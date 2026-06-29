'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const CHEATSHEETS = [
  {
    id: 'spark-performance',
    title: 'Spark Performance Quick Reference',
    category: 'Spark',
    color: '#f59e0b',
    sections: [
      {
        title: 'Anti-Patterns (Avoid These)',
        items: [
          'df.collect() on large DataFrames → brings all data to Driver, OOM',
          'UDFs in Python → serialization overhead, use Spark native functions',
          'cartesian join (cross join) without filter → N×M rows explosion',
          'repartition() without reason → triggers shuffle',
          'df.count() in loop → full scan each time',
          'Small files problem → many tasks, high overhead',
        ]
      },
      {
        title: 'Join Strategies',
        items: [
          'BroadcastHashJoin: one side < 10MB (autoBroadcastJoinThreshold) → no shuffle',
          'SortMergeJoin: large-large → sort both sides + merge',
          'Force broadcast: df.join(broadcast(small_df), "key")',
          'AQE: enables runtime conversion SMJ→BHJ for small partitions',
          'Bucketing: pre-sort on join key → eliminates shuffle for joins',
        ]
      },
      {
        title: 'Memory Configuration',
        items: [
          'spark.executor.memory: total executor JVM heap',
          'spark.executor.memoryOverhead: off-heap (Python UDFs, native libs) = max(executor.memory * 0.1, 384MB)',
          'spark.memory.fraction (0.6): fraction of heap for execution+storage',
          'spark.memory.storageFraction (0.5): cache storage within above',
          'spark.sql.shuffle.partitions: default 200, tune for dataset size (2-3× executor cores)',
        ]
      },
      {
        title: 'Performance Tuning Checklist',
        items: [
          '[ ] Check Spark UI → find slowest stage → look at task time distribution',
          '[ ] Is there a data skew? (one task takes 10× others) → salt key or use AQE',
          '[ ] Is shuffle read large? → can you broadcast one side?',
          '[ ] Is cache() being used? → cache only if DF used 2+ times',
          '[ ] Are there many small files? → coalesce before writing',
          '[ ] Is GC time > 5%? → tune memory, reduce object creation',
        ]
      }
    ]
  },
  {
    id: 'delta-lake',
    title: 'Delta Lake One-Liners',
    category: 'Delta Lake',
    color: '#00aab5',
    sections: [
      {
        title: 'Core Operations',
        items: [
          'Read delta: spark.read.format("delta").load("/path")',
          'Write delta: df.write.format("delta").mode("append").save("/path")',
          'Overwrite: .mode("overwrite").option("overwriteSchema", "true")',
          'Merge: DeltaTable.forPath(spark, path).alias("t").merge(df.alias("s"), "t.id = s.id")',
          'Time travel: spark.read.format("delta").option("versionAsOf", 5).load(path)',
          'Time travel by date: .option("timestampAsOf", "2024-01-01").load(path)',
        ]
      },
      {
        title: 'Optimization Commands',
        items: [
          'OPTIMIZE table_name ZORDER BY (col1, col2) -- compaction + Z-Order',
          'VACUUM table_name RETAIN 168 HOURS -- delete files older than 7 days',
          'ANALYZE TABLE table COMPUTE STATISTICS FOR ALL COLUMNS',
          'ALTER TABLE table SET TBLPROPERTIES ("delta.autoOptimize.optimizeWrite" = "true")',
          'DESCRIBE HISTORY table -- view all commits with version/timestamp',
          'RESTORE TABLE table TO VERSION AS OF 10 -- rollback to version 10',
        ]
      },
      {
        title: 'Schema Operations',
        items: [
          'ALTER TABLE t ADD COLUMNS (new_col STRING)',
          'ALTER TABLE t CHANGE COLUMN old_col new_col STRING',
          'SET delta.schema.autoMerge.enabled = true (for schema evolution)',
          'df.write.option("mergeSchema", "true").format("delta").save(path)',
          'df.write.option("overwriteSchema", "true").mode("overwrite").save(path)',
        ]
      },
      {
        title: 'Change Data Feed (CDC)',
        items: [
          'Enable: ALTER TABLE t SET TBLPROPERTIES ("delta.enableChangeDataFeed" = "true")',
          'Read changes: spark.read.format("delta").option("readChangeFeed", "true").option("startingVersion", 0).table("t")',
          '_change_type column: "insert" | "update_preimage" | "update_postimage" | "delete"',
        ]
      }
    ]
  },
  {
    id: 'synapse-sql',
    title: 'Synapse Dedicated SQL Cheat Sheet',
    category: 'Synapse',
    color: '#0078d4',
    sections: [
      {
        title: 'Distribution Strategy',
        items: [
          'HASH: large fact tables, column with high cardinality used in JOINs',
          'REPLICATE: small dimension tables < 2GB',
          'ROUND_ROBIN: staging tables, no natural join key',
          'Check: SELECT * FROM sys.pdw_table_distribution_properties',
          'Data movement: EXPLAIN queries to see data movement operations',
        ]
      },
      {
        title: 'Performance Tips',
        items: [
          'CTAS (CREATE TABLE AS SELECT) is faster than INSERT...SELECT',
          'PolyBase/COPY INTO is fastest for bulk loading from ADLS',
          'COPY INTO: COPY INTO table FROM \'https://...\' WITH (FILE_TYPE=\'PARQUET\')',
          'Statistics: CREATE STATISTICS ON table(col) must be manually created',
          'Result set caching: SET RESULT_SET_CACHING ON (query results cached)',
          'Workload groups: assign DWU resources to user groups',
        ]
      },
      {
        title: 'Loading Patterns',
        items: [
          'Bronze: COPY INTO with FILE_TYPE=PARQUET from ADLS',
          'Dimension: MERGE into distributed dim table',
          'Fact: COPY INTO or PolyBase, then distribute on most-joined key',
          'Always use CTAS not INSERT into large tables',
          'Avoid: small INSERT statements (use bulk copy)',
        ]
      }
    ]
  },
  {
    id: 'adf-expressions',
    title: 'ADF Expression Quick Reference',
    category: 'ADF',
    color: '#8b5cf6',
    sections: [
      {
        title: 'String Functions',
        items: [
          '@concat(pipeline().parameters.folder, \'/\', formatDateTime(utcNow(), \'yyyy-MM-dd\'))',
          '@substring(variables(\'filename\'), 0, 8) -- first 8 chars',
          '@toUpper(pipeline().parameters.env)',
          '@replace(variables(\'text\'), \'old\', \'new\')',
          '@trim(pipeline().parameters.value)',
          '@split(variables(\'csv_list\'), \',\')',
        ]
      },
      {
        title: 'Date Functions',
        items: [
          '@formatDateTime(utcNow(), \'yyyy-MM-dd\') -- today as string',
          '@addDays(utcNow(), -1) -- yesterday',
          '@formatDateTime(addDays(utcNow(),-1),\'yyyy/MM/dd\') -- yesterday as folder path',
          '@convertFromUtc(utcNow(), \'Eastern Standard Time\')',
          '@dayOfWeek(utcNow()) -- 0=Sunday, 1=Monday...',
        ]
      },
      {
        title: 'Conditional & Logic',
        items: [
          '@if(equals(pipeline().parameters.env, \'prod\'), \'prod-conn\', \'dev-conn\')',
          '@coalesce(variables(\'optional_var\'), \'default_value\')',
          '@bool(pipeline().parameters.is_full_load)',
          '@equals(activity(\'CheckFile\').output.exists, true)',
          '@greater(activity(\'GetCount\').output.firstRow.cnt, 0)',
        ]
      },
      {
        title: 'Pipeline Variables',
        items: [
          'pipeline().parameters.param_name -- pipeline parameter',
          'variables(\'var_name\') -- pipeline variable',
          'activity(\'activityName\').output.fieldName -- activity output',
          'item() -- current ForEach item',
          'pipeline().RunId -- unique run ID',
          'pipeline().DataFactory -- ADF instance name',
        ]
      }
    ]
  },
  {
    id: 'kql-snippets',
    title: 'KQL Snippets for Data Engineers',
    category: 'Monitoring',
    color: '#ef4444',
    sections: [
      {
        title: 'ADF Monitoring',
        items: [
          '// Failed ADF pipeline runs in last 24h\nADFPipelineRun\n| where Status == "Failed"\n| where TimeGenerated > ago(24h)\n| project PipelineName, RunId, FailureType, ErrorMessage\n| order by TimeGenerated desc',
          '// ADF activity duration by pipeline\nADFActivityRun\n| where Status == "Succeeded"\n| summarize avg_duration=avg(End-Start) by PipelineName, ActivityName\n| order by avg_duration desc',
        ]
      },
      {
        title: 'Cost & Performance',
        items: [
          '// Storage account operations cost\nAzureMetrics\n| where ResourceProvider == "MICROSOFT.STORAGE"\n| where MetricName == "Transactions"\n| summarize count() by Resource, bin(TimeGenerated, 1d)',
          '// Top slow queries in Synapse\nSynapseSqlPoolExecRequests\n| where Status == "Completed"\n| order by total_elapsed_time desc\n| project command, total_elapsed_time, resource_class',
        ]
      },
      {
        title: 'Databricks Monitoring',
        items: [
          '// Long-running Databricks jobs\nDatabricksJobs\n| where ActionName == "runFailed"\n| project JobName, ErrorMessage, TimeGenerated',
          '// Cluster utilization\nDatabricksClusters\n| where ActionName == "create"\n| summarize count() by bin(TimeGenerated, 1h)',
        ]
      }
    ]
  }
];

function CheatSheetCard({ sheet }: { sheet: typeof CHEATSHEETS[0] }) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(text);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="h-1" style={{ background: sheet.color }} />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{sheet.title}</CardTitle>
          <Badge variant="outline" className="text-xs" style={{ borderColor: sheet.color + '50', color: sheet.color }}>
            {sheet.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sheet.sections.map((section, si) => (
          <div key={si}>
            <h4 className="font-semibold text-sm mb-3" style={{ color: sheet.color }}>{section.title}</h4>
            <div className="space-y-2">
              {section.items.map((item, ii) => (
                <div
                  key={ii}
                  className="group flex items-start justify-between gap-2 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors"
                >
                  <code className="text-xs font-mono leading-relaxed flex-1 whitespace-pre-wrap">{item}</code>
                  <button
                    onClick={() => copyText(item)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-background"
                  >
                    {copiedItem === item
                      ? <Check className="w-3 h-3 text-green-400" />
                      : <Copy className="w-3 h-3 text-muted-foreground" />
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function CheatsheetsPage() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">Quick Reference</Badge>
          <h1 className="text-5xl font-bold mb-4">
            <span className="azure-gradient-text">Cheat Sheets</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quick-reference cards for Spark, Delta Lake, Synapse, ADF expressions, and KQL.
            Hover over any item to copy it.
          </p>
        </motion.div>

        {/* Sheet selector */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {CHEATSHEETS.map(sheet => (
            <button
              key={sheet.id}
              onClick={() => setActiveSheet(activeSheet === sheet.id ? null : sheet.id)}
              className={cn(
                'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                activeSheet === sheet.id
                  ? 'text-white border-transparent'
                  : 'border-border text-muted-foreground hover:border-border hover:text-foreground'
              )}
              style={activeSheet === sheet.id ? { background: sheet.color } : {}}
            >
              {sheet.title.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
          {activeSheet && (
            <button onClick={() => setActiveSheet(null)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
              Show All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CHEATSHEETS.filter(s => !activeSheet || s.id === activeSheet).map((sheet, i) => (
            <motion.div
              key={sheet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={activeSheet === sheet.id ? 'lg:col-span-2' : ''}
            >
              <CheatSheetCard sheet={sheet} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
