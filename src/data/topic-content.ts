export type TopicContentEntry = {
  simpleExplanation: string;
  deepExplanation: string;
  keyPoints: string[];
  commonMistakes: string[];
  interviewTips: string[];
  bestPractices: string[];
  codeExamples: { title: string; language: string; code: string; description?: string }[];
  resources: { title: string; url: string; type: string; free: boolean }[];
  quiz: { question: string; options: string[]; answer: number; explanation: string }[];
};

export const TOPIC_CONTENT: Record<string, TopicContentEntry> = {

  // ─── PHASE 1 ────────────────────────────────────────────────────────────────

  'python-core': {
    simpleExplanation: 'Python is the primary programming language for data engineering. Think of it as the universal tool in your DE toolkit — you use it to write scripts that move data, call APIs, process files, and orchestrate workflows.',
    deepExplanation: `**Python for Data Engineering**\n\nPython for Data Engineering goes beyond basic scripting. As a DE, you'll use Python across three main areas:\n\n**1. Ingestion scripts** – Calling REST APIs, reading files, connecting to databases. You need to handle pagination, rate limiting, retries with exponential backoff, and proper error handling.\n\n**2. Transformation logic** – Processing data before loading it into the lake or warehouse. This includes parsing complex JSON, flattening nested structures, data type conversion, and business rule application.\n\n**3. Orchestration** – Writing custom ADF activities, Databricks notebooks, and Azure Functions. These all require solid Python fundamentals.\n\nThe key insight: data engineers write Python code that runs in production 24/7. Your code must be robust, observable (structured logs), and maintainable.`,
    keyPoints: [
      'Master file I/O: CSV, JSON, XML, YAML, Parquet with proper encoding handling',
      'Async/await with aiohttp for parallel API calls — massive speed improvement over sequential',
      'Logging module with structured JSON logs — never use print() in production',
      'Dataclasses and Pydantic for config validation and schema definition',
      'Virtual environments (venv, poetry) — always isolate dependencies',
      'pytest for unit and integration tests — write tests from day 1',
    ],
    commonMistakes: [
      'Writing everything in Jupyter notebooks — learn modules and packages early',
      'Using print() instead of logging — you cannot search print output in production logs',
      'No error handling — transient failures (network, rate limits) need retry logic',
      'Hardcoding credentials in scripts — always use environment variables or Key Vault',
    ],
    interviewTips: [
      'Know how to implement exponential backoff for API retries (common coding question)',
      'Explain the difference between threading, multiprocessing, and asyncio',
      'Show you can write a context manager (__enter__/__exit__)',
      'Explain GIL (Global Interpreter Lock) and why asyncio avoids it for I/O-bound tasks',
    ],
    bestPractices: [
      'Separate config, ingestion, transformation, and loading concerns into modules',
      'Use structlog or logging with JSON formatter for searchable logs',
      'Use Pydantic BaseSettings to validate environment variables at startup',
      'Use tenacity library for retry logic with exponential backoff',
    ],
    codeExamples: [
      {
        title: 'Production-grade API ingestion with retry',
        language: 'python',
        description: 'The pattern used in real ADF custom activities',
        code: `import asyncio, json, logging, time
from dataclasses import dataclass
from typing import AsyncGenerator
import aiohttp
from tenacity import retry, stop_after_attempt, wait_exponential

logging.basicConfig(level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","msg":"%(message)s"}')
logger = logging.getLogger(__name__)

@dataclass
class APIConfig:
    base_url: str
    api_key: str
    page_size: int = 100

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=4, max=10))
async def fetch_page(session: aiohttp.ClientSession, url: str, params: dict) -> dict:
    async with session.get(url, params=params) as r:
        if r.status == 429:
            await asyncio.sleep(int(r.headers.get('Retry-After', 60)))
            raise Exception("Rate limited")
        r.raise_for_status()
        return await r.json()

async def paginated_fetch(config: APIConfig, endpoint: str) -> AsyncGenerator[dict, None]:
    headers = {"Authorization": f"Bearer {config.api_key}"}
    params = {"page": 1, "per_page": config.page_size}
    async with aiohttp.ClientSession(headers=headers) as session:
        while True:
            data = await fetch_page(session, f"{config.base_url}/{endpoint}", params)
            for item in data.get("items", []):
                yield item
            if not data.get("has_next"):
                break
            params["page"] += 1`,
      },
      {
        title: 'Pydantic config validation',
        language: 'python',
        code: `from pydantic import BaseSettings, validator

class PipelineConfig(BaseSettings):
    storage_account_name: str
    source_container: str = "raw"
    batch_size: int = 1000

    class Config:
        env_prefix = "PIPELINE_"

    @validator("batch_size")
    def batch_size_positive(cls, v):
        if v <= 0:
            raise ValueError("batch_size must be positive")
        return v

config = PipelineConfig()  # Fails fast if env vars missing`,
      },
    ],
    resources: [
      { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'docs', free: true },
      { title: 'tenacity retry library', url: 'https://github.com/jd/tenacity', type: 'github', free: true },
      { title: 'Pydantic docs', url: 'https://docs.pydantic.dev', type: 'docs', free: true },
      { title: 'aiohttp quickstart', url: 'https://docs.aiohttp.org/en/stable/client_quickstart.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the difference between threading and asyncio in Python?',
        options: [
          'Threading is for I/O-bound tasks, asyncio is for CPU-bound tasks',
          'Threading uses OS threads (parallelism limited by GIL for CPU), asyncio uses single-thread cooperative concurrency best for I/O',
          'They are identical in performance',
          'Asyncio requires multiple CPU cores',
        ],
        answer: 1,
        explanation: 'Threading creates OS threads but Python\'s GIL prevents true CPU parallelism. Asyncio uses a single-thread event loop — ideal for I/O-bound tasks like API calls.',
      },
      {
        question: 'Which logging approach is preferred in production?',
        options: [
          'print() statements for simplicity',
          'logging.basicConfig() with text format',
          'Structured JSON logging with timestamp, level, message, correlation_id',
          'No logging — just check the data',
        ],
        answer: 2,
        explanation: 'Structured JSON logs are machine-readable and queryable in Azure Log Analytics. They let you filter by correlation_id to trace a single pipeline run across distributed systems.',
      },
    ],
  },

  'python-oop': {
    simpleExplanation: 'Object-Oriented Programming lets you bundle data and behavior together into reusable "blueprints" called classes — instead of writing the same logic over and over, you build it once and reuse it everywhere.',
    deepExplanation: `**Why OOP matters in Data Engineering**\n\nAs a data engineer, you write pipelines that share a lot of common logic: connecting to storage, logging, error handling, config loading. OOP lets you build that logic once in a base class and reuse it across all your pipelines.\n\n**Classes, inheritance, and composition**\nA class is a template. Inheritance lets a child class get all the behavior of a parent. Composition (using other objects inside a class) is often preferred over deep inheritance trees — it's more flexible.\n\n**Modules and packages**\nA module is a .py file. A package is a folder with an __init__.py. Organizing your DE code into packages (ingestion/, transformation/, utils/) makes it maintainable and testable.\n\n**Virtual environments**\nvenv or poetry create isolated Python environments so your pipeline's dependencies don't clash with other projects on the same machine or server.`,
    keyPoints: [
      'Classes encapsulate state (attributes) and behavior (methods) together',
      'Use __init__ for initialization, @property for computed attributes',
      '@dataclass decorator auto-generates __init__, __repr__, __eq__ — great for config objects',
      'Abstract base classes (ABC) enforce an interface contract across pipeline implementations',
      'Use composition over inheritance for complex pipelines — avoid deep class hierarchies',
      'Package structure: src/ingestion/__init__.py, src/transformation/__init__.py, etc.',
    ],
    commonMistakes: [
      'Using mutable default arguments in __init__ (e.g., def __init__(self, items=[]) is a bug — items is shared)',
      'Deep inheritance chains (5+ levels) that become impossible to understand',
      'Not using dataclasses for simple data containers — writing boilerplate __init__ manually',
      'Forgetting to call super().__init__() in child classes when overriding __init__',
    ],
    interviewTips: [
      'Explain the four pillars: encapsulation, inheritance, polymorphism, abstraction',
      'Show how you would design a base Extractor class and concrete implementations (SqlExtractor, APIExtractor)',
      'Know the difference between @staticmethod, @classmethod, and instance methods',
      'Explain __enter__ and __exit__ for context managers (very common for resource management)',
    ],
    bestPractices: [
      'Use @dataclass for config/DTO objects — eliminates boilerplate and adds __repr__ for free',
      'Keep classes small and focused on one responsibility (SRP)',
      'Use ABC to define pipeline interfaces: abstract extract(), transform(), load() methods',
      'Use poetry for dependency management — pyproject.toml replaces setup.py + requirements.txt',
    ],
    codeExamples: [
      {
        title: 'Abstract base pipeline with concrete implementations',
        language: 'python',
        description: 'The pattern used to build reusable DE library code',
        code: `from abc import ABC, abstractmethod
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class PipelineConfig:
    source: str
    target: str
    batch_size: int = 1000

class BasePipeline(ABC):
    """All pipelines share logging and config loading."""

    def __init__(self, config: PipelineConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)

    @abstractmethod
    def extract(self) -> list:
        """Subclasses must implement extraction logic."""
        ...

    @abstractmethod
    def transform(self, data: list) -> list:
        """Subclasses must implement transformation logic."""
        ...

    def load(self, data: list) -> None:
        self.logger.info(f"Loading {len(data)} records to {self.config.target}")

    def run(self) -> None:
        raw = self.extract()
        transformed = self.transform(raw)
        self.load(transformed)
        self.logger.info("Pipeline complete")


class SqlToBlobPipeline(BasePipeline):
    def extract(self) -> list:
        self.logger.info(f"Extracting from SQL: {self.config.source}")
        return [{"id": 1, "value": "example"}]  # Real: run SQL query

    def transform(self, data: list) -> list:
        return [{**row, "processed": True} for row in data]


config = PipelineConfig(source="sql://mydb/orders", target="blob://raw/orders/")
SqlToBlobPipeline(config).run()`,
      },
    ],
    resources: [
      { title: 'Python OOP docs', url: 'https://docs.python.org/3/tutorial/classes.html', type: 'docs', free: true },
      { title: 'Python dataclasses', url: 'https://docs.python.org/3/library/dataclasses.html', type: 'docs', free: true },
      { title: 'Poetry dependency manager', url: 'https://python-poetry.org/docs/', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the problem with this code: def __init__(self, items=[])?',
        options: [
          'It is a syntax error',
          'The list is shared across all instances — mutations to items in one instance affect others',
          'Lists cannot be used as default arguments',
          'No problem, this is fine',
        ],
        answer: 1,
        explanation: 'Mutable default arguments are created once at function definition time, not on each call. Every instance shares the same list object. Fix: use def __init__(self, items=None): self.items = items or []',
      },
    ],
  },

  'python-concurrency': {
    simpleExplanation: 'Concurrency lets your Python code do multiple things at once — instead of waiting for one API call to finish before starting the next, you fire off 10 simultaneously and collect all results at once.',
    deepExplanation: `**Three concurrency models in Python**\n\n**asyncio (async/await)** — single-threaded cooperative multitasking. When your code awaits an I/O operation (network call, file read), the event loop runs another coroutine instead of blocking. This is the best model for data engineering work involving many API calls or database queries because I/O is the bottleneck, not CPU.\n\n**Threading (concurrent.futures.ThreadPoolExecutor)** — OS threads. Multiple threads share memory. Python's GIL prevents true parallel CPU execution, but threads are fine for I/O-bound work. Use when you need to call existing blocking (non-async) libraries.\n\n**Multiprocessing (concurrent.futures.ProcessPoolExecutor)** — separate processes, each with their own Python interpreter and GIL. True parallelism for CPU-bound work like heavy data transformation. More overhead than threads (process startup cost, no shared memory).\n\n**Choosing the right model**: API calls / database queries → asyncio. Blocking libraries that don't support async → ThreadPoolExecutor. CPU-intensive transformation → ProcessPoolExecutor.`,
    keyPoints: [
      'async def defines a coroutine; await pauses it without blocking the event loop',
      'asyncio.gather() runs multiple coroutines concurrently and waits for all to finish',
      'ThreadPoolExecutor: use loop.run_in_executor() to run blocking code from async context',
      'aiohttp for async HTTP; asyncpg for async PostgreSQL; aiobotocore for async AWS S3',
      'Semaphore controls concurrency: asyncio.Semaphore(10) limits to 10 concurrent requests',
    ],
    commonMistakes: [
      'Mixing blocking calls inside async functions — this blocks the entire event loop',
      'Using asyncio.sleep(0) as a hack instead of understanding the event loop properly',
      'Creating a new event loop manually when one already exists (common in Jupyter)',
      'Using multiprocessing for I/O-bound work — overkill, asyncio is better',
    ],
    interviewTips: [
      'Explain GIL and why it doesn\'t prevent asyncio from being effective for I/O',
      'Show asyncio.gather() vs asyncio.create_task() — what\'s the difference?',
      'Describe how you would parallelize 1000 API calls with rate limiting (Semaphore)',
      'Explain what happens when you call a blocking function inside an async function',
    ],
    bestPractices: [
      'Use asyncio + aiohttp for all new HTTP-based ingestion pipelines',
      'Always set a Semaphore to prevent overwhelming target APIs',
      'Use asyncio.timeout() (Python 3.11+) or asyncio.wait_for() for per-request timeouts',
      'Run ProcessPoolExecutor tasks for CPU-heavy transformation in parallel',
    ],
    codeExamples: [
      {
        title: 'Parallel API ingestion with rate limiting',
        language: 'python',
        description: 'Fetch 100 endpoints concurrently, max 10 at a time',
        code: `import asyncio
import aiohttp

async def fetch_one(session: aiohttp.ClientSession, url: str, sem: asyncio.Semaphore) -> dict:
    async with sem:  # max 10 concurrent requests
        async with session.get(url) as r:
            r.raise_for_status()
            return await r.json()

async def fetch_all(urls: list[str], concurrency: int = 10) -> list[dict]:
    sem = asyncio.Semaphore(concurrency)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url, sem) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
    # Filter out errors
    return [r for r in results if not isinstance(r, Exception)]

urls = [f"https://api.example.com/data/{i}" for i in range(100)]
results = asyncio.run(fetch_all(urls))
print(f"Fetched {len(results)} records")`,
      },
    ],
    resources: [
      { title: 'asyncio official docs', url: 'https://docs.python.org/3/library/asyncio.html', type: 'docs', free: true },
      { title: 'concurrent.futures docs', url: 'https://docs.python.org/3/library/concurrent.futures.html', type: 'docs', free: true },
      { title: 'aiohttp docs', url: 'https://docs.aiohttp.org/en/stable/', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What happens if you call requests.get() inside an async function?',
        options: [
          'It works fine — Python handles the conversion automatically',
          'It blocks the entire event loop, preventing all other coroutines from running',
          'It raises a RuntimeError immediately',
          'It runs in a background thread automatically',
        ],
        answer: 1,
        explanation: 'requests.get() is a blocking call. Inside an async function, it blocks the event loop thread entirely, freezing all other coroutines. Use aiohttp instead, or wrap with loop.run_in_executor() if you must use blocking code.',
      },
    ],
  },

  'linux-shell': {
    simpleExplanation: 'Linux and shell scripting are the operating system tools every data engineer needs to debug servers, schedule jobs, move files, and automate repetitive tasks on the machines where your pipelines run.',
    deepExplanation: `**Why Linux matters for Data Engineers**\n\nMost Azure VMs, Databricks clusters, and container images run Linux. When a Self-Hosted Integration Runtime (SHIR) crashes at 2AM, you SSH in and debug it from the command line. When a Spark job runs out of disk space, you check partitions with df -h. Linux fluency is not optional for senior engineers.\n\n**The essential toolkit**\nNavigating the filesystem (cd, ls, find), reading files (cat, less, head, tail), searching text (grep, awk, sed), process management (ps, kill, top), permissions (chmod, chown), and scheduling (cron) cover 90% of daily DE Linux work.\n\n**Shell scripting for automation**\nBash scripts let you combine commands into reusable programs. You use them to automate backups, rotate logs, trigger Python scripts on a schedule, and wrap CLI tools like az, databricks, and adf.\n\n**SSH and remote access**\nSSH key pairs (ssh-keygen, ssh-copy-id) are how you securely connect to VMs. Understanding ~/.ssh/config makes managing multiple servers much easier.`,
    keyPoints: [
      'grep -r "pattern" /path searches recursively — add -i for case insensitive',
      'awk \'{print $1}\' splits by whitespace and prints field 1 — powerful for log parsing',
      'find /path -name "*.log" -mtime +7 finds log files older than 7 days',
      'crontab -e opens the cron editor; "0 2 * * *" means daily at 2AM',
      'chmod 755 file = owner rwx, group r-x, others r-x — know the octal notation',
      'tail -f /var/log/app.log follows a log file in real time — essential for debugging',
    ],
    commonMistakes: [
      'Running rm -rf as root without double-checking the path — destroys data instantly',
      'Not using quotes around variables in scripts: $VAR should be "$VAR" to handle spaces',
      'Forgetting set -e and set -u in bash scripts — errors pass silently without them',
      'Writing cron paths without absolute paths — cron runs with a minimal $PATH',
    ],
    interviewTips: [
      'Know how to check disk usage (df -h) and which process is using most CPU/memory (top, htop)',
      'Be able to write a bash script that runs a Python script and emails on failure',
      'Explain file permissions: what does chmod 644 mean?',
      'Know how to find which process is listening on a port: lsof -i :8080',
    ],
    bestPractices: [
      'Always start bash scripts with #!/bin/bash and set -euo pipefail',
      'Use ssh-agent and key pairs instead of passwords for SSH access',
      'Log output of cron jobs: 0 2 * * * /script.sh >> /var/log/script.log 2>&1',
      'Use tmux or screen for long-running sessions over SSH — disconnect-safe',
    ],
    codeExamples: [
      {
        title: 'Production bash script template',
        language: 'bash',
        description: 'The safest way to write scripts that run in production',
        code: `#!/bin/bash
set -euo pipefail  # Exit on error, undefined var, pipe failure

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/data-pipeline/$(date +%Y%m%d).log"
PYTHON_SCRIPT="$SCRIPT_DIR/ingest.py"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

cleanup() {
  log "Script exiting with status $?"
}
trap cleanup EXIT

log "Starting pipeline..."
python3 "$PYTHON_SCRIPT" --config "$SCRIPT_DIR/config.yaml"
log "Pipeline completed successfully"`,
      },
      {
        title: 'Log analysis with grep and awk',
        language: 'bash',
        code: `# Find all ERROR lines in the last hour
grep "ERROR" /var/log/app.log | tail -100

# Count errors by type
awk '/ERROR/ {print $5}' app.log | sort | uniq -c | sort -rn

# Find files over 1GB
find /data -size +1G -type f -ls

# Show top 10 disk-consuming directories
du -sh /data/* | sort -rh | head -10

# Real-time log following with filter
tail -f /var/log/spark/driver.log | grep -v "INFO"`,
      },
    ],
    resources: [
      { title: 'Linux Command Line (free book)', url: 'https://linuxcommand.org/tlcl.php', type: 'book', free: true },
      { title: 'Bash Reference Manual', url: 'https://www.gnu.org/software/bash/manual/', type: 'docs', free: true },
      { title: 'explainshell.com', url: 'https://explainshell.com', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What does set -euo pipefail do at the top of a bash script?',
        options: [
          'Sets environment variables for the script',
          'Exits on any error (-e), treats unset variables as errors (-u), and makes pipe failures visible (-o pipefail)',
          'Enables verbose mode',
          'Sets file permissions',
        ],
        answer: 1,
        explanation: 'Without set -e, bash silently continues after errors. Without -u, unset variables expand to empty strings causing subtle bugs. Without pipefail, a failed command in a pipe (cmd1 | cmd2) is invisible because the pipe returns cmd2\'s exit code.',
      },
    ],
  },

  'git-version-control': {
    simpleExplanation: 'Git is the save-and-share system for code — it tracks every change you make, lets you work on separate features without breaking each other\'s work, and enables you to roll back any mistake in seconds.',
    deepExplanation: `**Git fundamentals for data engineers**\n\nGit tracks changes by storing snapshots (commits) of your project. Every commit has a unique hash, a message, and a pointer to its parent. This chain of commits is your project's entire history.\n\n**Branching strategy**\nIn professional teams, you never commit directly to main. You create a feature branch, make your changes, open a Pull Request (PR), get code reviewed, and merge. This protects main from broken code and enables parallel development.\n\n**Merging vs Rebasing**\nMerge creates a merge commit preserving all branch history. Rebase replays your commits on top of main giving a linear history. Most teams use merge for shared branches and rebase for keeping feature branches up to date.\n\n**ADF and Databricks with Git**\nADF integrates with Azure Repos — every pipeline change is saved as JSON in Git. Databricks Repos syncs notebooks with Git. This means your data pipelines follow the same review and CI/CD process as application code.`,
    keyPoints: [
      'git status, git diff, git log --oneline are your most-used daily commands',
      'git stash saves uncommitted changes temporarily so you can switch branches',
      'git reset --hard HEAD~1 deletes the last commit permanently — use with caution',
      'git revert <hash> creates a new commit that undoes a change — safe for shared branches',
      '.gitignore should exclude: .env files, __pycache__, *.pyc, .venv, *.tfstate',
      'Commit messages: use imperative mood: "Add watermark logic" not "Added" or "Adding"',
    ],
    commonMistakes: [
      'Committing secrets (.env files, API keys, connection strings) to the repo',
      'Making huge commits with 50 changed files — small focused commits are much easier to review',
      'Not pulling before pushing, causing unnecessary merge conflicts',
      'Deleting branches before merging — you lose all history of that work',
    ],
    interviewTips: [
      'Explain the difference between git merge and git rebase',
      'How do you resolve a merge conflict? Walk through the steps',
      'What is git cherry-pick and when would you use it?',
      'Explain the Gitflow branching strategy and why it\'s used in DE teams',
    ],
    bestPractices: [
      'Use git hooks (pre-commit) to run linting and secret scanning before every commit',
      'Set up .gitignore before your first commit — adding it later is messy',
      'Use signed commits (git config commit.gpgsign true) for auditable pipelines',
      'Use branch protection rules on main: require PR + 1 reviewer before merging',
    ],
    codeExamples: [
      {
        title: 'Essential git workflow',
        language: 'bash',
        code: `# Daily workflow
git checkout -b feature/add-watermark-logic  # Create feature branch
git add src/pipelines/watermark.py           # Stage specific files
git commit -m "Add watermark pattern for incremental loads"
git push -u origin feature/add-watermark-logic  # Push and set upstream

# Keep branch up to date with main
git fetch origin
git rebase origin/main

# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Undo changes to a specific file
git checkout -- src/config.py

# View history as a graph
git log --oneline --graph --all`,
      },
      {
        title: '.gitignore for a DE Python project',
        language: 'bash',
        code: `# Python
__pycache__/
*.py[cod]
.venv/
.env
*.egg-info/

# Secrets & credentials
*.json.key
credentials.json
service_account*.json

# Terraform
*.tfstate
*.tfstate.backup
.terraform/

# IDE
.vscode/settings.json
.idea/

# Data files (never commit raw data)
data/
*.csv
*.parquet`,
      },
    ],
    resources: [
      { title: 'Pro Git Book (free)', url: 'https://git-scm.com/book/en/v2', type: 'book', free: true },
      { title: 'GitHub Git Cheatsheet', url: 'https://education.github.com/git-cheat-sheet-education.pdf', type: 'docs', free: true },
      { title: 'Conventional Commits', url: 'https://www.conventionalcommits.org/', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the safest way to undo a commit that has already been pushed to a shared branch?',
        options: [
          'git reset --hard HEAD~1 then force push',
          'git revert <commit-hash> — creates a new commit that undoes the changes',
          'Delete the branch and recreate it',
          'Manually edit the files back',
        ],
        answer: 1,
        explanation: 'git revert creates a new commit that undoes the target commit\'s changes. This preserves history and is safe on shared branches. git reset --hard + force push rewrites history and breaks everyone else\'s local copies.',
      },
    ],
  },

  // ─── PHASE 2 ────────────────────────────────────────────────────────────────

  'sql-fundamentals': {
    simpleExplanation: 'SQL is the universal language for talking to data — every data engineer uses it daily to extract, filter, join, and aggregate data, whether in Azure Synapse, Databricks SQL, or a traditional database.',
    deepExplanation: `**SQL execution order**\n\nSQL doesn't execute in the order you write it. The actual order is: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. This is why you can't use a SELECT alias in a WHERE clause — WHERE runs before SELECT.\n\n**JOINs in depth**\nInner join returns only matching rows. Left join returns all rows from the left table. Full outer join returns all rows from both. The anti-join pattern (LEFT JOIN WHERE right.id IS NULL) finds rows in the left table with no match — extremely common in DE for finding new/deleted records.\n\n**CTEs vs subqueries vs temp tables**\nCTEs (WITH clauses) improve readability and support recursion. Subqueries are fine for simple one-time filters. For expensive queries used multiple times, a temp table materializes the result and avoids re-execution.\n\n**Transactions**\nACID transactions guarantee data integrity. In Delta Lake, ACID is provided by the transaction log. In Synapse Dedicated SQL, transactions use table-level locks — be careful with long-running transactions.`,
    keyPoints: [
      'SQL execution order: FROM→JOIN→WHERE→GROUP BY→HAVING→SELECT→ORDER BY',
      'Always use UNION ALL over UNION unless you specifically need deduplication',
      'EXISTS is often faster than IN for large subqueries — different query plans',
      'CTEs don\'t materialize by default — use temp tables if the CTE is expensive and reused',
      'COALESCE(a, b, c) returns the first non-null value — standard and multi-argument',
      'NULL is not equal to anything, including itself — always use IS NULL, not = NULL',
    ],
    commonMistakes: [
      'SELECT * in production — always specify columns to reduce I/O and document intent',
      'Using WHERE to filter after GROUP BY instead of HAVING',
      'Not parameterizing queries — causes SQL injection and pollutes the plan cache',
      'Using cursors when set-based SQL would work — cursors are 100x slower',
    ],
    interviewTips: [
      'Always be able to write a query to find the Nth highest value using DENSE_RANK',
      'Know how to implement SCD Type 2 with MERGE statement',
      'Explain the difference between correlated and non-correlated subqueries',
      'Know what "parameter sniffing" is and how to diagnose it (common senior-level question)',
    ],
    bestPractices: [
      'Use CTEs for readability, temp tables for performance when the CTE is reused',
      'Partition large tables on date columns — enables partition elimination',
      'Index design: equality columns first, then range, then INCLUDE for covering indexes',
      'Test with production-scale data — 100-row dev data hides performance problems',
    ],
    codeExamples: [
      {
        title: 'Window functions master class',
        language: 'sql',
        description: 'The most common window function patterns in DE interviews',
        code: `-- Running total, moving average, day-over-day change
SELECT
    order_date,
    daily_revenue,
    SUM(daily_revenue) OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total,
    AVG(daily_revenue) OVER (ORDER BY order_date ROWS 6 PRECEDING) AS rolling_7day_avg,
    LAG(daily_revenue, 1, 0) OVER (ORDER BY order_date) AS prev_day,
    daily_revenue - LAG(daily_revenue, 1, 0) OVER (ORDER BY order_date) AS day_over_day
FROM daily_sales;

-- Top-N per group (VERY common interview question)
WITH ranked AS (
    SELECT region, customer_id, revenue,
           ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rn
    FROM customer_revenue
)
SELECT region, customer_id, revenue
FROM ranked WHERE rn <= 3;

-- Anti-join: find records in left not in right
SELECT c.customer_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL;  -- customers who never ordered`,
      },
      {
        title: 'SCD Type 2 with MERGE',
        language: 'sql',
        code: `MERGE dim_customer AS target
USING staging_customer AS source
ON target.customer_id = source.customer_id AND target.is_current = 1
WHEN MATCHED AND (
    target.email <> source.email OR target.tier <> source.tier
) THEN
    UPDATE SET target.is_current = 0, target.valid_to = CAST(GETDATE() AS DATE)
WHEN NOT MATCHED BY TARGET THEN
    INSERT (customer_id, email, tier, is_current, valid_from, valid_to)
    VALUES (source.customer_id, source.email, source.tier, 1, GETDATE(), '9999-12-31');`,
      },
    ],
    resources: [
      { title: 'SQL Server Documentation', url: 'https://docs.microsoft.com/en-us/sql/sql-server/', type: 'docs', free: true },
      { title: 'LeetCode Database track', url: 'https://leetcode.com/problemset/database/', type: 'practice', free: true },
      { title: 'Use The Index, Luke', url: 'https://use-the-index-luke.com', type: 'book', free: true },
    ],
    quiz: [
      {
        question: 'What is the correct SQL execution order?',
        options: [
          'SELECT → FROM → WHERE → GROUP BY → HAVING',
          'FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
          'WHERE → FROM → SELECT → GROUP BY',
          'SELECT → WHERE → FROM → ORDER BY',
        ],
        answer: 1,
        explanation: 'SQL executes in this logical order: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. This is why you cannot use a SELECT alias in WHERE — WHERE runs before SELECT.',
      },
    ],
  },

  'sql-window-functions': {
    simpleExplanation: 'Window functions let you compute aggregations (like running totals or rankings) while still seeing every individual row — like having a GROUP BY that doesn\'t collapse your rows.',
    deepExplanation: `**What makes window functions special**\n\nRegular aggregate functions (SUM, COUNT, AVG with GROUP BY) collapse rows — you lose the individual records. Window functions compute the same aggregations but preserve every row, adding the aggregate value as a new column alongside the original data.\n\n**The OVER() clause**\nEvery window function has an OVER() clause that defines the "window" of rows to compute over. PARTITION BY divides rows into groups (like GROUP BY). ORDER BY within OVER defines the order for ranking and running calculations. The frame clause (ROWS BETWEEN ...) controls exactly which rows in the partition are included.\n\n**Ranking functions**\nROW_NUMBER: unique sequential (1,2,3,4 — no ties). RANK: ties get same rank, gaps follow (1,1,3,4). DENSE_RANK: ties get same rank, no gaps (1,1,2,3). Use ROW_NUMBER for deduplication and pagination. Use DENSE_RANK for leaderboards.\n\n**Offset functions**\nLAG(col, n) looks back n rows. LEAD(col, n) looks forward n rows. FIRST_VALUE and LAST_VALUE return the first/last value in the window. These are essential for time-series analysis and computing period-over-period changes.`,
    keyPoints: [
      'OVER() defines the window — empty OVER() means the entire result set is one window',
      'PARTITION BY in OVER() is like GROUP BY but doesn\'t collapse rows',
      'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW = running total from start to current row',
      'ROW_NUMBER is perfect for deduplication: delete all rows where rn > 1',
      'LAG/LEAD are essential for comparing a row to its previous/next row (time series)',
      'Window functions execute AFTER WHERE and GROUP BY — they see the filtered, grouped data',
    ],
    commonMistakes: [
      'Using RANGE instead of ROWS in frame clause — RANGE can be non-deterministic with duplicate values',
      'Forgetting that window functions can\'t be used in WHERE — wrap in a CTE or subquery first',
      'Using GROUP BY when you need window functions — you lose the detail rows',
      'Not partitioning correctly — ROW_NUMBER() without PARTITION BY numbers all rows globally',
    ],
    interviewTips: [
      '"Find the top 3 products per category" — immediate DENSE_RANK + PARTITION BY answer',
      '"Calculate month-over-month revenue change" — LAG() over ORDER BY month',
      '"Find gaps and islands" — classic interview problem using ROW_NUMBER() trick',
      'Know FIRST_VALUE / LAST_VALUE and how to handle the default RANGE frame issue',
    ],
    bestPractices: [
      'Always use ROWS BETWEEN rather than RANGE for running totals — deterministic with ties',
      'Put window function results in a CTE if you need to filter on them',
      'Name windows with WINDOW clause when reusing the same OVER() multiple times',
      'Use QUALIFY (in Databricks SQL/Snowflake) instead of CTE+WHERE for cleaner dedup queries',
    ],
    codeExamples: [
      {
        title: 'Complete window functions reference',
        language: 'sql',
        code: `-- Ranking
SELECT name, score,
    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num,   -- 1,2,3,4 unique
    RANK()       OVER (ORDER BY score DESC) AS rank_,     -- 1,1,3,4 gaps
    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank -- 1,1,2,3 no gaps
FROM leaderboard;

-- Running total and moving average
SELECT date, sales,
    SUM(sales) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) AS cumulative,
    AVG(sales) OVER (ORDER BY date ROWS 6 PRECEDING)         AS rolling_7d
FROM daily_sales;

-- Period over period with LAG
SELECT month, revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue,
    revenue - LAG(revenue) OVER (ORDER BY month) AS mom_change,
    ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
          / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 2) AS mom_pct
FROM monthly_revenue;

-- Deduplication: keep latest record per customer
WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn
    FROM customers
)
SELECT * FROM ranked WHERE rn = 1;`,
      },
    ],
    resources: [
      { title: 'Window Functions (Mode Analytics Tutorial)', url: 'https://mode.com/sql-tutorial/sql-window-functions/', type: 'course', free: true },
      { title: 'SQL Window Functions - Microsoft Docs', url: 'https://docs.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the result of ROW_NUMBER() vs RANK() when two rows have the same value?',
        options: [
          'Both assign the same number to tied rows',
          'ROW_NUMBER gives unique numbers (1,2) even for ties; RANK gives same number (1,1) then skips to 3',
          'RANK gives unique numbers; ROW_NUMBER gives the same number for ties',
          'They behave identically',
        ],
        answer: 1,
        explanation: 'ROW_NUMBER always assigns unique sequential integers regardless of ties — the order between tied rows is arbitrary. RANK assigns the same rank to tied rows and then skips the next rank(s). DENSE_RANK does the same but without gaps.',
      },
    ],
  },

  'sql-performance': {
    simpleExplanation: 'SQL performance tuning is the art of making slow queries fast — reading execution plans, adding the right indexes, and rewriting queries so the database engine doesn\'t scan millions of rows unnecessarily.',
    deepExplanation: `**Execution plans**\nEvery query generates an execution plan before running. The plan shows how the engine intends to retrieve data: table scans (reads every row), index seeks (jumps directly to the right rows), sort operations, hash joins, and more. A table scan on a 100M-row table when an index seek was possible is the most common performance killer.\n\n**Index types**\nClustered index: determines physical row order. One per table. Best for range queries on the primary key. Non-clustered index: separate structure pointing back to the table. Multiple allowed. Covering index: includes all columns needed by a query in the index itself, avoiding a lookup back to the main table (INCLUDE clause).\n\n**Columnstore indexes**\nColumnstore indexes store data column-by-column instead of row-by-row. This enables compression ratios of 10:1 and batch-mode execution that processes 900 rows at a time instead of one. Essential for OLAP/analytics workloads. Synapse Dedicated SQL uses clustered columnstore by default.\n\n**Common performance killers**\nImplicit type conversions (comparing VARCHAR to INT bypasses indexes), functions on indexed columns in WHERE (WHERE YEAR(date_col) = 2024 can\'t use an index), parameter sniffing (bad cached plan for new parameter values), and unnecessary sorts triggered by ORDER BY on large intermediate results.`,
    keyPoints: [
      'Table scan = reads every row. Index seek = jumps directly. Always prefer seek over scan',
      'EXPLAIN / SET STATISTICS IO ON to see actual logical reads — the key performance metric',
      'Covering index: add frequently selected columns to INCLUDE to avoid lookups',
      'Columnstore index: 10x compression + batch mode execution for analytics queries',
      'SARGable predicates: WHERE col = @val uses indexes. WHERE YEAR(col) = 2024 does NOT',
      'Avoid SELECT DISTINCT as a crutch — it forces a sort/hash; fix the root cause of duplicates',
    ],
    commonMistakes: [
      'Wrapping indexed columns in functions in WHERE clause — kills index usage',
      'Over-indexing: too many non-clustered indexes slow down INSERT/UPDATE/DELETE',
      'Ignoring statistics — outdated statistics cause bad query plans; run UPDATE STATISTICS',
      'Not considering partition elimination — always filter on the partition column first',
    ],
    interviewTips: [
      'Walk through how you would diagnose a slow query: check execution plan, look for scans, check missing index hints',
      'Explain parameter sniffing with an example and three solutions',
      'When would you use a filtered index?',
      'What is the difference between a covering index and a composite index?',
    ],
    bestPractices: [
      'Enable Query Store in Azure SQL to track query plan regressions over time',
      'Always test index changes with realistic data volumes (not 100-row dev tables)',
      'Use Adaptive Query Execution (AQE) in Spark/Databricks — it fixes bad plans at runtime',
      'Set up Automatic Index Tuning in Azure SQL for self-managing recommendations',
    ],
    codeExamples: [
      {
        title: 'Diagnosing a slow query',
        language: 'sql',
        code: `-- Step 1: Check I/O cost
SET STATISTICS IO ON;
SELECT customer_id, SUM(amount)
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id;
-- Look for: "logical reads" — high number = table scan likely

-- Step 2: View execution plan
-- In SSMS: Ctrl+M before running the query
-- In Azure Data Studio: Explain button

-- Step 3: Create a covering index for this query
CREATE NONCLUSTERED INDEX ix_orders_date_customer
ON orders (order_date, customer_id)
INCLUDE (amount);  -- INCLUDE avoids key lookup to the main table

-- Step 4: Fix parameter sniffing
CREATE OR ALTER PROCEDURE get_orders_by_region @region VARCHAR(50)
AS
BEGIN
    -- Option 1: Force recompile each execution
    SELECT * FROM orders WHERE region = @region
    OPTION (RECOMPILE);

    -- Option 2: Use local variable to break sniffing
    DECLARE @local_region VARCHAR(50) = @region;
    SELECT * FROM orders WHERE region = @local_region;
END`,
      },
    ],
    resources: [
      { title: 'Use The Index, Luke (free)', url: 'https://use-the-index-luke.com', type: 'book', free: true },
      { title: 'Brent Ozar SQL performance', url: 'https://www.brentozar.com/training/', type: 'blog', free: true },
      { title: 'Azure SQL Query Performance Insight', url: 'https://docs.microsoft.com/en-us/azure/azure-sql/database/query-performance-insight-use', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'Why does WHERE YEAR(order_date) = 2024 perform poorly even with an index on order_date?',
        options: [
          'YEAR() is not a valid SQL function',
          'Wrapping a column in a function makes it non-SARGable — the index cannot be used for a seek',
          'The index needs to be rebuilt first',
          'It performs fine — this is a myth',
        ],
        answer: 1,
        explanation: 'SARGable (Search ARGument ABLE) predicates allow the engine to use an index seek. Wrapping the column in YEAR() forces the engine to evaluate the function for every row — a full scan. Fix: WHERE order_date >= \'2024-01-01\' AND order_date < \'2025-01-01\'.',
      },
    ],
  },

  'data-modeling': {
    simpleExplanation: 'Data modeling is designing the structure of your data — deciding which tables to create, what columns they have, and how they relate to each other — so that queries run fast and the data makes business sense.',
    deepExplanation: `**OLTP vs OLAP**\nOLTP (Online Transaction Processing) databases are optimized for many small, fast reads and writes — like your banking app. Tables are highly normalized (no redundancy). OLAP (Online Analytical Processing) databases are optimized for large-scale reads and aggregations — like a data warehouse. Tables are often denormalized for query speed.\n\n**Dimensional modeling (Kimball)**\nThe most common data warehouse design pattern. Facts table stores measurable events (sales, clicks, sensor readings) with foreign keys. Dimension tables store descriptive context (customer info, product details, dates). Together they form a star schema — fact in the center, dimensions around it.\n\n**SCD (Slowly Changing Dimensions)**\nType 1: overwrite old value (lose history). Type 2: add a new row with new values + effective dates (preserve full history — most common). Type 3: add a "previous value" column (limited history). Type 2 is what 90% of interviews ask about.\n\n**Inmon vs Kimball**\nInmon: build a normalized enterprise data warehouse first (3NF), then create data marts per business unit. Top-down approach. Kimball: build dimensional data marts directly, integration comes from shared dimensions (conformed dimensions). Bottom-up, faster time to value.`,
    keyPoints: [
      'Star schema: one large fact table + multiple small dimension tables joined by surrogate keys',
      'Surrogate key: an artificial integer PK for dimension rows (not the natural business key)',
      'SCD Type 2: new row per change with is_current flag, valid_from, valid_to dates',
      'Fact table grain: the level of detail in each row — must be defined before designing columns',
      'Conformed dimensions: shared across multiple fact tables — enables cross-subject-area analysis',
      'Snowflake schema: normalized dimensions (dimension tables have their own sub-dimensions) — more joins, less redundancy',
    ],
    commonMistakes: [
      'Not defining the grain of the fact table first — leads to ambiguous data later',
      'Using natural keys in fact tables instead of surrogate keys — breaks SCD2',
      'Putting measures (amounts, quantities) in dimension tables instead of the fact table',
      'Over-normalizing an OLAP schema — every extra join is query latency at scale',
    ],
    interviewTips: [
      '"Design a data model for an e-commerce platform" — draw fact_orders + dim_customer, dim_product, dim_date',
      'Explain SCD Type 1 vs Type 2 and when to use each with a concrete example',
      'What is a fact table grain and how do you choose it?',
      'What is the difference between a degenerate dimension and a junk dimension?',
    ],
    bestPractices: [
      'Always define grain before adding columns — "one row per order line item" not "one row per order"',
      'Use integer surrogate keys for all dimension tables — faster joins than GUIDs or natural keys',
      'Create a dim_date table with pre-calculated fiscal periods, holidays, weekday flags',
      'Document your data model in a wiki or dbt schema.yml — models rot without documentation',
    ],
    codeExamples: [
      {
        title: 'Star schema DDL for e-commerce',
        language: 'sql',
        code: `-- Dimension: Customer (SCD Type 2)
CREATE TABLE dim_customer (
    customer_sk     INT IDENTITY(1,1) PRIMARY KEY,  -- surrogate key
    customer_id     VARCHAR(50) NOT NULL,            -- natural key
    full_name       VARCHAR(200),
    email           VARCHAR(255),
    segment         VARCHAR(50),  -- e.g. Gold, Silver, Bronze
    is_current      BIT DEFAULT 1,
    valid_from      DATE,
    valid_to        DATE DEFAULT '9999-12-31'
);

-- Dimension: Date (pre-populated)
CREATE TABLE dim_date (
    date_sk         INT PRIMARY KEY,  -- YYYYMMDD format e.g. 20240115
    full_date       DATE,
    year            INT,
    quarter         INT,
    month           INT,
    month_name      VARCHAR(20),
    day_of_week     INT,
    is_weekend      BIT,
    is_holiday      BIT
);

-- Fact: Orders (grain = one row per order line item)
CREATE TABLE fact_order_lines (
    order_line_sk   BIGINT IDENTITY(1,1),
    order_id        VARCHAR(50),          -- degenerate dimension
    customer_sk     INT REFERENCES dim_customer(customer_sk),
    product_sk      INT,
    date_sk         INT REFERENCES dim_date(date_sk),
    quantity        INT,
    unit_price      DECIMAL(10,2),
    discount        DECIMAL(10,2),
    net_amount      DECIMAL(10,2)         -- pre-calculated measure
);`,
      },
    ],
    resources: [
      { title: 'Kimball Group — The Data Warehouse Toolkit', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/', type: 'book', free: true },
      { title: 'dbt docs — dimensional modeling', url: 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the primary difference between SCD Type 1 and SCD Type 2?',
        options: [
          'Type 1 uses surrogate keys, Type 2 uses natural keys',
          'Type 1 overwrites old values (no history), Type 2 inserts a new row to preserve history',
          'Type 2 is used for facts, Type 1 is used for dimensions',
          'They are identical, just different naming conventions',
        ],
        answer: 1,
        explanation: 'SCD Type 1 simply updates the existing row — previous values are lost forever. SCD Type 2 inserts a new row with the new values and closes the old row (is_current=0, valid_to=today). Type 2 enables "what was the customer\'s tier when they made this purchase?" historical analysis.',
      },
    ],
  },

  // ─── PHASE 3 ────────────────────────────────────────────────────────────────

  'azure-subscription-model': {
    simpleExplanation: 'The Azure subscription hierarchy is like a company org chart for cloud resources — Tenant at the top, then Management Groups, Subscriptions, Resource Groups, and finally individual Resources at the bottom.',
    deepExplanation: `**The hierarchy from top to bottom**\n\nTenant: your Azure Active Directory (Entra ID) instance. One per organization. All users, groups, and service principals live here.\n\nManagement Groups: containers for organizing subscriptions. Apply policy at this level to enforce governance across many subscriptions (e.g., "all DE subscriptions must be in East US 2").\n\nSubscription: the billing and access boundary. A subscription is associated with one tenant. You pay per subscription. Typically you have separate subscriptions for Dev, UAT, and Prod.\n\nResource Group: a logical container for resources that share the same lifecycle. When you delete a resource group, all resources inside are deleted too. All resources in a group should be deployed and deleted together.\n\nResource: the actual Azure service (a storage account, a Databricks workspace, an ADF instance).\n\n**Tags and naming conventions**\nTags are key-value metadata on any resource. They enable cost allocation (Environment:Prod, Team:DataEngineering), automation (find all resources with a tag), and governance. Good naming: rg-de-platform-prod, adls-deplatform-prod-001.`,
    keyPoints: [
      'Tenant = Entra ID directory. One per company. All identities live here',
      'Management Groups: policy and RBAC applied here cascades down to all child subscriptions',
      'Subscriptions are the billing unit — you pay per subscription, one bill per subscription',
      'Resource Groups = lifecycle boundary. Delete the group, delete everything in it',
      'Resource locks (CanNotDelete, ReadOnly) prevent accidental deletion of critical resources',
      'Tags enable cost reporting: filter Azure Cost Management by tag (Team=DE)',
    ],
    commonMistakes: [
      'Putting all environments (Dev/UAT/Prod) in one subscription — no isolation for billing or policy',
      'Not using resource groups by lifecycle — mixing resources that should be deleted at different times',
      'Ignoring tags from day one — retroactively tagging hundreds of resources is painful',
      'Using the root tenant scope for RBAC assignments — too broad, violates least privilege',
    ],
    interviewTips: [
      'Draw the hierarchy: Tenant → Management Group → Subscription → Resource Group → Resource',
      'Explain how Azure Policy works at the Management Group level',
      'What is the difference between a resource lock and an RBAC deny assignment?',
      'How would you structure subscriptions for a 3-environment DE platform?',
    ],
    bestPractices: [
      'One subscription per environment (Dev, UAT, Prod) — clean billing and access separation',
      'Apply resource locks to production resource groups to prevent accidental deletion',
      'Enforce naming conventions and mandatory tags via Azure Policy',
      'Use Management Groups to apply policy once instead of per-subscription',
    ],
    codeExamples: [
      {
        title: 'Azure CLI — Subscription and Resource Group setup',
        language: 'bash',
        code: `# List all subscriptions
az account list --output table

# Set the active subscription
az account set --subscription "de-platform-prod"

# Create resource groups per environment
az group create \
  --name "rg-de-platform-prod" \
  --location "eastus2" \
  --tags Environment=Prod Team=DataEngineering CostCenter=DE001

# Apply a read-only lock to production resource group
az lock create \
  --name "prod-rg-lock" \
  --resource-group "rg-de-platform-prod" \
  --lock-type CanNotDelete \
  --notes "Prevents accidental deletion of prod resources"

# List all resources with a specific tag
az resource list --tag Environment=Prod --output table`,
      },
    ],
    resources: [
      { title: 'Azure Management Hierarchy docs', url: 'https://docs.microsoft.com/en-us/azure/governance/management-groups/overview', type: 'docs', free: true },
      { title: 'Azure Naming Conventions', url: 'https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the correct Azure resource hierarchy from top to bottom?',
        options: [
          'Subscription → Tenant → Management Group → Resource Group → Resource',
          'Tenant → Management Group → Subscription → Resource Group → Resource',
          'Management Group → Tenant → Subscription → Resource → Resource Group',
          'Tenant → Subscription → Resource Group → Management Group → Resource',
        ],
        answer: 1,
        explanation: 'The hierarchy is: Tenant (Entra ID) → Management Groups → Subscriptions → Resource Groups → Resources. Policy and RBAC applied at higher levels cascade down to all child scopes.',
      },
    ],
  },

  'azure-identity': {
    simpleExplanation: 'Azure identity is how services and users prove who they are and what they are allowed to do — think of it as the security guard at the door of every Azure resource.',
    deepExplanation: `**Entra ID (formerly Azure Active Directory)**\nEntra ID is Azure's identity platform. It manages users, groups, service principals, and managed identities. Everything that wants to access an Azure resource needs an identity in Entra ID.\n\n**Service Principal vs Managed Identity**\nA Service Principal is a manual identity for an app — it has a client ID and a secret or certificate that you manage and rotate. A Managed Identity is an automatically managed identity assigned to an Azure resource. Azure rotates the credentials for you — there are no secrets to store or rotate. Always prefer Managed Identity for Azure-to-Azure authentication.\n\n**RBAC (Role-Based Access Control)**\nRBAC controls what an identity can DO with a resource. Built-in roles like Storage Blob Data Contributor, ADF Contributor, and Databricks Contributor grant specific permissions. Assign roles at the narrowest scope needed — resource group level, not subscription.\n\n**The DE security model**\nADF uses its Managed Identity to read secrets from Key Vault, write to ADLS, and call SQL databases. Databricks cluster service principals access ADLS through Unity Catalog or access connectors — never through storage account keys.`,
    keyPoints: [
      'Managed Identity > Service Principal — Azure manages credentials, no secret rotation needed',
      'System-assigned MI: tied to one resource lifecycle. User-assigned MI: standalone, shareable',
      'RBAC at narrowest scope: assign Storage Blob Reader on one container, not the whole account',
      'Use groups for RBAC, not individual users — add/remove users from groups, not role assignments',
      'Conditional Access policies add MFA and device compliance requirements for human users',
      'Service Principal credentials expire — set calendar reminders or use cert-based auth',
    ],
    commonMistakes: [
      'Using storage account keys instead of Managed Identity + RBAC for service-to-service auth',
      'Assigning Owner or Contributor at subscription scope for a pipeline service account',
      'Storing Service Principal secrets in code or config files instead of Key Vault',
      'Not auditing RBAC assignments — stale role assignments accumulate and violate least privilege',
    ],
    interviewTips: [
      'Explain the difference between authentication (who are you?) and authorization (what can you do?)',
      'When would you use a Service Principal instead of Managed Identity?',
      'What RBAC roles does ADF need to read from ADLS and write to Azure SQL?',
      'What is the difference between system-assigned and user-assigned managed identity?',
    ],
    bestPractices: [
      'Use Managed Identity for all ADF linked services, Databricks access connectors, and Function Apps',
      'Assign roles to Entra ID groups, not individuals — easier to manage at scale',
      'Use Azure Key Vault for all Service Principal secrets that cannot use Managed Identity',
      'Enable Entra ID audit logs and review them monthly for unusual role assignment changes',
    ],
    codeExamples: [
      {
        title: 'Assign RBAC role via Azure CLI',
        language: 'bash',
        code: `# Get the ADF managed identity object ID
ADF_MI=$(az datafactory show \
  --name "adf-deplatform-prod" \
  --resource-group "rg-de-platform-prod" \
  --query identity.principalId -o tsv)

# Grant ADF "Storage Blob Data Contributor" on ADLS container
az role assignment create \
  --assignee "$ADF_MI" \
  --role "Storage Blob Data Contributor" \
  --scope "/subscriptions/<sub-id>/resourceGroups/rg-de-platform-prod/providers/Microsoft.Storage/storageAccounts/adlsdeplatform/blobServices/default/containers/raw"

# Verify role assignments
az role assignment list \
  --assignee "$ADF_MI" \
  --output table`,
      },
      {
        title: 'Use Managed Identity in Python (DefaultAzureCredential)',
        language: 'python',
        code: `from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

# DefaultAzureCredential tries: Managed Identity → VS Code → Azure CLI → ...
# Works locally (uses your az login) and in production (uses Managed Identity)
credential = DefaultAzureCredential()

client = BlobServiceClient(
    account_url="https://adlsdeplatform.blob.core.windows.net",
    credential=credential  # No secrets — Managed Identity in production
)

container = client.get_container_client("raw")
blobs = list(container.list_blobs())
print(f"Found {len(blobs)} blobs")`,
      },
    ],
    resources: [
      { title: 'Managed Identity docs', url: 'https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview', type: 'docs', free: true },
      { title: 'Azure RBAC docs', url: 'https://docs.microsoft.com/en-us/azure/role-based-access-control/overview', type: 'docs', free: true },
      { title: 'DefaultAzureCredential docs', url: 'https://docs.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'Why should you prefer Managed Identity over a Service Principal for ADF to ADLS access?',
        options: [
          'Managed Identity is faster',
          'Managed Identity credentials are managed by Azure — no secrets to create, store, or rotate',
          'Service Principals cannot access ADLS Gen2',
          'Managed Identity gives broader permissions',
        ],
        answer: 1,
        explanation: 'Service Principals require creating a client secret (or certificate), storing it securely, and rotating it before expiry. Managed Identities have no credentials that you manage — Azure handles everything. This eliminates the #1 cause of production incidents: expired or leaked credentials.',
      },
    ],
  },

  'azure-networking': {
    simpleExplanation: 'Azure networking is the private road system for your cloud resources — it controls which services can talk to each other and ensures sensitive data never travels over the public internet.',
    deepExplanation: `**Virtual Networks (VNets)**\nA VNet is a private network in Azure. Resources inside a VNet can communicate with each other by default. A VNet has an address space (e.g., 10.0.0.0/16) which is divided into subnets (10.0.1.0/24 for DE services, 10.0.2.0/24 for DBs, etc.).\n\n**Network Security Groups (NSGs)**\nNSGs are firewalls attached to subnets or NICs. They have inbound and outbound rules with priority, port, protocol, and source/destination. Lower priority number = higher precedence. Block everything by default, allow only what's needed.\n\n**Private Endpoints**\nA private endpoint gives an Azure PaaS service (ADLS, Azure SQL, ADF, Key Vault) a private IP address inside your VNet. Traffic to the service goes through the Azure backbone — never the public internet. DNS resolves the service FQDN to the private IP automatically via Private DNS Zones.\n\n**Hub-Spoke topology**\nThe standard enterprise pattern: one Hub VNet contains shared services (firewall, DNS, VPN gateway). Multiple Spoke VNets (Dev, UAT, Prod) are peered to the Hub but not to each other. All traffic routes through the hub, enabling centralized inspection and logging.`,
    keyPoints: [
      'VNet address space must not overlap between peered VNets or with on-premises networks',
      'Private Endpoint = PaaS service gets a private IP in your subnet — mandatory for production',
      'NSG rules: lower number = higher priority. 100 is evaluated before 200',
      'Service Endpoints route traffic to PaaS services over the Azure backbone but keep public IPs',
      'Private Endpoint is preferred over Service Endpoint for stricter isolation (private IP in VNet)',
      'VNet peering is non-transitive: A↔B and B↔C does NOT mean A↔C',
    ],
    commonMistakes: [
      'Leaving ADLS Gen2 accessible from the public internet in production',
      'Overlapping VNet address spaces — VNet peering fails immediately',
      'Using Service Endpoints instead of Private Endpoints for new projects (less secure)',
      'Not setting up Private DNS Zones — services resolve to public IPs even with private endpoints',
    ],
    interviewTips: [
      'Explain the difference between a Private Endpoint and a Service Endpoint',
      'How does DNS resolution work with Private Endpoints?',
      'What is VNet peering and why is it non-transitive?',
      'How would you design the network for an ADF Self-Hosted Integration Runtime?',
    ],
    bestPractices: [
      'Enable Private Endpoints for all PaaS services in production: ADLS, ADF, Key Vault, SQL',
      'Use Network Watcher and NSG Flow Logs to audit traffic for security investigations',
      'Implement hub-spoke topology from day one — retrofitting is painful',
      'Use Azure Firewall in the hub for centralized egress filtering and logging',
    ],
    codeExamples: [
      {
        title: 'Create VNet with subnet and NSG using Bicep',
        language: 'bicep',
        code: `param location string = resourceGroup().location
param vnetName string = 'vnet-de-platform-prod'

resource nsg 'Microsoft.Network/networkSecurityGroups@2023-04-01' = {
  name: 'nsg-de-subnet'
  location: location
  properties: {
    securityRules: [
      {
        name: 'DenyInternetInbound'
        properties: {
          priority: 100
          protocol: '*'
          access: 'Deny'
          direction: 'Inbound'
          sourceAddressPrefix: 'Internet'
          destinationAddressPrefix: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
        }
      }
    ]
  }
}

resource vnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: { addressPrefixes: ['10.0.0.0/16'] }
    subnets: [
      {
        name: 'snet-de-services'
        properties: {
          addressPrefix: '10.0.1.0/24'
          networkSecurityGroup: { id: nsg.id }
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
    ]
  }
}`,
      },
    ],
    resources: [
      { title: 'Azure Virtual Network docs', url: 'https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview', type: 'docs', free: true },
      { title: 'Azure Private Link docs', url: 'https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-overview', type: 'docs', free: true },
      { title: 'Hub-spoke topology', url: 'https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/hub-spoke', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the key difference between a Service Endpoint and a Private Endpoint?',
        options: [
          'Service Endpoints are free, Private Endpoints cost money',
          'Service Endpoint keeps the service\'s public IP but routes traffic on Azure backbone. Private Endpoint gives the service a private IP inside your VNet',
          'They are the same thing with different names',
          'Private Endpoints only work for Storage accounts',
        ],
        answer: 1,
        explanation: 'Service Endpoints route traffic over the Azure backbone but the service still has a public IP — you can restrict access to your VNet but the public endpoint exists. Private Endpoints give the service a private IP address IN your VNet — the service is fully private, no public IP needed.',
      },
    ],
  },

  'azure-iac': {
    simpleExplanation: 'Infrastructure as Code means writing your Azure resources in code files instead of clicking through the portal — so your infrastructure is version-controlled, repeatable, and deployable in minutes instead of days.',
    deepExplanation: `**Why IaC matters**\nClickOps (manually creating resources in the Azure portal) doesn't scale. If you delete a resource accidentally, recreating it from memory takes hours and is error-prone. IaC means your entire data platform can be torn down and rebuilt from scratch in 15 minutes from a git repository.\n\n**ARM Templates**\nAzure Resource Manager (ARM) templates are JSON files that describe Azure resources declaratively. They are the native format — all other tools eventually compile down to ARM. Verbose and hard to write by hand.\n\n**Bicep**\nBicep is Microsoft's DSL (Domain Specific Language) that compiles to ARM. It's much more concise, supports modules, and has great VS Code tooling. The recommended choice for Azure-only infrastructure.\n\n**Terraform**\nHashiCorp Terraform uses HCL (HashiCorp Configuration Language). Multi-cloud — the same tool works for Azure, AWS, GCP. The most popular IaC tool in enterprise. Maintains a state file that tracks what resources exist. Use the AzureRM provider.\n\n**State management**\nTerraform state (terraform.tfstate) must be stored remotely (Azure Blob Storage backend) and locked to prevent concurrent modifications. Never commit state files to Git — they contain sensitive resource IDs.`,
    keyPoints: [
      'Bicep for Azure-only projects, Terraform for multi-cloud or team preference',
      'Always store Terraform state in Azure Blob with state locking (azurerm backend)',
      'Bicep modules = reusable templates; Terraform modules = reusable HCL blocks',
      'az deployment group create deploys Bicep/ARM to a resource group',
      'terraform plan shows what will change before applying — always review before apply',
      'Use terraform workspace or separate state files for Dev/UAT/Prod environments',
    ],
    commonMistakes: [
      'Storing terraform.tfstate in Git — it contains sensitive output values and resource IDs',
      'Running terraform apply without reviewing terraform plan first',
      'Hard-coding environment-specific values instead of using variables/parameters',
      'Not using remote state — two engineers running apply simultaneously corrupt state',
    ],
    interviewTips: [
      'Explain the difference between Bicep and ARM templates',
      'How do you manage secrets in Terraform without committing them? (Key Vault data source)',
      'What is terraform import and when would you use it?',
      'What happens if Terraform state gets out of sync with real Azure resources?',
    ],
    bestPractices: [
      'Use azurerm backend for Terraform state: resource group + storage account + container',
      'Enable state locking with azurerm backend — prevents concurrent apply runs',
      'Structure Bicep as modules: networking.bicep, storage.bicep, databricks.bicep',
      'Use GitHub Actions or Azure DevOps pipelines to run terraform plan on PR and apply on merge',
    ],
    codeExamples: [
      {
        title: 'Terraform azurerm backend configuration',
        language: 'bash',
        code: `# backend.tf — remote state in Azure Blob Storage
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "sttfstatedeplatform"
    container_name       = "tfstate"
    key                  = "de-platform/prod.tfstate"
  }
}

# Initialize (run once per environment)
terraform init

# Preview changes (run on every PR)
terraform plan -var-file="environments/prod.tfvars"

# Apply (run after PR review and plan review)
terraform apply -var-file="environments/prod.tfvars" -auto-approve`,
      },
      {
        title: 'Bicep module for ADLS Gen2',
        language: 'bicep',
        code: `// modules/storage.bicep
param name string
param location string
param environment string

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: name
  location: location
  kind: 'StorageV2'
  sku: { name: environment == 'prod' ? 'Standard_ZRS' : 'Standard_LRS' }
  properties: {
    isHnsEnabled: true          // ADLS Gen2
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false // Never allow public access
    networkAcls: {
      defaultAction: 'Deny'     // Deny all by default
      bypass: 'AzureServices'
    }
  }
}

output storageId string = storage.id`,
      },
    ],
    resources: [
      { title: 'Bicep documentation', url: 'https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview', type: 'docs', free: true },
      { title: 'Terraform AzureRM provider', url: 'https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs', type: 'docs', free: true },
      { title: 'Microsoft Learn — Bicep fundamentals', url: 'https://learn.microsoft.com/en-us/training/paths/fundamentals-bicep/', type: 'course', free: true },
    ],
    quiz: [
      {
        question: 'Why should terraform.tfstate never be committed to Git?',
        options: [
          'It is too large for Git',
          'It contains sensitive resource IDs, output values, and potentially secrets — and concurrent edits corrupt it',
          'Git cannot track binary files',
          'Terraform does not support Git integration',
        ],
        answer: 1,
        explanation: 'State files contain resource IDs, IP addresses, and can contain sensitive output values (connection strings, keys). More importantly, if two engineers commit different state files, the state becomes corrupted. Always use a remote backend (azurerm) with state locking.',
      },
    ],
  },
};
