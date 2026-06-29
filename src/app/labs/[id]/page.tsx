'use client';

import { use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, ChevronDown, ChevronRight, AlertTriangle, Lightbulb, Trash2, Copy, Check, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LAB_DETAILS: Record<string, {
  id: string; title: string; topic: string; difficulty: string; duration: string;
  description: string; prerequisites: string[];
  objectives: string[];
  architecture: string;
  steps: { title: string; description: string; code?: string; language?: string; hint?: string; expectedOutput?: string }[];
  commonErrors: { error: string; solution: string }[];
  cleanup: string[];
  furtherChallenges: string[];
}> = {
  'lab-1': {
    id: 'lab-1', title: 'Build Your First ADF Pipeline', topic: 'Azure Data Factory', difficulty: 'Beginner', duration: '2 hours',
    description: 'In this lab you will create a complete end-to-end Azure Data Factory pipeline that copies a CSV file from Azure Blob Storage to an Azure SQL Database table. You will configure linked services, datasets, a Copy Activity, and schedule the pipeline with a trigger.',
    prerequisites: ['An active Azure subscription (free trial works)', 'Azure portal access', 'No prior ADF experience needed'],
    objectives: ['Create and configure a Storage Account with a sample CSV', 'Provision ADF and configure Managed Identity access', 'Create Linked Services for Blob and Azure SQL', 'Build a Copy Activity pipeline with column mapping', 'Schedule the pipeline with a daily trigger', 'Monitor a pipeline run in ADF Monitor'],
    architecture: 'CSV File in Azure Blob Storage (bronze container) → ADF Copy Activity (transformation/mapping) → Azure SQL Database table (processed)',
    steps: [
      {
        title: 'Create Resource Group and Storage Account',
        description: 'Start by creating a resource group to organize all lab resources, then create a Storage Account with a container for your CSV file.',
        code: `# Use Azure CLI or Azure Portal
az group create --name rg-adf-lab --location eastus

# Create a Storage Account (name must be globally unique)
az storage account create \\
  --name sadflabeastus001 \\
  --resource-group rg-adf-lab \\
  --location eastus \\
  --sku Standard_LRS \\
  --kind StorageV2

# Create a container named 'bronze'
az storage container create \\
  --name bronze \\
  --account-name sadflabeastus001`,
        language: 'bash',
        hint: 'Storage account names must be 3-24 characters, lowercase letters and numbers only. Make it unique by adding your initials and a number.',
        expectedOutput: 'StorageAccount and container created successfully in Azure portal.',
      },
      {
        title: 'Upload Sample CSV File',
        description: 'Create a sample sales CSV and upload it to the bronze container.',
        code: `# Create sample CSV locally
cat > sales.csv << 'EOF'
OrderId,CustomerName,Product,Amount,OrderDate
1,Alice Smith,Widget A,150.00,2024-01-15
2,Bob Johnson,Widget B,250.50,2024-01-16
3,Carol White,Widget A,300.00,2024-01-17
4,Dave Brown,Widget C,75.25,2024-01-18
5,Eve Davis,Widget B,180.00,2024-01-19
EOF

# Upload to the bronze container
az storage blob upload \\
  --account-name sadflabeastus001 \\
  --container-name bronze \\
  --name sales/2024/01/sales.csv \\
  --file sales.csv`,
        language: 'bash',
        hint: 'If you don\'t have Azure CLI, you can upload the file manually using Azure Portal → Storage Account → Containers → Upload.',
        expectedOutput: 'sales.csv uploaded to bronze/sales/2024/01/',
      },
      {
        title: 'Create Azure SQL Database',
        description: 'Provision an Azure SQL Database for the destination. Use the free serverless tier to minimize cost.',
        code: `# Create SQL Server
az sql server create \\
  --name sql-adf-lab-001 \\
  --resource-group rg-adf-lab \\
  --location eastus \\
  --admin-user sqladmin \\
  --admin-password "P@ssw0rd2024!"

# Create SQL Database (Serverless, S0 is cheapest)
az sql db create \\
  --resource-group rg-adf-lab \\
  --server sql-adf-lab-001 \\
  --name salesdb \\
  --service-objective S0

# Allow Azure services to connect
az sql server firewall-rule create \\
  --resource-group rg-adf-lab \\
  --server sql-adf-lab-001 \\
  --name AllowAzureServices \\
  --start-ip-address 0.0.0.0 \\
  --end-ip-address 0.0.0.0`,
        language: 'bash',
        hint: 'The firewall rule with 0.0.0.0 → 0.0.0.0 allows Azure services (including ADF) to connect. Your local machine still needs its own IP added.',
      },
      {
        title: 'Create the Destination Table',
        description: 'Connect to the SQL Database and create the target table that ADF will write to.',
        code: `-- Run this in Azure Portal Query Editor or SSMS
CREATE TABLE dbo.SalesOrders (
    OrderId INT PRIMARY KEY,
    CustomerName NVARCHAR(100),
    Product NVARCHAR(50),
    Amount DECIMAL(10, 2),
    OrderDate DATE,
    LoadedAt DATETIME2 DEFAULT GETUTCDATE()
);`,
        language: 'sql',
        hint: 'In Azure Portal, navigate to your SQL Database → Query Editor. Log in with the admin credentials you created.',
        expectedOutput: 'Table created successfully. You can verify with: SELECT * FROM dbo.SalesOrders;',
      },
      {
        title: 'Create Azure Data Factory',
        description: 'Provision an ADF instance and enable the System-Assigned Managed Identity (auto-enabled on creation).',
        code: `az datafactory create \\
  --resource-group rg-adf-lab \\
  --factory-name adf-lab-eastus-001 \\
  --location eastus

# Grant ADF Managed Identity access to Storage (Storage Blob Data Reader)
ADF_PRINCIPAL_ID=$(az datafactory show \\
  --resource-group rg-adf-lab \\
  --factory-name adf-lab-eastus-001 \\
  --query identity.principalId -o tsv)

STORAGE_ID=$(az storage account show \\
  --name sadflabeastus001 \\
  --resource-group rg-adf-lab \\
  --query id -o tsv)

az role assignment create \\
  --assignee $ADF_PRINCIPAL_ID \\
  --role "Storage Blob Data Reader" \\
  --scope $STORAGE_ID`,
        language: 'bash',
        hint: 'Managed Identity eliminates the need for connection string secrets. The identity is automatically created when you create ADF.',
      },
      {
        title: 'Build the Pipeline in ADF Studio',
        description: 'Open ADF Studio and create the pipeline with linked services, datasets, and a Copy Activity.',
        code: `// ADF Pipeline ARM template (export from ADF Studio after building)
{
  "name": "CopySalesToSQL",
  "properties": {
    "activities": [{
      "name": "CopySalesCSV",
      "type": "Copy",
      "inputs": [{ "referenceName": "DS_Blob_Sales_CSV", "type": "DatasetReference" }],
      "outputs": [{ "referenceName": "DS_SQL_SalesOrders", "type": "DatasetReference" }],
      "typeProperties": {
        "source": { "type": "DelimitedTextSource", "storeSettings": { "type": "AzureBlobFSReadSettings" } },
        "sink": { "type": "AzureSqlSink", "writeBehavior": "upsert", "upsertSettings": { "useTempDB": true, "keys": ["OrderId"] } },
        "enableSkipIncompatibleRow": true,
        "translator": {
          "type": "TabularTranslator",
          "mappings": [
            { "source": { "name": "OrderId", "type": "Int32" }, "sink": { "name": "OrderId", "type": "Int32" } },
            { "source": { "name": "CustomerName" }, "sink": { "name": "CustomerName" } },
            { "source": { "name": "Amount", "type": "Decimal" }, "sink": { "name": "Amount", "type": "Decimal" } }
          ]
        }
      }
    }]
  }
}`,
        language: 'json',
        hint: 'In ADF Studio: go to Author → Pipelines → New Pipeline. Drag a "Copy data" activity onto the canvas. Configure source (Blob CSV) and sink (SQL Table) linked services.',
        expectedOutput: 'Pipeline created with a Copy Activity. Validate and Debug to run it manually first.',
      },
      {
        title: 'Add a Daily Trigger and Monitor',
        description: 'Schedule the pipeline to run daily at midnight and verify a successful run in ADF Monitor.',
        code: `# Add trigger via ADF Studio UI:
# Manage → Triggers → New → Schedule Trigger
# Set: Start Time, Recurrence = Every 1 Day at 00:00 UTC
# Attach to pipeline: CopySalesToSQL

# Verify via ADF Monitor (can also use CLI):
az datafactory pipeline-run query-by-factory \\
  --resource-group rg-adf-lab \\
  --factory-name adf-lab-eastus-001 \\
  --last-updated-after "2024-01-01T00:00:00Z" \\
  --last-updated-before "2024-12-31T00:00:00Z"`,
        language: 'bash',
        expectedOutput: 'Pipeline run shows Status: Succeeded, rows read = 5, rows written = 5.',
      },
    ],
    commonErrors: [
      { error: 'UserErrorStorageAccountNotFound — Linked Service connection failed', solution: 'Verify the storage account name is correct and the ADF Managed Identity has the "Storage Blob Data Reader" role assigned on the storage account (not just the resource group).' },
      { error: 'Cannot insert the value NULL into column \'OrderId\'', solution: 'Check the column mapping in the Copy Activity. The source CSV column name must exactly match the mapping (case-sensitive). Open the Mapping tab in the Copy Activity and verify.' },
      { error: 'Login failed for user \'<token-identified principal>\'', solution: 'The ADF Managed Identity does not have access to the SQL Database. In Azure SQL, run: CREATE USER [adf-lab-eastus-001] FROM EXTERNAL PROVIDER; ALTER ROLE db_datareader ADD MEMBER [adf-lab-eastus-001]; ALTER ROLE db_datawriter ADD MEMBER [adf-lab-eastus-001];' },
      { error: 'Pipeline validation failed: Activity has no output', solution: 'Every Copy Activity must have a Sink Dataset configured. Go back to the Sink tab of the Copy Activity and select or create a dataset.' },
    ],
    cleanup: [
      'In ADF Studio, disable the trigger: Manage → Triggers → Select trigger → Disable',
      'Delete ADF instance: az datafactory delete --resource-group rg-adf-lab --factory-name adf-lab-eastus-001',
      'Or delete the entire resource group to remove all resources at once:',
      'az group delete --name rg-adf-lab --yes --no-wait',
    ],
    furtherChallenges: [
      'Add a Validation Activity before the Copy to check if the CSV file exists before attempting to copy',
      'Add a Web Activity to send a Teams webhook notification on pipeline success or failure',
      'Modify the pipeline to handle incremental loads using a watermark column (OrderDate)',
      'Add a Data Flow activity to perform a currency conversion on the Amount column before writing to SQL',
      'Set up ADF Git integration with Azure Repos and commit your pipeline to source control',
    ],
  },
  'lab-3': {
    id: 'lab-3', title: 'Delta Lake ACID Transactions', topic: 'Delta Lake', difficulty: 'Intermediate', duration: '3 hours',
    description: 'In this lab you will create a Delta Lake table in Databricks, perform MERGE (upsert) operations, explore time travel, run OPTIMIZE with Z-ORDER, and enable Change Data Feed. You will experience ACID guarantees firsthand by simulating concurrent writes.',
    prerequisites: ['Azure Databricks workspace (Community Edition is free)', 'Basic Python and SQL knowledge', 'ADLS Gen2 storage account (optional — can use DBFS for this lab)'],
    objectives: ['Create a Delta table from a PySpark DataFrame', 'Perform upserts using the MERGE INTO command', 'Query historical versions using time travel', 'Improve query performance with OPTIMIZE and Z-ORDER', 'Enable and query Change Data Feed (CDC)'],
    architecture: 'Raw data (Python dict) → PySpark DataFrame → Delta Table (DBFS or ADLS) → MERGE/OPTIMIZE/Time Travel → Change Data Feed output',
    steps: [
      {
        title: 'Create a Databricks Cluster',
        description: 'In Databricks workspace, create a single-node cluster for the lab. Community Edition provides a free cluster.',
        code: `# Cluster settings (via Databricks UI):
# Cluster Mode: Single Node
# Databricks Runtime: 13.3 LTS (includes Delta Lake 2.4)
# Node type: Standard_DS3_v2 (or smallest available)
# Auto-terminate: 30 minutes

# Verify Delta Lake version in a notebook:
import delta
print(delta.__version__)  # Should print 2.4.x or later`,
        language: 'python',
        hint: 'Community Edition (community.cloud.databricks.com) is free and sufficient for this lab. Clusters terminate after 2 hours automatically.',
        expectedOutput: 'Cluster running. Delta version: 2.4.0',
      },
      {
        title: 'Create a Delta Table from DataFrame',
        description: 'Create sample sales data as a PySpark DataFrame and save it as a Delta table.',
        code: `from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, IntegerType, StringType, DoubleType, DateType
from datetime import date

# Sample data
data = [
    (1, "Alice", "Widget A", 150.0, date(2024, 1, 1)),
    (2, "Bob", "Widget B", 250.5, date(2024, 1, 2)),
    (3, "Carol", "Widget C", 300.0, date(2024, 1, 3)),
    (4, "Dave", "Widget A", 75.25, date(2024, 1, 4)),
    (5, "Eve", "Widget B", 180.0, date(2024, 1, 5)),
]

schema = StructType([
    StructField("order_id", IntegerType(), False),
    StructField("customer", StringType(), True),
    StructField("product", StringType(), True),
    StructField("amount", DoubleType(), True),
    StructField("order_date", DateType(), True),
])

df = spark.createDataFrame(data, schema)

# Save as Delta table
df.write.format("delta").mode("overwrite").saveAsTable("sales_orders")

# Verify
spark.sql("SELECT * FROM sales_orders").show()
spark.sql("DESCRIBE HISTORY sales_orders").show(truncate=False)`,
        language: 'python',
        hint: 'Run each code block in a separate Databricks notebook cell using Shift+Enter.',
        expectedOutput: '5 rows written. DESCRIBE HISTORY shows version 0 with operation "CREATE OR REPLACE TABLE".',
      },
      {
        title: 'Perform an Upsert with MERGE INTO',
        description: 'Simulate incoming updates: Bob changed his order amount, and a new customer Frank placed an order. Use MERGE to upsert these changes.',
        code: `from delta.tables import DeltaTable

# Incoming changes: Bob updated, Frank is new
updates = [
    (2, "Bob", "Widget B", 999.99, date(2024, 1, 2)),   # Update Bob's amount
    (6, "Frank", "Widget C", 450.0, date(2024, 1, 6)),   # New order
]

updates_df = spark.createDataFrame(updates, schema)

# MERGE into the Delta table
sales_table = DeltaTable.forName(spark, "sales_orders")

sales_table.alias("target").merge(
    updates_df.alias("source"),
    "target.order_id = source.order_id"
).whenMatchedUpdateAll() \
 .whenNotMatchedInsertAll() \
 .execute()

# Verify result — should have 6 rows with Bob's amount = 999.99
spark.sql("SELECT * FROM sales_orders ORDER BY order_id").show()`,
        language: 'python',
        expectedOutput: '6 rows. order_id=2: amount=999.99 (updated). order_id=6: Frank (inserted).',
      },
      {
        title: 'Time Travel — Query Historical Versions',
        description: 'Delta Lake keeps a transaction log. Query the table as it was at version 0 (before the MERGE).',
        code: `# Option 1: Query by version number
df_v0 = spark.read.format("delta").option("versionAsOf", 0).table("sales_orders")
print(f"Version 0 row count: {df_v0.count()}")  # Should be 5
df_v0.show()

# Option 2: Query by timestamp
# df_ts = spark.read.format("delta").option("timestampAsOf", "2024-01-15").table("sales_orders")

# Check the transaction log
spark.sql("DESCRIBE HISTORY sales_orders").select("version", "timestamp", "operation", "operationParameters").show(truncate=False)`,
        language: 'python',
        hint: 'DESCRIBE HISTORY shows every write operation as a version. Delta retains 30 days of history by default.',
        expectedOutput: 'Version 0: 5 rows (original). Current: 6 rows (after MERGE). History shows 2 versions.',
      },
      {
        title: 'OPTIMIZE and Z-ORDER',
        description: 'Compact small files and create Z-ORDER index on the product column to speed up product-based filters.',
        code: `# See current files (before OPTIMIZE)
import subprocess
files_before = spark.sql("SELECT COUNT(*) as file_count FROM (DESCRIBE DETAIL sales_orders)").collect()

# OPTIMIZE compacts small files into larger ones
spark.sql("OPTIMIZE sales_orders ZORDER BY (product)")

# After OPTIMIZE — fewer, larger files
spark.sql("DESCRIBE DETAIL sales_orders").select("numFiles", "sizeInBytes").show()

# Verify Z-ORDER works — run a query with a product filter
spark.sql("""
    SELECT customer, amount
    FROM sales_orders
    WHERE product = 'Widget B'
""").show()

# Check the Spark UI (after running the query above) to see data skipping stats`,
        language: 'python',
        hint: 'OPTIMIZE is most impactful on large tables with many small files. For this small lab table, the improvement is minimal but the concept is the same.',
        expectedOutput: 'OPTIMIZE ran successfully. Files compacted. Product filter query ran with data skipping.',
      },
      {
        title: 'Enable Change Data Feed (CDC)',
        description: 'Enable CDF on the table and query the change stream — useful for downstream incremental pipelines.',
        code: `# Enable CDF on the table
spark.sql("""
    ALTER TABLE sales_orders
    SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
""")

# Make a change (update Carol's amount)
spark.sql("UPDATE sales_orders SET amount = 999.0 WHERE customer = 'Carol'")

# Delete Dave's order
spark.sql("DELETE FROM sales_orders WHERE customer = 'Dave'")

# Read the change feed — shows what changed and how
cdf = spark.read.format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingVersion", 0) \
    .table("sales_orders")

# The _change_type column tells you what happened:
# 'insert', 'update_preimage', 'update_postimage', 'delete'
cdf.select("order_id", "customer", "amount", "_change_type", "_commit_version").orderBy("order_id", "_commit_version").show()`,
        language: 'python',
        expectedOutput: 'CDF shows insert for all initial rows, update_preimage + update_postimage for Carol, delete for Dave.',
      },
    ],
    commonErrors: [
      { error: 'AnalysisException: Table or view not found: sales_orders', solution: 'The table was created in a specific database. Either run USE default; or qualify the table name as default.sales_orders. Also ensure you\'re using the same cluster where you created the table.' },
      { error: 'ConcurrentWriteException: This table is locked by another write', solution: 'Delta Lake prevents concurrent writes to the same table. If this happens in a notebook, ensure no other cell is writing to the same table simultaneously.' },
      { error: 'delta.exceptions.DeltaAnalysisException: Cannot time travel Delta table to version 5 — version 5 does not exist', solution: 'Check available versions with DESCRIBE HISTORY sales_orders. You can only query versions that exist in the transaction log.' },
      { error: 'readChangeFeed: startingVersion is required', solution: 'When reading CDF, you must specify either startingVersion or startingTimestamp. Use .option("startingVersion", 0) to read all changes.' },
    ],
    cleanup: [
      'In the Databricks notebook, run: spark.sql("DROP TABLE IF EXISTS sales_orders")',
      'Delete the Delta table files: dbutils.fs.rm("dbfs:/user/hive/warehouse/sales_orders", recurse=True)',
      'Terminate the Databricks cluster (it will auto-terminate after the configured idle timeout)',
      'If using ADLS, delete the storage container or resource group',
    ],
    furtherChallenges: [
      'Implement SCD Type 2 using MERGE — add an is_current flag and valid_from/valid_to timestamps',
      'Set up a streaming pipeline that reads Delta CDF and writes to a downstream Delta table',
      'Create a DLT (Delta Live Tables) pipeline in Databricks that uses the medallion architecture',
      'Enable Auto-Optimize (optimizeWrite + autoCompact) and observe the difference in file sizes',
      'Implement a RESTORE TABLE operation to roll back to a previous version after a bad write',
    ],
  },
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-3">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/60 rounded-t-lg border border-border/50 border-b-0">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <><Check className="w-3 h-3 text-green-400" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
        </button>
      </div>
      <pre className="p-4 bg-secondary/30 rounded-b-lg border border-border/50 overflow-x-auto text-xs font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lab = LAB_DETAILS[id];
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number>(0);

  if (!lab) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Lab not found</h1>
          <p className="text-muted-foreground mb-4">This lab is under construction. Check back soon!</p>
          <Link href="/labs"><Button variant="outline">← Back to Labs</Button></Link>
        </div>
      </div>
    );
  }

  const toggleStep = (i: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const progressPct = Math.round((completedSteps.size / lab.steps.length) * 100);
  const DIFF_COLORS: Record<string, string> = {
    Beginner: 'border-green-500/20 bg-green-500/5 text-green-400',
    Intermediate: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
    Advanced: 'border-red-500/20 bg-red-500/5 text-red-400',
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-5xl mx-auto py-10">
        {/* Back */}
        <Link href="/labs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />Back to Labs
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-7 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className={`border text-xs ${DIFF_COLORS[lab.difficulty] ?? ''}`}>{lab.difficulty}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{lab.duration}</span>
            <Badge variant="success" className="text-xs border">Free</Badge>
            <span className="text-xs text-muted-foreground">{lab.topic}</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">{lab.title}</h1>
          <p className="text-muted-foreground mb-5">{lab.description}</p>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lab Progress</span>
              <span className="font-medium">{completedSteps.size}/{lab.steps.length} steps · {progressPct}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full progress-bar rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Architecture */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-[#0078d4]" />Architecture</CardTitle></CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-secondary/30 text-sm font-mono text-muted-foreground">{lab.architecture}</div>
              </CardContent>
            </Card>

            {/* Steps */}
            <div>
              <h2 className="text-xl font-bold mb-4">Lab Steps</h2>
              <div className="space-y-4">
                {lab.steps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={cn('border-border/50 overflow-hidden transition-all', completedSteps.has(i) && 'border-green-500/30 bg-green-500/3')}>
                      <button
                        onClick={() => setExpandedStep(expandedStep === i ? -1 : i)}
                        className="w-full p-5 flex items-center gap-4 text-left hover:bg-secondary/20 transition-colors"
                      >
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors', completedSteps.has(i) ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground')}>
                          {completedSteps.has(i) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{step.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{step.description}</div>
                        </div>
                        {expandedStep === i ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      </button>

                      <AnimatePresence>
                        {expandedStep === i && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
                              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                              {step.code && <CodeBlock code={step.code} language={step.language ?? 'bash'} />}

                              {step.hint && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                  <p className="text-xs text-muted-foreground">{step.hint}</p>
                                </div>
                              )}

                              {step.expectedOutput && (
                                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-xs text-muted-foreground">
                                  <span className="font-medium text-green-400">Expected output: </span>{step.expectedOutput}
                                </div>
                              )}

                              <Button
                                variant={completedSteps.has(i) ? 'outline' : 'gradient'}
                                size="sm"
                                onClick={() => toggleStep(i)}
                              >
                                {completedSteps.has(i) ? 'Mark Incomplete' : 'Mark Complete'}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Common Errors */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />Common Errors & Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lab.commonErrors.map((e, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-sm font-mono text-red-400 text-xs">{e.error}</div>
                    <div className="text-sm text-muted-foreground">{e.solution}</div>
                    {i < lab.commonErrors.length - 1 && <div className="h-px bg-border/30 mt-3" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Prerequisites */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">Prerequisites</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {lab.prerequisites.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />{p}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">Learning Objectives</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {lab.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3 text-[#0078d4] mt-0.5 shrink-0" />{obj}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cleanup */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />Cleanup (Avoid Azure Costs)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lab.cleanup.map((step, i) => (
                  <div key={i} className="text-xs text-muted-foreground font-mono">{step}</div>
                ))}
              </CardContent>
            </Card>

            {/* Further challenges */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">Further Challenges</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {lab.furtherChallenges.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-[#0078d4] font-bold shrink-0">{i + 1}.</span>{c}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
