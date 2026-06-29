import { InterviewQuestion } from '@/types';

export const SQL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'sql-1',
    question: 'What is the difference between WHERE and HAVING clauses?',
    answer: 'WHERE filters rows before grouping (cannot use aggregate functions). HAVING filters groups after GROUP BY (can use aggregate functions). Example: SELECT dept, COUNT(*) as cnt FROM employees WHERE salary > 50000 GROUP BY dept HAVING COUNT(*) > 5',
    difficulty: 'Easy',
    category: 'SQL Fundamentals',
    tags: ['sql', 'filtering', 'grouping']
  },
  {
    id: 'sql-2',
    question: 'Explain all types of SQL JOINs with examples.',
    answer: 'INNER JOIN: returns only matching rows from both tables. LEFT JOIN: all rows from left + matching from right (NULL if no match). RIGHT JOIN: all rows from right + matching from left. FULL OUTER JOIN: all rows from both tables. CROSS JOIN: cartesian product. SELF JOIN: join a table with itself. Anti-join pattern: LEFT JOIN WHERE right.id IS NULL (finds rows in left with no match in right).',
    difficulty: 'Easy',
    category: 'SQL Joins',
    tags: ['sql', 'joins']
  },
  {
    id: 'sql-3',
    question: 'Write a query to find the second highest salary in a table.',
    answer: 'Method 1: SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)\nMethod 2: SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rk FROM employees) t WHERE rk = 2\nMethod 3: SELECT TOP 1 salary FROM (SELECT DISTINCT TOP 2 salary FROM employees ORDER BY salary DESC) t ORDER BY salary ASC',
    difficulty: 'Easy',
    category: 'SQL Fundamentals',
    tags: ['sql', 'ranking', 'subquery']
  },
  {
    id: 'sql-4',
    question: 'Explain ROW_NUMBER vs RANK vs DENSE_RANK.',
    answer: 'ROW_NUMBER: assigns unique sequential numbers (1,2,3,4) – no ties, always unique.\nRANK: same rank for ties, then skips numbers (1,1,3,4) – gaps after ties.\nDENSE_RANK: same rank for ties, no gaps (1,1,2,3) – consecutive even after ties.\nUse ROW_NUMBER for pagination/deduplication, RANK/DENSE_RANK for leaderboards or top-N per group.',
    difficulty: 'Medium',
    category: 'Window Functions',
    tags: ['sql', 'window-functions', 'ranking']
  },
  {
    id: 'sql-5',
    question: 'What is the difference between a clustered and non-clustered index?',
    answer: 'Clustered index: determines the physical sort order of data in the table. Only one per table. The leaf nodes ARE the data pages. Best for range queries on the indexed column.\nNon-clustered index: a separate structure with pointers to data rows. Multiple allowed per table. Leaf nodes contain the index key + row locator (RID or clustered key). Best for selective lookups on non-primary-key columns.',
    difficulty: 'Medium',
    category: 'SQL Performance',
    tags: ['sql', 'indexes', 'performance']
  },
  {
    id: 'sql-6',
    question: 'What is a CTE (Common Table Expression) and when would you use it over a subquery?',
    answer: 'A CTE is a named temporary result set defined with WITH clause. Prefer CTEs for: readability (complex multi-step queries), recursive queries (hierarchies, running totals), reusing the same subquery multiple times in one statement. Prefer subqueries for: simple one-time filters, correlated subqueries. Note: CTEs are not materialized by default (most engines re-execute them each time), so for expensive subqueries used multiple times, a temp table may be better.',
    difficulty: 'Medium',
    category: 'SQL Fundamentals',
    tags: ['sql', 'cte', 'optimization']
  },
  {
    id: 'sql-7',
    question: 'Explain SQL ACID properties.',
    answer: 'Atomicity: transaction is all-or-nothing. Either all statements commit or all roll back.\nConsistency: transaction brings the DB from one valid state to another, enforcing all constraints.\nIsolation: concurrent transactions execute as if serialized – each sees a consistent view of data.\nDurability: committed transactions survive system failures (written to persistent storage).\nIn Azure: Synapse Dedicated SQL supports ACID with table locks. Delta Lake provides ACID at scale via transaction logs.',
    difficulty: 'Medium',
    category: 'SQL Transactions',
    tags: ['sql', 'acid', 'transactions']
  },
  {
    id: 'sql-8',
    question: 'Write a query to find running total of sales by date.',
    answer: 'SELECT order_date, daily_sales,\n  SUM(daily_sales) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,\n  AVG(daily_sales) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7day_avg\nFROM daily_sales_summary\nORDER BY order_date;\n\nKey: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW gives running total. Use ROWS (not RANGE) for deterministic behavior with duplicates.',
    difficulty: 'Medium',
    category: 'Window Functions',
    tags: ['sql', 'window-functions', 'running-total']
  },
  {
    id: 'sql-9',
    question: 'What is SCD Type 2 and how would you implement it with MERGE?',
    answer: 'SCD Type 2 tracks historical changes by adding new rows instead of updating. Each row has: surrogate key, natural key, attributes, is_current flag, valid_from date, valid_to date.\n\nMERGE implementation:\nMERGE INTO dim_customer AS target\nUSING staging_customer AS source ON target.customer_id = source.customer_id AND target.is_current = 1\nWHEN MATCHED AND (target.email <> source.email OR target.address <> source.address) THEN\n  UPDATE SET target.is_current = 0, target.valid_to = GETDATE()\nWHEN NOT MATCHED THEN\n  INSERT (customer_id, email, address, is_current, valid_from, valid_to)\n  VALUES (source.customer_id, source.email, source.address, 1, GETDATE(), \'9999-12-31\');\n-- Then insert new versions for updated rows',
    difficulty: 'Hard',
    category: 'Data Modeling',
    tags: ['sql', 'scd', 'modeling', 'merge']
  },
  {
    id: 'sql-10',
    question: 'What are isolation levels in SQL and how do they affect concurrency?',
    answer: 'Read Uncommitted: reads dirty data (uncommitted changes). Highest concurrency, lowest consistency.\nRead Committed (default): reads only committed data. Prevents dirty reads.\nRepeatable Read: same row reads same data within transaction. Prevents dirty reads + non-repeatable reads.\nSnapshot: reads committed data as of transaction start (uses versioning). No blocking reads.\nSerializable: highest isolation – transactions execute as if serial. Prevents all anomalies but lowest concurrency.\nAzure SQL default: Read Committed with RCSI (Snapshot isolation for reads). Delta Lake uses optimistic concurrency with serializable isolation at the write level.',
    difficulty: 'Hard',
    category: 'SQL Transactions',
    tags: ['sql', 'isolation', 'concurrency', 'transactions']
  },
  {
    id: 'sql-11',
    question: 'What is a columnstore index and when should you use it?',
    answer: 'A columnstore index stores data by column rather than row, enabling high compression and batch-mode execution. When to use: analytical/OLAP workloads with large table scans, aggregations over wide tables, data warehouses. When NOT to use: OLTP with frequent point lookups or single-row updates (clustered columnstore is read-optimized).\nIn Azure Synapse Dedicated SQL, tables are clustered columnstore by default. ZORDER in Delta Lake serves a similar purpose for data skipping.',
    difficulty: 'Hard',
    category: 'SQL Performance',
    tags: ['sql', 'columnstore', 'performance', 'analytics']
  },
  {
    id: 'sql-12',
    question: 'Explain the difference between UNION and UNION ALL.',
    answer: 'UNION: combines result sets and removes duplicates (performs a DISTINCT operation – expensive for large sets).\nUNION ALL: combines result sets without removing duplicates (no sorting/hashing overhead – much faster).\nBest practice: always use UNION ALL unless you specifically need duplicate elimination. If you need deduplication, consider GROUP BY on the result instead for better query plan flexibility.',
    difficulty: 'Easy',
    category: 'SQL Fundamentals',
    tags: ['sql', 'set-operations']
  },
  {
    id: 'sql-13',
    question: 'Write a recursive CTE to find all employees in a hierarchy under a manager.',
    answer: 'WITH EmployeeHierarchy AS (\n  -- Anchor: start with the root manager\n  SELECT employee_id, name, manager_id, 0 AS level\n  FROM employees\n  WHERE manager_id IS NULL  -- or WHERE employee_id = @ManagerId\n  \n  UNION ALL\n  \n  -- Recursive: add direct reports\n  SELECT e.employee_id, e.name, e.manager_id, eh.level + 1\n  FROM employees e\n  INNER JOIN EmployeeHierarchy eh ON e.manager_id = eh.employee_id\n)\nSELECT * FROM EmployeeHierarchy ORDER BY level, name;\n\nUse cases in DE: organizational hierarchies, BOM (bill of materials), category trees, dependency graphs.',
    difficulty: 'Hard',
    category: 'SQL CTEs',
    tags: ['sql', 'recursive-cte', 'hierarchy']
  },
  {
    id: 'sql-14',
    question: 'What is parameter sniffing and how do you resolve it?',
    answer: 'Parameter sniffing: SQL Server compiles a query plan based on the first parameter values used, then caches it. If subsequent calls use very different parameter values (e.g., rare value vs. common value), the cached plan may be suboptimal.\nSolutions: (1) OPTION (RECOMPILE) – force recompile each execution, (2) OPTION (OPTIMIZE FOR UNKNOWN) – generate a plan based on statistics averages, (3) separate stored procedures for different data distributions, (4) use local variables to "sniff-proof" the query, (5) create filtered indexes for each distribution. In Synapse/Databricks: use Adaptive Query Execution (AQE) which dynamically adjusts plans.',
    difficulty: 'Hard',
    category: 'SQL Performance',
    tags: ['sql', 'parameter-sniffing', 'performance']
  },
  {
    id: 'sql-15',
    question: 'How would you find and remove duplicate rows from a table?',
    answer: '-- Find duplicates\nSELECT col1, col2, COUNT(*) as cnt\nFROM table_name\nGROUP BY col1, col2\nHAVING COUNT(*) > 1;\n\n-- Delete duplicates, keeping one row\nWITH CTE AS (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY col1, col2 ORDER BY id) as rn\n  FROM table_name\n)\nDELETE FROM CTE WHERE rn > 1;\n\n-- Or with a temp table approach for large datasets\nSELECT DISTINCT * INTO #deduped FROM table_name;\nTRUNCATE TABLE table_name;\nINSERT INTO table_name SELECT * FROM #deduped;',
    difficulty: 'Medium',
    category: 'SQL Fundamentals',
    tags: ['sql', 'deduplication', 'data-quality']
  }
];

export const SPARK_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'spark-1',
    question: 'Explain the Spark architecture: Driver, Executors, and the cluster manager.',
    answer: 'Driver: the JVM process that runs the main() function, creates SparkContext, builds the DAG, and coordinates execution. One per application.\nCluster Manager: allocates resources (YARN, Kubernetes, Databricks runtime, Standalone). Receives resource requests from the Driver.\nExecutors: JVM processes on worker nodes that run tasks and cache data. Each executor has a fixed number of cores and memory slots.\nFlow: Driver submits app → Cluster Manager assigns executors → Driver divides work into tasks → Executors run tasks and return results.\nKey insight: the Driver is the bottleneck for collect() calls – never collect large DataFrames to the Driver.',
    difficulty: 'Medium',
    category: 'Spark Architecture',
    tags: ['spark', 'architecture', 'driver', 'executor']
  },
  {
    id: 'spark-2',
    question: 'What is lazy evaluation in Spark and why does it matter?',
    answer: 'Lazy evaluation means transformations (map, filter, join, select) do NOT execute immediately – they build a logical plan (DAG). Execution only happens when an action is triggered (collect, count, write, show).\nWhy it matters: (1) Spark can optimize the full plan before executing (predicate pushdown, column pruning, join reordering), (2) allows pipelining of transformations without intermediate materializations, (3) saves computation if results are never needed.\nCommon mistake: calling df.count() in a loop thinking it\'s cheap – each count is a full scan.',
    difficulty: 'Medium',
    category: 'Spark Internals',
    tags: ['spark', 'lazy-evaluation', 'dag']
  },
  {
    id: 'spark-3',
    question: 'What causes a shuffle in Spark and how do you minimize it?',
    answer: 'Shuffles happen when data must be redistributed across partitions: groupBy, join on non-co-partitioned data, distinct, repartition, coalesce.\nA shuffle = write shuffle files to disk + network transfer + read shuffle files. This is the #1 performance killer.\nMinimization strategies:\n(1) Broadcast joins: small tables fit in memory, no shuffle needed (spark.sql.autoBroadcastJoinThreshold)\n(2) Bucketing: pre-partition and sort tables on join keys, eliminating shuffle at query time\n(3) Partition pruning: filter before joins to reduce data moved\n(4) Avoid unnecessary repartitions: use coalesce() instead of repartition() when reducing partitions\n(5) AQE (Adaptive Query Execution): automatically converts sort-merge joins to broadcast joins when one side is small',
    difficulty: 'Hard',
    category: 'Spark Performance',
    tags: ['spark', 'shuffle', 'performance', 'optimization']
  },
  {
    id: 'spark-4',
    question: 'Explain the difference between narrow and wide transformations.',
    answer: 'Narrow transformations: each partition of the parent RDD is used by at most one partition of the child RDD. No shuffle needed. Examples: map, filter, flatMap, union, select, withColumn. These can be pipelined within a stage.\nWide transformations: multiple parent partitions contribute to a single child partition. Requires a shuffle. Examples: groupBy, join (non-broadcast), distinct, sort, repartition. These create stage boundaries.\nImplication: the number of stages in a Spark job equals the number of wide transformations + 1. Each stage is a unit of work that can be retried independently.',
    difficulty: 'Hard',
    category: 'Spark Internals',
    tags: ['spark', 'transformations', 'stages', 'dag']
  },
  {
    id: 'spark-5',
    question: 'How do you handle data skew in Spark?',
    answer: 'Data skew = some partitions have many more rows than others, causing some tasks to take 10x longer.\nDetection: look at task duration distribution in Spark UI – if one task takes much longer, you have skew.\nSolutions:\n(1) Salting: add random suffix to skewed keys, explode the small side, then aggregate. col("key") + "_" + (rand() * N).cast("int")\n(2) Broadcast join: if one side is small enough, broadcast it entirely\n(3) AQE Skew Join Handling: spark.sql.adaptive.skewJoin.enabled=true – automatically splits skewed partitions\n(4) Two-stage aggregation: partial aggregation then global aggregation\n(5) Repartition by a more uniform key before the join',
    difficulty: 'Hard',
    category: 'Spark Performance',
    tags: ['spark', 'skew', 'performance', 'salting']
  },
  {
    id: 'spark-6',
    question: 'What is the difference between cache() and persist() in Spark?',
    answer: 'cache() = persist(StorageLevel.MEMORY_AND_DISK) – the default caching shorthand.\npersist() allows you to specify StorageLevel: MEMORY_ONLY (pure RDD approach, re-computes on eviction), MEMORY_AND_DISK (spills to disk on eviction, recommended), MEMORY_ONLY_SER (serialized in memory, less space but CPU overhead), DISK_ONLY, OFF_HEAP.\nWhen to use: when a DataFrame is used multiple times in the same application (e.g., ML feature engineering, iterative algorithms). When NOT to use: wide tables with many partitions being written once.\nGotcha: Spark is lazy – caching is not triggered until an action is called. Always call count() or similar after persist() to actually materialize the cache.',
    difficulty: 'Medium',
    category: 'Spark Performance',
    tags: ['spark', 'caching', 'persist', 'storage-level']
  },
  {
    id: 'spark-7',
    question: 'Explain Delta Lake transaction log and how ACID is achieved.',
    answer: 'Delta Lake stores a transaction log (_delta_log/) with JSON files recording every write operation. Each commit is an atomic JSON file listing: files added, files removed, schema changes, table metadata.\nACID in Delta:\n- Atomicity: writes create a new JSON commit file atomically. If the write fails, no commit file = no change.\n- Consistency: schema enforcement validates each write against the registered schema.\n- Isolation: Optimistic Concurrency Control (OCC) – writers check for conflicts at commit time. Serializable isolation at the table level.\n- Durability: once the commit JSON is written to cloud storage, the data is durable.\nTime travel: each commit has a version number. SELECT * FROM delta.`/path` VERSION AS OF 10 reads the state at commit 10.',
    difficulty: 'Hard',
    category: 'Delta Lake',
    tags: ['delta-lake', 'acid', 'transaction-log', 'databricks']
  },
  {
    id: 'spark-8',
    question: 'What is Structured Streaming and how does it handle late data?',
    answer: 'Structured Streaming is Spark\'s stream processing engine built on top of DataFrames. It treats a stream as an unbounded table and runs micro-batches (default) or continuous processing.\nLate data handling with watermarks: df.withWatermark("timestamp", "10 minutes") tells Spark to wait 10 minutes past the max seen event time before finalizing aggregations. Data arriving later than the watermark threshold may be dropped.\nState management: Structured Streaming maintains stateful aggregations (e.g., counts per window) in managed state stores. Checkpointing saves this state to HDFS/ADLS for fault tolerance.\nOutput modes: Append (new rows only – streaming aggregations aren\'t supported without watermarks), Update (only changed rows), Complete (full result table – small aggregations only).',
    difficulty: 'Hard',
    category: 'Spark Streaming',
    tags: ['spark-streaming', 'watermarks', 'late-data', 'stateful']
  },
  {
    id: 'spark-9',
    question: 'What join strategies does Spark support and when does each apply?',
    answer: 'Broadcast Hash Join (BHJ): small table broadcast to all executors, hash join in memory. No shuffle. Best when one side < spark.sql.autoBroadcastJoinThreshold (default 10MB). Force with broadcast() hint.\nSort-Merge Join (SMJ): both sides sorted and merged. Default for large-large joins. Requires shuffle + sort. Most reliable.\nShuffle Hash Join: one side hashed in memory, other side streamed. Works when one side is significantly smaller but too large to broadcast.\nBroadcast Nested Loop Join: fallback for non-equi joins (cross joins with conditions). Very slow.\nAQE: Adaptive Query Execution converts SMJ to BHJ at runtime if one side turns out to be small after filtering.',
    difficulty: 'Hard',
    category: 'Spark Joins',
    tags: ['spark', 'joins', 'broadcast', 'sort-merge']
  },
  {
    id: 'spark-10',
    question: 'What is the Medallion Architecture and how do you implement it in Databricks?',
    answer: 'Medallion architecture = Bronze → Silver → Gold layered data storage pattern.\nBronze: raw ingestion, schema-on-read. Exact copy of source data. Append-only Delta tables. No transformations except format conversion.\nSilver: cleaned, validated, conformed data. Deduplication, type casting, column standardization, business rule application. Row-level data quality checks.\nGold: aggregated, business-ready data. Dimensional models, aggregations, KPIs. Optimized for BI and ML consumption.\nImplementation: separate Delta tables per layer, each written by a DLT pipeline or Databricks Workflow. OPTIMIZE + ZORDER on Gold tables for query performance. Unity Catalog manages access per layer.',
    difficulty: 'Medium',
    category: 'Architecture',
    tags: ['medallion', 'databricks', 'delta-lake', 'architecture']
  }
];

export const AZURE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'azure-1',
    question: 'Explain the difference between a Managed Identity and a Service Principal.',
    answer: 'Service Principal: an identity created for an application/service in Entra ID. Has a client ID + client secret (or certificate). You manage the lifecycle and secret rotation manually.\nManaged Identity: an automatically managed identity for Azure resources. Azure handles credentials – no secrets to rotate. System-assigned: tied to one resource lifecycle (deleted when resource deleted). User-assigned: standalone, can be shared across multiple resources.\nBest practice: always prefer Managed Identity over Service Principals for Azure-to-Azure authentication. Use SP only for cross-tenant or external system scenarios.\nData Engineering use: ADF uses Managed Identity to access ADLS, Key Vault, SQL. Databricks uses Managed Identity for storage mount credentials.',
    difficulty: 'Medium',
    category: 'Azure Identity',
    tags: ['azure', 'managed-identity', 'service-principal', 'security']
  },
  {
    id: 'azure-2',
    question: 'What is a private endpoint and when should you use it?',
    answer: 'A private endpoint is a network interface that connects you privately to an Azure service using a private IP address from your VNet. The connection uses Azure Private Link.\nWhen to use: any production scenario where data should not traverse the public internet. Required for most enterprise data platforms.\nHow it works: service is assigned a private IP in your VNet → DNS resolves the service FQDN to the private IP → traffic stays within Microsoft backbone, never touches internet.\nData Engineering: ADLS Gen2, ADF Integration Runtime, Synapse, Event Hubs should all be configured with private endpoints in production. Self-hosted Integration Runtime in ADF connects to sources through private endpoints.',
    difficulty: 'Medium',
    category: 'Azure Networking',
    tags: ['azure', 'private-endpoint', 'networking', 'security']
  },
  {
    id: 'azure-3',
    question: 'What is the difference between LRS, ZRS, GRS, and RA-GRS storage redundancy?',
    answer: 'LRS (Locally Redundant Storage): 3 synchronous copies within one datacenter. Protects against disk/rack failure. Cheapest.\nZRS (Zone Redundant Storage): 3 copies across 3 availability zones in one region. Protects against zone failure. 99.9999999999% durability.\nGRS (Geo-Redundant Storage): LRS in primary + async replication to secondary region. Secondary not readable unless failover. Protects against region failure.\nRA-GRS (Read-Access GRS): GRS + read access to secondary endpoint. Use for DR read scenarios.\nFor ADLS Gen2 / Data Lakes: Use ZRS for production (zone failure protection), LRS for dev/test. GRS/RA-GRS for critical data with strict DR requirements.',
    difficulty: 'Easy',
    category: 'Azure Storage',
    tags: ['azure', 'storage', 'redundancy', 'adls']
  },
  {
    id: 'azure-4',
    question: 'Explain the Integration Runtime types in ADF and when to use each.',
    answer: 'Azure IR: fully managed compute in Azure. Used for cloud-to-cloud data movement and Data Flow execution. Supports auto-scale. No infrastructure to manage.\nSelf-hosted IR (SHIR): installed on on-premises or VM, in your network. Used to connect to on-premises databases, private network resources. You manage the VM.\nAzure-SSIS IR: lifts and shifts SSIS packages to Azure. Runs SSIS packages as ADF activities. Most expensive option.\nChoice guide: on-premises source → SHIR. Private VNet resources → SHIR or managed VNet IR. Cloud-to-cloud → Azure IR. SSIS migration → Azure-SSIS IR. Managed VNet IR: newer option that runs in a managed VNet with private link support – preferred over SHIR for new projects when possible.',
    difficulty: 'Medium',
    category: 'ADF',
    tags: ['adf', 'integration-runtime', 'shir', 'azure']
  },
  {
    id: 'azure-5',
    question: 'What is the difference between Dedicated SQL Pool and Serverless SQL Pool in Synapse?',
    answer: 'Dedicated SQL Pool: provisioned compute (DWUs), MPP architecture with distributions. Fixed cost whether running or paused. Best for: heavy, repeated BI workloads, sub-second query requirements, when data is permanently loaded.\nServerless SQL Pool: no infrastructure to provision, pay per TB scanned. Best for: ad-hoc exploration of ADLS files, external table queries on Delta/Parquet/CSV, ETL pipelines that don\'t need a dedicated pool.\nKey difference: Dedicated Pool data lives in internal distributed storage. Serverless queries data WHERE IT IS (ADLS) using OPENROWSET or external tables.\nCost tip: Serverless is great for exploratory work. Dedicated Pool is expensive – pause when not in use (saves compute, not storage costs).',
    difficulty: 'Medium',
    category: 'Azure Synapse',
    tags: ['synapse', 'sql-pool', 'serverless', 'azure']
  },
  {
    id: 'azure-6',
    question: 'What is Azure Event Hubs and how does it compare to Kafka?',
    answer: 'Event Hubs is a fully managed event streaming platform. It exposes a Kafka-compatible endpoint so existing Kafka producers/consumers work without code changes.\nKey concepts: Namespace (container), Event Hub (topic), Partition (ordered sequence), Consumer Group (independent reader position), Capture (auto-archive to ADLS/Blob).\nVs Kafka: Event Hubs manages infrastructure (no ZooKeeper, no broker management). Kafka gives more control (custom retention policies, compaction, exactly-once in older versions). Event Hubs pricing is per throughput unit (TU). Kafka requires Confluent Platform or self-managed clusters.\nFor Azure Data Engineering: Event Hubs → ADF (trigger), Stream Analytics, Spark Structured Streaming, or Functions. Use Event Hubs Capture for raw data landing in ADLS.',
    difficulty: 'Medium',
    category: 'Azure Streaming',
    tags: ['event-hubs', 'kafka', 'streaming', 'azure']
  },
  {
    id: 'azure-7',
    question: 'How does Azure Key Vault integrate with data engineering services?',
    answer: 'Key Vault stores secrets (connection strings, API keys, passwords), certificates, and cryptographic keys.\nIntegration patterns in DE:\n(1) ADF Linked Services: reference Key Vault secrets instead of hardcoding credentials. ADF Managed Identity reads secrets.\n(2) Databricks: mount secrets from Key Vault-backed secret scope using dbutils.secrets.get(). Secrets never appear in logs.\n(3) Azure Functions: use DefaultAzureCredential / Managed Identity to read secrets without any stored credentials.\n(4) Terraform: reference Key Vault secrets in azurerm_key_vault_secret data source.\nBest practice: no secrets in config files, environment variables, or notebooks. All credentials in Key Vault, accessed via Managed Identity.',
    difficulty: 'Medium',
    category: 'Azure Security',
    tags: ['key-vault', 'secrets', 'security', 'azure']
  },
  {
    id: 'azure-8',
    question: 'What is Microsoft Purview and what problems does it solve?',
    answer: 'Microsoft Purview is a unified data governance platform that provides: Data Map (automated scanning and cataloging of data assets across Azure, on-premises, multi-cloud), Data Catalog (searchable business glossary, data discovery), Data Lineage (visual lineage from source to sink through ADF, Synapse, Databricks), Access Policies (data-level access control through Purview).\nProblems it solves: "Where is this data coming from?" (lineage), "Who has access to what?" (access control), "What is this column?" (business glossary + classification), "Is this data sensitive?" (classification rules for PII, financial data), "Who is using this data?" (usage analytics).\nData Engineering integration: Purview auto-scans ADLS, Synapse, ADF. ADF writes lineage to Purview after each pipeline run.',
    difficulty: 'Hard',
    category: 'Data Governance',
    tags: ['purview', 'governance', 'lineage', 'catalog']
  },
  {
    id: 'azure-9',
    question: 'Explain the Synapse Dedicated SQL Pool distribution types.',
    answer: 'Hash distribution: rows distributed to specific node based on hash of distribution column. Best for large fact tables in joins and aggregations. Choose the most frequently joined column with high cardinality.\nRound-robin: rows distributed evenly in round-robin fashion. Best for staging tables, tables without natural join key. Simple but causes data movement in joins.\nReplicated: full copy of table on every compute node. Best for small dimension tables (< 2GB). Eliminates data movement for joins – great for star schema.\nDW tip: fact tables → hash by most common join key. Dimension tables < 2GB → replicated. Staging/temp tables → round-robin. Avoid round-robin for tables frequently joined to large hash-distributed facts.',
    difficulty: 'Hard',
    category: 'Azure Synapse',
    tags: ['synapse', 'distribution', 'mpp', 'performance']
  },
  {
    id: 'azure-10',
    question: 'What is Delta Lake and what advantages does it provide over Parquet?',
    answer: 'Delta Lake is an open-source storage layer built on Parquet that adds ACID transactions, scalable metadata, schema enforcement/evolution, and time travel.\nAdvantages over plain Parquet:\n1. ACID transactions: concurrent reads/writes without corruption (Parquet has none)\n2. Schema enforcement: rejects writes with mismatched schemas\n3. Time travel: query any historical version\n4. Upserts/Deletes: MERGE, UPDATE, DELETE operations (Parquet = append-only)\n5. Scalable metadata: Z-Order clustering and data skipping avoid full scans\n6. Auto-compaction: small file problem managed automatically\n7. CDC support: Change Data Feed tracks row-level changes\nOn Azure: Delta Lake is the default format for Databricks and Microsoft Fabric Lakehouse.',
    difficulty: 'Medium',
    category: 'Delta Lake',
    tags: ['delta-lake', 'parquet', 'lakehouse', 'acid']
  }
];

export const ADF_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'adf-1',
    question: 'What is the difference between a Dataset and a Linked Service in ADF?',
    answer: 'Linked Service: a connection definition. It defines HOW to connect to a data source (connection string, authentication type, credentials). Think of it as a connection pool.\nDataset: a pointer to data within a linked service. It defines WHAT data to access (file path, table name, format, schema). A dataset always references a linked service.\nAnalogy: Linked Service = database connection. Dataset = the specific table or file you want to read/write.\nParameterization: both can be parameterized. A generic linked service + parameterized dataset can represent thousands of tables with one pair of objects.',
    difficulty: 'Easy',
    category: 'ADF Fundamentals',
    tags: ['adf', 'linked-service', 'dataset']
  },
  {
    id: 'adf-2',
    question: 'Explain the watermark pattern for incremental data loading in ADF.',
    answer: 'Watermark pattern: store the last successfully loaded timestamp/ID in a control table. Each pipeline run loads data > watermark value and updates the watermark.\nImplementation steps:\n1. Create watermark table: CREATE TABLE watermark (table_name NVARCHAR(100), watermark_value DATETIME)\n2. ADF Pipeline: Lookup activity reads current watermark → Copy activity loads WHERE modified_date > @watermark AND modified_date <= @pipeline_start_time → Stored Procedure activity updates watermark to pipeline_start_time.\nKey insight: use pipeline start time (not run end time) as the upper bound so concurrent modifications during the run are captured in the next load.',
    difficulty: 'Medium',
    category: 'ADF Patterns',
    tags: ['adf', 'incremental-load', 'watermark', 'pattern']
  },
  {
    id: 'adf-3',
    question: 'How does ADF CI/CD work with Git integration?',
    answer: 'ADF integrates with Azure Repos or GitHub. Dev branch: designers work here, artifacts stored as JSON in the repo. Main/collaboration branch: validated artifacts. Publish branch: auto-generated ARM templates on "Publish" click.\nCI/CD flow:\n1. Developer commits to feature branch → PR → code review → merge to main.\n2. CI pipeline runs automated tests (if any).\n3. CD pipeline: export ARM template from adf_publish branch → deploy to Test environment using ADF ARM template deployment task → deploy to Prod (with approval gate).\nGotcha: global parameters and IR configurations need environment-specific overrides using ARM parameter files. Use environment-specific linked services or parameters for connection strings.',
    difficulty: 'Hard',
    category: 'ADF DevOps',
    tags: ['adf', 'ci-cd', 'devops', 'arm', 'git']
  },
  {
    id: 'adf-4',
    question: 'What is a Mapping Data Flow in ADF and when should you use it vs a Copy Activity?',
    answer: 'Mapping Data Flow: a visually designed, Spark-based transformation engine. Runs on an Azure IR with Spark cluster underneath. Supports joins, aggregations, derived columns, pivots, unpivots, window functions – all visually.\nCopy Activity: optimized for raw data movement. Minimal transformation capability (basic column mapping). Uses ADF\'s own execution engine (not Spark). Much faster for bulk loads.\nWhen to use Data Flow: complex transformations (joins, aggregations, type conversion, SCD logic), when you want visual/no-code ETL.\nWhen to use Copy Activity: bulk data ingestion with minimal transformation (land raw to bronze), when speed and cost matter (Copy is cheaper than Data Flow).\nRule of thumb: Copy to land raw, Data Flow to transform, Databricks for heavy PySpark logic.',
    difficulty: 'Medium',
    category: 'ADF Activities',
    tags: ['adf', 'data-flow', 'copy-activity', 'transformation']
  },
  {
    id: 'adf-5',
    question: 'How would you implement error handling and retry logic in ADF?',
    answer: 'Activity-level: each activity has On Success, On Failure, On Completion, On Skip connections. Chain a "Send Email" or "Teams notification" activity on On Failure.\nRetry policy: set on the activity – retry count (e.g., 3), retry interval (e.g., 30s), with exponential backoff option.\nPipeline-level: wrap activities in Execute Pipeline activities, catch failures in parent pipeline.\nAlerts: Azure Monitor Alerts → ADF metric "Failed pipeline runs" → notification to email/webhook.\nError handling pattern:\n1. Try section: Copy Activity\n2. On Failure: Log error to Azure SQL error table + send Teams notification\n3. On Success: update watermark + log run to audit table\nCommon mistake: not distinguishing transient failures (network blip – retry helps) from permanent failures (schema mismatch – retry won\'t help).',
    difficulty: 'Medium',
    category: 'ADF Operations',
    tags: ['adf', 'error-handling', 'retry', 'monitoring']
  }
];

export const SCENARIO_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'scenario-1',
    question: 'Design a real-time data pipeline that ingests IoT telemetry from 10,000 devices and makes it available for dashboards within 30 seconds.',
    answer: 'Architecture: Devices → Event Hubs (10 partitions, 10 TUs) → Stream Analytics or Spark Structured Streaming → Two sinks:\n\nHot path (< 5 second latency): Event Hubs → Stream Analytics (5-second tumbling window aggregations) → Azure SQL or Cosmos DB → Power BI DirectQuery dashboard.\nWarm path (30-second latency): Event Hubs → Databricks Structured Streaming → Delta Lake (Gold streaming table with 30s trigger) → Synapse Serverless SQL → Power BI.\nCold path: Event Hubs Capture → ADLS Gen2 (Parquet) → Bronze Delta table → batch Databricks job for historical analytics.\n\nKey decisions: Partition Event Hubs by device_id for ordered processing per device. Use watermarks to handle late-arriving sensor data. Enable Azure Monitor for end-to-end latency tracking.',
    difficulty: 'Hard',
    category: 'System Design',
    tags: ['system-design', 'iot', 'streaming', 'real-time']
  },
  {
    id: 'scenario-2',
    question: 'Your daily ADF pipeline runs for 6 hours but needs to complete in 2. How do you diagnose and fix it?',
    answer: 'Diagnosis steps:\n1. ADF Monitor → Pipeline run → Activity breakdown: which activity is slowest?\n2. If Copy Activity is slow: check throughput (DIU count), source partition strategy, network bandwidth, compression.\n3. If Data Flow is slow: Spark UI → check stages, tasks, shuffle read/write, skew in task durations.\n\nFix strategies:\n1. Parallelize: ForEach activity with batch count = 10 instead of sequential. Break one big copy into 10 parallel copies per partition.\n2. Increase DIUs: for large file copies, increase Data Integration Units.\n3. Partition the source: use partition options in Copy (physical/dynamic range partitioning) to parallelize SQL reads.\n4. Fix Spark skew: if a Data Flow stage has skewed tasks, repartition by a more uniform key.\n5. Pushdown transformations: move filtering to source (SQL WHERE clause) before data enters ADF.\n6. Use PolyBase/COPY INTO for Synapse loads instead of INSERT rows.',
    difficulty: 'Hard',
    category: 'Performance',
    tags: ['adf', 'performance', 'debugging', 'optimization']
  },
  {
    id: 'scenario-3',
    question: 'How would you implement GDPR data deletion (right to be forgotten) in a lakehouse?',
    answer: 'Challenge: data lakes are historically append-only. GDPR requires physical deletion within 30 days of request.\n\nDelta Lake approach (recommended):\n1. Record deletion requests in a "deletion_requests" Delta table with user_id, timestamp, status.\n2. Run daily GDPR job: DELETE FROM bronze_table WHERE user_id IN (SELECT user_id FROM deletion_requests WHERE status = \'pending\')\n3. Delta VACUUM after retention period to physically remove old file versions: VACUUM table_name RETAIN 0 HOURS (override default 7-day retention with caution).\n4. Update deletion_requests status to \'completed\'.\n\nFor encrypted pseudonymization (alternative): store encryption key per user in Key Vault. Encrypt PII columns with user-specific key. Delete the key to "forget" – data becomes unreadable without key recovery.\n\nAudit trail: log all deletion operations to immutable audit log (Event Hub → ADLS with legal hold enabled).',
    difficulty: 'Hard',
    category: 'Compliance',
    tags: ['gdpr', 'compliance', 'delta-lake', 'data-deletion']
  }
];

export const ALL_QUESTIONS = [
  ...SQL_QUESTIONS,
  ...SPARK_QUESTIONS,
  ...AZURE_QUESTIONS,
  ...ADF_QUESTIONS,
  ...SCENARIO_QUESTIONS
];
