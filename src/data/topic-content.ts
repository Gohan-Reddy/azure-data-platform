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
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
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

  // ─── PHASE 4 ────────────────────────────────────────────────────────────────

  'adls-gen2': {
    simpleExplanation: 'Azure Data Lake Storage Gen2 is the central hard drive of your Azure data platform — a massively scalable, cheap, secure place to store every file in your data pipeline, from raw CSVs to processed Parquet and Delta tables.',
    deepExplanation: `**What makes ADLS Gen2 different from regular Blob Storage**\nADLS Gen2 is built on Azure Blob Storage but adds a Hierarchical Namespace (HNS). Without HNS, renaming a folder of 10,000 files requires copying and deleting each file individually. With HNS, a folder rename is a single atomic metadata operation. This makes ADLS Gen2 much faster for data lake workloads where directories are constantly reorganized.\n\n**Access tiers**\nHot tier: optimized for frequent reads (landing zone, recent data). Cool tier: cheaper storage for data accessed monthly (processed data older than 30 days). Archive tier: cheapest, but rehydration takes hours — for compliance data you never expect to read. Lifecycle management policies automatically move blobs between tiers based on age.\n\n**Security model**\nADLS Gen2 supports both RBAC (coarse-grained, at container/account level) and POSIX-style ACLs (fine-grained, per file and folder). For production, use Managed Identity + RBAC roles (Storage Blob Data Contributor for write, Storage Blob Data Reader for read). Private Endpoints ensure traffic never leaves the Azure backbone.\n\n**Folder structure best practice**\nOrganize by layer, then subject area, then date partition: /bronze/sales/orders/year=2024/month=01/. This structure enables partition pruning in Spark and Synapse Serverless queries.`,
    keyPoints: [
      'Hierarchical Namespace (HNS) must be enabled at creation — cannot be added later without migration',
      'Use Storage Blob Data Contributor (write) and Storage Blob Data Reader (read) RBAC roles',
      'Soft delete and versioning protect against accidental deletion — enable on production',
      'Lifecycle management policies auto-tier data: Hot → Cool after 30 days → Archive after 90',
      'Zone-Redundant Storage (ZRS) for production: survives an entire availability zone failure',
      'ADLS Gen2 supports both ABFS (abfss://) and WASB protocols — always use ABFS in new code',
    ],
    commonMistakes: [
      'Creating a storage account without HNS — you get Blob Storage, not a real data lake',
      'Allowing public network access in production — always disable and use Private Endpoints',
      'Using storage account access keys in code — use Managed Identity instead',
      'Not partitioning data by date — full container scans are extremely slow at scale',
    ],
    interviewTips: [
      'What is the difference between ADLS Gen1, Gen2, and Azure Blob Storage?',
      'How do ACLs and RBAC interact in ADLS Gen2? Which takes precedence?',
      'How would you implement column-level security on data in ADLS? (Unity Catalog)',
      'What is the abfss:// protocol and why is it used instead of wasbs://?',
    ],
    bestPractices: [
      'Structure folders as: /{layer}/{domain}/{entity}/year={}/month={}/day={}',
      'Enable soft delete (30-day retention) on all production storage accounts',
      'Use separate storage accounts per environment (dev, uat, prod) — not containers',
      'Monitor ingress/egress costs with Azure Cost Management tags per pipeline',
    ],
    codeExamples: [
      {
        title: 'Access ADLS Gen2 from PySpark using Managed Identity',
        language: 'python',
        code: `# In Databricks — configure OAuth with Managed Identity (no keys)
spark.conf.set(
    "fs.azure.account.auth.type.adlsdeplatform.dfs.core.windows.net",
    "OAuth"
)
spark.conf.set(
    "fs.azure.account.oauth.provider.type.adlsdeplatform.dfs.core.windows.net",
    "org.apache.hadoop.fs.azurebfs.oauth2.MsiTokenProvider"
)

# Read from bronze layer
df = spark.read.parquet(
    "abfss://bronze@adlsdeplatform.dfs.core.windows.net/sales/orders/year=2024/"
)

# Write to silver layer partitioned by date
df.write \
    .format("delta") \
    .partitionBy("year", "month") \
    .mode("append") \
    .save("abfss://silver@adlsdeplatform.dfs.core.windows.net/sales/orders/")`,
      },
      {
        title: 'Lifecycle management policy (Azure CLI)',
        language: 'bash',
        code: `az storage account management-policy create \
  --account-name adlsdeplatform \
  --resource-group rg-de-platform-prod \
  --policy '{
    "rules": [{
      "name": "tier-old-data",
      "type": "Lifecycle",
      "definition": {
        "filters": {"blobTypes": ["blockBlob"], "prefixMatch": ["bronze/"]},
        "actions": {
          "baseBlob": {
            "tierToCool": {"daysAfterModificationGreaterThan": 30},
            "tierToArchive": {"daysAfterModificationGreaterThan": 90}
          }
        }
      }
    }]
  }'`,
      },
    ],
    resources: [
      { title: 'ADLS Gen2 docs', url: 'https://docs.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction', type: 'docs', free: true },
      { title: 'Access control in ADLS Gen2', url: 'https://docs.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-access-control', type: 'docs', free: true },
      { title: 'Storage lifecycle management', url: 'https://docs.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-overview', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the key feature that distinguishes ADLS Gen2 from standard Azure Blob Storage?',
        options: [
          'ADLS Gen2 is cheaper',
          'Hierarchical Namespace (HNS) enables atomic directory operations and POSIX ACLs',
          'ADLS Gen2 supports more file formats',
          'ADLS Gen2 has higher throughput limits',
        ],
        answer: 1,
        explanation: 'HNS makes folder rename/move an O(1) metadata operation instead of O(n) copy-delete. It also enables POSIX-style ACLs for per-file/folder security. Without HNS, you have Blob Storage — good for object storage but not optimized for hierarchical data lake workloads.',
      },
    ],
  },

  'azure-data-factory': {
    simpleExplanation: 'Azure Data Factory is Azure\'s managed data pipeline service — think of it as the conductor that orchestrates data movement between dozens of sources and destinations without you managing any servers.',
    deepExplanation: `**Core concepts**\nPipeline: a logical grouping of activities that together perform a task. Activity: a single processing step (Copy, Databricks Notebook, Stored Procedure, Web). Dataset: a named view of data pointing to a linked service. Linked Service: the connection definition (connection string + auth) to a source or sink.\n\n**Integration Runtime (IR)**\nThe IR is the compute infrastructure that ADF uses to execute activities. Azure IR: managed, auto-scale, for cloud-to-cloud. Self-Hosted IR (SHIR): installed on a VM in your network for on-premises or VNet-restricted sources. Azure-SSIS IR: for running legacy SSIS packages.\n\n**Triggers**\nSchedule trigger: runs a pipeline on a cron schedule. Tumbling window trigger: runs for non-overlapping time windows — great for reprocessing historical data. Storage event trigger: fires when a file lands in ADLS. Custom event trigger: fires from an Event Grid event.\n\n**Data Flows vs Copy Activity**\nCopy Activity is optimized for bulk data movement — fast, cheap, minimal transformation. Mapping Data Flow is a Spark-based visual transformation engine — supports complex joins, aggregations, pivots. Rule: Copy to land raw data, Data Flow for transformations, Databricks for heavy PySpark.`,
    keyPoints: [
      'Linked Service = connection string. Dataset = pointer to specific data. Pipeline = workflow',
      'Parameterize everything — one generic pipeline can load 100 tables with parameters',
      'ForEach activity with batch count controls parallelism — default is sequential',
      'ADF Managed VNet IR eliminates the need for SHIR in many private network scenarios',
      'Use Key Vault linked service for all secrets — never hardcode credentials in linked services',
      'ADF Git integration stores all pipeline JSON in Azure Repos — enables CI/CD',
    ],
    commonMistakes: [
      'Not parameterizing pipelines — copy-pasting pipelines for each table is unscalable',
      'Using Data Flow for simple copies — Copy Activity is 10x cheaper for raw ingestion',
      'No retry policy on Copy activities — transient network failures silently fail the pipeline',
      'Ignoring DIU (Data Integration Units) settings — default DIUs may throttle large copies',
    ],
    interviewTips: [
      'Explain the watermark pattern for incremental loads — the most common ADF design pattern',
      'What is the difference between a Mapping Data Flow and a Copy Activity?',
      'How would you deploy ADF pipelines across Dev/UAT/Prod environments?',
      'How does ADF connect to on-premises SQL Server? (SHIR)',
    ],
    bestPractices: [
      'Build metadata-driven pipelines: read table list from config table, loop with ForEach',
      'Always set retry count (3) and retry interval (30s) on Copy and Web activities',
      'Use pipeline-level parameters for run date, environment, and source/target paths',
      'Monitor with Azure Monitor alerts on "Failed pipeline runs" metric',
    ],
    codeExamples: [
      {
        title: 'Watermark incremental load pattern',
        language: 'sql',
        code: `-- 1. Create watermark control table
CREATE TABLE pipeline_watermark (
    table_name      VARCHAR(100) PRIMARY KEY,
    watermark_value DATETIME2
);
INSERT INTO pipeline_watermark VALUES ('orders', '2000-01-01');

-- 2. ADF Lookup activity: get current watermark
-- Query: SELECT watermark_value FROM pipeline_watermark WHERE table_name = 'orders'

-- 3. ADF Copy activity source query (Dynamic Content expression):
-- @concat('SELECT * FROM orders WHERE updated_at > ''',
--   activity(''GetWatermark'').output.firstRow.watermark_value,
--   ''' AND updated_at <= ''',
--   pipeline().parameters.run_start_time, '''')

-- 4. ADF Stored Procedure activity: update watermark after success
UPDATE pipeline_watermark
SET watermark_value = @run_start_time
WHERE table_name = 'orders';`,
      },
      {
        title: 'ADF pipeline ARM parameter override (for CI/CD)',
        language: 'json',
        code: `{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "factoryName": { "value": "adf-deplatform-prod" },
    "AzureSqlDatabase_connectionString": {
      "value": "@Microsoft.KeyVault(SecretUri=https://kv-deplatform-prod.vault.azure.net/secrets/sql-conn-string/)"
    },
    "AzureDataLakeStorage_accountKey": {
      "value": "@Microsoft.KeyVault(SecretUri=https://kv-deplatform-prod.vault.azure.net/secrets/adls-key/)"
    }
  }
}`,
      },
    ],
    resources: [
      { title: 'ADF documentation', url: 'https://docs.microsoft.com/en-us/azure/data-factory/introduction', type: 'docs', free: true },
      { title: 'ADF copy activity performance', url: 'https://docs.microsoft.com/en-us/azure/data-factory/copy-activity-performance', type: 'docs', free: true },
      { title: 'ADF CI/CD guide', url: 'https://docs.microsoft.com/en-us/azure/data-factory/continuous-integration-delivery', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'When should you use a Mapping Data Flow instead of a Copy Activity?',
        options: [
          'Always — Data Flow is more powerful',
          'When you need complex transformations (joins, aggregations, pivots). Use Copy Activity for simple bulk data movement',
          'When your data is over 1GB',
          'Copy Activity does not support Parquet format',
        ],
        answer: 1,
        explanation: 'Copy Activity is optimized for raw data movement — it\'s fast and cheap. Mapping Data Flow spins up a Spark cluster under the hood, adding startup latency and cost. Use Copy to land raw data, Data Flow for transformation logic, or Databricks for the heaviest PySpark work.',
      },
    ],
  },

  'adf-patterns': {
    simpleExplanation: 'ADF design patterns are proven blueprints for solving common pipeline problems — like loading thousands of tables without writing a pipeline for each one, or safely loading only new data since the last run.',
    deepExplanation: `**Metadata-driven pipelines**\nInstead of one pipeline per table, build one generic pipeline parameterized for any table, and drive it with a control table in SQL. The control table has rows like (source_table, target_path, watermark_column, is_active). A parent pipeline reads the control table and calls the generic child pipeline via ForEach. Adding a new table requires just one INSERT into the control table.\n\n**Incremental load patterns**\nWatermark: store last loaded timestamp, load only new/changed rows. Best for append-only or update-tracked sources. Change Data Feed (CDC): capture insert/update/delete events at the database level. ADF can read SQL Server CDC tables directly. Most reliable for full change tracking.\n\n**Error handling and resilience**\nEvery activity has On Success / On Failure / On Completion / On Skip paths. Chain a logging activity and notification on failure. Use the "Wait" activity with exponential backoff for transient errors. Log every pipeline run (start time, end time, rows copied, status) to an audit table for observability.\n\n**CDC with ADF and Delta Lake**\nSource SQL Server CDC → ADF Copy (reads cdc.fn_cdc_get_all_changes_*) → ADLS Bronze → Databricks MERGE into Delta Silver (handles inserts, updates, deletes based on __$operation column).`,
    keyPoints: [
      'Metadata-driven: control table + ForEach + parameterized child pipeline = scalable to 1000 tables',
      'Watermark pattern needs an upper bound (pipeline start time) to avoid missing rows written during the run',
      'CDC captures deletes — watermark cannot detect deleted rows',
      'Always write to an audit table: pipeline_name, start_time, end_time, rows_read, rows_written, status',
      'Use tumbling window trigger for reprocessable historical backfills',
      'Decouple ingestion (Copy) from transformation (Data Flow/Databricks) — separate pipelines',
    ],
    commonMistakes: [
      'Using current timestamp as upper watermark bound — rows inserted during the run are missed',
      'Not handling schema drift — source tables gain new columns and pipelines break',
      'Running all ForEach iterations sequentially when they could be parallel (set batchCount > 1)',
      'No audit logging — when a pipeline fails you cannot tell which table failed or how many rows loaded',
    ],
    interviewTips: [
      'Draw the metadata-driven pipeline architecture on a whiteboard',
      'Why do you need both a lower AND upper bound in the watermark pattern?',
      'How does CDC differ from a watermark-based incremental load?',
      'How would you reprocess a specific date range after a bug fix?',
    ],
    bestPractices: [
      'Store all pipeline configs (source/target/watermark) in Azure SQL config tables — not hardcoded',
      'Log every pipeline execution to an audit table for SLA reporting and debugging',
      'Use schema mapping in Copy Activity to handle source column reordering gracefully',
      'Test CDC pipelines with DELETE operations — many teams only test inserts/updates',
    ],
    codeExamples: [
      {
        title: 'Metadata-driven control table design',
        language: 'sql',
        code: `-- Pipeline config table
CREATE TABLE pipeline_config (
    id                INT IDENTITY PRIMARY KEY,
    source_schema     VARCHAR(50),
    source_table      VARCHAR(100),
    target_container  VARCHAR(100),
    target_path       VARCHAR(500),
    watermark_column  VARCHAR(100),
    watermark_value   DATETIME2 DEFAULT '2000-01-01',
    load_type         VARCHAR(20),  -- 'full' or 'incremental'
    is_active         BIT DEFAULT 1,
    last_run_status   VARCHAR(20),
    last_run_time     DATETIME2
);

-- Add a new table to pipeline with one INSERT
INSERT INTO pipeline_config
    (source_schema, source_table, target_container, target_path, watermark_column, load_type)
VALUES
    ('dbo', 'orders', 'bronze', 'sales/orders/', 'updated_at', 'incremental');

-- ADF Lookup reads active tables:
-- SELECT * FROM pipeline_config WHERE is_active = 1`,
      },
    ],
    resources: [
      { title: 'ADF metadata-driven copy pattern', url: 'https://docs.microsoft.com/en-us/azure/data-factory/copy-data-tool-metadata-driven', type: 'docs', free: true },
      { title: 'ADF CDC with SQL Server', url: 'https://docs.microsoft.com/en-us/azure/data-factory/connector-sql-server', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'Why does the watermark pattern use pipeline start time as the upper bound instead of current time?',
        options: [
          'Pipeline start time is easier to access in ADF expressions',
          'Using current time as upper bound risks missing rows inserted between the query running and the watermark update',
          'Current time is not available in ADF',
          'It makes no difference',
        ],
        answer: 1,
        explanation: 'If you load all data up to NOW and then update the watermark to NOW, any rows inserted while your Copy Activity was running fall into a gap. Using pipeline start time as the upper bound and saving that as the new watermark means the next run picks up exactly from where this run stopped — no gaps, no duplicates.',
      },
    ],
  },

  // ─── PHASE 5 ────────────────────────────────────────────────────────────────

  'spark-architecture': {
    simpleExplanation: 'Apache Spark is a distributed computing engine that splits your data processing across many machines simultaneously — what would take one machine 10 hours takes a 10-machine Spark cluster about 1 hour.',
    deepExplanation: `**Driver and Executors**\nThe Driver is the brain — it runs your main() function, builds the logical plan, optimizes it into a physical plan, and divides work into tasks. Executors are the workers — JVM processes on worker nodes that run tasks and cache data. There is one Driver per Spark application and many Executors.\n\n**DAG and lazy evaluation**\nWhen you write df.filter(...).groupBy(...).agg(...), nothing happens. Spark builds a Directed Acyclic Graph (DAG) of transformations. Only when you call an action (collect, count, write, show) does Spark optimize the DAG and execute it. This laziness enables Catalyst optimizer to reorder and prune operations before running.\n\n**Stages and tasks**\nA DAG is divided into stages at shuffle boundaries (wide transformations like groupBy, join). Within a stage, each partition becomes one task. Tasks in the same stage can run in parallel. A stage with 200 partitions runs 200 tasks in parallel (limited by executor cores).\n\n**RDD vs DataFrame vs Dataset**\nRDD (Resilient Distributed Dataset): low-level, no schema, no query optimization. DataFrame: distributed table with schema and Catalyst optimizer — the standard for DE work. Dataset: type-safe DataFrame (Scala/Java only). In PySpark, always use DataFrames.`,
    keyPoints: [
      'Driver is single point of failure — never collect() large DataFrames to Driver memory',
      'Lazy evaluation: transformations build a plan; actions trigger execution',
      'Stage boundary = shuffle = disk write + network transfer — the main performance cost',
      'Default shuffle partitions is 200 — tune with spark.sql.shuffle.partitions for your data size',
      'Spark UI (port 4040) shows stages, tasks, DAG, and shuffle metrics — essential for debugging',
      'Each executor core runs one task at a time — more cores = more parallelism per executor',
    ],
    commonMistakes: [
      'Calling df.collect() on a large DataFrame — transfers all data to Driver, causes OOM',
      'Using df.count() in a loop — each count is a full scan, extremely expensive',
      'Not understanding that print(df) shows nothing useful — use df.show() or df.display()',
      'Setting shuffle partitions too high (e.g., 200 for a 1GB dataset) — task overhead dominates',
    ],
    interviewTips: [
      'Explain the difference between a transformation and an action in Spark',
      'What is a stage boundary and what causes it?',
      'Why should you never call collect() on a large DataFrame?',
      'What is the Catalyst optimizer and what optimizations does it apply?',
    ],
    bestPractices: [
      'Set spark.sql.shuffle.partitions based on data size: ~128MB per partition is the target',
      'Use df.explain() to inspect the physical plan before running expensive queries',
      'Enable AQE: spark.sql.adaptive.enabled=true — auto-tunes partitions and joins at runtime',
      'Use broadcast hints for small tables: df.join(broadcast(small_df), "key")',
    ],
    codeExamples: [
      {
        title: 'Reading the Spark execution model',
        language: 'python',
        code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, avg

spark = SparkSession.builder \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.shuffle.partitions", "50") \
    .getOrCreate()

# Transformations — builds DAG, nothing executes yet
df = spark.read.parquet("abfss://bronze@storage.dfs.core.windows.net/orders/")
df_filtered = df.filter(col("status") == "completed")
df_agg = df_filtered.groupBy("region").agg(
    count("*").alias("order_count"),
    avg("amount").alias("avg_amount")
)

# Inspect logical and physical plans BEFORE running
df_agg.explain(extended=True)

# ACTION — triggers actual execution
df_agg.write.format("delta").mode("overwrite").save(
    "abfss://gold@storage.dfs.core.windows.net/region_stats/"
)

# Check Spark UI for stage breakdown
# http://localhost:4040 when running locally`,
      },
    ],
    resources: [
      { title: 'Apache Spark documentation', url: 'https://spark.apache.org/docs/latest/', type: 'docs', free: true },
      { title: 'Spark UI guide (Databricks)', url: 'https://docs.databricks.com/en/optimizations/spark-ui-guide.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What triggers actual execution in Spark?',
        options: [
          'Any transformation like filter() or groupBy()',
          'An action like collect(), count(), write(), or show()',
          'Reading a DataFrame from storage',
          'Calling df.schema',
        ],
        answer: 1,
        explanation: 'Spark uses lazy evaluation — transformations only build the DAG. Actions trigger the Catalyst optimizer to optimize the plan and execute it across the cluster. This is why you can chain 20 transformations with no overhead until you call write() or collect().',
      },
    ],
  },

  'pyspark-dataframes': {
    simpleExplanation: 'PySpark DataFrames are distributed tables you can manipulate with Python code — like pandas DataFrames but running across hundreds of machines processing billions of rows instead of thousands.',
    deepExplanation: `**DataFrame operations**\nSelect, filter, withColumn, groupBy, agg, join, union, distinct, orderBy — these are the building blocks of all PySpark transformations. They all return new DataFrames (immutable) without modifying the original.\n\n**Spark SQL**\nYou can register any DataFrame as a temporary view and query it with SQL: df.createOrReplaceTempView("orders") then spark.sql("SELECT * FROM orders WHERE status = 'complete'"). Both APIs produce identical execution plans — use whichever is cleaner for your use case.\n\n**Schema management**\nAlways define schemas explicitly for production pipelines — don't rely on schema inference from CSV/JSON. Schema inference reads the data twice (slow) and may infer wrong types. Use StructType and StructField.\n\n**Complex types and UDFs**\nSpark supports ArrayType, MapType, StructType as column types. Use explode() to flatten arrays into rows, getItem() to access map keys. Avoid Python UDFs — they serialize each row to Python, destroying parallelism. Use built-in functions (pyspark.sql.functions) which run as JVM bytecode. If you must write a UDF, use a Pandas UDF (vectorized, much faster).`,
    keyPoints: [
      'Use pyspark.sql.functions (F) — never write Python UDFs for logic that can use built-ins',
      'withColumn creates or replaces a column — original DataFrame is unchanged (immutable)',
      'groupBy().agg() is how you do multi-aggregate GROUP BY — can pass multiple agg functions',
      'join types: inner, left, right, full, left_semi (like EXISTS), left_anti (like NOT EXISTS)',
      'coalesce(n) reduces partitions without shuffle. repartition(n) redistributes with shuffle',
      'printSchema() shows column names, types, and nullable flags — always check after reading',
    ],
    commonMistakes: [
      'Writing Python UDFs instead of using built-in Spark functions — 10-100x slower',
      'Using toPandas() on large DataFrames — collects everything to Driver memory',
      'Not caching a DataFrame that is used multiple times in the same job',
      'Chaining too many withColumn() calls — each adds overhead; use select() with multiple expressions instead',
    ],
    interviewTips: [
      '"Write a PySpark query to find the top 5 products per region by revenue" — window function question',
      'What is the difference between coalesce() and repartition()?',
      'Why are Python UDFs slow and what is the alternative?',
      'How do you handle null values in PySpark? (fillna, dropna, coalesce function)',
    ],
    bestPractices: [
      'Import functions as F: from pyspark.sql import functions as F — avoids name conflicts',
      'Define explicit schemas with StructType for all file-based sources in production',
      'Cache DataFrames used more than twice: df.cache() then trigger with df.count()',
      'Use df.select() with multiple expressions instead of chaining withColumn() 20 times',
    ],
    codeExamples: [
      {
        title: 'PySpark transformation patterns',
        language: 'python',
        code: `from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType
from pyspark.sql.window import Window

# Define schema explicitly — never infer in production
schema = StructType([
    StructField("order_id",    StringType(),    False),
    StructField("customer_id", StringType(),    False),
    StructField("product_id",  StringType(),    True),
    StructField("amount",      DoubleType(),    True),
    StructField("order_date",  TimestampType(), True),
])

df = spark.read.schema(schema).parquet("abfss://bronze@storage.dfs.core.windows.net/orders/")

# Transformations using built-in functions (fast — runs in JVM)
df_clean = df.select(
    F.col("order_id"),
    F.col("customer_id"),
    F.upper(F.col("product_id")).alias("product_id"),
    F.coalesce(F.col("amount"), F.lit(0.0)).alias("amount"),
    F.to_date(F.col("order_date")).alias("order_date"),
    F.year("order_date").alias("year"),
    F.month("order_date").alias("month"),
).filter(F.col("amount") > 0)

# Window function: rank customers by revenue per region
window = Window.partitionBy("region").orderBy(F.desc("total_revenue"))
df_ranked = df_agg.withColumn("rank", F.dense_rank().over(window))

# Efficient aggregation
df_summary = df_clean.groupBy("year", "month", "customer_id").agg(
    F.count("*").alias("order_count"),
    F.sum("amount").alias("total_revenue"),
    F.avg("amount").alias("avg_order_value"),
    F.max("order_date").alias("last_order_date"),
)`,
      },
    ],
    resources: [
      { title: 'PySpark API docs', url: 'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/index.html', type: 'docs', free: true },
      { title: 'Databricks PySpark guide', url: 'https://docs.databricks.com/en/pyspark/index.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'Why should you avoid Python UDFs in PySpark?',
        options: [
          'Python UDFs are not supported in PySpark',
          'Python UDFs serialize each row from the JVM to Python, process it, and serialize back — eliminating Spark\'s JVM-level optimization and running row-by-row',
          'Python UDFs cannot handle null values',
          'Python UDFs only work on string columns',
        ],
        answer: 1,
        explanation: 'Spark runs natively on JVM. A Python UDF forces a row-by-row roundtrip: JVM → pickle to Python → execute Python → pickle back to JVM. This serialization overhead makes Python UDFs 10-100x slower than equivalent built-in functions. Use pyspark.sql.functions or Pandas UDFs (vectorized) instead.',
      },
    ],
  },

  'spark-optimization': {
    simpleExplanation: 'Spark optimization is identifying why your job is slow — too much data shuffling, uneven data distribution, not enough memory — and fixing it so jobs that took 2 hours finish in 10 minutes.',
    deepExplanation: `**Shuffles: the main enemy**\nA shuffle happens when data must be redistributed across partitions — for groupBy, join on non-co-partitioned data, distinct. Shuffles write data to disk, transfer it over the network, and read it back. This is the #1 performance killer. The goal is to minimize shuffles through broadcast joins, bucketing, and partition pruning.\n\n**Data skew**\nSkew means some partitions have vastly more data than others. With 200 tasks, if one task processes 50% of the data, the job can't finish until that one task completes. Visible in Spark UI: one long-running task while all others are done. Fix with salting (add random suffix to skewed key), AQE skew join handling, or two-stage aggregation.\n\n**Memory model**\nEach executor has heap memory divided into: execution memory (for shuffles, joins, sorts) and storage memory (for cached DataFrames). They share a unified pool. OOM errors happen when execution needs more memory than available. Increase executor memory, reduce partition size, or use disk spill.\n\n**Adaptive Query Execution (AQE)**\nAQE (enabled by default in Spark 3.x) dynamically adjusts the query plan at runtime based on actual statistics. It automatically converts sort-merge joins to broadcast joins when one side turns out to be small, coalesces small shuffle partitions, and handles skew joins. Always keep AQE enabled.`,
    keyPoints: [
      'Broadcast join: small table (< 10MB default) copied to every executor — no shuffle',
      'Salting for skew: append random int suffix to skewed key, explode small side, then aggregate',
      'AQE: spark.sql.adaptive.enabled=true — auto-fixes partition size and join strategy at runtime',
      'spark.sql.shuffle.partitions default=200 — too many for small data, too few for large data',
      'Predicate pushdown: filter rows as early as possible, before joins and aggregations',
      'Bucketing: pre-partition and sort a table by join key — eliminates shuffle at query time',
    ],
    commonMistakes: [
      'Not checking the Spark UI — you cannot optimize what you haven\'t measured',
      'Repartitioning too aggressively — creating thousands of tiny partitions adds scheduling overhead',
      'Using collect() to debug instead of show(10) — collect brings all data to Driver',
      'Caching huge DataFrames that are only used once — wastes executor memory',
    ],
    interviewTips: [
      'How do you detect data skew in a Spark job?',
      'Walk through the salting technique with a concrete example',
      'What is AQE and what problems does it automatically fix?',
      'When would you use bucketing and what are the trade-offs?',
    ],
    bestPractices: [
      'Always check Spark UI stage view before optimizing — find the actual bottleneck first',
      'Enable AQE and set spark.sql.adaptive.skewJoin.enabled=true for skew handling',
      'Aim for partition sizes of 100-200MB: partitions = total_data_GB * 10',
      'Use Delta Lake OPTIMIZE + ZORDER to cluster data by query columns before heavy reads',
    ],
    codeExamples: [
      {
        title: 'Broadcast join and salting for skew',
        language: 'python',
        code: `from pyspark.sql import functions as F

# Broadcast join — prevents shuffle for small dimension tables
from pyspark.sql.functions import broadcast
df_result = large_fact.join(broadcast(small_dim), "product_id", "inner")

# Salting for skewed join key
SALT_BUCKETS = 20

# Add random salt to the large (skewed) table
df_large_salted = large_df.withColumn(
    "salted_key",
    F.concat(F.col("skewed_key"), F.lit("_"), (F.rand() * SALT_BUCKETS).cast("int"))
)

# Explode the small table to match all salt values
from pyspark.sql.functions import array, explode, lit
df_small_exploded = small_df.withColumn(
    "salt_range", array([lit(i) for i in range(SALT_BUCKETS)])
).withColumn(
    "salt", explode("salt_range")
).withColumn(
    "salted_key", F.concat(F.col("join_key"), F.lit("_"), F.col("salt"))
).drop("salt_range", "salt")

# Now join on salted key — even distribution
df_joined = df_large_salted.join(df_small_exploded, "salted_key")

# AQE configuration
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256mb")`,
      },
    ],
    resources: [
      { title: 'Spark tuning guide', url: 'https://spark.apache.org/docs/latest/tuning.html', type: 'docs', free: true },
      { title: 'AQE docs (Databricks)', url: 'https://docs.databricks.com/en/optimizations/aqe.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'How do you detect data skew in a running Spark job?',
        options: [
          'Check the driver logs for "skew" keyword',
          'In Spark UI Stages tab: look for one task with drastically longer duration than others in the same stage',
          'Run ANALYZE TABLE on the DataFrame',
          'Skew cannot be detected without profiling tools',
        ],
        answer: 1,
        explanation: 'In the Spark UI Stages tab, each stage shows task duration distribution. If 199 tasks complete in 30 seconds but one task takes 20 minutes, that\'s data skew — one partition has disproportionately more data. The Min/Median/Max task duration columns in the stage summary reveal this instantly.',
      },
    ],
  },

  'azure-databricks': {
    simpleExplanation: 'Azure Databricks is the managed Spark platform on Azure — you get Spark clusters, collaborative notebooks, Delta Lake, and MLflow all in one workspace without managing any infrastructure.',
    deepExplanation: `**Cluster types**\nAll-purpose clusters: interactive development and notebooks — shared across users, expensive to run 24/7. Job clusters: single-use, auto-created for a Databricks Workflow run and terminated after — the right choice for production jobs (cheaper, isolated). SQL Warehouse: optimized for Databricks SQL analytics, auto-suspend when idle.\n\n**Unity Catalog integration**\nDatabricks Unity Catalog provides centralized governance across all workspaces. Tables, volumes, functions, and ML models are all governed through Unity Catalog with column-level security, row-level filtering, and automated lineage tracking.\n\n**Databricks Workflows**\nWorkflows are the production job orchestrator inside Databricks. A workflow is a DAG of tasks — notebooks, Python scripts, SQL queries, dbt models — with dependencies, retry policies, and notifications. Prefer Workflows over ADF for Databricks-native orchestration. Use ADF to call Databricks Workflows when you need to coordinate across non-Databricks steps.\n\n**Secrets management**\nNever hardcode credentials in notebooks. Use Databricks Secret Scopes backed by Azure Key Vault. Access secrets with dbutils.secrets.get("scope", "key") — values are never shown in notebook output.`,
    keyPoints: [
      'Job clusters terminate after each run — cheaper and more isolated than all-purpose clusters',
      'Databricks Runtime (DBR) is an optimized Spark distribution — faster than open-source Spark',
      'dbutils.secrets.get() reads from Key Vault secret scope — never prints values in notebooks',
      'Cluster policies enforce cost controls: max DBUs, auto-termination, allowed instance types',
      'Photon engine (vectorized C++ query engine) dramatically speeds up Delta Lake SQL queries',
      'Unity Catalog: one metastore per region, multiple workspaces share the same catalog',
    ],
    commonMistakes: [
      'Using all-purpose clusters for production jobs — 3-5x more expensive than job clusters',
      'Not setting auto-termination on all-purpose clusters — clusters idle for days cost real money',
      'Storing credentials in notebook variables or widgets instead of secret scopes',
      'Not using cluster init scripts for library installation — libraries reset on cluster restart',
    ],
    interviewTips: [
      'What is the difference between an all-purpose cluster and a job cluster?',
      'How do you securely access Azure Key Vault secrets from a Databricks notebook?',
      'What is the Databricks Runtime and how does it differ from open-source Spark?',
      'How would you deploy a Databricks notebook to production using CI/CD?',
    ],
    bestPractices: [
      'Production workloads always use job clusters — auto-created per run, auto-terminated after',
      'Set cluster auto-termination to 30 minutes on all all-purpose clusters',
      'Use Databricks Asset Bundles (DABs) to deploy workflows as code via CI/CD',
      'Enable cluster policies in your workspace to enforce cost guardrails',
    ],
    codeExamples: [
      {
        title: 'Accessing Key Vault secrets and mounting ADLS',
        language: 'python',
        code: `# Read secret from Key Vault-backed secret scope (never shows in output)
storage_account = dbutils.secrets.get(scope="kv-scope", key="adls-account-name")
client_secret   = dbutils.secrets.get(scope="kv-scope", key="sp-client-secret")

# Configure Service Principal OAuth access to ADLS
spark.conf.set(
    f"fs.azure.account.auth.type.{storage_account}.dfs.core.windows.net",
    "OAuth"
)
spark.conf.set(
    f"fs.azure.account.oauth.provider.type.{storage_account}.dfs.core.windows.net",
    "org.apache.hadoop.fs.azurebfs.oauth2.ClientCredsTokenProvider"
)
spark.conf.set(
    f"fs.azure.account.oauth2.client.secret.{storage_account}.dfs.core.windows.net",
    client_secret  # From Key Vault — never hardcoded
)

# Read from ADLS with Unity Catalog (recommended — no explicit config needed)
df = spark.read.table("catalog.bronze.orders")

# Or using abfss path
df = spark.read.format("delta").load(
    f"abfss://silver@{storage_account}.dfs.core.windows.net/orders/"
)`,
      },
    ],
    resources: [
      { title: 'Databricks documentation', url: 'https://docs.databricks.com/en/index.html', type: 'docs', free: true },
      { title: 'Databricks Asset Bundles', url: 'https://docs.databricks.com/en/dev-tools/bundles/index.html', type: 'docs', free: true },
      { title: 'Databricks secret scopes', url: 'https://docs.databricks.com/en/security/secrets/secret-scopes.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'Why should production Databricks jobs use job clusters instead of all-purpose clusters?',
        options: [
          'Job clusters are faster',
          'Job clusters are auto-created per run and terminated after — cheaper, isolated, and consistent',
          'All-purpose clusters cannot run scheduled jobs',
          'Job clusters support more instance types',
        ],
        answer: 1,
        explanation: 'All-purpose clusters stay running (and billing) between jobs and can have dirty library states from interactive use. Job clusters are provisioned fresh per run with exactly the libraries declared — this is cheaper (no idle time), reproducible (clean environment), and isolated (one job\'s failures don\'t affect another).',
      },
    ],
  },

  'delta-lake': {
    simpleExplanation: 'Delta Lake is a storage layer on top of Parquet files that gives your data lake ACID transactions, the ability to update and delete rows, and time travel — turning a simple file storage into a reliable database.',
    deepExplanation: `**The transaction log**\nDelta Lake stores a _delta_log/ directory alongside the data files. Every write operation creates a new JSON commit file in this log. Each commit records which Parquet files were added, which were removed, and what metadata changed. Reading a Delta table means reading the log to determine the current state (which files to read), then reading only those files.\n\n**ACID in Delta Lake**\nAtomicity: a write either creates a new commit file or fails — no partial writes. Consistency: schema enforcement rejects writes that don't match the registered schema. Isolation: optimistic concurrency control (OCC) checks for conflicts at commit time. Durability: once the commit JSON is written to cloud storage, the data persists through system failures.\n\n**Time travel**\nEvery commit is a version. SELECT * FROM table VERSION AS OF 10 returns data at version 10. SELECT * FROM table TIMESTAMP AS OF '2024-01-15' returns data as it was on that date. Time travel enables debugging ("what did the data look like before that bad pipeline run?"), regulatory compliance audits, and ML feature reproducibility.\n\n**Key operations**\nMERGE: upsert — insert new rows, update changed rows, optionally delete. UPDATE and DELETE: targeted row-level modifications. OPTIMIZE: compact small files into larger ones for read performance. VACUUM: remove old data files no longer referenced by the log (default 7-day retention). ZORDER: cluster data by column values to enable data skipping.`,
    keyPoints: [
      '_delta_log/ is the source of truth — the actual data files are just Parquet',
      'MERGE handles inserts, updates, and deletes in one atomic operation — the SCD2 workhorse',
      'Time travel: VERSION AS OF or TIMESTAMP AS OF — query any historical state',
      'OPTIMIZE compacts small files. ZORDER clusters data. Run both together for best results',
      'Change Data Feed (CDF): tracks row-level changes with before/after values — great for CDC pipelines',
      'Schema evolution: mergeSchema=true allows adding new columns without failing the write',
    ],
    commonMistakes: [
      'Running VACUUM with RETAIN 0 HOURS without understanding it deletes all time travel history',
      'Not running OPTIMIZE — small file accumulation slows reads dramatically over time',
      'Using Delta for tiny tables (< 1MB) — the log overhead outweighs the benefits',
      'Not enabling Change Data Feed before you need it — CDF only tracks changes from when it\'s enabled',
    ],
    interviewTips: [
      'Explain how Delta Lake achieves ACID transactions on cloud object storage',
      'What is the _delta_log and what does it contain?',
      'How does time travel work and what are its use cases?',
      'How would you implement SCD Type 2 using Delta Lake MERGE?',
    ],
    bestPractices: [
      'Run OPTIMIZE + ZORDER weekly on large Delta tables, targeting query columns for ZORDER',
      'Set delta.logRetentionDuration to at least 30 days for compliance and debugging',
      'Enable CDF (delta.enableChangeDataFeed=true) on tables that feed downstream CDC pipelines',
      'Use SHALLOW CLONE to create lightweight copies for testing without duplicating data',
    ],
    codeExamples: [
      {
        title: 'Delta Lake MERGE for SCD Type 2',
        language: 'python',
        code: `from delta.tables import DeltaTable
from pyspark.sql.functions import current_timestamp, lit

# Load target Delta table
delta_table = DeltaTable.forPath(spark,
    "abfss://silver@storage.dfs.core.windows.net/dim_customer/")

# Expire changed records
delta_table.alias("target").merge(
    source_df.alias("source"),
    "target.customer_id = source.customer_id AND target.is_current = true"
).whenMatchedUpdate(
    condition="target.email <> source.email OR target.tier <> source.tier",
    set={
        "is_current": lit(False),
        "valid_to":   current_timestamp(),
    }
).execute()

# Insert new versions of changed records + brand new records
new_rows = source_df.join(
    delta_table.toDF().filter("is_current = false AND valid_to >= current_timestamp() - INTERVAL 1 MINUTE"),
    "customer_id", "inner"
).union(
    source_df.join(delta_table.toDF(), "customer_id", "left_anti")
).withColumns({
    "is_current": lit(True),
    "valid_from": current_timestamp(),
    "valid_to":   lit("9999-12-31").cast("timestamp"),
})
new_rows.write.format("delta").mode("append").save(
    "abfss://silver@storage.dfs.core.windows.net/dim_customer/")

# Maintenance
spark.sql("OPTIMIZE delta.\`abfss://silver@storage.dfs.core.windows.net/dim_customer/\` ZORDER BY (customer_id)")`,
      },
    ],
    resources: [
      { title: 'Delta Lake documentation', url: 'https://docs.delta.io/latest/index.html', type: 'docs', free: true },
      { title: 'Delta Lake on Databricks', url: 'https://docs.databricks.com/en/delta/index.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What does the Delta Lake _delta_log directory contain?',
        options: [
          'Compressed copies of all Parquet data files',
          'JSON and checkpoint files recording every write operation — the source of truth for table state and version history',
          'Schema definitions only',
          'Index files for faster queries',
        ],
        answer: 1,
        explanation: 'The _delta_log contains JSON commit files (one per write) and periodic checkpoint files (Parquet format for faster log replay). Reading a Delta table means first reading the log to determine the current file set, then reading those Parquet files. This log is what enables ACID, time travel, and schema enforcement.',
      },
    ],
  },

  'medallion-architecture': {
    simpleExplanation: 'Medallion architecture organizes your data lake into three quality layers — Bronze (raw), Silver (cleaned), Gold (business-ready) — like a factory assembly line where each layer adds more value to the data.',
    deepExplanation: `**Bronze layer: raw ingestion**\nBronze is an exact copy of source data in its original structure, converted to Delta format. No transformations except format conversion. Append-only — you never update or delete Bronze. This layer is your insurance policy: if a transformation bug corrupts Silver, you can always reprocess from Bronze. Retain Bronze data for regulatory compliance (often 7 years).\n\n**Silver layer: cleaned and conformed**\nSilver applies business rules: deduplication, type casting, null handling, standardization (phone number formats, currency codes). Row-level data quality checks reject or quarantine bad records. Silver is your "single source of truth" for raw business events — still at the granular level.\n\n**Gold layer: business-ready aggregations**\nGold contains dimensional models, aggregations, and KPIs optimized for BI and ML consumption. This is what analysts and Power BI connect to. Gold tables are denormalized for query speed (pre-joined dimensions). Each Gold table serves a specific business domain (Sales Summary, Customer 360, Inventory Positions).\n\n**Why this matters**\nWithout clear layer separation, teams mix raw and transformed data, transformation bugs are hard to trace, and there's no rollback path. Medallion gives you reproducibility (reprocess any layer from the layer above), observability (data quality metrics per layer), and governance (different access controls per layer).`,
    keyPoints: [
      'Bronze = raw, append-only, format-converted. Never transform business logic in Bronze',
      'Silver = deduplicated, typed, validated. One row per business event at original grain',
      'Gold = aggregated, denormalized, business-domain oriented. What analysts query',
      'Each layer is a separate Delta table (or schema) with separate access controls',
      'Data quality checks at Silver prevent bad data from reaching Gold and BI reports',
      'Reprocessing: Bronze → Silver → Gold on schema change or bug fix is the expected pattern',
    ],
    commonMistakes: [
      'Applying business transformations in Bronze — breaks the raw backup guarantee',
      'Making Gold too granular — Gold should be pre-aggregated for BI query patterns',
      'Not tracking data quality metrics per layer — you need to know rejection rates',
      'Skipping Silver and writing directly from Bronze to Gold — no audit trail of cleaning',
    ],
    interviewTips: [
      'Explain what goes in each layer with a concrete example (e.g., sales orders)',
      'How do you handle a schema change in the source system at each layer?',
      'What data quality checks would you add to the Silver layer?',
      'How does Medallion work with Delta Live Tables vs standard Databricks notebooks?',
    ],
    bestPractices: [
      'Use separate ADLS containers or Unity Catalog schemas per layer (bronze/, silver/, gold/)',
      'Track row counts and null rates per column at each layer boundary',
      'OPTIMIZE + ZORDER Gold tables by the most common filter column',
      'Set retention: Bronze 7 years, Silver 2 years, Gold rebuild from Silver on change',
    ],
    codeExamples: [
      {
        title: 'Silver layer data quality and cleaning',
        language: 'python',
        code: `from pyspark.sql import functions as F

# Read Bronze (raw Parquet/Delta)
df_bronze = spark.read.format("delta").load(
    "abfss://bronze@storage.dfs.core.windows.net/sales/orders/")

# Apply Silver transformations
df_silver = (
    df_bronze
    # Type casting
    .withColumn("order_date", F.to_date("order_date_str", "yyyy-MM-dd"))
    .withColumn("amount", F.col("amount_str").cast("decimal(15,2)"))
    # Standardization
    .withColumn("status", F.upper(F.trim("status")))
    .withColumn("currency", F.coalesce(F.col("currency"), F.lit("USD")))
    # Deduplication: keep latest version of each order
    .withColumn("rn", F.row_number().over(
        Window.partitionBy("order_id").orderBy(F.desc("ingestion_timestamp"))
    ))
    .filter(F.col("rn") == 1).drop("rn")
    # Data quality: filter bad rows to quarantine
    .filter(F.col("amount") > 0)
    .filter(F.col("order_date").isNotNull())
    .filter(F.col("customer_id").isNotNull())
)

# Log quality metrics
total    = df_bronze.count()
good     = df_silver.count()
rejected = total - good
print(f"Bronze: {total} | Silver: {good} | Rejected: {rejected} ({100*rejected/total:.1f}%)")

df_silver.write.format("delta").mode("overwrite").option("overwriteSchema", "true") \
    .partitionBy("year", "month") \
    .save("abfss://silver@storage.dfs.core.windows.net/sales/orders/")`,
      },
    ],
    resources: [
      { title: 'Medallion architecture (Databricks)', url: 'https://docs.databricks.com/en/lakehouse/medallion.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the primary purpose of the Bronze layer?',
        options: [
          'Store aggregated business KPIs for BI tools',
          'An exact copy of source data as-landed — your insurance policy for reprocessing, with no business transformations',
          'Store cleaned and validated data at original grain',
          'Store ML feature tables',
        ],
        answer: 1,
        explanation: 'Bronze is a faithful copy of source data converted to Delta/Parquet. No business logic, no transformations. If a bug in Silver transformation corrupts data, you reprocess from Bronze. Bronze also satisfies regulatory "keep original data" requirements. Transformations belong in Silver and Gold.',
      },
    ],
  },

  'unity-catalog': {
    simpleExplanation: 'Unity Catalog is Databricks\'s security and governance layer — one central place to control who can access which tables, columns, and rows across all your Databricks workspaces.',
    deepExplanation: `**Three-level namespace**\nUnity Catalog organizes data as Catalog.Schema.Table (e.g., prod.sales.orders). A metastore is the top-level container — one per region, shared across all workspaces in that region. This means a table registered in one workspace is visible in all workspaces attached to the same metastore.\n\n**Access control**\nGrant and revoke privileges on any object: catalog, schema, table, view, function, volume. Privileges cascade — GRANT USE CATALOG on a catalog allows a user to see schemas inside it. Column masking: create a SQL function that returns masked values for non-privileged users. Row filtering: create a SQL function that filters rows based on the calling user's group membership.\n\n**Data lineage**\nUnity Catalog automatically captures column-level lineage as data flows through queries — which table a column came from, which downstream tables depend on it. This lineage is visible in the Catalog Explorer UI and queryable via REST API.\n\n**Volumes**\nVolumes are Unity Catalog-governed paths to files in cloud storage (ADLS). Instead of abfss:// paths, you use /Volumes/catalog/schema/volume/path. This puts file access under the same governance model as tables.`,
    keyPoints: [
      'Three-level namespace: Catalog.Schema.Table — always specify all three in production',
      'One metastore per region shared across all workspaces — no per-workspace table registration needed',
      'Column masking and row filters are SQL functions — can reference is_account_group_member()',
      'Lineage tracking is automatic — no instrumentation needed, works for SQL and Python DataFrames',
      'External tables point to ADLS paths. Managed tables store data inside Unity Catalog\'s own storage',
      'Delta Sharing: share live Delta tables with external organizations without copying data',
    ],
    commonMistakes: [
      'Using hive_metastore tables in new projects — migrate to Unity Catalog for proper governance',
      'Granting too-broad permissions: SELECT on entire catalog instead of specific tables',
      'Not using column masking for PII — PHI and PII must be masked before analysts can query',
      'Forgetting that lineage only captures SQL operations — Python df.write() without SQL registration has no lineage',
    ],
    interviewTips: [
      'Explain Unity Catalog\'s three-level namespace and what each level contains',
      'How does column masking work — at the query layer or storage layer?',
      'What is the difference between an external table and a managed table in Unity Catalog?',
      'How do you share data between two Databricks workspaces using Unity Catalog?',
    ],
    bestPractices: [
      'Create one catalog per environment (dev, uat, prod) with the same schema structure',
      'Use groups for GRANT statements — never grant to individual users',
      'Apply column masks to all PII/PHI columns before any analyst access',
      'Use Unity Catalog row filters instead of creating separate views per team',
    ],
    codeExamples: [
      {
        title: 'Column masking and row filtering',
        language: 'sql',
        code: `-- Create column masking function for PII
CREATE FUNCTION IF NOT EXISTS prod.security.mask_email(email STRING)
RETURNS STRING
RETURN CASE
    WHEN is_account_group_member('data-engineers') THEN email
    WHEN is_account_group_member('analysts')       THEN CONCAT(LEFT(email, 2), '***@***.com')
    ELSE '***REDACTED***'
END;

-- Apply mask to the email column
ALTER TABLE prod.silver.customers
ALTER COLUMN email SET MASK prod.security.mask_email;

-- Row filter: analysts only see their own region's data
CREATE FUNCTION IF NOT EXISTS prod.security.region_row_filter(region STRING)
RETURNS BOOLEAN
RETURN is_account_group_member('all-data') OR
       is_account_group_member(CONCAT('region-', region));

ALTER TABLE prod.silver.orders
SET ROW FILTER prod.security.region_row_filter ON (region);

-- Grant analyst access — masking/filtering applies automatically
GRANT SELECT ON TABLE prod.silver.customers TO analysts;
GRANT SELECT ON TABLE prod.silver.orders    TO analysts;`,
      },
    ],
    resources: [
      { title: 'Unity Catalog docs', url: 'https://docs.databricks.com/en/data-governance/unity-catalog/index.html', type: 'docs', free: true },
      { title: 'Column masking docs', url: 'https://docs.databricks.com/en/data-governance/unity-catalog/column-masking.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'In Unity Catalog, what is the correct object hierarchy?',
        options: [
          'Workspace → Database → Table',
          'Metastore → Catalog → Schema → Table',
          'Catalog → Metastore → Schema → Table',
          'Region → Workspace → Catalog → Table',
        ],
        answer: 1,
        explanation: 'Unity Catalog hierarchy: Metastore (one per Azure region) → Catalog (one per environment or domain) → Schema (one per subject area) → Table/View/Function/Volume. Full table reference: catalog.schema.table. The metastore is shared across all workspaces in the region.',
      },
    ],
  },

  'delta-live-tables': {
    simpleExplanation: 'Delta Live Tables (DLT) is Databricks\'s declarative pipeline framework — instead of writing imperative code that says "do this, then do that", you declare what each table should contain and Databricks figures out the execution order and handles failures automatically.',
    deepExplanation: `**Declarative vs imperative pipelines**\nWith standard notebooks, you write code that explicitly reads, transforms, and writes each table in order. With DLT, you annotate functions with @table or @view decorators and describe what the table contains. DLT builds the dependency graph automatically, executes in the right order, handles retries, and monitors quality.\n\n**Expectations (data quality)**\nExpectations are the killer feature of DLT. @expect("amount_positive", "amount > 0") adds a constraint to a table. You choose the action on violation: warn (log but don't fail), drop (remove failing rows), fail (stop the pipeline). This moves data quality enforcement into the pipeline definition itself.\n\n**Streaming vs batch tables**\n@table processes a full batch of data. @append_flow and streaming sources (readStream) create streaming tables that process incrementally. A single DLT pipeline can mix batch and streaming tables — Databricks manages the checkpoint and restart behavior.\n\n**Development and production modes**\nDevelopment mode: clusters stay running between updates, faster iteration. Production mode: new cluster per run, isolated. Always run production DLT pipelines in production mode for clean, reproducible results.`,
    keyPoints: [
      '@dlt.table defines a materialized Delta table. @dlt.view defines a temp view (not persisted)',
      '@dlt.expect_or_drop drops rows failing the constraint. @dlt.expect_or_fail stops the pipeline',
      'dlt.read("table_name") creates a dependency — DLT resolves the execution order automatically',
      'DLT pipeline runs in its own isolated compute — not your all-purpose cluster',
      'Enhanced autoscaling in DLT is more efficient than standard Spark autoscaling',
      'DLT event log captures every constraint violation, row count, and timing metric',
    ],
    commonMistakes: [
      'Mixing DLT and regular notebook code in the same file — DLT notebooks are interpreted differently',
      'Defining expectations without a clear action strategy — "warn" hides real data quality issues',
      'Using @dlt.view for tables that downstream tables reference in production — views recompute each time',
      'Not monitoring the DLT event log — violations accumulate silently without alerting',
    ],
    interviewTips: [
      'What is the difference between @dlt.table and @dlt.view?',
      'How do DLT expectations differ from a filter() in a regular notebook?',
      'How does DLT handle streaming and batch data in the same pipeline?',
      'When would you choose DLT over Databricks Workflows with regular notebooks?',
    ],
    bestPractices: [
      'Use @expect_or_drop at Silver layer, @expect_or_fail at Gold (bad data must not reach BI)',
      'Always monitor the DLT event log for expectation violation trends over time',
      'Structure DLT pipelines per domain (one pipeline per subject area, not one giant pipeline)',
      'Pin the DLT runtime version to avoid unexpected behavior from auto-upgrades',
    ],
    codeExamples: [
      {
        title: 'DLT Bronze → Silver → Gold pipeline',
        language: 'python',
        code: `import dlt
from pyspark.sql import functions as F

# Bronze: raw ingestion from ADLS auto loader
@dlt.table(comment="Raw orders from source system")
def bronze_orders():
    return (
        spark.readStream.format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.schemaLocation", "/checkpoints/orders_schema")
        .load("abfss://landing@storage.dfs.core.windows.net/orders/")
    )

# Silver: cleaned with quality expectations
@dlt.table(comment="Cleaned, validated orders")
@dlt.expect_or_drop("valid_amount",    "amount > 0")
@dlt.expect_or_drop("valid_date",      "order_date IS NOT NULL")
@dlt.expect("valid_customer",          "customer_id IS NOT NULL")  # warn only
def silver_orders():
    return (
        dlt.read_stream("bronze_orders")
        .withColumn("order_date", F.to_date("order_date_str"))
        .withColumn("amount", F.col("amount_str").cast("decimal(15,2)"))
        .withColumn("status", F.upper(F.trim("status")))
    )

# Gold: daily aggregation
@dlt.table(comment="Daily revenue summary by region")
def gold_daily_revenue():
    return (
        dlt.read("silver_orders")
        .groupBy(F.to_date("order_date").alias("date"), "region")
        .agg(
            F.sum("amount").alias("total_revenue"),
            F.count("*").alias("order_count"),
        )
    )`,
      },
    ],
    resources: [
      { title: 'Delta Live Tables docs', url: 'https://docs.databricks.com/en/delta-live-tables/index.html', type: 'docs', free: true },
      { title: 'DLT expectations', url: 'https://docs.databricks.com/en/delta-live-tables/expectations.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the difference between @dlt.expect and @dlt.expect_or_drop?',
        options: [
          'They are identical — both drop failing rows',
          '@dlt.expect logs a warning but keeps all rows. @dlt.expect_or_drop removes rows that fail the constraint',
          '@dlt.expect stops the pipeline on failure. @dlt.expect_or_drop continues',
          '@dlt.expect applies to streaming tables only',
        ],
        answer: 1,
        explanation: 'DLT has three expectation actions: @expect (warn — keep rows, log violation), @expect_or_drop (quarantine — remove failing rows, continue pipeline), @expect_or_fail (fail — stop the pipeline on any violation). Use drop at Silver to clean data, use fail at Gold to ensure BI never sees bad data.',
      },
    ],
  },

  // ─── PHASE 6 ────────────────────────────────────────────────────────────────

  'streaming-concepts': {
    simpleExplanation: 'Streaming data engineering is processing data the moment it arrives — instead of waiting to collect a day\'s worth of data and processing it overnight, you process each event within seconds of it happening.',
    deepExplanation: `**Event time vs processing time**\nEvent time is when the event actually happened (a sensor reading at 14:32:05). Processing time is when the system processes it (14:32:08 — 3 seconds later due to network latency). This distinction matters because events can arrive late — a mobile app event created at 14:30 might arrive at the server at 14:45 due to a poor connection. Aggregations based on event time give accurate results. Aggregations based on processing time are faster but can miscount late events.\n\n**Watermarks**\nA watermark is the threshold for how late data can arrive and still be included in a window. withWatermark("timestamp", "10 minutes") tells the system: "I'll wait up to 10 minutes past the current event time for late data. Events arriving more than 10 minutes late may be dropped." Watermarks let the system garbage-collect old state — without them, stateful aggregations grow forever.\n\n**Windowing**\nTumbling windows: fixed, non-overlapping time buckets (every 5 minutes). Sliding windows: overlapping windows (every 5 minutes, looking back 15 minutes). Session windows: variable-length windows that close after a gap of inactivity.\n\n**Exactly-once semantics**\nAt-most-once: events may be lost, never duplicated. At-least-once: events may be duplicated, never lost. Exactly-once: each event is processed exactly once — the hardest guarantee. Spark Structured Streaming + Delta Lake achieves exactly-once via idempotent writes and checkpointing.`,
    keyPoints: [
      'Event time = when event happened. Processing time = when system received it. Always prefer event time',
      'Watermark = late data tolerance threshold. Required for stateful streaming aggregations',
      'Tumbling window: fixed, non-overlapping (5-min buckets). Sliding: overlapping. Session: gap-based',
      'Checkpointing saves streaming state to ADLS — enables restart from last committed offset',
      'Exactly-once requires both idempotent sinks (Delta Lake) and committed source offsets',
      'Backpressure: streaming system slows ingestion when processing falls behind — prevents OOM',
    ],
    commonMistakes: [
      'Not using watermarks in stateful streaming — state grows unboundedly until OOM',
      'Confusing event time and processing time — time-based aggregations produce wrong results',
      'Deleting checkpoint directories to "reset" a streaming job — corrupts state, causes duplicates',
      'Setting watermark too tight (1 minute) — drops late data from slow mobile clients',
    ],
    interviewTips: [
      'Explain event time vs processing time with a real example (mobile app events)',
      'What is a watermark and why is it required for streaming aggregations?',
      'Describe the three windowing types and when to use each',
      'How does Spark Structured Streaming achieve exactly-once semantics?',
    ],
    bestPractices: [
      'Always set watermarks for stateful operations — size based on your source\'s late arrival SLA',
      'Store checkpoints in ADLS (not DBFS) for production streaming jobs',
      'Monitor consumer group lag (Event Hubs/Kafka) to detect streaming pipeline slowdowns',
      'Use trigger(availableNow=True) for near-real-time batch processing without always-on clusters',
    ],
    codeExamples: [
      {
        title: 'Windowed aggregation with watermark',
        language: 'python',
        code: `from pyspark.sql import functions as F

# Read stream from Event Hubs / Kafka
df_stream = spark.readStream.format("kafka") \
    .option("kafka.bootstrap.servers", "eventhub.servicebus.windows.net:9093") \
    .option("subscribe", "iot-telemetry") \
    .load()

# Parse JSON payload
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType
schema = StructType([
    StructField("device_id",  StringType()),
    StructField("timestamp",  TimestampType()),
    StructField("temperature", DoubleType()),
])
df_parsed = df_stream.select(
    F.from_json(F.col("value").cast("string"), schema).alias("d")
).select("d.*")

# Tumbling window aggregation with watermark
df_windowed = (
    df_parsed
    .withWatermark("timestamp", "2 minutes")   # Wait up to 2 min for late data
    .groupBy(
        F.window("timestamp", "5 minutes"),    # 5-minute tumbling windows
        "device_id"
    )
    .agg(
        F.avg("temperature").alias("avg_temp"),
        F.count("*").alias("reading_count"),
    )
)

# Write to Delta Lake with checkpointing
df_windowed.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "abfss://checkpoints@storage.dfs.core.windows.net/telemetry/") \
    .option("path", "abfss://silver@storage.dfs.core.windows.net/iot_agg/") \
    .trigger(processingTime="30 seconds") \
    .start()`,
      },
    ],
    resources: [
      { title: 'Structured Streaming guide', url: 'https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html', type: 'docs', free: true },
      { title: 'Streaming concepts (Databricks)', url: 'https://docs.databricks.com/en/structured-streaming/index.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'Why should streaming aggregations use event time instead of processing time?',
        options: [
          'Event time is easier to compute',
          'Events can arrive late — event time aggregations correctly place late events in the window where they belong, regardless of when they arrived',
          'Processing time is not available in Spark',
          'Event time is faster to process',
        ],
        answer: 1,
        explanation: 'A mobile sensor event created at 14:30 might arrive at 14:45 due to poor connectivity. Processing-time aggregation puts it in the 14:45 window — wrong. Event-time aggregation correctly places it in the 14:30 window. Watermarks control how long to wait for such late events before finalizing a window.',
      },
    ],
  },

  'azure-event-hubs': {
    simpleExplanation: 'Azure Event Hubs is a managed message queue for high-volume real-time data — think of it as a massive inbox that can receive millions of events per second from IoT devices, apps, or clickstreams and hold them until your pipeline is ready to process them.',
    deepExplanation: `**Core concepts**\nNamespace: the container for Event Hubs (like a Kafka cluster). Event Hub: a single topic/queue (like a Kafka topic). Partition: an ordered, immutable sequence of events — the unit of parallelism. Consumer Group: an independent cursor tracking position in each partition — multiple applications read the same data independently.\n\n**Partitions and throughput**\nPartition count is set at creation and cannot be changed. More partitions = more parallelism for consumers. Messages with the same partition key always go to the same partition — guaranteeing order for that key. Throughput Units (TUs) or Processing Units control ingress/egress limits. One TU = 1 MB/s in, 2 MB/s out.\n\n**Event Hubs Capture**\nCapture automatically archives all incoming events to ADLS Gen2 as Avro files on a configurable time/size schedule. This is the simplest way to land raw streaming data in your Bronze layer without writing a consumer — enable Capture and your Event Hub becomes a self-archiving Bronze ingestion.\n\n**Kafka compatibility**\nEvent Hubs exposes a Kafka-compatible endpoint on port 9093. Existing Kafka producers and consumers can point at Event Hubs with just a configuration change — no code changes. This makes migration from Confluent/MSK to Event Hubs trivial.`,
    keyPoints: [
      'Partition count is immutable after creation — plan capacity upfront (32 is a common production value)',
      'Consumer groups enable multiple independent readers: one for Spark, one for Stream Analytics, one for Functions',
      'Event retention: 1–7 days (Standard) or up to 90 days (Premium/Dedicated)',
      'Event Hubs Capture = zero-code Bronze landing layer in ADLS (Avro format, configurable interval)',
      'Partition key ensures ordered delivery per key — use device_id, user_id, or entity_id',
      'Dead-letter queue equivalent: failed events need explicit error handling in the consumer',
    ],
    commonMistakes: [
      'Creating too few partitions — you can\'t increase them later without recreation',
      'Not using consumer groups — multiple readers on the default group interfere with each other',
      'Ignoring partition key strategy — random partitioning loses per-entity ordering',
      'Not enabling Event Hubs Capture — losing data that wasn\'t consumed before retention period expired',
    ],
    interviewTips: [
      'How does Event Hubs compare to Apache Kafka?',
      'What is a consumer group and why do you need separate ones per downstream consumer?',
      'How would you ensure ordered processing of events per device?',
      'What is Event Hubs Capture and when would you use it instead of a consumer?',
    ],
    bestPractices: [
      'Enable Capture on all production Event Hubs as a Bronze backup — even if you have a consumer',
      'Create a dedicated consumer group for each downstream system (Spark, Stream Analytics, etc.)',
      'Use partition key = entity ID (device_id, user_id) for ordered per-entity processing',
      'Monitor Event Hubs with Azure Monitor: incoming messages, consumer lag, throttled requests',
    ],
    codeExamples: [
      {
        title: 'Read Event Hubs in Spark Structured Streaming',
        language: 'python',
        code: `import json
from pyspark.sql import functions as F

# Event Hubs connection config for Spark connector
eh_conn_str = dbutils.secrets.get("kv-scope", "eventhub-conn-str")
eh_conf = {
    "eventhubs.connectionString":
        sc._jvm.org.apache.spark.eventhubs.EventHubsUtils.encrypt(eh_conn_str),
    "eventhubs.consumerGroup": "databricks-cg",
    "eventhubs.startingPosition": json.dumps({
        "offset": "-1",        # -1 = start from beginning (use "@latest" for new data only)
        "seqNo": -1,
        "enqueuedTime": None,
        "isInclusive": True
    }),
}

# Read stream
df_raw = spark.readStream \
    .format("eventhubs") \
    .options(**eh_conf) \
    .load()

# Event Hubs fields: body, partition, offset, sequenceNumber, enqueuedTime, publisher, partitionKey
df_events = df_raw.select(
    F.col("body").cast("string").alias("payload"),
    F.col("enqueuedTime").alias("enqueued_at"),
    F.col("partitionKey").alias("device_id"),
    F.col("sequenceNumber"),
)`,
      },
    ],
    resources: [
      { title: 'Azure Event Hubs docs', url: 'https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-about', type: 'docs', free: true },
      { title: 'Event Hubs Capture', url: 'https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-capture-overview', type: 'docs', free: true },
      { title: 'Event Hubs Kafka endpoint', url: 'https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-for-kafka-ecosystem-overview', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What happens if two consumers share the same Event Hubs consumer group?',
        options: [
          'Both receive all events independently',
          'They compete — each event is delivered to only one of them, splitting the stream unpredictably',
          'An error is thrown',
          'The slower consumer is automatically removed',
        ],
        answer: 1,
        explanation: 'A consumer group tracks a single cursor (offset) per partition. Two consumers in the same group compete for partitions — each partition is assigned to one consumer at a time. They split the stream rather than both seeing all events. Create separate consumer groups for each independent downstream system.',
      },
    ],
  },

  'stream-analytics': {
    simpleExplanation: 'Azure Stream Analytics is a fully managed serverless service that lets you write SQL-like queries to process and analyze streaming data in real time — no Spark cluster to manage, just write a query and it runs.',
    deepExplanation: `**When to use Stream Analytics vs Spark Streaming**\nStream Analytics is ideal for simple-to-moderate streaming transformations where you want zero infrastructure management: filtering, aggregations, windowed counts, anomaly detection, reference data joins. Spark Structured Streaming is better for complex transformations, ML scoring, custom logic, and when you're already in Databricks.\n\n**SAQL (Stream Analytics Query Language)**\nSASL is a SQL dialect with streaming extensions. You write queries against named inputs (Event Hub, IoT Hub, Blob) and route results to named outputs (ADLS, SQL, Power BI, Service Bus). The windowing functions (TUMBLINGWINDOW, SLIDINGWINDOW, SESSIONWINDOW, HOPPINGWINDOW) are the core analytical primitives.\n\n**Reference data joins**\nStream Analytics can join a live stream against a static reference dataset (loaded from Blob Storage). The reference data is loaded into memory and refreshed periodically. Use this to enrich streaming events with device metadata, product info, or customer segments without a lookup service.\n\n**Outputs**\nStream Analytics can fan out to multiple outputs simultaneously: write raw events to ADLS, write aggregations to Azure SQL for dashboards, send anomalies to Service Bus for alerting — all from one query job.`,
    keyPoints: [
      'TUMBLINGWINDOW(minute, 5): non-overlapping 5-minute buckets — most common for DE aggregations',
      'SLIDINGWINDOW(minute, 5): fires on every event, looking back 5 minutes — good for anomaly detection',
      'Compatibility level 1.2 enables multi-step queries with CTEs — always use latest version',
      'Reference data join enriches stream with static lookup data loaded from Blob Storage',
      'Streaming Units (SUs) control compute allocation — scale up for higher throughput',
      'Built-in anomaly detection: AnomalyDetection_SpikeAndDip(), AnomalyDetection_ChangePoint()',
    ],
    commonMistakes: [
      'Using SLIDINGWINDOW when TUMBLINGWINDOW is needed — sliding fires on every event (expensive)',
      'Not selecting the right compatibility level — older levels lack multi-step query support',
      'Forgetting that Stream Analytics has at-least-once delivery — downstream sinks must handle duplicates',
      'Using Stream Analytics for complex ML scoring — use Databricks instead',
    ],
    interviewTips: [
      'Compare Stream Analytics vs Spark Structured Streaming — when do you choose each?',
      'What is the difference between TUMBLINGWINDOW and HOPPINGWINDOW?',
      'How does reference data work in Stream Analytics?',
      'How would you detect anomalies in IoT sensor data using Stream Analytics?',
    ],
    bestPractices: [
      'Use Stream Analytics for simple filtering and aggregation; Databricks for complex transformations',
      'Always output to ADLS as a backup alongside your primary output target',
      'Test queries in the Azure portal with sample data before deploying to production',
      'Set up Azure Monitor alerts on SU% utilization and output watermark delay',
    ],
    codeExamples: [
      {
        title: 'SAQL windowed aggregation with anomaly detection',
        language: 'sql',
        code: `-- Input: Event Hub "iot-telemetry"
-- Output 1: ADLS "silver-agg" (5-min aggregations)
-- Output 2: SQL DB "alerts" (anomalies only)

-- 5-minute tumbling window aggregation
SELECT
    System.Timestamp()                    AS window_end,
    device_id,
    AVG(temperature)                      AS avg_temp,
    MAX(temperature)                      AS max_temp,
    MIN(temperature)                      AS min_temp,
    COUNT(*)                              AS reading_count
INTO [silver-agg]
FROM [iot-telemetry] TIMESTAMP BY event_time
GROUP BY device_id, TumblingWindow(minute, 5);

-- Anomaly detection with spike and dip
SELECT
    System.Timestamp()                    AS detected_at,
    device_id,
    temperature,
    anomalyscore,
    isanomaly
INTO [alerts]
FROM (
    SELECT
        device_id,
        temperature,
        event_time,
        AnomalyDetection_SpikeAndDip(temperature, 95, 120, 'spikesanddips')
            OVER (PARTITION BY device_id LIMIT DURATION(minute, 10)) AS spike_score
    FROM [iot-telemetry] TIMESTAMP BY event_time
) detection
CROSS APPLY GetRecordProperties(spike_score)
WHERE isanomaly = 1;`,
      },
    ],
    resources: [
      { title: 'Azure Stream Analytics docs', url: 'https://docs.microsoft.com/en-us/azure/stream-analytics/stream-analytics-introduction', type: 'docs', free: true },
      { title: 'SAQL windowing functions', url: 'https://docs.microsoft.com/en-us/stream-analytics-query/windowing-azure-stream-analytics', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the difference between TUMBLINGWINDOW and SLIDINGWINDOW in Stream Analytics?',
        options: [
          'They are identical — just different names',
          'TUMBLINGWINDOW creates fixed non-overlapping buckets that fire once per interval. SLIDINGWINDOW fires on every event looking back a fixed duration',
          'SLIDINGWINDOW is more accurate',
          'TUMBLINGWINDOW requires more Streaming Units',
        ],
        answer: 1,
        explanation: 'TUMBLINGWINDOW(minute, 5) fires once every 5 minutes with that window\'s aggregated data — efficient for periodic reporting. SLIDINGWINDOW(minute, 5) fires on every incoming event and aggregates the past 5 minutes — useful for continuous anomaly detection but generates far more output records.',
      },
    ],
  },

  'spark-structured-streaming': {
    simpleExplanation: 'Spark Structured Streaming processes live data streams using the same DataFrame API you use for batch jobs — Spark treats the stream as an infinitely growing table and you query it like normal data.',
    deepExplanation: `**Micro-batch and continuous processing**\nDefault mode is micro-batch: Spark processes new data in small batches at a configurable trigger interval (e.g., every 30 seconds). Continuous processing mode aims for sub-millisecond latency but has limitations. For DE workloads, micro-batch is almost always the right choice — trigger(availableNow=True) processes all available data then stops, ideal for scheduled near-real-time jobs.\n\n**Sources and sinks**\nBuilt-in streaming sources: Kafka/Event Hubs, Auto Loader (file-based), Delta Lake, Rate (test). Built-in sinks: Delta Lake (recommended), Kafka, files, console (debug). Delta Lake as a sink provides exactly-once writes via transactional commits combined with checkpointing.\n\n**Checkpointing**\nCheckpointing saves the streaming query state and source offsets to durable storage (ADLS). If a streaming job crashes, it restarts from the last checkpoint — no data loss, no reprocessing from the beginning. Always set checkpointLocation for every streaming query in production.\n\n**Stateful operations**\nGroupBy + agg on a stream maintains running state (partial aggregates per key). The state store persists between micro-batches. Use withWatermark to bound state size — without it, state grows forever and the job eventually OOMs. mapGroupsWithState and flatMapGroupsWithState enable custom stateful logic.`,
    keyPoints: [
      'trigger(processingTime="30 seconds"): run every 30s. trigger(availableNow=True): process all new data then stop',
      'checkpointLocation is mandatory for production — stores offsets and state for fault tolerance',
      'outputMode("append"): only new rows. outputMode("complete"): full result. outputMode("update"): changed rows',
      'Auto Loader (cloudFiles format) is the recommended way to stream new files from ADLS',
      'foreachBatch lets you apply any batch operation (MERGE, complex transformations) to each micro-batch',
      'Watermark + window = bounded state. Without watermark, stateful streaming grows forever',
    ],
    commonMistakes: [
      'Not setting checkpointLocation — job restarts from scratch on failure, reprocessing all data',
      'Using outputMode("complete") for large aggregations — writes the entire result every micro-batch',
      'Deleting the checkpoint directory to fix issues — causes duplicate processing or data loss',
      'Using trigger(processingTime="1 second") when trigger(availableNow=True) would be cheaper',
    ],
    interviewTips: [
      'What is the difference between the three output modes?',
      'How does checkpointing provide fault tolerance in Structured Streaming?',
      'When would you use foreachBatch?',
      'How do you implement MERGE (upsert) in a streaming pipeline?',
    ],
    bestPractices: [
      'Always store checkpoints in ADLS: abfss://checkpoints@storage.dfs.core.windows.net/job-name/',
      'Use Auto Loader for file-based streaming — handles schema inference, new file detection, and exactly-once',
      'Use foreachBatch + Delta MERGE for streaming upserts instead of streaming append + batch dedup',
      'Monitor streaming query metrics via query.lastProgress for lag and throughput',
    ],
    codeExamples: [
      {
        title: 'Auto Loader + foreachBatch MERGE pattern',
        language: 'python',
        code: `from pyspark.sql import functions as F
from delta.tables import DeltaTable

# Auto Loader: stream new JSON files landing in ADLS
df_stream = (
    spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaLocation",
            "abfss://checkpoints@storage.dfs.core.windows.net/orders-schema/")
    .load("abfss://landing@storage.dfs.core.windows.net/orders/")
)

# foreachBatch: apply Delta MERGE for upsert semantics (exactly-once)
def upsert_to_silver(batch_df, batch_id):
    silver_path = "abfss://silver@storage.dfs.core.windows.net/orders/"

    # Create table if first run
    if not DeltaTable.isDeltaTable(spark, silver_path):
        batch_df.write.format("delta").save(silver_path)
        return

    DeltaTable.forPath(spark, silver_path).alias("t") \
        .merge(batch_df.alias("s"), "t.order_id = s.order_id") \
        .whenMatchedUpdateAll() \
        .whenNotMatchedInsertAll() \
        .execute()

query = df_stream.writeStream \
    .foreachBatch(upsert_to_silver) \
    .option("checkpointLocation",
            "abfss://checkpoints@storage.dfs.core.windows.net/orders/") \
    .trigger(availableNow=True) \
    .start()
query.awaitTermination()`,
      },
    ],
    resources: [
      { title: 'Structured Streaming programming guide', url: 'https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html', type: 'docs', free: true },
      { title: 'Auto Loader docs (Databricks)', url: 'https://docs.databricks.com/en/ingestion/auto-loader/index.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What does outputMode("append") mean in Spark Structured Streaming?',
        options: [
          'New data is appended to the checkpoint',
          'Only newly generated rows since the last trigger are written to the sink — existing rows are never updated',
          'All rows in the result table are written every trigger',
          'Only rows that changed since last trigger are written',
        ],
        answer: 1,
        explanation: 'append mode writes only rows that are finalized (will not change) since the last trigger. For aggregations with watermarks, a window\'s result is only appended after the watermark passes it. "complete" writes the full result table every trigger. "update" writes only changed rows (works for aggregations).',
      },
    ],
  },

  'lambda-kappa': {
    simpleExplanation: 'Lambda and Kappa are architecture blueprints for systems that need to answer questions about both historical data and live data — Lambda uses two separate paths (batch + streaming), Kappa uses one unified streaming path for everything.',
    deepExplanation: `**Lambda Architecture**\nLambda has three layers: Batch layer (processes all historical data periodically for accuracy), Speed layer (processes real-time data for low latency, accepts some inaccuracy), Serving layer (merges batch and speed results to answer queries). Problem: maintaining two codebases for the same logic is expensive. The batch layer always wins for accuracy but the speed layer is needed for fresh data.\n\n**Kappa Architecture**\nKappa simplifies Lambda by eliminating the batch layer. All data — historical and real-time — is processed through a single streaming pipeline. To reprocess historical data, you replay the event log from the beginning. This works because systems like Kafka/Event Hubs store all events with configurable retention.\n\n**Modern Lakehouse approach**\nDelta Lake + Databricks blurs the Lambda/Kappa distinction. A single Delta table can be written by both a streaming job (for fresh data) and a batch job (for historical corrections). Structured Streaming with trigger(availableNow=True) runs a micro-batch job on new files — essentially batch semantics with streaming infrastructure. This is sometimes called "Lakehouse architecture" — the successor to both Lambda and Kappa.\n\n**Choosing between them**\nLambda: when your batch layer has computation that can't be expressed as a stream (complex historical ML, full table scans). Kappa: when your transformation logic is expressible as a stream and your event log has sufficient retention. Modern default: Delta Lake + Auto Loader + Workflows handles most use cases without a strict Lambda or Kappa choice.`,
    keyPoints: [
      'Lambda: batch layer (accurate, slow) + speed layer (approximate, fast) + serving layer (merge)',
      'Kappa: one streaming pipeline for everything — replay history by rewinding the event log',
      'Lambda\'s main weakness: duplicated transformation logic in two different systems',
      'Kappa\'s main weakness: full reprocessing requires the event log to retain all events (expensive)',
      'Delta Lake + Auto Loader = modern alternative that handles both streaming and batch in one pipeline',
      'trigger(availableNow=True) = batch semantics on streaming infrastructure = Kappa without always-on cost',
    ],
    commonMistakes: [
      'Over-engineering: building full Lambda when trigger(availableNow=True) would solve the problem',
      'Not retaining enough Event Hub history for Kappa reprocessing scenarios',
      'Mixing Lambda speed and batch results incorrectly — serving layer logic is subtle',
      'Treating these as strict choices — modern systems often blend both patterns',
    ],
    interviewTips: [
      'Draw Lambda architecture: batch layer, speed layer, serving layer with arrows',
      'What are the trade-offs between Lambda and Kappa?',
      'How would you implement Kappa architecture on Azure?',
      'What problem does the Lakehouse architecture solve that Lambda/Kappa don\'t?',
    ],
    bestPractices: [
      'Default to Kappa/Lakehouse for new projects — simpler to maintain than Lambda',
      'Use Lambda only when you have genuine batch-only computation (full historical aggregations, complex backfills)',
      'Design event schemas for replayability from day one — immutable events with timestamps',
      'Document your architecture choice and the trade-offs — this is a common design review topic',
    ],
    codeExamples: [
      {
        title: 'Kappa pattern on Azure: replay via Event Hubs + Auto Loader',
        language: 'python',
        code: `# Normal operation: Auto Loader processes new files as they land (streaming-ish)
query = (
    spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "parquet")
    .option("cloudFiles.schemaLocation", "/checkpoints/orders-schema/")
    .load("abfss://bronze@storage.dfs.core.windows.net/orders/")
    .writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoints/orders-silver/")
    .option("path", "abfss://silver@storage.dfs.core.windows.net/orders/")
    .trigger(availableNow=True)  # Process all new files, then stop
    .start()
)
query.awaitTermination()

# Full reprocess (Kappa replay): delete checkpoint + restart
# dbutils.fs.rm("/checkpoints/orders-silver/", recurse=True)
# spark.sql("DROP TABLE IF EXISTS silver.orders")
# Run the same job again — reprocesses all files from scratch`,
      },
    ],
    resources: [
      { title: 'Lambda architecture (Microsoft)', url: 'https://docs.microsoft.com/en-us/azure/architecture/data-guide/big-data/', type: 'docs', free: true },
      { title: 'Lakehouse architecture (Databricks)', url: 'https://docs.databricks.com/en/lakehouse/index.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the main disadvantage of Lambda Architecture?',
        options: [
          'It cannot handle real-time data',
          'The same transformation logic must be maintained in two separate systems (batch and speed layers)',
          'It requires more storage than Kappa',
          'Lambda does not support historical queries',
        ],
        answer: 1,
        explanation: 'Lambda\'s speed and batch layers compute the same metrics but with different code (one in Spark batch, one in streaming). Any business logic change must be applied to both layers simultaneously, or results diverge. This maintenance burden is why Kappa and Lakehouse architectures emerged as simpler alternatives.',
      },
    ],
  },

  // ─── PHASE 7 ────────────────────────────────────────────────────────────────

  'azure-devops': {
    simpleExplanation: 'Azure DevOps is the platform that automates the journey from writing code to deploying it to production — every commit can automatically trigger tests, build artifacts, and deploy your pipelines across environments without manual steps.',
    deepExplanation: `**Core services**\nBoards: Agile project management (epics, stories, tasks, sprints). Repos: Git repositories (same as GitHub but inside Azure). Pipelines: CI/CD automation as YAML files. Artifacts: package feeds for Python packages, npm, NuGet. Test Plans: manual and automated test management.\n\n**YAML pipelines**\nAzure Pipelines are defined as YAML files committed to the repo — infrastructure as code for your CI/CD. A pipeline has triggers (on push to main, on PR), stages (Build, Test, Deploy-Dev, Deploy-Prod), jobs (groups of steps), and steps (individual tasks or scripts). Approval gates between stages require a human reviewer before continuing to production.\n\n**Service connections**\nA service connection is an authenticated link to an external service — Azure subscription, Docker registry, GitHub. Pipelines use service connections to deploy resources without storing credentials in YAML files.\n\n**Variable groups and Key Vault integration**\nVariable groups store reusable variables (environment names, connection strings). Link a variable group to Azure Key Vault and pipeline secrets are fetched at runtime — no secrets in YAML, no secrets in the pipeline UI.`,
    keyPoints: [
      'YAML pipelines are code — committed to the repo, reviewed in PRs, versioned with the project',
      'Approval gates between stages enforce human review before production deployment',
      'Service connections authenticate pipelines to Azure without storing credentials in YAML',
      'Branch policies on main: require PR + min 2 reviewers + all CI checks passing before merge',
      'Environments in Azure DevOps track deployments and enable rollback with one click',
      'Pipeline templates enable reuse: define once, reference from many pipelines',
    ],
    commonMistakes: [
      'Storing secrets in YAML pipeline files or variable group plain text — use Key Vault link instead',
      'No approval gate on production deployment — any merged PR auto-deploys to prod',
      'Not using pipeline templates — copy-pasting pipeline YAML across repos creates drift',
      'Skipping branch policies — direct pushes to main bypass code review',
    ],
    interviewTips: [
      'Draw a CI/CD pipeline from code commit to production deployment',
      'What is a service connection and how does it authenticate?',
      'How do you deploy to multiple environments with environment-specific parameters?',
      'How do you prevent a failing CI pipeline from blocking an emergency hotfix?',
    ],
    bestPractices: [
      'Keep pipeline YAML in the same repo as the code it deploys',
      'Use pipeline templates stored in a central repo for shared stages (test, security scan)',
      'Link variable groups to Key Vault — never store secrets as plain-text pipeline variables',
      'Set up branch policies: require PR, min 1 reviewer, linked work item, CI must pass',
    ],
    codeExamples: [
      {
        title: 'Multi-stage Azure Pipelines YAML',
        language: 'yaml',
        code: `trigger:
  branches:
    include: [main]
  paths:
    include: [src/pipelines/**, infrastructure/**]

variables:
  - group: de-platform-vars  # Linked to Key Vault

stages:
  - stage: CI
    displayName: Build & Test
    jobs:
      - job: Test
        pool: { vmImage: ubuntu-latest }
        steps:
          - task: UsePythonVersion@0
            inputs: { versionSpec: '3.11' }
          - script: pip install -r requirements-dev.txt
          - script: pytest tests/ --junitxml=results.xml
          - task: PublishTestResults@2
            inputs: { testResultsFiles: results.xml }

  - stage: DeployDev
    displayName: Deploy to Dev
    dependsOn: CI
    condition: succeeded()
    jobs:
      - deployment: DeployADF
        environment: dev
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureResourceManagerTemplateDeployment@3
                  inputs:
                    deploymentScope: Resource Group
                    azureResourceManagerConnection: sc-azure-dev
                    resourceGroupName: rg-de-platform-dev
                    templateLocation: Linked artifact
                    csmFile: adf_publish/ARMTemplateForFactory.json

  - stage: DeployProd
    displayName: Deploy to Production
    dependsOn: DeployDev
    jobs:
      - deployment: DeployProd
        environment: prod  # Has approval gate configured in Azure DevOps
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploying to production"`,
      },
    ],
    resources: [
      { title: 'Azure Pipelines docs', url: 'https://docs.microsoft.com/en-us/azure/devops/pipelines/', type: 'docs', free: true },
      { title: 'YAML pipeline schema', url: 'https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the purpose of an environment approval gate in Azure DevOps?',
        options: [
          'It validates YAML syntax before running the pipeline',
          'It pauses the pipeline at a stage boundary and requires a designated reviewer to manually approve before the next stage runs',
          'It automatically tests the deployment in a sandbox',
          'It enforces branch policies',
        ],
        answer: 1,
        explanation: 'An approval gate on an Environment (e.g., "prod") means the pipeline pauses after deploying to UAT and waits for a designated approver to review and click Approve. Only then does the pipeline continue to the production deployment stage. This prevents accidental or unreviewed production deployments.',
      },
    ],
  },

  'adf-cicd': {
    simpleExplanation: 'ADF CI/CD is the process of automatically deploying your Data Factory pipelines across Dev, UAT, and Production environments whenever code is merged — instead of manually publishing in each environment.',
    deepExplanation: `**How ADF Git integration works**\nWhen you connect ADF to Azure Repos, every pipeline, dataset, linked service, and trigger is stored as JSON files in a collaboration branch (usually main). Developers work on feature branches and create PRs. The "Publish" button in ADF compiles these JSON files into ARM templates and pushes them to the adf_publish branch.\n\n**The CI/CD flow**\nCI: PR triggers a validation pipeline that checks JSON syntax and runs any unit tests. CD: merging to main triggers a release pipeline that takes ARM templates from adf_publish, applies environment-specific parameter overrides, and deploys to UAT then Prod with approval gates.\n\n**Parameter overrides**\nLinked service connection strings differ between Dev, UAT, and Prod. ADF ARM templates support parameter files — you supply environment-specific values at deploy time. Key Vault references in parameter files pull secrets at deployment time without hardcoding.\n\n**Stop triggers before deploy**\nBefore deploying to an environment, stop all active triggers. Deploy the ARM template. Restart triggers. This prevents pipelines from running against half-deployed ARM templates during the deployment window.`,
    keyPoints: [
      'adf_publish branch is auto-generated by the "Publish" button — never edit it manually',
      'ARM parameter override file allows per-environment connection strings without changing the template',
      'Always stop triggers → deploy → start triggers to avoid runs on partially-deployed state',
      'Global parameters in ADF need separate handling in the ARM template deployment',
      'Use the ADF deployment task (v2) in Azure DevOps — it handles trigger stop/start automatically',
      'Roll back by redeploying the previous ARM template from an earlier adf_publish commit',
    ],
    commonMistakes: [
      'Manually editing JSON files in adf_publish branch — the next Publish overwrites them',
      'Not stopping triggers before deployment — running pipelines encounter mixed old/new state',
      'Using hardcoded connection strings in linked services instead of ARM parameters',
      'Not having a rollback plan — always keep the previous ARM template version in Artifacts',
    ],
    interviewTips: [
      'Explain the role of the adf_publish branch in the ADF CI/CD process',
      'How do you handle environment-specific linked service credentials during deployment?',
      'Why do you need to stop triggers before deploying ADF ARM templates?',
      'How would you roll back an ADF deployment that broke production?',
    ],
    bestPractices: [
      'Use Azure DevOps pipeline with ADF Deploy task — handles trigger lifecycle automatically',
      'Store ARM parameter files per environment in the repo: params/dev.json, params/prod.json',
      'Add a smoke test stage after deployment: run a test pipeline and verify output',
      'Tag ADF ARM template deployments with the triggering git commit SHA for traceability',
    ],
    codeExamples: [
      {
        title: 'ADF deployment pipeline with trigger management',
        language: 'yaml',
        code: `# azure-pipelines-adf.yml
stages:
  - stage: DeployADFProd
    jobs:
      - job: StopTriggers
        steps:
          - task: AzurePowerShell@5
            inputs:
              azureSubscription: sc-azure-prod
              ScriptType: InlineScript
              Inline: |
                $triggers = Get-AzDataFactoryV2Trigger \
                  -ResourceGroupName "rg-de-platform-prod" \
                  -DataFactoryName "adf-deplatform-prod"
                $triggers | ForEach-Object {
                  Stop-AzDataFactoryV2Trigger \
                    -ResourceGroupName "rg-de-platform-prod" \
                    -DataFactoryName "adf-deplatform-prod" \
                    -Name $_.Name -Force
                }

      - job: DeployARM
        dependsOn: StopTriggers
        steps:
          - task: AzureResourceManagerTemplateDeployment@3
            inputs:
              deploymentScope: Resource Group
              azureResourceManagerConnection: sc-azure-prod
              resourceGroupName: rg-de-platform-prod
              templateLocation: Linked artifact
              csmFile: $(Pipeline.Workspace)/adf_publish/ARMTemplateForFactory.json
              csmParametersFile: params/prod.json

      - job: StartTriggers
        dependsOn: DeployARM
        steps:
          - task: AzurePowerShell@5
            inputs:
              Inline: |
                # Restart all triggers after deployment
                Start-AzDataFactoryV2Trigger \
                  -ResourceGroupName "rg-de-platform-prod" \
                  -DataFactoryName "adf-deplatform-prod" \
                  -Name "tr_daily_ingestion" -Force`,
      },
    ],
    resources: [
      { title: 'ADF CI/CD docs', url: 'https://docs.microsoft.com/en-us/azure/data-factory/continuous-integration-delivery', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the adf_publish branch and who should edit it?',
        options: [
          'A branch for publishing documentation — edited by anyone',
          'An auto-generated branch containing compiled ARM templates — never manually edited, overwritten by each Publish click',
          'The main development branch for ADF pipelines',
          'A protected branch requiring 2 reviewers',
        ],
        answer: 1,
        explanation: 'The adf_publish branch is automatically generated when a developer clicks "Publish" in the ADF studio. It contains the compiled ARM templates for all pipelines, datasets, and linked services. Manually editing it is pointless — the next Publish overwrites it entirely. CI/CD deploys from this branch.',
      },
    ],
  },

  'databricks-cicd': {
    simpleExplanation: 'Databricks CI/CD means deploying your notebooks, jobs, and workflows automatically through Dev, UAT, and Production environments using code — so a data engineer never needs to manually upload notebooks or click through the Databricks UI to deploy.',
    deepExplanation: `**Databricks Asset Bundles (DABs)**\nDABs is the modern, official way to deploy Databricks resources as code. You define jobs, clusters, notebooks, and pipelines in a YAML bundle file (databricks.yml). The Databricks CLI deploys the bundle to target environments. DABs replaces older approaches (Databricks REST API, Terraform databricks provider) for notebook-centric deployments.\n\n**Bundle structure**\nA bundle has: resources (jobs, pipelines, clusters), targets (dev, staging, prod — each with different workspace URL and run-as identity), and variable overrides per target. Secrets in bundles reference Key Vault or Databricks secrets — never hardcoded values.\n\n**Notebook testing in CI**\nNotebooks are hard to unit test because they mix code and outputs. Best approaches: (1) extract business logic into Python modules, unit test the modules with pytest, (2) run the notebook end-to-end as an integration test on a job cluster using the Databricks CLI, (3) use nutter (open-source notebook testing framework) for notebook-level assertions.\n\n**Deployment flow**\nDeveloper pushes feature branch → PR triggers CI (lint, test Python modules, validate bundle) → merge to main triggers CD (bundle deploy to staging → integration test → approve → bundle deploy to prod).`,
    keyPoints: [
      'Databricks Asset Bundles (DABs): define jobs/pipelines as YAML, deploy via databricks bundle deploy',
      'databricks.yml has targets: dev, staging, prod — each with its own workspace URL and overrides',
      'Extract logic into .py modules and test with pytest — notebooks themselves are hard to unit test',
      'databricks bundle run <job-name> executes a job remotely for integration testing',
      'Use Databricks Repos to sync notebooks from Git — enables notebook version control in workspace',
      'Run integration tests on a job cluster spun up in CI — not on a shared all-purpose cluster',
    ],
    commonMistakes: [
      'Committing notebooks as ipynb with all output cells saved — creates noisy diffs',
      'No integration testing — unit tests on modules don\'t catch Spark runtime issues',
      'Using workspace-relative paths in notebooks — breaks when notebook moves to prod workspace',
      'Not cleaning up test Delta tables and job clusters after CI runs — cost accumulates',
    ],
    interviewTips: [
      'What are Databricks Asset Bundles and how do they work?',
      'How do you version control Databricks notebooks?',
      'How would you test a PySpark transformation function in CI?',
      'What is the difference between Repos and Asset Bundles in Databricks?',
    ],
    bestPractices: [
      'Use DABs for all production Databricks job deployments — it\'s the official recommended approach',
      'Add a .gitattributes rule to strip notebook outputs: *.ipynb filter=strip-notebook-output',
      'Structure your repo: src/pipelines/ (notebooks), src/lib/ (Python modules), tests/ (pytest)',
      'Use databricks bundle validate in CI to catch YAML schema errors before deploying',
    ],
    codeExamples: [
      {
        title: 'Databricks Asset Bundle configuration',
        language: 'yaml',
        code: `# databricks.yml
bundle:
  name: de-platform

variables:
  env:
    default: dev

targets:
  dev:
    mode: development
    workspace:
      host: https://adb-dev.azuredatabricks.net
    variables:
      env: dev

  prod:
    mode: production
    workspace:
      host: https://adb-prod.azuredatabricks.net
    variables:
      env: prod
    run_as:
      service_principal_name: sp-de-platform-prod

resources:
  jobs:
    daily_silver_ingestion:
      name: "daily-silver-ingestion-\${var.env}"
      email_notifications:
        on_failure: ["de-team@company.com"]
      tasks:
        - task_key: ingest_orders
          notebook_task:
            notebook_path: src/pipelines/silver_orders.py
            base_parameters:
              env: "\${var.env}"
          job_cluster_key: default_cluster
        - task_key: validate_quality
          depends_on: [{task_key: ingest_orders}]
          notebook_task:
            notebook_path: src/pipelines/quality_check.py
          job_cluster_key: default_cluster

      job_clusters:
        - job_cluster_key: default_cluster
          new_cluster:
            spark_version: 15.4.x-scala2.12
            node_type_id: Standard_DS3_v2
            num_workers: 2`,
      },
    ],
    resources: [
      { title: 'Databricks Asset Bundles docs', url: 'https://docs.databricks.com/en/dev-tools/bundles/index.html', type: 'docs', free: true },
      { title: 'Databricks CLI', url: 'https://docs.databricks.com/en/dev-tools/cli/index.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What does databricks bundle deploy do?',
        options: [
          'Runs all jobs in the bundle immediately',
          'Deploys the bundle\'s defined resources (jobs, pipelines, clusters) to the target Databricks workspace as defined in databricks.yml',
          'Downloads notebooks from the workspace',
          'Creates a backup of the workspace',
        ],
        answer: 1,
        explanation: 'databricks bundle deploy reads databricks.yml, resolves variable overrides for the target (dev/staging/prod), and creates or updates all declared resources (jobs, DLT pipelines, clusters) in the target workspace via the Databricks REST API. It is idempotent — safe to run multiple times.',
      },
    ],
  },

  'data-testing': {
    simpleExplanation: 'Data pipeline testing means writing automated checks that verify your transformations produce correct results — catching bugs before they reach production instead of discovering them when a stakeholder reports wrong numbers in a dashboard.',
    deepExplanation: `**Testing pyramid for data pipelines**\nUnit tests: test individual Python functions (transformation logic, parsing, business rules) in isolation with mock data. Fast, run in seconds. Integration tests: test the full pipeline on a small but realistic dataset in a real Spark/SQL environment. Slower, run in CI. Data quality tests: run against production data to catch data drift and schema changes.\n\n**pytest for Spark**\npytest with a local SparkSession fixture lets you run PySpark unit tests without a cluster. Create a shared SparkSession in a conftest.py fixture with scope="session" — one Spark context for all tests in the suite.\n\n**Great Expectations**\nGreat Expectations (GX) is the leading framework for data quality validation. You define "expectations" (the data must have these columns, this column must not have nulls, revenue must be positive) and run them against a DataFrame or table. GX generates HTML data docs showing expectation results over time — invaluable for stakeholder-facing data quality reporting.\n\n**dbt tests**\ndbt has built-in schema tests (not_null, unique, accepted_values, relationships) and supports custom SQL tests. If you use dbt for transformations, dbt test runs all tests after each build — part of your CI pipeline.`,
    keyPoints: [
      'Unit tests run without a cluster using a local SparkSession — fast enough for every CI run',
      'conftest.py SparkSession fixture with scope="session" — create once, share across all test files',
      'Great Expectations: expect_column_values_to_not_be_null, expect_column_values_to_be_between',
      'Test coverage target: 80%+ on transformation functions, 100% on business rule functions',
      'Data contract tests verify schema compatibility between producer and consumer pipelines',
      'Run data quality tests daily against production data — catch data drift early',
    ],
    commonMistakes: [
      'Only testing with tiny toy datasets — edge cases (nulls, duplicates, skewed keys) don\'t appear',
      'Creating a new SparkSession per test — extremely slow (30+ seconds per test)',
      'Testing only happy paths — test null handling, empty DataFrames, and schema mismatches',
      'Skipping integration tests — unit tests pass but the full pipeline fails on real Spark cluster',
    ],
    interviewTips: [
      'How do you unit test a PySpark transformation function?',
      'What is Great Expectations and how does it differ from unit tests?',
      'How would you test a pipeline that writes to Delta Lake?',
      'What is a data contract and how do you enforce it?',
    ],
    bestPractices: [
      'Separate pure business logic into Python functions — testable without Spark',
      'Use pytest fixtures for SparkSession, sample DataFrames, and temp Delta paths',
      'Add Great Expectations validation as a pipeline step in Silver layer — block bad data',
      'Run pytest in CI on every PR — fail the PR if any test fails',
    ],
    codeExamples: [
      {
        title: 'PySpark unit tests with pytest',
        language: 'python',
        code: `# conftest.py
import pytest
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark():
    """Single SparkSession for all tests — created once."""
    return (
        SparkSession.builder
        .master("local[2]")
        .appName("test-suite")
        .config("spark.sql.shuffle.partitions", "2")  # Small for tests
        .getOrCreate()
    )

# test_silver_orders.py
from pyspark.sql import Row
from src.lib.transformations import clean_orders  # Pure function to test

def test_clean_orders_removes_negative_amounts(spark):
    data = [
        Row(order_id="1", amount=100.0,  status="complete"),
        Row(order_id="2", amount=-50.0,  status="complete"),  # Should be removed
        Row(order_id="3", amount=0.0,    status="complete"),  # Should be removed
    ]
    df_input = spark.createDataFrame(data)
    df_result = clean_orders(df_input)

    assert df_result.count() == 1
    assert df_result.first()["order_id"] == "1"

def test_clean_orders_handles_null_status(spark):
    data = [Row(order_id="1", amount=100.0, status=None)]
    df_input = spark.createDataFrame(data)
    df_result = clean_orders(df_input)

    # Should fill null status with 'unknown', not drop the row
    assert df_result.count() == 1
    assert df_result.first()["status"] == "unknown"`,
      },
    ],
    resources: [
      { title: 'pytest documentation', url: 'https://docs.pytest.org/en/stable/', type: 'docs', free: true },
      { title: 'Great Expectations docs', url: 'https://docs.greatexpectations.io/docs/', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'Why should you use scope="session" for the SparkSession pytest fixture?',
        options: [
          'Session scope makes Spark run faster',
          'SparkSession creation takes 10-30 seconds — session scope creates it once and reuses it across all tests, keeping the test suite fast',
          'It is required by PySpark',
          'Session scope prevents test isolation issues',
        ],
        answer: 1,
        explanation: 'Starting a SparkSession involves JVM initialization, loading Spark libraries, and starting internal services — this takes 10-30 seconds. With scope="session", pytest creates it once for the entire test run and shares it. Without this, a suite with 50 tests would spend 25+ minutes just starting SparkSessions.',
      },
    ],
  },

  // ─── PHASE 8 ────────────────────────────────────────────────────────────────

  'azure-synapse': {
    simpleExplanation: 'Azure Synapse Analytics is Microsoft\'s all-in-one analytics platform — it combines a data warehouse (Dedicated SQL Pool), serverless SQL for querying files, Spark notebooks, and pipeline orchestration all in one workspace.',
    deepExplanation: `**Dedicated SQL Pool (formerly SQL DW)**\nDedicated SQL Pool is a Massively Parallel Processing (MPP) database. Data is distributed across 60 compute nodes. Each query is broken into 60 parallel distribution queries that run simultaneously. DWU (Data Warehouse Units) control how many compute nodes you have — scaling up = more parallelism. Pause when not in use — you pay for compute only when running.\n\n**Distribution strategies**\nHash: rows distributed by hash of a chosen column. Best for large fact tables joined on that column — joins happen on the same node (co-located), no data movement needed. Round-robin: even distribution, no co-location guarantee. Best for staging tables with no natural join key. Replicated: full copy on every node. Best for small dimension tables (< 2GB) — eliminates data movement for star schema joins.\n\n**Serverless SQL Pool**\nNo infrastructure to provision. Pay per TB scanned. Queries data files in ADLS Gen2 directly using OPENROWSET or external tables. Best for: ad-hoc exploration, ETL pipelines over ADLS files, exposing Delta Lake tables to BI tools. Not suitable for: heavy repeated workloads that need sub-second response (use Dedicated Pool).\n\n**Synapse vs Databricks**\nSynapse Dedicated Pool: best for structured SQL-heavy BI workloads with a fixed schema. Databricks: best for large-scale unstructured/semi-structured data, ML, complex Spark transformations. Many enterprises run both — Databricks for engineering, Synapse for serving.`,
    keyPoints: [
      '60 distributions per Dedicated Pool — hash by the most common JOIN column for co-location',
      'REPLICATE small dimension tables (< 2GB) — eliminates shuffle for star schema joins',
      'PolyBase/COPY INTO for bulk loads — much faster than INSERT row-by-row',
      'Pause Dedicated Pool when not in use — saves compute cost (storage continues billing)',
      'Serverless SQL Pool: OPENROWSET reads CSV/Parquet/Delta from ADLS — no data loading needed',
      'Result-set caching: identical queries return cached results — great for dashboard queries',
    ],
    commonMistakes: [
      'Choosing the wrong distribution key — hash on a low-cardinality column causes uneven distribution',
      'Not pausing Dedicated Pool overnight and on weekends — billing continues',
      'Using INSERT INTO instead of COPY INTO for bulk loads — 100x slower',
      'Over-partitioning small tables — each distribution has 60 partitions → 3600 total small partitions',
    ],
    interviewTips: [
      'Explain the three distribution types and when to use each',
      'What is the difference between Dedicated SQL Pool and Serverless SQL Pool?',
      'How does PolyBase/COPY INTO differ from a regular INSERT?',
      'When would you choose Synapse over Databricks?',
    ],
    bestPractices: [
      'Hash distribute all fact tables on their most common join column',
      'Replicate all dimension tables under 2GB',
      'Use COPY INTO or PolyBase for all bulk data loads into Dedicated Pool',
      'Set up workload management groups to prevent one heavy query from starving interactive users',
    ],
    codeExamples: [
      {
        title: 'Synapse Dedicated SQL Pool table design',
        language: 'sql',
        code: `-- Hash-distributed fact table (join key = customer_sk)
CREATE TABLE fact_sales (
    sale_id         BIGINT NOT NULL,
    customer_sk     INT    NOT NULL,
    product_sk      INT    NOT NULL,
    date_sk         INT    NOT NULL,
    quantity        INT,
    net_amount      DECIMAL(15,2)
)
WITH (
    DISTRIBUTION = HASH(customer_sk),
    CLUSTERED COLUMNSTORE INDEX,
    PARTITION (date_sk RANGE RIGHT FOR VALUES (20240101, 20240201, 20240301))
);

-- Replicated dimension table (< 2GB)
CREATE TABLE dim_product (
    product_sk  INT IDENTITY(1,1),
    product_id  VARCHAR(50),
    name        VARCHAR(200),
    category    VARCHAR(100)
)
WITH (DISTRIBUTION = REPLICATE, CLUSTERED COLUMNSTORE INDEX);

-- Bulk load with COPY INTO (fastest method)
COPY INTO fact_sales
FROM 'https://adlsdeplatform.dfs.core.windows.net/gold/sales/*.parquet'
WITH (
    FILE_TYPE = 'PARQUET',
    CREDENTIAL = (IDENTITY = 'Managed Identity')
);

-- Serverless SQL: query Delta Lake directly in ADLS
SELECT TOP 100 *
FROM OPENROWSET(
    BULK 'https://adlsdeplatform.dfs.core.windows.net/silver/orders/',
    FORMAT = 'DELTA'
) AS orders;`,
      },
    ],
    resources: [
      { title: 'Azure Synapse Analytics docs', url: 'https://docs.microsoft.com/en-us/azure/synapse-analytics/overview-what-is', type: 'docs', free: true },
      { title: 'Synapse distribution guidance', url: 'https://docs.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-tables-distribute', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'Which distribution strategy is best for a large fact table that is frequently joined to dimension tables on customer_id?',
        options: [
          'Round-robin — ensures even data distribution',
          'Replicated — copies the table to every node',
          'Hash on customer_id — co-locates matching rows on the same node, eliminating data movement during joins',
          'Hash on sale_id — unique key gives even distribution',
        ],
        answer: 2,
        explanation: 'Hash distributing the fact table on customer_id means all rows for a given customer_id land on the same distribution node. When you join to a dimension table that is also hash-distributed on customer_id (or replicated), the join happens locally on each node — no network data movement. Round-robin cannot guarantee co-location.',
      },
    ],
  },

  'data-governance-purview': {
    simpleExplanation: 'Microsoft Purview is the governance layer for your Azure data estate — it automatically scans and catalogs all your data assets, tracks where data came from and where it goes, and classifies sensitive data like PII.',
    deepExplanation: `**Data Map**\nPurview's Data Map is the foundation — it stores metadata about all your data assets across Azure, on-premises, and multi-cloud. Automated scanners connect to ADLS, Synapse, ADF, SQL databases, Power BI, and more. They catalog tables, columns, file paths, and schemas without you manually registering anything.\n\n**Data Catalog**\nThe Data Catalog is the searchable interface over the Data Map. Data engineers and analysts search for tables, see business glossary terms linked to columns, see data quality scores, and understand who owns what. This solves the "where is the sales data?" problem that wastes hours in large organizations.\n\n**Data Lineage**\nPurview automatically captures lineage from ADF pipeline runs (which source → which transformation → which sink), from Synapse SQL queries, and from Databricks jobs. You can visually trace a Gold table column all the way back to its source system — essential for impact analysis when a source schema changes.\n\n**Classification and sensitivity labels**\nPurview applies built-in classification rules to automatically detect PII (email addresses, SSNs, credit card numbers, phone numbers) and other sensitive data categories. Sensitivity labels (from Microsoft 365) can be applied to restrict access, enforce encryption, and trigger DLP policies.`,
    keyPoints: [
      'Data Map: automated metadata catalog — one scan registers thousands of assets',
      'Lineage: ADF, Synapse, and Databricks automatically push lineage to Purview after each run',
      'Classification: built-in PII rules detect email, SSN, credit card automatically during scans',
      'Business Glossary: link business terms (Customer, Revenue) to technical columns — bridges IT/business',
      'Purview Policy: manage data access directly from Purview without touching each service\'s IAM',
      'Microsoft Purview = governance. Azure Purview is the old name — both refer to the same service',
    ],
    commonMistakes: [
      'Not creating scan rule sets — default scans miss custom file formats and patterns',
      'Ignoring the business glossary — without it, the catalog is technical metadata nobody uses',
      'Not connecting Purview to ADF — automatic lineage is one of Purview\'s best features',
      'Treating Purview as set-and-forget — scans need to run regularly as schemas evolve',
    ],
    interviewTips: [
      'Explain what problems Purview solves in a large enterprise (data discovery, lineage, PII)',
      'How does ADF lineage work in Purview? What configuration is needed?',
      'What is the difference between classification and sensitivity labels?',
      'How would you use Purview to assess the impact of a source schema change?',
    ],
    bestPractices: [
      'Schedule scans weekly — daily is expensive, monthly is too stale for active data platforms',
      'Link ADF to Purview on day one — lineage from the first pipeline run is captured automatically',
      'Build a business glossary with data stewards — this is what makes the catalog valuable',
      'Use Purview insights dashboards for data quality and sensitivity reporting to leadership',
    ],
    codeExamples: [
      {
        title: 'Register and scan ADLS in Purview via REST API',
        language: 'python',
        code: `import requests
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
token = credential.get_token("https://purview.azure.com/.default").token
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

PURVIEW_ACCOUNT = "purview-deplatform-prod"
BASE_URL = f"https://{PURVIEW_ACCOUNT}.purview.azure.com"

# Register ADLS Gen2 data source
source_payload = {
    "kind": "AdlsGen2",
    "name": "adls-deplatform-prod",
    "properties": {
        "endpoint": "https://adlsdeplatform.dfs.core.windows.net/",
        "resourceGroup": "rg-de-platform-prod",
        "subscriptionId": "<subscription-id>",
        "location": "eastus2",
    }
}
r = requests.put(
    f"{BASE_URL}/scan/datasources/adls-deplatform-prod",
    headers=headers, json=source_payload
)
print(r.status_code, r.json())

# Trigger a scan
scan_payload = {"kind": "AdlsGen2Msi", "properties": {"scanRulesetName": "AdlsGen2"}}
requests.put(
    f"{BASE_URL}/scan/datasources/adls-deplatform-prod/scans/weekly-scan",
    headers=headers, json=scan_payload
)
requests.put(
    f"{BASE_URL}/scan/datasources/adls-deplatform-prod/scans/weekly-scan/runs/run-001",
    headers=headers
)`,
      },
    ],
    resources: [
      { title: 'Microsoft Purview docs', url: 'https://docs.microsoft.com/en-us/azure/purview/overview', type: 'docs', free: true },
      { title: 'Purview ADF lineage', url: 'https://docs.microsoft.com/en-us/azure/purview/how-to-lineage-azure-data-factory', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'How does Purview capture ADF pipeline lineage?',
        options: [
          'You must manually register each ADF pipeline in Purview',
          'ADF automatically pushes lineage metadata to Purview after each pipeline run when the Purview account is linked to ADF',
          'Purview scans ADF ARM templates to infer lineage',
          'Lineage requires installing an agent on the ADF Integration Runtime',
        ],
        answer: 1,
        explanation: 'When you link a Purview account to ADF (in ADF settings), ADF automatically emits lineage events to Purview after each pipeline run — no manual registration per pipeline. The lineage shows source datasets, transformations, and sink datasets as a visual graph in Purview\'s lineage explorer.',
      },
    ],
  },

  'data-mesh': {
    simpleExplanation: 'Data Mesh is an organizational approach where each business domain (Sales, Finance, HR) owns and manages its own data as a "data product" — instead of one central data team being the bottleneck for all data work.',
    deepExplanation: `**The four principles (Zhamak Dehghani)**\n1. Domain-oriented ownership: the Sales team owns Sales data — they ingest it, transform it, and serve it. The central data team sets standards, not ownership.\n2. Data as a product: domains publish data products with SLAs, documentation, and quality guarantees — not just raw tables that other teams must figure out.\n3. Self-serve data infrastructure: a platform team provides tools so domain teams can build and operate their own data products without needing infrastructure expertise.\n4. Federated computational governance: global standards (naming, security, quality) are enforced via automation, not manual reviews.\n\n**Data Mesh on Azure**\nEach domain gets its own Databricks workspace and ADLS container. Unity Catalog federates governance across all domain workspaces — a Finance analyst can query Sales data products through the shared metastore with the correct access controls. Purview provides cross-domain lineage and classification.\n\n**Data product vs dataset**\nA dataset is a table — here it is, figure it out. A data product is a table PLUS: schema contract, SLA (freshness, availability), documentation, owner, quality score, and access request process. Data products are discoverable and trustworthy. Datasets are not.\n\n**When NOT to use Data Mesh**\nData Mesh makes sense for large organizations with multiple mature domain teams. For a 5-person startup or a single domain, a centralized lakehouse is simpler and faster to operate.`,
    keyPoints: [
      'Data Mesh is an organizational pattern, not a technology — you can\'t buy a "Data Mesh product"',
      'Domain ownership means domain teams are responsible for data quality in their domain',
      'Data product = table + SLA + documentation + owner + quality score + access mechanism',
      'Federated governance: Unity Catalog provides global table access control across domain workspaces',
      'Platform team provides self-serve: Databricks workspace templates, monitoring dashboards, deployment tooling',
      'Success requires domain teams to have data engineering skills — not just a central "Data Mesh team"',
    ],
    commonMistakes: [
      'Calling a shared data lake "Data Mesh" — ownership, products, and governance must change too',
      'Implementing Data Mesh before domain teams have data engineering maturity',
      'No cross-domain data contract standards — every domain designs differently, integration breaks',
      'Centralizing platform operations while decentralizing ownership — creates confusion about who is responsible',
    ],
    interviewTips: [
      'Name and explain the four principles of Data Mesh',
      'What is a data product and how does it differ from a regular dataset?',
      'How does Unity Catalog enable federated governance in a Data Mesh?',
      'When would you NOT implement Data Mesh?',
    ],
    bestPractices: [
      'Start with one pilot domain before rolling out organization-wide',
      'Define data product standards (schema, SLA, documentation template) before domains start building',
      'Use Unity Catalog cross-catalog access for data product consumption across domains',
      'Measure Data Mesh success: reduce central team bottleneck, improve data product discoverability',
    ],
    codeExamples: [
      {
        title: 'Data product contract definition',
        language: 'yaml',
        code: `# data_product.yaml — Sales domain revenue product
name: sales_daily_revenue
domain: sales
owner: sales-data-team@company.com
version: "2.1.0"

sla:
  freshness: "daily by 06:00 UTC"
  availability: "99.9%"
  quality_threshold: 0.995  # 99.5% rows must pass all quality checks

schema:
  - name: transaction_date
    type: date
    nullable: false
    description: "UTC date of the sales transaction"
  - name: region_code
    type: string
    nullable: false
    pii: false
  - name: revenue_usd
    type: decimal(15,2)
    nullable: false
    description: "Net revenue after discounts in USD"

quality_expectations:
  - "revenue_usd >= 0"
  - "transaction_date IS NOT NULL"
  - "region_code IN ('NA', 'EMEA', 'APAC', 'LATAM')"

access:
  public_groups: ["finance_analysts", "executives", "data_scientists"]
  request_process: "Submit access request via data catalog"`,
      },
    ],
    resources: [
      { title: 'Data Mesh principles (Martin Fowler)', url: 'https://martinfowler.com/articles/data-mesh-principles.html', type: 'blog', free: true },
      { title: 'Azure Data Mesh architecture', url: 'https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/scenarios/cloud-scale-analytics/architectures/data-mesh-scenario', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the key difference between a "dataset" and a "data product"?',
        options: [
          'A data product uses Delta Lake; a dataset uses Parquet',
          'A data product includes an SLA, documentation, ownership, quality guarantees, and a defined access mechanism — a dataset is just a table',
          'Data products are larger than datasets',
          'A dataset is accessed via SQL; a data product via API only',
        ],
        answer: 1,
        explanation: 'A dataset is raw — here\'s a table, good luck. A data product is treated like a software product: it has an owner (accountable), a schema contract (consumers can rely on it), an SLA (freshness/availability guarantees), documentation (what does this column mean?), and quality metrics. This shift in mindset is the core of Data Mesh.',
      },
    ],
  },

  'monitoring-observability': {
    simpleExplanation: 'Monitoring and observability for data pipelines means knowing when something goes wrong before your stakeholders do — setting up alerts, dashboards, and logs so you can detect, diagnose, and fix failures within minutes.',
    deepExplanation: `**Azure Monitor and Log Analytics**\nAzure Monitor collects metrics (numerical measurements: CPU%, pipeline runs, rows copied) and logs (structured events: ADF activity runs, Spark events, security logs) from all Azure services. Log Analytics workspaces store logs and provide KQL (Kusto Query Language) for querying them. Alerts trigger on metric thresholds or log query results.\n\n**KQL (Kusto Query Language)**\nKQL is the query language for Azure Log Analytics. It uses a pipe-based syntax similar to Unix pipes. ADF logs pipeline run status, activity run details, and errors to Log Analytics. Databricks clusters send driver and executor logs. Custom application logs from Python pipelines go via Azure Monitor SDK.\n\n**Pipeline observability patterns**\nAudit table: every pipeline run writes a record (start, end, rows_in, rows_out, status). Operational dashboard: Azure Workbook or Power BI showing pipeline health, row counts, and SLA compliance. Alerting: Azure Monitor alert when pipeline fails, when row count drops below threshold, or when latency exceeds SLA.\n\n**Cost monitoring**\nAzure Cost Management + Billing tracks spending per resource, per tag, per subscription. Tag all resources (Team=DE, Pipeline=Sales-Ingestion) to enable cost attribution. Set budget alerts at 80% and 100% of monthly budget.`,
    keyPoints: [
      'ADF Monitor → Pipeline Runs: built-in dashboard for run history, duration, status',
      'Enable ADF diagnostics → Log Analytics: detailed activity logs for KQL querying',
      'KQL: AzureDiagnostics | where Category == "PipelineRuns" | where Status == "Failed"',
      'Databricks cluster logs: accessible from cluster UI, or stream to Log Analytics via init script',
      'Azure Monitor Alerts: metric-based (CPU >, failed runs >) or log-based (query returns results)',
      'Cost tags: tag every resource with Environment, Team, Pipeline — query costs in Cost Management',
    ],
    commonMistakes: [
      'No alerting on pipeline failures — you learn about failures from angry stakeholders',
      'Only monitoring if the pipeline ran, not if it produced correct row counts',
      'Not tagging resources — impossible to attribute costs to teams or projects',
      'Ignoring Databricks cluster idle time — forgotten all-purpose clusters bill continuously',
    ],
    interviewTips: [
      'How would you alert on ADF pipeline failures? Walk through the configuration',
      'Write a KQL query to find all failed ADF pipeline runs in the last 24 hours',
      'What metrics would you put on a data platform health dashboard?',
      'How do you detect data quality issues in production without running a full DQ scan every day?',
    ],
    bestPractices: [
      'Build an audit table: every pipeline writes start/end/rows/status — queryable for SLA reporting',
      'Set row-count alerts: if today\'s load has < 80% rows of yesterday\'s, trigger an alert',
      'Create an Azure Workbook dashboard for data platform health — share with stakeholders',
      'Use action groups to send alerts to Teams/email/PagerDuty — not just Azure portal',
    ],
    codeExamples: [
      {
        title: 'KQL queries for pipeline monitoring',
        language: 'sql',
        code: `// Failed ADF pipeline runs in the last 24 hours
AzureDiagnostics
| where TimeGenerated > ago(24h)
| where ResourceType == "FACTORIES/PIPELINERUNS"
| where status_s == "Failed"
| project TimeGenerated, pipelineName_s, failureType_s, message_s
| order by TimeGenerated desc

// Pipeline run duration trends (detect slowdowns)
AzureDiagnostics
| where TimeGenerated > ago(7d)
| where ResourceType == "FACTORIES/PIPELINERUNS"
| where status_s == "Succeeded"
| where pipelineName_s == "pl_silver_orders"
| project TimeGenerated, duration_s = durationInQueue_d
| summarize avg_duration = avg(duration_s), p95_duration = percentile(duration_s, 95) by bin(TimeGenerated, 1d)
| render timechart

// Databricks job failures
SparkLoggingEvent_CL
| where Level == "ERROR"
| where TimeGenerated > ago(1h)
| project TimeGenerated, Message, SparkContext_s
| order by TimeGenerated desc`,
      },
    ],
    resources: [
      { title: 'Azure Monitor docs', url: 'https://docs.microsoft.com/en-us/azure/azure-monitor/overview', type: 'docs', free: true },
      { title: 'KQL reference', url: 'https://docs.microsoft.com/en-us/azure/data-explorer/kql-quick-reference', type: 'docs', free: true },
      { title: 'ADF monitoring with Azure Monitor', url: 'https://docs.microsoft.com/en-us/azure/data-factory/monitor-using-azure-monitor', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the difference between a metric alert and a log alert in Azure Monitor?',
        options: [
          'They are the same thing',
          'Metric alerts trigger on numerical time-series thresholds (CPU > 80%). Log alerts trigger when a KQL query returns results (failed pipeline runs found)',
          'Log alerts are faster',
          'Metric alerts require Log Analytics; log alerts do not',
        ],
        answer: 1,
        explanation: 'Metric alerts are evaluated against numerical measurements sampled over time — good for "CPU > 80% for 5 minutes." Log alerts run a KQL query on a schedule and alert when the query returns any rows — good for "any failed pipeline run in the last 15 minutes." Log alerts are more flexible but have higher latency (1-5 minute evaluation frequency).',
      },
    ],
  },

  'ha-dr-scalability': {
    simpleExplanation: 'HA (High Availability), DR (Disaster Recovery), and scalability patterns are how you design your data platform to keep running when servers crash, entire data centers fail, or data volumes grow 10x.',
    deepExplanation: `**High Availability**\nHA means your system keeps running despite individual component failures. Azure achieves HA through redundancy: Availability Zones (physically separate datacenters in the same region), Zone-Redundant Storage (ZRS), and geo-redundant services. For data platforms: ADLS with ZRS, ADF with built-in HA, Databricks clusters that restart on node failure, Azure SQL with zone-redundant replicas.\n\n**Disaster Recovery**\nDR means recovering from a catastrophic event (entire region outage). Two key metrics: RPO (Recovery Point Objective — how much data can you afford to lose? 0 minutes means sync replication. 4 hours means async), RTO (Recovery Time Objective — how long can you be down? 1 hour means you need automated failover). Geo-redundant storage, geo-replicated Azure SQL, and cross-region ADF pipelines all contribute to DR.\n\n**Scaling patterns**\nVertical scaling: bigger VMs (more RAM, more CPU). Horizontal scaling: more VMs/nodes. For data platforms, horizontal is preferred: Databricks auto-scaling clusters, Synapse Dedicated Pool scaling DWUs, Event Hubs scaling Throughput Units. Design for horizontal scale from the start — adding nodes is easier than redesigning architecture.\n\n**Active-active vs active-passive**\nActive-active: both regions handle traffic simultaneously. Complex to implement, zero RPO. Active-passive: one primary region, one standby. Simpler, some RPO/RTO. For most data platforms, active-passive is sufficient — data platforms are not transaction systems.`,
    keyPoints: [
      'RTO: how long can the system be unavailable? RPO: how much data loss is acceptable?',
      'Availability Zones protect against single datacenter failure — use ZRS storage and zone-redundant services',
      'Geo-redundant storage (GRS) replicates data asynchronously to a paired region',
      'Databricks multi-region: separate workspace per region, replicate Delta tables via Geo-Restore or DEEP CLONE',
      'ADF has built-in HA — IR nodes can be clustered for SHIR HA',
      'Design for failure: circuit breakers, retry logic, dead-letter queues in every pipeline',
    ],
    commonMistakes: [
      'No documented DR plan — "we\'ll figure it out when it happens" costs days of recovery',
      'Never testing DR — untested plans fail when you need them most (chaos engineering)',
      'Not distinguishing between HA (keep running) and DR (recover from disaster) — different solutions',
      'Designing scale as an afterthought — retrofitting horizontal scale is expensive',
    ],
    interviewTips: [
      'Define RPO and RTO and give an example for a data platform',
      'What is the difference between active-active and active-passive DR?',
      'How would you achieve HA for a Self-Hosted Integration Runtime?',
      'How would you design a data platform for an RPO of 1 hour?',
    ],
    bestPractices: [
      'Document RPO/RTO requirements before designing DR — drive architecture decisions from requirements',
      'Run DR drills every 6 months — test failover procedures before a real disaster',
      'Use infrastructure as code (Bicep/Terraform) — DR environment rebuild time = terraform apply time',
      'Tag resources with DR tier (Tier1=mission-critical, Tier2=important, Tier3=can-wait)',
    ],
    codeExamples: [
      {
        title: 'Delta table geo-replication with DEEP CLONE',
        language: 'sql',
        code: `-- DEEP CLONE creates an independent full copy of a Delta table in another region
-- Run this in the DR Databricks workspace (different region)

-- Initial full clone (run once to establish DR copy)
CREATE TABLE IF NOT EXISTS dr_catalog.silver.orders
DEEP CLONE prod_catalog.silver.orders
LOCATION 'abfss://silver@adls-dr-region.dfs.core.windows.net/orders/';

-- Incremental sync (run on schedule — e.g., every 4 hours)
-- DEEP CLONE on an existing table only copies changes since last clone
CREATE OR REPLACE TABLE dr_catalog.silver.orders
DEEP CLONE prod_catalog.silver.orders;

-- Check clone lag
DESCRIBE HISTORY dr_catalog.silver.orders
-- Compare timestamp of latest DR version vs prod version
-- Gap = your current RPO

-- For RTO: DR pipelines point to DR storage account
-- Switch DNS / ADF linked service to DR endpoint during failover`,
      },
    ],
    resources: [
      { title: 'Azure reliability docs', url: 'https://docs.microsoft.com/en-us/azure/reliability/overview', type: 'docs', free: true },
      { title: 'Databricks disaster recovery', url: 'https://docs.databricks.com/en/administration-guide/disaster-recovery.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the difference between RPO and RTO?',
        options: [
          'RPO is about speed; RTO is about cost',
          'RPO (Recovery Point Objective) = maximum acceptable data loss. RTO (Recovery Time Objective) = maximum acceptable downtime before the system must be back online',
          'They are the same metric measured differently',
          'RPO applies to databases; RTO applies to applications',
        ],
        answer: 1,
        explanation: 'RPO: "If a disaster happens at 3PM, what\'s the oldest data we can tolerate losing?" RPO=1 hour means we can lose at most 1 hour of data (last backup was at 2PM). RTO: "How long until we\'re back up?" RTO=4 hours means business accepts 4 hours of downtime. Both drive architecture choices: sync vs async replication, manual vs automated failover.',
      },
    ],
  },

  'powerbi-for-de': {
    simpleExplanation: 'Power BI for Data Engineers is understanding how to build the data layer that Power BI connects to — choosing between DirectQuery and Import mode, optimizing your semantic model, and ensuring dashboards stay fast at scale.',
    deepExplanation: `**Import vs DirectQuery vs Direct Lake**\nImport mode: data is copied into Power BI's in-memory engine (VertiPaq). Fastest query performance. Data freshens on schedule (up to 8x/day on Premium). DirectQuery: every visual triggers a live query to the source. Always current, but performance depends on the source. Direct Lake (Fabric): reads Delta Parquet files directly from OneLake — combines Import speed with DirectQuery freshness. For Azure DE: build Gold Delta tables, serve via Direct Lake (Fabric) or DirectQuery from Synapse Serverless.\n\n**Semantic model design**\nThe semantic model (formerly "dataset") is the Power BI layer between raw tables and reports. Star schema in the semantic model: fact tables and dimension tables. DAX measures (calculated fields) defined once in the model and reused across all reports. Avoid calculated columns (row-by-row, computed at refresh time) — use DAX measures instead.\n\n**Incremental refresh**\nPower BI Import can refresh only new/changed data if you configure incremental refresh with RangeStart and RangeEnd parameters. This dramatically reduces refresh time for large fact tables — instead of refreshing 3 years of data, only refresh the last 10 days.\n\n**Performance optimization**\nFor DE, the best optimization happens before Power BI: pre-aggregate data in Gold Delta tables for the most common report granularities. Avoid DirectQuery to row-level transactional tables — always serve from pre-aggregated Gold or Synapse Dedicated Pool.`,
    keyPoints: [
      'DirectQuery: always fresh, performance depends on source. Import: fast, refreshes on schedule',
      'Serve Power BI from Synapse Serverless or Gold Delta tables — never directly from Bronze',
      'Pre-aggregate data in Gold for BI patterns: daily revenue by region, not individual transactions',
      'Incremental refresh requires RangeStart and RangeEnd date/time parameters in your query',
      'Star schema in the semantic model: one fact table, multiple dimension tables, relationships defined',
      'Enable Large Dataset Storage format for Import datasets over 1GB on Power BI Premium',
    ],
    commonMistakes: [
      'Pointing Power BI DirectQuery at Bronze Delta tables — millions of rows, no aggregation, very slow',
      'Designing Gold tables without considering BI query patterns — analysts work around it with slow calculated columns',
      'Not configuring incremental refresh — 3-year fact table refreshes entirely every night',
      'Building complex DAX measures that could be pre-computed in the Gold layer as simple columns',
    ],
    interviewTips: [
      'Explain the difference between Import mode and DirectQuery — when would you use each?',
      'What is a semantic model in Power BI and why does star schema matter?',
      'How would you reduce dashboard refresh time for a 500M-row fact table?',
      'What is Direct Lake mode and how does it work with Delta Lake?',
    ],
    bestPractices: [
      'Design Gold tables for BI: pre-join dimension attributes into wide flat tables for simple models',
      'Use Synapse Serverless SQL as a Power BI gateway over ADLS — avoids data duplication',
      'Configure incremental refresh on all large Import datasets to keep refresh under 30 minutes',
      'Monitor Power BI query performance with Performance Analyzer — identify slow visuals early',
    ],
    codeExamples: [
      {
        title: 'Gold table optimized for Power BI DirectQuery',
        language: 'sql',
        code: `-- Gold table: pre-joined, pre-aggregated at daily/region grain
-- Designed specifically for Power BI DirectQuery performance

CREATE OR REPLACE TABLE gold.sales_summary
USING DELTA
AS
SELECT
    DATE_TRUNC('day', o.order_date)     AS report_date,
    c.region                             AS region,
    c.customer_segment                   AS segment,
    p.category                           AS product_category,
    COUNT(DISTINCT o.order_id)           AS order_count,
    COUNT(DISTINCT o.customer_id)        AS unique_customers,
    SUM(o.net_amount)                    AS total_revenue,
    AVG(o.net_amount)                    AS avg_order_value,
    SUM(o.quantity)                      AS units_sold
FROM silver.orders o
JOIN silver.customers c ON o.customer_id = c.customer_id AND c.is_current = true
JOIN silver.products  p ON o.product_id  = p.product_id
WHERE o.order_date >= '2022-01-01'
GROUP BY 1, 2, 3, 4;

-- Optimize for Power BI filter patterns
OPTIMIZE gold.sales_summary ZORDER BY (report_date, region);

-- Synapse Serverless external table for Power BI connection
CREATE EXTERNAL TABLE gold_sales_summary
WITH (DATA_SOURCE = gold_lake, LOCATION = '/sales_summary/', FILE_FORMAT = DeltaFormat);`,
      },
    ],
    resources: [
      { title: 'Power BI docs', url: 'https://docs.microsoft.com/en-us/power-bi/', type: 'docs', free: true },
      { title: 'DirectQuery vs Import', url: 'https://docs.microsoft.com/en-us/power-bi/connect-data/desktop-directquery-about', type: 'docs', free: true },
      { title: 'Incremental refresh', url: 'https://docs.microsoft.com/en-us/power-bi/connect-data/incremental-refresh-overview', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'When would you choose DirectQuery over Import mode in Power BI?',
        options: [
          'When you want the fastest dashboard performance',
          'When data must be real-time or near-real-time and the source database can handle the query load from every dashboard interaction',
          'When the dataset is larger than 1GB',
          'DirectQuery is always better than Import',
        ],
        answer: 1,
        explanation: 'Import mode copies data into Power BI\'s VertiPaq engine — query speed is fastest but data is only as fresh as the last refresh schedule. DirectQuery queries the source live on every dashboard interaction — always fresh but every click runs a query. Choose DirectQuery only when freshness requirements exceed Import schedule capabilities AND the source can handle the query load.',
      },
    ],
  },

  // ─── PHASE 9 ────────────────────────────────────────────────────────────────

  'interview-sql': {
    simpleExplanation: 'SQL interviews test your ability to write correct, efficient queries under time pressure — you need to know window functions, CTEs, JOINs, and query optimization cold, without looking anything up.',
    deepExplanation: `**What interviewers are really testing**\nSQL interviews test logical thinking (can you decompose a problem into steps?), knowledge of the SQL toolkit (do you know when to reach for window functions vs GROUP BY?), and production awareness (would your query work on a billion rows?).\n\n**The most common question patterns**\nTop-N per group: use DENSE_RANK() with PARTITION BY. Running total/moving average: use SUM/AVG with OVER + ROWS BETWEEN. Period-over-period change: use LAG(). Gaps and islands: use ROW_NUMBER() subtraction trick. Pivot/unpivot: use CASE WHEN aggregation or PIVOT operator.\n\n**How to approach a SQL interview**\nClarify: ask about nulls, duplicates, expected output grain. Think out loud: explain your approach before writing. Start simple: write a basic query then add complexity. Test edge cases: what if the table is empty? What if there are ties?\n\n**Performance awareness**\nFor senior roles, always mention scalability: "This uses a subquery that runs once per row — on a billion-row table I'd rewrite it as a JOIN or window function." Show you think about execution plans, indexes, and data volume.`,
    keyPoints: [
      'Top-N per group = ROW_NUMBER() or DENSE_RANK() with PARTITION BY — memorize this pattern',
      'Running total = SUM() OVER (ORDER BY date ROWS UNBOUNDED PRECEDING)',
      'Period-over-period = LAG(metric, 1) OVER (ORDER BY date)',
      'Gaps and islands = ROW_NUMBER() - ROW_NUMBER() trick to identify consecutive sequences',
      'Anti-join = LEFT JOIN WHERE right.id IS NULL (find rows in A with no match in B)',
      'Always mention NULL handling — most candidates forget NULLs in real data',
    ],
    commonMistakes: [
      'Jumping to write code before understanding the question — clarify output grain first',
      'Forgetting NULL handling — IS NULL instead of = NULL, COALESCE for default values',
      'Writing subqueries when window functions are cleaner and faster',
      'Not considering duplicates in the source data — real data always has them',
    ],
    interviewTips: [
      'Practice top-N per group, running total, and LAG until you can write them in 60 seconds',
      'Always ask: "Can I assume no duplicate records?" before writing deduplication logic',
      'For hard problems: write the correct answer first, optimize after',
      'Mention indexes and execution plans even if not asked — signals senior-level thinking',
    ],
    bestPractices: [
      'Practice 3 SQL problems daily for 4 weeks before interviewing — LeetCode database section',
      'Master all window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, FIRST_VALUE, NTILE',
      'Know MERGE syntax cold — SCD2 implementation is a very common senior question',
      'Practice explaining your query while writing — interviews are often on video calls with screen share',
    ],
    codeExamples: [
      {
        title: 'The 5 patterns you must know cold',
        language: 'sql',
        code: `-- 1. Top-N per group
WITH ranked AS (
    SELECT product_id, region, revenue,
           ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC) AS rn
    FROM sales
)
SELECT * FROM ranked WHERE rn <= 3;

-- 2. Running total
SELECT date, revenue,
       SUM(revenue) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) AS running_total
FROM daily_sales;

-- 3. Period over period change
SELECT month, revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev_month,
       revenue - LAG(revenue) OVER (ORDER BY month) AS change
FROM monthly_revenue;

-- 4. Gaps and islands (find consecutive active days)
WITH grp AS (
    SELECT user_id, activity_date,
           activity_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date) * INTERVAL '1 day' AS grp
    FROM user_activity
)
SELECT user_id, MIN(activity_date) AS start_date, MAX(activity_date) AS end_date,
       COUNT(*) AS consecutive_days
FROM grp GROUP BY user_id, grp;

-- 5. Anti-join (customers who never ordered)
SELECT c.customer_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL;`,
      },
    ],
    resources: [
      { title: 'LeetCode Database section', url: 'https://leetcode.com/problemset/database/', type: 'practice', free: true },
      { title: 'SQL Window Functions tutorial', url: 'https://mode.com/sql-tutorial/sql-window-functions/', type: 'course', free: true },
    ],
    quiz: [
      {
        question: 'How do you find the second highest salary in a table without using LIMIT/TOP?',
        options: [
          'SELECT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1',
          'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)',
          'SELECT salary FROM employees WHERE salary = 2',
          'SELECT salary FROM employees GROUP BY salary HAVING COUNT(*) = 2',
        ],
        answer: 1,
        explanation: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees) finds the max salary that is less than the overall max — that\'s the second highest. The window function version: SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rk FROM employees) t WHERE rk = 2 handles ties more cleanly.',
      },
    ],
  },

  'interview-spark': {
    simpleExplanation: 'Spark interviews test whether you understand how Spark actually works under the hood — not just how to write PySpark code, but why shuffles are expensive, how memory is managed, and how to diagnose performance issues.',
    deepExplanation: `**Architecture questions are always asked**\nInterviewers want to know you understand: Driver vs Executors, lazy evaluation, stage boundaries (shuffles), the DAG optimizer. Be ready to explain why collect() on a large DataFrame is dangerous and why groupBy causes a shuffle.\n\n**Performance questions dominate senior interviews**\nKnow: what causes shuffles and how to minimize them (broadcast, bucketing, partition pruning). How to detect and fix data skew (Spark UI, salting, AQE). Memory model (execution vs storage, unified memory pool). When to cache and when not to.\n\n**Delta Lake is now standard**\nAny Azure Spark interview will include Delta Lake: ACID transactions via transaction log, time travel, MERGE for upserts, OPTIMIZE + ZORDER for read performance, CDF for CDC, schema evolution.\n\n**Structured Streaming is increasingly common**\nWatermarks, checkpointing, output modes, foreachBatch for upserts. Know the difference between micro-batch and continuous processing.`,
    keyPoints: [
      'Shuffle = wide transformation = stage boundary = disk write + network transfer',
      'Broadcast join: small table copied to every executor = no shuffle = massive speedup',
      'Data skew visible in Spark UI: one long task while 199 others complete',
      'AQE (spark.sql.adaptive.enabled=true) auto-fixes partition size and join strategy at runtime',
      'Delta MERGE = atomic upsert. OPTIMIZE = compact small files. ZORDER = cluster data',
      'Watermark bounds stateful streaming state — without it, state grows until OOM',
    ],
    commonMistakes: [
      'Not knowing what causes shuffles — this is the most common gap at junior level',
      'Unable to explain lazy evaluation clearly with a concrete example',
      'Not mentioning AQE when discussing Spark performance — it\'s now table stakes knowledge',
      'Confusing cache() and persist() — know that cache() = persist(MEMORY_AND_DISK)',
    ],
    interviewTips: [
      '"Explain what happens when I run df.groupBy("key").count() on a 1TB dataset" — walk through every step',
      '"You have a 6-hour Spark job, how do you optimize it?" — systematic diagnosis question',
      '"Explain Delta Lake ACID" — draw the _delta_log and explain optimistic concurrency',
      '"How does AQE work?" — explain runtime plan adaptation and the three optimizations it applies',
    ],
    bestPractices: [
      'Build a mental model: read this code → where are the shuffles? → what does the DAG look like?',
      'Know the Spark UI inside out — stages, tasks, shuffle read/write, skew detection',
      'Practice explaining code out loud as you write it — interviews are conversations',
      'Have specific numbers from real experience: "I reduced a 4-hour job to 20 minutes by..."',
    ],
    codeExamples: [
      {
        title: 'Spark interview: skew detection and AQE config',
        language: 'python',
        code: `# How to diagnose and fix common Spark performance problems

# 1. Check for skew in Spark UI — or programmatically:
df.groupBy("join_key").count().orderBy("count", ascending=False).show(10)
# If top key has 10M rows and median is 1K rows → heavy skew

# 2. Broadcast join for small tables
from pyspark.sql.functions import broadcast
result = large_df.join(broadcast(small_df), "product_id")
# Check: spark.sql.autoBroadcastJoinThreshold default = 10MB

# 3. Enable AQE — fixes partition skew, joins, and small partition coalescing
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")

# 4. Right-size shuffle partitions
# Rule of thumb: ~128MB per partition
# 100GB data → 100GB / 128MB ≈ 800 partitions
spark.conf.set("spark.sql.shuffle.partitions", "800")

# 5. Cache only when reused multiple times
df_expensive = spark.read.parquet("...").filter(...).join(...).cache()
df_expensive.count()  # Materialize cache
# Use again: df_expensive.groupBy(...).agg(...)  ← hits cache
df_expensive.unpersist()  # Release when done`,
      },
    ],
    resources: [
      { title: 'Spark documentation', url: 'https://spark.apache.org/docs/latest/', type: 'docs', free: true },
      { title: 'Databricks optimization guide', url: 'https://docs.databricks.com/en/optimizations/index.html', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the difference between a narrow and a wide transformation in Spark?',
        options: [
          'Narrow transformations process wide tables; wide transformations process narrow tables',
          'Narrow: each output partition depends on one input partition (no shuffle). Wide: output partitions depend on multiple input partitions (shuffle required)',
          'Narrow transformations are faster by definition',
          'Wide transformations cannot be parallelized',
        ],
        answer: 1,
        explanation: 'Narrow transformations (filter, map, select, withColumn) operate within a single partition — no data crosses partition boundaries, no shuffle. Wide transformations (groupBy, join on non-co-partitioned data, distinct, repartition) require data from multiple partitions to be redistributed — triggering a shuffle. Wide transformations create stage boundaries in the DAG.',
      },
    ],
  },

  'interview-azure': {
    simpleExplanation: 'Azure interviews test whether you can design and operate real data platforms — not just list service names, but explain when to use which service, how security works end-to-end, and how you would debug a production issue at 2AM.',
    deepExplanation: `**Service selection questions**\n"When would you use Synapse vs Databricks?" "When would you use Event Hubs vs Service Bus?" "When would you use ADF vs Databricks Workflows?" These questions test whether you understand the trade-offs, not just the feature lists. The right answer always depends on the use case — good candidates explain the decision criteria.\n\n**Security questions are always included**\nEvery Azure DE interview includes identity and networking: Managed Identity vs Service Principal, private endpoints, RBAC vs ACLs, Key Vault integration. Be able to trace the path from "ADF pipeline runs" to "ADLS data is read" and explain every security check along the way.\n\n**Architecture design questions**\nSenior interviews include open-ended design questions: "Design a real-time data platform for 10,000 IoT devices." Draw the architecture, explain each service choice, discuss trade-offs. Practice drawing: Event Hubs → Structured Streaming / Stream Analytics → ADLS → Databricks → Synapse → Power BI.\n\n**Operational questions test real experience**\n"How would you debug a slow ADF pipeline?" "Your Delta table is growing too large — what do you do?" "A pipeline started failing at midnight — walk me through your troubleshooting." These require hands-on experience, not just reading docs.`,
    keyPoints: [
      'Know the full Azure DE stack: ADLS, ADF, Databricks, Synapse, Event Hubs, Purview, Key Vault',
      'For every service: know when to use it, what replaces it, and its key limitations',
      'Security: Managed Identity + RBAC is the answer to most auth questions',
      'Networking: private endpoints for all PaaS services in production is the default answer',
      'Monitoring: Azure Monitor + Log Analytics + KQL for every production platform',
      'CI/CD: Azure DevOps YAML pipelines + ARM/DABs deployments across Dev/UAT/Prod',
    ],
    commonMistakes: [
      'Memorizing feature lists without understanding trade-offs — "Synapse has Spark and SQL" is not an answer',
      'Not having a networking answer — private endpoints are mandatory for any production discussion',
      'Saying "I would use Managed Identity" without explaining what role and at what scope',
      'Designing architectures that ignore cost — interviewers notice when you pick the most expensive option for everything',
    ],
    interviewTips: [
      '"Design an Azure data platform for a retail company with batch and streaming" — practice this in 15 minutes',
      '"How does ADF connect to on-premises SQL Server securely?" — SHIR + private endpoint answer',
      '"What are the distribution strategies in Synapse and when do you use each?" — hash/round-robin/replicate',
      '"How do you monitor a data platform in production?" — Azure Monitor + KQL + audit tables',
    ],
    bestPractices: [
      'Draw every architecture you design — practice on paper, not just in your head',
      'For each design decision, be ready to explain: why this service, why not the alternatives',
      'Know the approximate pricing for key services — mentioning cost shows real-world awareness',
      'Have 2-3 specific production incidents you debugged — story format (situation, diagnosis, fix, prevention)',
    ],
    codeExamples: [
      {
        title: 'Architecture decision framework',
        language: 'bash',
        code: `# Service selection cheat sheet for interviews

# Storage: always ADLS Gen2 with HNS for data lake
# Small reference data: Azure SQL or Cosmos DB

# Batch ETL orchestration:
# - Azure only, visual preferred: ADF
# - Spark-heavy, code-first: Databricks Workflows

# Transformation:
# - Simple SQL transformations: ADF Mapping Data Flow or Synapse Pipelines
# - PySpark, ML, complex logic: Databricks notebooks/jobs
# - Large-scale BI serving: Synapse Dedicated SQL Pool

# Streaming:
# - Simple aggregations, no code: Stream Analytics
# - Complex ML, custom logic, Spark: Databricks Structured Streaming
# - Message broker: Event Hubs (high volume) / Service Bus (ordered, guaranteed delivery)

# Serving:
# - BI dashboards: Synapse Serverless SQL + Power BI DirectQuery
# - ML feature store: Databricks Feature Store
# - Ad-hoc exploration: Synapse Serverless SQL

# Security (always):
# - Auth: Managed Identity (never service principals if avoidable)
# - Secrets: Key Vault
# - Network: Private Endpoints for all PaaS services
# - RBAC: assign to groups, never individuals`,
      },
    ],
    resources: [
      { title: 'Azure Architecture Center', url: 'https://docs.microsoft.com/en-us/azure/architecture/', type: 'docs', free: true },
      { title: 'Azure DE reference architectures', url: 'https://docs.microsoft.com/en-us/azure/architecture/solution-ideas/articles/azure-databricks-modern-analytics-architecture', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'A stakeholder asks why you chose ADF over Databricks Workflows for orchestration. What do you say?',
        options: [
          'ADF is always better than Databricks Workflows',
          'ADF is preferred when orchestrating non-Databricks steps (SQL stored procedures, HTTP calls, SSIS packages) or when a visual no-code pipeline is required. Databricks Workflows is better when all steps are Databricks-native (notebooks, DLT, ML jobs)',
          'ADF is free and Databricks Workflows costs extra',
          'They are identical — just different names',
        ],
        answer: 1,
        explanation: 'ADF excels at heterogeneous orchestration: copy from SQL Server to ADLS, call an HTTP endpoint, run a stored procedure, trigger a Databricks job, email on completion — all in one pipeline. Databricks Workflows is better for Databricks-native pipelines (notebook → DLT → SQL → ML) where you want native Databricks monitoring and retry behavior without leaving the Databricks ecosystem.',
      },
    ],
  },

  'interview-scenario': {
    simpleExplanation: 'Scenario-based interviews put you in the role of a senior engineer and ask you to solve real-world problems — you need to demonstrate systems thinking, not just knowledge of individual tools.',
    deepExplanation: `**What scenario questions test**\nScenario questions test: can you decompose a complex problem? Can you make reasonable assumptions when requirements are incomplete? Can you identify trade-offs and explain your decisions? Can you think about failure modes, not just the happy path?\n\n**System design approach**\nClarify requirements first (latency SLA, data volume, update frequency, budget). Sketch the high-level architecture. Dive into each component's design decisions. Address failure modes and scalability. Discuss monitoring and observability. Many candidates dive into components immediately without understanding requirements — don't.\n\n**Common scenario types**\nBatch ingestion design: how to load 50 source tables incrementally. Real-time streaming design: IoT or clickstream to dashboard with latency SLA. Historical backfill: reprocess 3 years of data after a bug fix. GDPR/compliance: implement right to be forgotten. Migration: move an on-premises SQL DW to Azure.\n\n**Behavioral questions matter too**\nSTAR format (Situation, Task, Action, Result) for: "Tell me about a production incident you debugged." "Describe a time you improved pipeline performance." "How did you handle disagreement with a stakeholder?" Have 3-5 STAR stories ready.`,
    keyPoints: [
      'Requirements first: volume, latency, freshness, budget, compliance — before drawing any architecture',
      'Always address: happy path, failure scenarios, monitoring, and rollback/recovery',
      'Cost awareness: picking Event Hubs Premium when Standard suffices signals poor judgment',
      'Data quality: every design should include where and how data quality is enforced',
      'Stakeholder communication: "How would you explain this delay to the business?" is a real question',
      'Be concrete: "I would use ADF with watermark pattern loading from SQL Server to ADLS hourly" is better than "I would use a pipeline"',
    ],
    commonMistakes: [
      'Starting to design before clarifying requirements — then having to redesign when constraints emerge',
      'Designing only the happy path — interviewers will push: "what happens if the source is down for 2 hours?"',
      'Ignoring cost and operational complexity — the most sophisticated solution is rarely the right one',
      'Vague answers: "I would monitor it" without explaining what metrics, what thresholds, what tools',
    ],
    interviewTips: [
      '"Design a platform that processes 1M orders/day" — start with: what latency? batch or real-time? what reporting?',
      'Practice drawing architectures on paper in 10 minutes — timed practice makes you confident',
      'After designing, always add: "If I had more time I would also address X" — shows senior-level thinking',
      'For behavioral questions, prepare specific examples in advance — vague answers fail',
    ],
    bestPractices: [
      'Keep a design journal: after every project, write a 1-page architecture summary — great interview stories',
      'Practice system design out loud with a friend or record yourself',
      'Read Azure architecture reference implementations — learn from patterns others have validated',
      'Prepare 5 STAR behavioral stories covering: performance optimization, incident response, stakeholder conflict, cross-team collaboration, learning from failure',
    ],
    codeExamples: [
      {
        title: 'System design: real-time IoT platform template',
        language: 'bash',
        code: `# SCENARIO: 10,000 IoT devices, <30 second dashboard latency

# CLARIFICATIONS TO ASK:
# - Event rate: 10K devices × 1 event/10s = 1,000 events/second
# - Latency: dashboard freshness <30 seconds acceptable
# - Historical: yes, analysts need trend analysis
# - Budget: standard tier acceptable

# ARCHITECTURE:
#
# IoT Devices
#   → Event Hubs (10 partitions, Standard tier, 1 TU)
#       ├── [Hot path] Stream Analytics (1-min tumbling window)
#       │     → Azure SQL DB (aggregated last 24h)
#       │     → Power BI Streaming Dataset (real-time visuals)
#       │
#       └── [Warm/Cold path] Databricks Structured Streaming
#             (30s trigger, foreachBatch MERGE)
#             → Delta Silver (device_1min_agg)
#             → Delta Gold (device_daily_summary)
#             → Synapse Serverless → Power BI DirectQuery (trends)
#
#       Also: Event Hubs Capture → ADLS Bronze (raw backup)

# FAILURE MODES:
# - Event Hubs down: devices buffer locally, replay on reconnect
# - Stream Analytics down: hot path stale, warm path continues
# - Databricks down: checkpoint enables restart from last offset
# - Data quality: watermark handles late devices (up to 2 min)

# MONITORING:
# - Event Hubs: consumer lag alert if >60 seconds behind
# - Stream Analytics: watermark delay alert
# - Databricks: streaming query progress, row count per micro-batch
# - Azure Monitor: alert on any streaming job failure`,
      },
    ],
    resources: [
      { title: 'Azure Architecture Center', url: 'https://docs.microsoft.com/en-us/azure/architecture/', type: 'docs', free: true },
      { title: 'IoT reference architecture', url: 'https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/iot', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'In a system design interview, what should you do before drawing any architecture?',
        options: [
          'Start with the most complex component first to show depth',
          'List all Azure services you know and pick the most relevant ones',
          'Clarify requirements: data volume, latency SLA, freshness, budget, compliance requirements',
          'Ask what technologies the company uses',
        ],
        answer: 2,
        explanation: 'Starting without requirements leads to designing the wrong system. A 30-second latency SLA needs a streaming architecture; a 24-hour latency needs batch. 1TB/day is designed differently from 1PB/day. HIPAA compliance changes every component choice. Requirements take 2-3 minutes but prevent redesigning your entire answer halfway through.',
      },
    ],
  },

  // ─── PHASE 10 ───────────────────────────────────────────────────────────────

  'project-portfolio': {
    simpleExplanation: 'Your portfolio is the proof that you can build real data engineering systems — 3-5 strong GitHub projects with clear business problems, architecture diagrams, and working code will differentiate you from candidates who only have certifications.',
    deepExplanation: `**What makes a great DE portfolio project**\nBusiness problem: start with "A retail company needs to..." not "I built a pipeline that...". Architecture diagram: a clear diagram shows you think in systems. Real data: use public datasets (NYC Taxi, Kaggle, government open data) with enough volume to demonstrate scale thinking. Working code: the repo should be runnable, with setup instructions. Resume impact: 2-3 bullet points quantifying impact (processed 100M records, reduced load time by 60%).\n\n**Project progression**\nBeginner: batch pipeline (ADF + ADLS + Databricks + Synapse). Intermediate: incremental load with SCD2, streaming with Event Hubs. Advanced: real-time platform, GDPR compliance, Data Mesh. Having projects at different complexity levels shows growth.\n\n**LinkedIn and GitHub strategy**\nGitHub: every project has a README with architecture diagram (draw.io or Excalidraw), technologies used, setup instructions, and sample output. LinkedIn: pin your 3 best projects, write posts about what you learned building them — this signals to recruiters you are actively learning and building.\n\n**ATS keywords**\nATS (Applicant Tracking Systems) scan for keywords. Your resume must include: Azure Data Factory, Azure Databricks, Delta Lake, PySpark, ADLS Gen2, Azure Synapse, Python, SQL, Medallion Architecture, CI/CD, Azure DevOps. Spell them exactly as they appear in job postings.`,
    keyPoints: [
      'Start every project description with the business problem, not the technology',
      'Architecture diagram is mandatory — recruiters and interviewers evaluate systems thinking visually',
      'Quantify impact: "processed 50M records", "reduced load time from 4 hours to 25 minutes"',
      'README is your first impression — spend as much time on it as the code itself',
      'Public datasets for free projects: NYC Taxi, World Bank, Yahoo Finance, US Census',
      'GitHub contributions graph matters — keep it green with regular commits',
    ],
    commonMistakes: [
      'Building projects without a business problem — "I built a pipeline" is less compelling than a story',
      'No README or architecture diagram — recruiters skip repos that aren\'t immediately understandable',
      'All projects at the same complexity level — show a progression from beginner to advanced',
      'Private repos — make everything public, or create a public demo version',
    ],
    interviewTips: [
      '"Walk me through a project on your GitHub" — tell the business story, architecture decisions, challenges',
      '"What would you improve about this project?" — always have an answer (shows self-awareness)',
      '"How would you scale this to 10x the data volume?" — design thinking question',
      'Contribute to open source (Delta Lake, dbt, Great Expectations) — signals genuine passion',
    ],
    bestPractices: [
      'One strong, well-documented project beats five incomplete ones',
      'Write a post-mortem for each project: what worked, what you\'d do differently, what you learned',
      'Link projects on LinkedIn and write 1-2 posts about each one — recruiting algorithm rewards activity',
      'Get feedback from senior engineers before publishing — quality over quantity',
    ],
    codeExamples: [
      {
        title: 'Project README template',
        language: 'bash',
        code: `# Project README structure that gets noticed

## Project Title
NYC Taxi Lakehouse — End-to-End Azure Data Platform

## Business Problem
A city transportation analytics team needs to analyze 100M+ taxi trips
monthly to optimize fleet distribution and dynamic pricing. Data arrives
daily as Parquet files and must be queryable within 2 hours of landing.

## Architecture
[Link to architecture diagram]
Source → ADF (ingest) → ADLS Bronze → Databricks (Silver/Gold Delta)
→ Synapse Serverless → Power BI Dashboard

## Technologies
- Azure Data Factory (incremental load with watermark pattern)
- ADLS Gen2 (medallion: bronze/silver/gold)
- Azure Databricks + PySpark (transformation)
- Delta Lake (ACID, time travel, MERGE)
- Synapse Analytics Serverless SQL (serving layer)
- Bicep (infrastructure as code)
- Azure DevOps (CI/CD pipeline)

## Key Results
- Processes 100M+ records/month with <2 hour SLA
- Reduced query time by 70% with ZORDER on pickup_datetime
- Infrastructure deployable in <10 minutes from scratch (IaC)

## Setup
1. Prerequisites: Azure subscription, Azure CLI, Databricks CLI
2. Clone repo and run: terraform init && terraform apply
3. Trigger ADF pipeline: az datafactory pipeline create-run ...
4. Access dashboard: [Power BI link]

## What I'd improve next
- Add Great Expectations data quality validation
- Implement Delta Live Tables for declarative pipeline
- Add streaming ingestion via Event Hubs for real-time dashboard`,
      },
    ],
    resources: [
      { title: 'NYC TLC Trip Data (free)', url: 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page', type: 'docs', free: true },
      { title: 'Azure architecture icons', url: 'https://docs.microsoft.com/en-us/azure/architecture/icons/', type: 'docs', free: true },
    ],
    quiz: [
      {
        question: 'What is the most important element of a data engineering portfolio project README?',
        options: [
          'The length of the code',
          'The number of Azure services used',
          'A clear business problem statement followed by an architecture diagram — explains why the project exists and how it is designed',
          'A list of all Python packages installed',
        ],
        answer: 2,
        explanation: 'Recruiters and hiring managers spend 30 seconds on a README. The business problem answers "why does this exist?" The architecture diagram answers "how was it built?" Without these two things, even excellent code gets skipped. Start with the story, back it up with the technical details.',
      },
    ],
  },
};
