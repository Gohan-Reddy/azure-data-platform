import { Project } from '@/types';

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    slug: 'nyc-taxi-lakehouse',
    title: 'NYC Taxi Lakehouse (Batch)',
    level: 'Beginner',
    description: 'Build an end-to-end batch pipeline using the NYC Taxi dataset. Land raw data in ADLS, transform with ADF and Databricks, serve from Synapse Serverless.',
    businessProblem: 'A city transportation analytics team needs to analyze millions of taxi trips to optimize fleet distribution and fare pricing. Data arrives daily as Parquet files from the city\'s data portal.',
    architecture: 'NYC Taxi API → ADF (ingest) → ADLS Gen2 (Bronze Parquet) → Databricks (Silver/Gold Delta) → Synapse Serverless SQL (query) → Power BI Dashboard',
    techStack: ['Azure Data Factory', 'ADLS Gen2', 'Azure Databricks', 'Delta Lake', 'Synapse Analytics', 'Python', 'PySpark', 'SQL'],
    duration: '1-2 weeks',
    steps: [
      {
        number: 1,
        title: 'Setup Infrastructure',
        description: 'Provision ADLS Gen2, Databricks workspace, Synapse workspace, and ADF using Terraform or Bicep.',
        code: `# main.bicep
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '\${storageAccountName}'
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    isHnsEnabled: true  // Enable ADLS Gen2
    minimumTlsVersion: 'TLS1_2'
  }
}`,
        language: 'bicep'
      },
      {
        number: 2,
        title: 'Create ADLS Folder Structure',
        description: 'Set up Bronze/Silver/Gold containers and folder hierarchy.',
        code: `# Folder structure
/raw/           # Bronze - raw Parquet files
/silver/        # Silver - cleaned Delta tables
  /trips/
  /zones/
/gold/          # Gold - aggregated Delta tables
  /daily_stats/
  /zone_analysis/`,
        language: 'text'
      },
      {
        number: 3,
        title: 'ADF Pipeline - Bronze Ingestion',
        description: 'Build ADF pipeline to download NYC Taxi Parquet files from TLC portal to ADLS Bronze.',
        code: `// ADF Pipeline Expression - dynamic file path
@concat(
  'yellow_tripdata_',
  formatDateTime(pipeline().parameters.month, 'yyyy-MM'),
  '.parquet'
)`,
        language: 'json'
      },
      {
        number: 4,
        title: 'Databricks Bronze to Silver',
        description: 'Clean and validate raw data, write to Silver Delta tables.',
        code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp, when
from delta.tables import DeltaTable

spark = SparkSession.builder.getOrCreate()

# Read bronze
df_bronze = spark.read.parquet("abfss://raw@<storage>.dfs.core.windows.net/trips/")

# Clean and validate
df_silver = df_bronze.filter(
    (col("trip_distance") > 0) &
    (col("fare_amount") > 0) &
    (col("tpep_pickup_datetime").isNotNull())
).withColumn(
    "pickup_hour",
    df_bronze.tpep_pickup_datetime.cast("timestamp").cast("int") // 3600 % 24
).dropDuplicates(["vendorid", "tpep_pickup_datetime", "tpep_dropoff_datetime"])

# Write to Silver Delta
df_silver.write.format("delta").mode("overwrite").option(
    "overwriteSchema", "true"
).save("abfss://silver@<storage>.dfs.core.windows.net/trips/")`,
        language: 'python'
      },
      {
        number: 5,
        title: 'Databricks Silver to Gold',
        description: 'Build aggregated Gold tables for analytics.',
        code: `from pyspark.sql.functions import avg, count, sum, date_format

df_silver = spark.read.format("delta").load("abfss://silver@<storage>.dfs.core.windows.net/trips/")

# Daily stats aggregation
df_gold = df_silver.groupBy(
    date_format("tpep_pickup_datetime", "yyyy-MM-dd").alias("trip_date"),
    "pulocationid"
).agg(
    count("*").alias("trip_count"),
    avg("fare_amount").alias("avg_fare"),
    avg("trip_distance").alias("avg_distance"),
    sum("tip_amount").alias("total_tips")
)

df_gold.write.format("delta").mode("overwrite").partitionBy("trip_date").save(
    "abfss://gold@<storage>.dfs.core.windows.net/daily_stats/"
)`,
        language: 'python'
      },
      {
        number: 6,
        title: 'Synapse Serverless External Table',
        description: 'Create external table in Synapse Serverless SQL for BI access.',
        code: `-- Create external data source
CREATE EXTERNAL DATA SOURCE gold_lake WITH (
    LOCATION = 'https://<storage>.dfs.core.windows.net/gold'
);

-- Create external table
CREATE EXTERNAL TABLE daily_trip_stats (
    trip_date DATE,
    pulocationid INT,
    trip_count BIGINT,
    avg_fare DECIMAL(10,2),
    avg_distance DECIMAL(10,2),
    total_tips DECIMAL(10,2)
)
WITH (
    DATA_SOURCE = gold_lake,
    LOCATION = '/daily_stats/',
    FILE_FORMAT = DeltaLakeFormat
);`,
        language: 'sql'
      }
    ],
    resumePoints: [
      'Built end-to-end medallion architecture lakehouse processing 100M+ NYC taxi records using ADF, Databricks, and Delta Lake',
      'Implemented Bronze-Silver-Gold data quality pipeline with PySpark data validation and deduplication',
      'Created Synapse Serverless external tables for BI consumption, reducing query latency by 60%',
      'Deployed infrastructure as code using Bicep templates and integrated CI/CD via Azure DevOps'
    ],
    interviewQuestions: [
      'Why did you choose Delta Lake over plain Parquet for this project?',
      'How would you handle schema changes when the NYC Taxi file format changes?',
      'How would you scale this to process data in real-time?',
      'What data quality checks would you add to the Silver layer?'
    ],
    enhancements: [
      'Add Great Expectations data quality validation in the Silver layer',
      'Implement real-time streaming with Event Hubs Capture',
      'Add Power BI DirectQuery dashboard',
      'Implement Delta Lake time travel for historical analysis',
      'Add ML model for fare prediction using Databricks MLflow'
    ]
  },
  {
    id: 'p2',
    slug: 'retail-sales-lakehouse-scd2',
    title: 'Retail Sales Lakehouse with SCD2 Dimensions',
    level: 'Intermediate',
    description: 'Production-grade retail analytics platform with SCD Type 2 customer dimensions, daily fact loads, and star schema in Synapse.',
    businessProblem: 'A retail company needs to track customer behavior over time including address changes, tier upgrades, and product preferences. Historical analysis must reflect the customer\'s status AT THE TIME of each transaction.',
    architecture: 'Source SQL Server → ADF (CDC incremental) → ADLS Gen2 (Bronze Delta) → Databricks (SCD2 merge, Silver) → Synapse Dedicated SQL (Star Schema Gold) → Power BI',
    techStack: ['Azure Data Factory', 'ADLS Gen2', 'Azure Databricks', 'Delta Lake', 'Synapse Dedicated SQL', 'Python', 'PySpark SQL', 'dbt'],
    duration: '2-3 weeks',
    steps: [
      {
        number: 1,
        title: 'CDC Incremental Ingestion with ADF',
        description: 'Use ADF watermark pattern to incrementally load changed records from source SQL Server.',
        code: `-- Source: SQL Server CDC-enabled table
-- ADF Lookup activity reads watermark
SELECT watermark_value FROM pipeline_watermark WHERE table_name = 'customers'

-- ADF Copy activity uses dynamic source query
-- Source Query expression in ADF:
@concat('SELECT * FROM customers WHERE updated_at > ''',
        activity('GetWatermark').output.firstRow.watermark_value,
        ''' AND updated_at <= ''',
        pipeline().parameters.run_start_time, '''')`,
        language: 'sql'
      },
      {
        number: 2,
        title: 'SCD Type 2 Implementation in Databricks',
        description: 'Implement SCD2 merge using Delta Lake MERGE operation.',
        code: `from delta.tables import DeltaTable
from pyspark.sql.functions import current_timestamp, lit

def apply_scd2_merge(spark, source_df, delta_path, natural_key, compare_cols):
    """Apply SCD Type 2 merge on a Delta table."""

    delta_table = DeltaTable.forPath(spark, delta_path)

    # Expire old records that have changed
    delta_table.alias("target").merge(
        source_df.alias("source"),
        f"target.{natural_key} = source.{natural_key} AND target.is_current = 1"
    ).whenMatchedUpdate(
        condition=" OR ".join([f"target.{c} <> source.{c}" for c in compare_cols]),
        set={
            "is_current": lit(False),
            "valid_to": current_timestamp(),
            "updated_at": current_timestamp()
        }
    ).execute()

    # Insert new versions for changed records + brand new records
    changed_df = source_df.join(
        delta_table.toDF().filter("is_current = true"),
        natural_key, "left_anti"  # Records not in current target
    ).union(
        source_df.join(
            delta_table.toDF().filter("is_current = false"),
            natural_key, "inner"
        ).select(source_df.columns)
    ).withColumns({
        "is_current": lit(True),
        "valid_from": current_timestamp(),
        "valid_to": lit("9999-12-31").cast("timestamp"),
        "surrogate_key": monotonically_increasing_id()
    })

    changed_df.write.format("delta").mode("append").save(delta_path)

# Apply to customer dimension
apply_scd2_merge(
    spark,
    source_df=staging_customers,
    delta_path="abfss://silver@storage.dfs.core.windows.net/dim_customer",
    natural_key="customer_id",
    compare_cols=["email", "address", "city", "customer_tier"]
)`,
        language: 'python'
      },
      {
        number: 3,
        title: 'Star Schema in Synapse Dedicated SQL',
        description: 'Create fact and dimension tables with optimal distribution strategies.',
        code: `-- Dimension table: replicated (small lookup table)
CREATE TABLE dim_customer (
    customer_sk INT IDENTITY(1,1),
    customer_id VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    customer_tier VARCHAR(50),
    is_current BIT DEFAULT 1,
    valid_from DATETIME2,
    valid_to DATETIME2
)
WITH (DISTRIBUTION = REPLICATE, CLUSTERED COLUMNSTORE INDEX);

-- Fact table: hash distributed on customer_sk
CREATE TABLE fact_sales (
    sale_id BIGINT,
    customer_sk INT,
    product_sk INT,
    date_sk INT,
    quantity INT,
    unit_price DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    net_amount DECIMAL(10,2)
)
WITH (
    DISTRIBUTION = HASH(customer_sk),
    CLUSTERED COLUMNSTORE INDEX,
    PARTITION (date_sk RANGE RIGHT FOR VALUES (20240101, 20240201, 20240301))
);`,
        language: 'sql'
      }
    ],
    resumePoints: [
      'Implemented SCD Type 2 customer dimension using Delta Lake MERGE, preserving 3 years of customer history across 5M records',
      'Built incremental ADF watermark pipeline reducing daily load time from 4 hours to 25 minutes',
      'Designed Synapse Dedicated SQL star schema with hash/replicated distribution strategy, achieving 5x query performance improvement',
      'Deployed end-to-end CI/CD using Azure DevOps with environment-specific parameters for Dev/UAT/Prod'
    ],
    interviewQuestions: [
      'Why SCD Type 2 over SCD Type 1 for this use case?',
      'How would you handle late-arriving dimension records?',
      'What is the trade-off between hash and replicated distribution?',
      'How would you implement SCD Type 3 for the previous value?'
    ],
    enhancements: [
      'Add dbt models for Gold layer transformations',
      'Implement Change Data Feed on Delta tables to track changes',
      'Add data quality expectations on Silver layer using Great Expectations',
      'Build Power BI composite model for DirectQuery + Import'
    ]
  },
  {
    id: 'p3',
    slug: 'iot-realtime-telemetry',
    title: 'Real-Time IoT Telemetry Pipeline',
    level: 'Intermediate',
    description: 'Process millions of IoT sensor messages per hour with sub-minute latency using Event Hubs, Spark Structured Streaming, and Delta Lake.',
    businessProblem: 'A manufacturing company monitors 5,000 industrial machines via IoT sensors sending temperature, pressure, and vibration readings every 10 seconds. They need real-time anomaly detection and historical trend analysis.',
    architecture: 'IoT Hub / Event Hubs → Databricks Structured Streaming → Delta Live Tables → Gold Delta tables + Stream Analytics (hot path) → Power BI Streaming Dashboard',
    techStack: ['Azure Event Hubs', 'Azure IoT Hub', 'Azure Databricks', 'Delta Live Tables', 'Spark Structured Streaming', 'Azure Stream Analytics', 'Delta Lake', 'Python'],
    duration: '2-3 weeks',
    steps: [
      {
        number: 1,
        title: 'Configure Event Hubs and Simulate IoT Data',
        description: 'Set up Event Hubs with 10 partitions and build a Python IoT data simulator.',
        code: `import asyncio
import json
import random
from datetime import datetime
from azure.eventhub.aio import EventHubProducerClient
from azure.eventhub import EventData

DEVICE_COUNT = 100
EVENT_HUB_CONN_STR = "Endpoint=sb://..."
EVENT_HUB_NAME = "iot-telemetry"

async def send_telemetry():
    async with EventHubProducerClient.from_connection_string(
        conn_str=EVENT_HUB_CONN_STR,
        eventhub_name=EVENT_HUB_NAME
    ) as producer:
        while True:
            batch = await producer.create_batch()
            for device_id in range(DEVICE_COUNT):
                payload = {
                    "device_id": f"machine_{device_id:04d}",
                    "timestamp": datetime.utcnow().isoformat(),
                    "temperature": round(random.gauss(75, 10), 2),
                    "pressure": round(random.gauss(100, 5), 2),
                    "vibration": round(random.gauss(0.5, 0.2), 4),
                    "status": random.choice(["normal", "normal", "normal", "warning", "critical"])
                }
                batch.add(EventData(json.dumps(payload)))
            await producer.send_batch(batch)
            await asyncio.sleep(10)  # Send every 10 seconds

asyncio.run(send_telemetry())`,
        language: 'python'
      },
      {
        number: 2,
        title: 'Spark Structured Streaming from Event Hubs',
        description: 'Build a streaming Databricks notebook that reads from Event Hubs.',
        code: `from pyspark.sql.functions import *
from pyspark.sql.types import *

# Event Hubs connection config
eh_conf = {
    "eventhubs.connectionString": sc._jvm.org.apache.spark.eventhubs.EventHubsUtils.encrypt(
        dbutils.secrets.get("kv-scope", "eventhub-conn-str")
    ),
    "eventhubs.consumerGroup": "databricks-cg",
    "eventhubs.startingPosition": json.dumps({"offset": "-1", "seqNo": -1, "enqueuedTime": None, "isInclusive": True})
}

# Define schema for IoT payload
telemetry_schema = StructType([
    StructField("device_id", StringType()),
    StructField("timestamp", TimestampType()),
    StructField("temperature", DoubleType()),
    StructField("pressure", DoubleType()),
    StructField("vibration", DoubleType()),
    StructField("status", StringType())
])

# Read from Event Hubs
df_raw = spark.readStream.format("eventhubs").options(**eh_conf).load()

# Parse JSON payload
df_parsed = df_raw.select(
    from_json(col("body").cast("string"), telemetry_schema).alias("data"),
    col("enqueuedTime").alias("event_time")
).select("data.*", "event_time")

# Watermark for late data (allow 2 minutes late)
df_watermarked = df_parsed.withWatermark("timestamp", "2 minutes")

# Aggregate: 1-minute averages per device
df_agg = df_watermarked.groupBy(
    window("timestamp", "1 minute"),
    "device_id"
).agg(
    avg("temperature").alias("avg_temp"),
    avg("pressure").alias("avg_pressure"),
    max("vibration").alias("max_vibration"),
    count("*").alias("reading_count")
)

# Write to Delta Lake Silver
df_agg.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "/checkpoints/telemetry-silver") \
    .option("path", "abfss://silver@storage.dfs.core.windows.net/iot_telemetry_agg") \
    .trigger(processingTime="30 seconds") \
    .start()`,
        language: 'python'
      }
    ],
    resumePoints: [
      'Architected real-time IoT telemetry pipeline processing 1M+ events/hour with <30 second end-to-end latency',
      'Implemented Spark Structured Streaming with watermarks for handling late sensor data',
      'Built anomaly detection using 5-minute rolling averages on 5,000 device streams',
      'Reduced storage costs 40% using Delta Lake compaction and Z-Order optimization on device_id'
    ],
    interviewQuestions: [
      'How do watermarks work and what happens to data arriving after the watermark threshold?',
      'How would you handle a single hot partition receiving data from many devices?',
      'What is the difference between Append, Update, and Complete output modes?',
      'How would you implement exactly-once semantics?'
    ],
    enhancements: [
      'Add ML anomaly detection model using Databricks AutoML',
      'Implement Delta Live Tables for declarative pipeline',
      'Add Power BI real-time dashboard',
      'Implement alert system for critical device status'
    ]
  },
  {
    id: 'p4',
    slug: 'healthcare-hl7-fhir',
    title: 'Healthcare HL7/FHIR Pipeline with PHI Protection',
    level: 'Advanced',
    description: 'HIPAA-compliant healthcare data pipeline processing HL7 messages and FHIR resources with PHI data masking, encryption, and audit logging.',
    businessProblem: 'A healthcare network receives patient data as HL7 v2 messages from hospital systems and FHIR R4 resources from partner APIs. Data must be stored securely with PHI protection, row-level security for clinicians, and full HIPAA audit trail.',
    architecture: 'HL7 Source → Azure API for FHIR → ADLS Gen2 (encrypted) → Databricks (PHI masking, Bronze/Silver/Gold) → Synapse (RLS policies) → Clinical Power BI Dashboard',
    techStack: ['Azure API for FHIR', 'Azure Databricks', 'Azure Key Vault', 'Delta Lake', 'Synapse Analytics', 'Python', 'Unity Catalog', 'Microsoft Purview'],
    duration: '4-6 weeks',
    steps: [
      {
        number: 1,
        title: 'FHIR Data Ingestion',
        description: 'Pull FHIR R4 Patient and Observation resources using the FHIR REST API.',
        code: `import requests
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
token = credential.get_token("https://healthcareapis.azure.com/.default")

FHIR_BASE = "https://myhealthcare.fhir.azurehealthcareapis.com"

def fetch_fhir_bundle(resource_type: str, last_updated: str):
    """Fetch paginated FHIR resources updated since last_updated."""
    headers = {"Authorization": f"Bearer {token.token}", "Accept": "application/fhir+json"}
    url = f"{FHIR_BASE}/{resource_type}?_lastUpdated=gt{last_updated}&_count=100"

    while url:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        bundle = response.json()

        for entry in bundle.get("entry", []):
            yield entry["resource"]

        # Handle pagination
        url = next(
            (link["url"] for link in bundle.get("link", []) if link["relation"] == "next"),
            None
        )`,
        language: 'python'
      },
      {
        number: 2,
        title: 'PHI Masking and Encryption in Databricks',
        description: 'Implement column-level PHI masking using Unity Catalog column masks.',
        code: `-- Unity Catalog column masking function
CREATE FUNCTION phi_masking.mask_patient_name(name STRING)
RETURNS STRING
RETURN CASE
    WHEN is_account_group_member('clinicians') THEN name
    WHEN is_account_group_member('researchers') THEN CONCAT(LEFT(name, 1), '***')
    ELSE '***REDACTED***'
END;

-- Apply mask to column
ALTER TABLE silver.fhir_patients
ALTER COLUMN patient_name SET MASK phi_masking.mask_patient_name;

-- Row-level security: researchers only see de-identified records
CREATE ROW FILTER phi_masking.patient_row_filter
ON silver.fhir_patients
USING (CASE
    WHEN is_account_group_member('clinicians') THEN TRUE
    WHEN is_account_group_member('researchers') THEN is_deidentified = TRUE
    ELSE FALSE
END);`,
        language: 'sql'
      }
    ],
    resumePoints: [
      'Built HIPAA-compliant data pipeline processing 500K+ FHIR R4 resources daily with PHI column masking using Unity Catalog',
      'Implemented column-level security and row-level filtering for 5 clinical user groups using Databricks Unity Catalog',
      'Designed encryption-at-rest strategy with customer-managed keys in Azure Key Vault',
      'Created Purview classification rules for automatic PHI detection across 50+ data assets'
    ],
    interviewQuestions: [
      'How does column masking in Unity Catalog work at the query execution level?',
      'What is the difference between pseudonymization and anonymization?',
      'How would you implement HIPAA audit logging for data access?',
      'How do you handle encryption key rotation without data loss?'
    ],
    enhancements: [
      'Implement differential privacy for research datasets',
      'Add Purview sensitivity labels for PHI classification',
      'Build HIPAA audit report with Azure Monitor',
      'Implement data retention policies with automatic deletion'
    ]
  },
  {
    id: 'p5',
    slug: 'self-serve-analytics-data-mesh',
    title: 'Self-Serve Analytics Platform with Data Mesh',
    level: 'Advanced',
    description: 'Enterprise-scale Data Mesh implementation with domain-oriented ownership, self-serve infrastructure, and federated governance using Unity Catalog.',
    businessProblem: 'A global enterprise has 5 business domains (Sales, Finance, Operations, HR, Marketing) each with their own data teams. The central data team has become a bottleneck. They need domain teams to own and publish their data products while maintaining enterprise governance.',
    architecture: 'Domain Source Systems → Domain-owned Databricks Workspaces → Domain Delta Tables (Data Products) → Unity Catalog (Federated Governance) → Cross-domain Synapse SQL → Enterprise Power BI',
    techStack: ['Azure Databricks', 'Delta Lake', 'Unity Catalog', 'Azure Synapse', 'Microsoft Purview', 'Azure API Management', 'Terraform', 'Python', 'Azure DevOps'],
    duration: '6-8 weeks',
    steps: [
      {
        number: 1,
        title: 'Design Data Product Interface',
        description: 'Define the data product contract and schema for the Sales domain.',
        code: `# data_product_contract.yaml
name: sales_daily_revenue
domain: sales
owner: sales-data-team@company.com
version: "2.1.0"
sla:
  freshness: "daily by 06:00 UTC"
  availability: "99.9%"
  quality_threshold: 0.995

schema:
  - name: transaction_date
    type: date
    nullable: false
    description: "Date of the sales transaction"
  - name: region_code
    type: string
    nullable: false
    pii: false
  - name: product_sku
    type: string
    nullable: false
  - name: revenue_usd
    type: decimal(15,2)
    nullable: false
  - name: unit_count
    type: int
    nullable: false

access_policy:
  public_groups: ["finance_analysts", "executives"]
  restricted_groups: ["sales_team"]

quality_expectations:
  - "revenue_usd >= 0"
  - "unit_count > 0"
  - "transaction_date is not null"`,
        language: 'yaml'
      },
      {
        number: 2,
        title: 'Unity Catalog Data Product Registration',
        description: 'Register and govern data products across domains in Unity Catalog.',
        code: `-- Create catalog per domain
CREATE CATALOG IF NOT EXISTS sales_domain;
CREATE CATALOG IF NOT EXISTS finance_domain;

-- Grant cross-domain access via Unity Catalog
GRANT USE CATALOG ON CATALOG sales_domain TO finance_analysts;
GRANT SELECT ON TABLE sales_domain.gold.daily_revenue TO finance_analysts;

-- Create data product view with lineage tracking
CREATE VIEW finance_domain.cross_domain.sales_finance_reconciliation AS
SELECT
    s.transaction_date,
    s.revenue_usd AS sales_revenue,
    f.recognized_revenue,
    s.revenue_usd - f.recognized_revenue AS variance
FROM sales_domain.gold.daily_revenue s
JOIN finance_domain.gold.revenue_recognition f
    ON s.transaction_date = f.accounting_date;`,
        language: 'sql'
      }
    ],
    resumePoints: [
      'Architected Data Mesh platform for 5 business domains with domain-owned Databricks workspaces and Unity Catalog federation',
      'Reduced central data team bottleneck by 70% by enabling self-serve data product publishing',
      'Implemented federated governance with Unity Catalog across 15 Databricks workspaces',
      'Designed data product catalog with SLA monitoring and automated quality scoring'
    ],
    interviewQuestions: [
      'What are the four principles of Data Mesh?',
      'How does Unity Catalog enable federated governance?',
      'What is a data product and how does it differ from a dataset?',
      'What are the trade-offs between Data Mesh and a centralized data lake?'
    ],
    enhancements: [
      'Build self-serve data product marketplace portal',
      'Implement automated data lineage using Purview integration',
      'Add cost chargeback per domain using Azure Cost Management tags',
      'Build data quality SLA dashboard per domain'
    ]
  }
];
