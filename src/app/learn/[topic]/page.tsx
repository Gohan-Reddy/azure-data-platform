'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { use } from 'react';
import {
  BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle2, Bookmark, BookmarkCheck,
  Copy, Check, ChevronDown, ChevronUp, Brain, Code2, Lightbulb, AlertTriangle,
  Target, ExternalLink, Award, Play, FileText, HelpCircle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/progress';
import { PHASES } from '@/data/roadmap';
import { getDifficultyBg, cn } from '@/lib/utils';
import { Topic } from '@/types';

// Rich content for specific topics
const TOPIC_CONTENT: Record<string, {
  simpleExplanation: string;
  deepExplanation: string;
  keyPoints: string[];
  commonMistakes: string[];
  interviewTips: string[];
  bestPractices: string[];
  codeExamples: { title: string; language: string; code: string; description?: string }[];
  resources: { title: string; url: string; type: string; free: boolean }[];
  quiz: { question: string; options: string[]; answer: number; explanation: string }[];
}> = {
  'python-core': {
    simpleExplanation: 'Python is the primary programming language for data engineering. Think of it as the universal tool in your DE toolkit — you use it to write scripts that move data, call APIs, process files, and orchestrate workflows.',
    deepExplanation: `Python for Data Engineering goes beyond basic scripting. As a DE, you'll use Python across three main areas:

**1. Ingestion scripts** – Calling REST APIs, reading files, connecting to databases. You need to handle pagination, rate limiting, retries with exponential backoff, and proper error handling.

**2. Transformation logic** – Processing data before loading it into the lake or warehouse. This includes parsing complex JSON, flattening nested structures, data type conversion, and business rule application.

**3. Orchestration** – Writing custom ADF activities, Databricks notebooks, Airflow DAGs, and Azure Functions. These all require solid Python fundamentals.

The key insight: data engineers write Python code that runs in production 24/7. This means your code needs to be robust (handles failures gracefully), observable (structured logs), and maintainable (well-organized, tested).`,
    keyPoints: [
      'Master file I/O: CSV, JSON, XML, YAML, Parquet with proper encoding handling',
      'Async/await with aiohttp for parallel API calls — massive speed improvement over sequential',
      'Logging module with structured JSON logs — never use print() in production',
      'Dataclasses and Pydantic for config validation and schema definition',
      'Virtual environments (venv, poetry) — always isolate dependencies',
      'pyproject.toml based packaging for sharing utilities across teams',
      'pytest for unit and integration tests — write tests from day 1'
    ],
    commonMistakes: [
      'Writing everything in Jupyter notebooks — learn modules and packages early',
      'Using print() instead of logging — you cannot search print output in production logs',
      'No error handling — transient failures (network, rate limits) need retry logic',
      'Skipping virtual environments — dependency conflicts will bite you in production',
      'Hardcoding credentials in scripts — always use environment variables or Key Vault',
      'No type hints — makes code harder to maintain and catches bugs early',
    ],
    interviewTips: [
      'Know how to implement exponential backoff for API retries (common coding question)',
      'Explain the difference between threading, multiprocessing, and asyncio — when each applies',
      'Show you can write a context manager (__enter__/__exit__)',
      'Demonstrate decorator usage for logging/timing/retry logic',
      'Explain GIL (Global Interpreter Lock) and why asyncio avoids it for I/O-bound tasks',
    ],
    bestPractices: [
      'Structure: separate config, ingestion, transformation, and loading concerns',
      'Logging: use structlog or logging with JSON formatter for searchable logs',
      'Config: use Pydantic BaseSettings to validate environment variables at startup',
      'Retry: use tenacity library for retry logic with exponential backoff',
      'Testing: aim for 80%+ coverage on transformation logic, 100% on business rules',
    ],
    codeExamples: [
      {
        title: 'Production-grade API ingestion with retry',
        language: 'python',
        description: 'The pattern used in real Azure Data Factory custom activities and ADF HTTP connectors',
        code: `import asyncio
import json
import logging
import time
from dataclasses import dataclass
from typing import AsyncGenerator
import aiohttp
from tenacity import retry, stop_after_attempt, wait_exponential

# Structured logging setup
logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}'
)
logger = logging.getLogger(__name__)

@dataclass
class APIConfig:
    base_url: str
    api_key: str
    page_size: int = 100
    max_retries: int = 3

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def fetch_page(session: aiohttp.ClientSession, url: str, params: dict) -> dict:
    """Fetch a single page with retry logic."""
    async with session.get(url, params=params) as response:
        if response.status == 429:  # Rate limited
            retry_after = int(response.headers.get('Retry-After', 60))
            logger.warning(f"Rate limited. Waiting {retry_after}s")
            await asyncio.sleep(retry_after)
            raise Exception("Rate limited, will retry")
        response.raise_for_status()
        return await response.json()

async def paginated_fetch(config: APIConfig, endpoint: str) -> AsyncGenerator[dict, None]:
    """Fetch all pages from a paginated API endpoint."""
    headers = {"Authorization": f"Bearer {config.api_key}"}
    params = {"page": 1, "per_page": config.page_size}

    async with aiohttp.ClientSession(headers=headers) as session:
        while True:
            start = time.time()
            data = await fetch_page(session, f"{config.base_url}/{endpoint}", params)
            elapsed = time.time() - start

            logger.info(
                "Fetched page",
                extra={"page": params["page"], "records": len(data.get("items", [])), "elapsed_ms": round(elapsed * 1000)}
            )

            for item in data.get("items", []):
                yield item

            if not data.get("has_next"):
                break
            params["page"] += 1

async def main():
    config = APIConfig(
        base_url="https://api.example.com",
        api_key="your-key-from-key-vault"
    )
    records = []
    async for record in paginated_fetch(config, "users"):
        records.append(record)

    with open("output.json", "w") as f:
        json.dump(records, f)
    logger.info(f"Saved {len(records)} records")

asyncio.run(main())`
      },
      {
        title: 'Pydantic config validation',
        language: 'python',
        code: `from pydantic import BaseSettings, validator, AnyUrl
from typing import Optional

class PipelineConfig(BaseSettings):
    """Type-safe config loaded from environment variables."""
    storage_account_name: str
    storage_account_key: str
    source_container: str = "raw"
    target_container: str = "silver"
    batch_size: int = 1000
    max_retries: int = 3

    class Config:
        env_prefix = "PIPELINE_"  # Reads PIPELINE_STORAGE_ACCOUNT_NAME etc.

    @validator("batch_size")
    def batch_size_positive(cls, v):
        if v <= 0:
            raise ValueError("batch_size must be positive")
        return v

# Usage — fails fast at startup if env vars are missing or invalid
config = PipelineConfig()
print(config.storage_account_name)  # From env: PIPELINE_STORAGE_ACCOUNT_NAME`
      },
      {
        title: 'Context manager for resource cleanup',
        language: 'python',
        code: `from contextlib import contextmanager
from azure.storage.blob import BlobServiceClient
import logging

logger = logging.getLogger(__name__)

@contextmanager
def blob_client(connection_string: str, container: str):
    """Context manager that ensures the blob client is always closed."""
    client = BlobServiceClient.from_connection_string(connection_string)
    container_client = client.get_container_client(container)
    try:
        logger.info(f"Opened connection to container: {container}")
        yield container_client
    except Exception as e:
        logger.error(f"Error in blob operation: {e}")
        raise
    finally:
        # Always cleanup, even if exception occurs
        logger.info("Closing blob connection")

# Usage
with blob_client(conn_str, "raw") as cc:
    blobs = list(cc.list_blobs())
    print(f"Found {len(blobs)} blobs")`
      }
    ],
    resources: [
      { title: 'Python Docs - Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'docs', free: true },
      { title: 'Real Python - Data Engineering track', url: 'https://realpython.com', type: 'course', free: false },
      { title: 'Fluent Python (Book)', url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492056232/', type: 'book', free: false },
      { title: 'tenacity - retry library', url: 'https://github.com/jd/tenacity', type: 'github', free: true },
      { title: 'Pydantic docs', url: 'https://docs.pydantic.dev', type: 'docs', free: true },
      { title: 'aiohttp tutorial', url: 'https://docs.aiohttp.org/en/stable/client_quickstart.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the difference between threading and asyncio in Python?',
        options: [
          'Threading is for I/O-bound tasks, asyncio is for CPU-bound tasks',
          'Threading uses OS threads (parallelism limited by GIL for CPU), asyncio uses single-thread cooperative concurrency (best for I/O-bound)',
          'They are identical in performance',
          'Asyncio requires multiple CPU cores'
        ],
        answer: 1,
        explanation: 'Threading creates OS threads but Python\'s GIL prevents true parallelism for CPU-bound work. Asyncio uses a single-thread event loop for cooperative concurrency — ideal for I/O-bound tasks like API calls, where most time is spent waiting for network responses.'
      },
      {
        question: 'Which logging approach is preferred in production data engineering?',
        options: [
          'print() statements for simplicity',
          'logging.basicConfig() with text format',
          'Structured JSON logging with context fields (timestamp, level, message, correlation_id)',
          'No logging — just check the data'
        ],
        answer: 2,
        explanation: 'Structured JSON logs are machine-readable and can be queried in Azure Log Analytics / Splunk / CloudWatch. They allow you to filter by correlation_id to trace a single pipeline run across distributed logs.'
      },
      {
        question: 'What is exponential backoff and why do you use it?',
        options: [
          'A data compression technique',
          'A retry strategy that doubles the wait time after each failure, preventing thundering herd on the target service',
          'A method to speed up API calls',
          'A caching strategy'
        ],
        answer: 1,
        explanation: 'Exponential backoff: first retry after 2s, second after 4s, third after 8s (with jitter). Prevents all retrying clients from hitting the same service simultaneously after a transient failure, reducing cascading failures.'
      }
    ]
  },
  'sql-fundamentals': {
    simpleExplanation: 'SQL (Structured Query Language) is the universal language for working with data. Every data engineer uses SQL daily — from extracting data in ADF to querying tables in Synapse to writing transformations in Databricks SQL.',
    deepExplanation: `SQL mastery for data engineers goes beyond SELECT statements. You need to understand the query engine's behavior:

**Execution order** (not the same as writing order):
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT

This matters because you cannot reference a SELECT alias in a WHERE clause, but you can in a HAVING clause.

**Window functions** are the senior engineer's secret weapon. They let you compute aggregations while keeping individual rows — running totals, moving averages, ranking, gaps-and-islands patterns.

**Query plans** are how you diagnose slow queries. Every seasoned DE can read an execution plan, identify table scans vs index seeks, and spot expensive sort operations.

**Transactions and isolation levels** matter when multiple writers hit the same table. Understanding SNAPSHOT isolation (used in Azure SQL) vs pessimistic locking is essential for DE pipeline design.`,
    keyPoints: [
      'SQL execution order: FROM→JOIN→WHERE→GROUP BY→HAVING→SELECT→ORDER BY',
      'Window functions operate AFTER GROUP BY — they see individual rows within groups',
      'CTEs don\'t materialize by default — use temp tables for expensive repeated subqueries',
      'Always use UNION ALL over UNION unless you need deduplication (UNION forces a sort)',
      'EXISTS is often faster than IN for large datasets — different execution strategies',
      'COALESCE vs ISNULL: COALESCE is ANSI standard, accepts multiple args',
    ],
    commonMistakes: [
      'Using SELECT * in production — always specify columns (less I/O, more readable)',
      'Not understanding HAVING vs WHERE — WHERE filters rows, HAVING filters groups',
      'Confusing window function frames (ROWS vs RANGE) — RANGE can be non-deterministic with ties',
      'Skipping execution plans when a query is slow',
      'Using CURSOR when set-based SQL would work — cursors are 100x slower',
      'Not using parameterized queries — leads to SQL injection and plan cache pollution',
    ],
    interviewTips: [
      'Always be able to write a query to find the Nth highest value in a table',
      'Know all window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, FIRST_VALUE',
      'Explain the difference between correlated and non-correlated subqueries',
      'Walk through how MERGE implements SCD Type 2 with a specific example',
      'Know what "parameter sniffing" is and how to fix it (common senior question)',
    ],
    bestPractices: [
      'Use CTEs for readability, temp tables for performance when the CTE is used multiple times',
      'Partition large tables on date columns — date range filters become partition elimination',
      'Index based on your query patterns: equality first, then range, then INCLUDE non-key columns',
      'Prefer set-based operations over row-by-row processing (no cursors)',
      'Always test with production-scale data — 100-row dev data hides performance issues',
    ],
    codeExamples: [
      {
        title: 'Window functions master class',
        language: 'sql',
        description: 'The most common window function patterns in DE interviews',
        code: `-- Running total and moving average
SELECT
    order_date,
    daily_revenue,
    SUM(daily_revenue) OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total,
    AVG(daily_revenue) OVER (ORDER BY order_date ROWS 6 PRECEDING) AS rolling_7_day_avg,
    LAG(daily_revenue, 1, 0) OVER (ORDER BY order_date) AS prev_day_revenue,
    daily_revenue - LAG(daily_revenue, 1, 0) OVER (ORDER BY order_date) AS day_over_day_change

FROM daily_sales;

-- Top-N per group (VERY common interview question)
-- "Find the top 3 customers by revenue per region"
WITH ranked AS (
    SELECT
        region,
        customer_id,
        total_revenue,
        ROW_NUMBER() OVER (PARTITION BY region ORDER BY total_revenue DESC) AS rn
    FROM customer_revenue
)
SELECT region, customer_id, total_revenue
FROM ranked
WHERE rn <= 3;

-- Gap-and-island: find consecutive date ranges
-- "Find sessions where users were continuously active"
WITH numbered AS (
    SELECT
        user_id,
        activity_date,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date) AS rn,
        DATEADD(day, -ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date), activity_date) AS grp
    FROM user_activity
)
SELECT user_id, MIN(activity_date) AS session_start, MAX(activity_date) AS session_end,
       COUNT(*) AS consecutive_days
FROM numbered
GROUP BY user_id, grp
ORDER BY user_id, session_start;`
      },
      {
        title: 'SCD Type 2 with MERGE',
        language: 'sql',
        description: 'The most important data warehousing pattern — preserve history in dimension tables',
        code: `-- SCD Type 2 implementation using MERGE
-- Assume: dim_customer has surrogate_key, customer_id, email, tier, is_current, valid_from, valid_to

MERGE dim_customer AS target
USING staging_customer AS source
ON target.customer_id = source.customer_id
    AND target.is_current = 1

-- Close old record when something meaningful changed
WHEN MATCHED AND (
    target.email <> source.email
    OR target.customer_tier <> source.customer_tier
    OR target.address <> source.address
) THEN
    UPDATE SET
        target.is_current = 0,
        target.valid_to = CAST(GETDATE() AS DATE)

-- Insert new customers (no match at all)
WHEN NOT MATCHED BY TARGET THEN
    INSERT (customer_id, email, customer_tier, address, is_current, valid_from, valid_to)
    VALUES (source.customer_id, source.email, source.customer_tier, source.address,
            1, CAST(GETDATE() AS DATE), '9999-12-31');

-- Insert new version for changed customers (MERGE can't do this in one step)
-- Run as a second statement:
INSERT INTO dim_customer (customer_id, email, customer_tier, address, is_current, valid_from, valid_to)
SELECT s.customer_id, s.email, s.customer_tier, s.address, 1, CAST(GETDATE() AS DATE), '9999-12-31'
FROM staging_customer s
INNER JOIN dim_customer d
    ON s.customer_id = d.customer_id
    AND d.valid_to = CAST(GETDATE() AS DATE)  -- just expired today`
      }
    ],
    resources: [
      { title: 'SQL Server Documentation', url: 'https://docs.microsoft.com/en-us/sql/sql-server/', type: 'docs', free: true },
      { title: 'StrataScratch - 300 SQL problems', url: 'https://stratascratch.com', type: 'practice', free: false },
      { title: 'LeetCode Database track', url: 'https://leetcode.com/problemset/database/', type: 'practice', free: true },
      { title: 'Use The Index, Luke (free online book)', url: 'https://use-the-index-luke.com', type: 'book', free: true },
      { title: 'SQL Window Functions (Mode Analytics)', url: 'https://mode.com/sql-tutorial/sql-window-functions/', type: 'course', free: true },
    ],
    quiz: [
      {
        question: 'What is the correct SQL execution order?',
        options: [
          'SELECT → FROM → WHERE → GROUP BY → HAVING',
          'FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
          'WHERE → FROM → SELECT → GROUP BY',
          'SELECT → WHERE → FROM → ORDER BY'
        ],
        answer: 1,
        explanation: 'SQL executes in this order: FROM (choose tables) → JOIN → WHERE (filter rows) → GROUP BY → HAVING (filter groups) → SELECT (choose columns) → DISTINCT → ORDER BY → LIMIT. This is why you cannot reference a SELECT alias in a WHERE clause.'
      },
      {
        question: 'When would you use ROW_NUMBER() instead of RANK()?',
        options: [
          'When you want to skip numbers after ties',
          'When you need unique sequential numbers with no ties (e.g., deduplication, pagination)',
          'When performance matters',
          'When sorting by multiple columns'
        ],
        answer: 1,
        explanation: 'ROW_NUMBER assigns unique sequential numbers even when values are tied. Perfect for: deduplication (keep the row with rn=1), pagination (WHERE rn BETWEEN 11 AND 20). RANK/DENSE_RANK are for leaderboard scenarios where ties should share a rank.'
      }
    ]
  }
};

const DEFAULT_CONTENT = {
  simpleExplanation: 'This topic covers essential Azure Data Engineering concepts that are critical for building production-grade data platforms.',
  deepExplanation: 'This is an advanced topic that requires understanding of both the theoretical concepts and practical implementation details. In real-world Azure data engineering, this knowledge is applied daily when designing, building, and maintaining data pipelines.',
  keyPoints: [
    'Understand the core concepts and how they fit into the Azure ecosystem',
    'Know when to use this service/pattern vs alternatives',
    'Be able to explain the architecture and trade-offs in interviews',
    'Have hands-on experience configuring and troubleshooting',
    'Know the security and networking considerations',
  ],
  commonMistakes: [
    'Not reading the documentation carefully before implementation',
    'Ignoring security best practices from the start',
    'Not considering performance implications at scale',
    'Skipping proper error handling and monitoring',
  ],
  interviewTips: [
    'Be able to draw the architecture on a whiteboard',
    'Know the key configuration options and trade-offs',
    'Have a real example from a project to reference',
    'Understand how this integrates with other Azure services',
  ],
  bestPractices: [
    'Follow Azure Well-Architected Framework principles',
    'Use managed identities instead of service principals where possible',
    'Implement proper monitoring and alerting from day one',
    'Use infrastructure as code (Bicep/Terraform) for all resources',
  ],
  codeExamples: [
    {
      title: 'Azure CLI - Common Commands',
      language: 'bash',
      code: `# Login to Azure
az login

# Set subscription
az account set --subscription "my-subscription-id"

# List resource groups
az group list --output table

# Create a resource group
az group create --name "rg-data-platform" --location "eastus2"

# Deploy a Bicep template
az deployment group create \\
  --resource-group "rg-data-platform" \\
  --template-file main.bicep \\
  --parameters environment=dev`
    }
  ],
  resources: [
    { title: 'Microsoft Learn - Azure Data Fundamentals', url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/', type: 'course', free: true },
    { title: 'Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/', type: 'docs', free: true },
    { title: 'Microsoft Tech Community - Azure DE', url: 'https://techcommunity.microsoft.com/t5/azure-data-engineering/bg-p/AzureDataEngineering', type: 'blog', free: true },
  ],
  quiz: [
    {
      question: 'Which Azure service is the primary managed ETL/ELT tool for orchestrating data movement?',
      options: ['Azure Databricks', 'Azure Data Factory', 'Azure Synapse Pipelines', 'Azure Functions'],
      answer: 1,
      explanation: 'Azure Data Factory is Azure\'s primary managed ETL/ELT service for data integration at scale. While Synapse has pipelines too (same engine), ADF is the dedicated service for data movement and transformation.'
    }
  ]
};

function CodeBlock({ code, language, title, description }: { code: string; language: string; title: string; description?: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <div>
          <span className="text-sm font-medium text-white">{title}</span>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-[#0d1117] px-2 py-0.5 rounded">{language}</span>
          <button onClick={copyCode} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-white/10">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function QuizSection({ questions }: { questions: typeof DEFAULT_CONTENT.quiz }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <div key={i} className="rounded-xl border border-border p-5">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0078d4] text-white text-xs flex items-center justify-center">{i + 1}</span>
            {q.question}
          </h4>
          <div className="space-y-2 mb-4">
            {q.options.map((option, j) => (
              <button
                key={j}
                onClick={() => setAnswers({ ...answers, [i]: j })}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                  answers[i] === j
                    ? revealed[i]
                      ? j === q.answer ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'
                      : 'bg-[#0078d4]/10 border-[#0078d4] text-[#0078d4]'
                    : revealed[i] && j === q.answer
                    ? 'bg-green-500/10 border-green-500 text-green-400'
                    : 'border-border hover:border-[#0078d4]/30 hover:bg-[#0078d4]/5'
                )}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + j)}.</span> {option}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {answers[i] !== undefined && !revealed[i] && (
              <Button size="sm" onClick={() => setRevealed({ ...revealed, [i]: true })}>Check Answer</Button>
            )}
            {revealed[i] && (
              <div className="flex-1 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = use(params);
  const [activeSection, setActiveSection] = useState('overview');
  const { isTopicComplete, markTopicComplete, markTopicIncomplete, isBookmarked, addBookmark, removeBookmark } = useProgressStore();

  // Find the topic across all phases
  let topicData: Topic | null = null;
  let phaseData = null;
  let topicIndex = 0;
  let nextTopic: Topic | null = null;
  let prevTopic: Topic | null = null;

  for (const phase of PHASES) {
    const idx = phase.topics.findIndex(t => t.slug === topic);
    if (idx !== -1) {
      topicData = phase.topics[idx];
      phaseData = phase;
      topicIndex = idx;
      prevTopic = idx > 0 ? phase.topics[idx - 1] : null;
      nextTopic = idx < phase.topics.length - 1 ? phase.topics[idx + 1] : null;
      break;
    }
  }

  const content = TOPIC_CONTENT[topic] || DEFAULT_CONTENT;
  const isComplete = topicData ? isTopicComplete(topicData.id) : false;
  const bookmarked = topicData ? isBookmarked(topicData.id) : false;

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'deep-dive', label: 'Deep Dive', icon: Brain },
    { id: 'code', label: 'Code Examples', icon: Code2 },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'resources', label: 'Resources', icon: ExternalLink },
  ];

  if (!topicData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
          <p className="text-muted-foreground mb-6">The topic "{topic}" doesn't exist in our curriculum.</p>
          <Link href="/roadmap"><Button>Browse All Topics</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/roadmap" className="hover:text-foreground transition-colors">Roadmap</Link>
          <ChevronDown className="w-3 h-3 -rotate-90" />
          <span className="text-foreground">{topicData.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Topic info */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={topicData.difficulty === 'Beginner' ? 'success' : topicData.difficulty === 'Intermediate' ? 'warning' : 'danger'} className="border text-xs">
                      {topicData.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{topicData.estimatedTime}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {topicData.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => isComplete ? markTopicIncomplete(topicData!.id) : markTopicComplete(topicData!.id)}
                      variant={isComplete ? 'secondary' : 'default'}
                      className="w-full"
                    >
                      {isComplete ? (
                        <><CheckCircle2 className="w-4 h-4 text-green-500" />Completed</>
                      ) : (
                        <><Target className="w-4 h-4" />Mark Complete</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => bookmarked ? removeBookmark(topicData!.id) : addBookmark(topicData!.id)}
                    >
                      {bookmarked ? <><BookmarkCheck className="w-4 h-4" />Bookmarked</> : <><Bookmark className="w-4 h-4" />Bookmark</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation sections */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    {sections.map(section => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left',
                          activeSection === section.id
                            ? 'bg-[#0078d4]/10 text-[#0078d4]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )}
                      >
                        <section.icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Phase context */}
              {phaseData && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">Part of</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center" style={{ background: phaseData.color }}>
                        {phaseData.number}
                      </div>
                      <span className="text-sm font-medium">{phaseData.title}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Topic {topicIndex + 1} of {phaseData.topics.length}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-bold mb-3">{topicData.title}</h1>
              <p className="text-lg text-muted-foreground mb-8">{topicData.description}</p>

              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="space-y-8">
                  {/* Simple Explanation */}
                  <Card className="border-[#0078d4]/20 bg-[#0078d4]/5">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-[#0078d4]" />
                        <h2 className="font-bold text-lg">Simple Explanation</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{content.simpleExplanation}</p>
                    </CardContent>
                  </Card>

                  {/* Learning Objectives */}
                  {topicData.objectives.length > 0 && (
                    <div>
                      <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#0078d4]" />Learning Objectives
                      </h2>
                      <div className="space-y-2">
                        {topicData.objectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Points */}
                  <div>
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />Key Points
                    </h2>
                    <div className="space-y-2">
                      {content.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-[#0078d4]/30 transition-colors">
                          <div className="w-5 h-5 rounded-full bg-[#0078d4]/10 text-[#0078d4] text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Mistakes */}
                  <div>
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />Common Mistakes
                    </h2>
                    <div className="space-y-2">
                      {content.commonMistakes.map((mistake, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-sm">{mistake}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interview Tips */}
                  <div>
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-purple-500" />Interview Tips
                    </h2>
                    <div className="space-y-2">
                      {content.interviewTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                          <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div>
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-500" />Best Practices
                    </h2>
                    <div className="space-y-2">
                      {content.bestPractices.map((bp, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                          <span className="text-sm">{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Deep Dive Section */}
              {activeSection === 'deep-dive' && (
                <div className="prose dark:prose-invert max-w-none">
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <h2 className="font-bold text-xl mb-4">Deep Technical Explanation</h2>
                      <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                        {content.deepExplanation}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Code Examples Section */}
              {activeSection === 'code' && (
                <div className="space-y-4">
                  <h2 className="font-bold text-xl mb-4">Code Examples</h2>
                  {content.codeExamples.map((example, i) => (
                    <CodeBlock key={i} {...example} />
                  ))}
                </div>
              )}

              {/* Quiz Section */}
              {activeSection === 'quiz' && (
                <div>
                  <h2 className="font-bold text-xl mb-6">Knowledge Check</h2>
                  <QuizSection questions={content.quiz} />
                </div>
              )}

              {/* Resources Section */}
              {activeSection === 'resources' && (
                <div>
                  <h2 className="font-bold text-xl mb-6">Learning Resources</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {content.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-4 rounded-xl border border-border hover:border-[#0078d4]/50 bg-background/50 hover:bg-[#0078d4]/5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-sm mb-1 group-hover:text-[#0078d4] transition-colors">{resource.title}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant={resource.free ? 'success' : 'warning'} className="text-xs border">
                                {resource.free ? 'Free' : 'Paid'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#0078d4] transition-colors shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
                {prevTopic ? (
                  <Link href={`/learn/${prevTopic.slug}`}>
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      {prevTopic.title}
                    </Button>
                  </Link>
                ) : <div />}

                {nextTopic && (
                  <Link href={`/learn/${nextTopic.slug}`}>
                    <Button variant="gradient" className="gap-2">
                      {nextTopic.title}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
