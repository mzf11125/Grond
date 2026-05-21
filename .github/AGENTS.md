# AGENTS.md — Grond Project Guidelines

> **Grond** is an agentic OSINT (Open Source Intelligence) platform.
> Evidence-first pipelines, AI-orchestrated tools, and analyst-ready reporting.
> Python (FastAPI + LangGraph) + TypeScript (Claude SDK + BullMQ).

---

## Project Identity

| Property | Value |
|---|---|
| **Name** | Grond |
| **Version** | 0.2.0 |
| **License** | MIT |
| **Python** | 3.12+ |
| **Node** | 22.x |
| **TypeScript** | 5.7+ |
| **Primary language** | Python (54 source files) + TypeScript (20 source files) |
| **Package managers** | uv (Python), npm (TypeScript) |

### Key Documents

| Document | Location | Purpose |
|---|---|---|
| **PRD** | `docs/PRD.md` | Full product spec, personas, feature catalog, v0.3 release plan |
| **Roadmap** | `ROADMAP.md` | Prioritized improvement gaps (P0→P3) |
| **Maturity Report** | `MATURITY_REPORT.md` | Code maturity assessment (2.67/4.0) |
| **Security Auth** | `docs/security-authorization.md` | Authorization model, scan gating |
| **Incident Response** | `docs/incident-response.md` | IR procedures (partially filled) |
| **Env Template** | `.env.example` | All environment variables with descriptions |

---

## Directory Map

```
Grond/
│
├── src/                          # Python source
│   ├── api/main.py               # FastAPI entrypoint — all routes live here
│   ├── core/                     # config, authorization, audit, orchestrator, exceptions, state
│   ├── embeddings/               # pgvector / Qdrant indexer + retriever
│   ├── graph/                    # Neo4j graph client + indexer
│   ├── models/
│   │   ├── evidence.py           # Canonical Evidence model (358 lines — read this!)
│   │   └── report.py             # IntelReport, ReportFinding, ReportSection, RiskLevel
│   ├── observability/            # OTel tracing setup, structlog wiring
│   ├── pipeline/                 # Stages: collector, enricher, verifier, reporter, domain_relevance
│   ├── storage/                  # S3 artifact store (aiobotocore)
│   └── tools/                    # 12 tool adapters (see "Tools" section below)
│
├── orchestration/                # TypeScript agent orchestration
│   ├── package.json              # @grond/orchestration — deps include Anthropic SDK, BullMQ, Zod
│   └── src/
│       ├── index.ts              # Main entry — starts BullMQ worker
│       ├── agents/               # osint-orchestrator.ts, openrouter-osint-agent.ts
│       ├── graph/client.ts       # Neo4j helpers
│       ├── observability/        # pino logger + OTel tracer
│       ├── queue/jobs.ts         # BullMQ job definitions
│       ├── tools/grond-api.ts    # HTTP wrappers calling Python FastAPI (498 lines)
│       └── types/evidence.ts     # Zod mirror of Python Evidence model
│
├── agents/                       # Markdown agent playbooks (for Cursor / IDE agents)
│   ├── osint-orchestrator.md
│   ├── network-scanner.md
│   ├── shodan-intel.md
│   ├── web-intelligence.md
│   └── report-generator.md
│
├── examples/
│   └── grond-dashboard/          # Next.js analyst console (Intel/Recon/Datasheet)
│
├── tests/                        # 10 pytest files (~1089 lines)
├── scripts/                      # enqueue-scan.ts, trigger_scan.py
├── docs/                         # PRD, security docs, API docs (planned)
├── recon/                        # Scripts to build Nmap/Ncrack/Npcap from source
├── pyproject.toml                # Python project config (hatchling + uv)
├── uv.lock                       # uv lockfile
└── .github/workflows/ci.yml      # CI: Python (ruff + pytest) + Next.js build
```

---

## Technology Stack

### Python (src/)

| Category | Technology |
|---|---|
| Web framework | FastAPI + uvicorn[standard] |
| Pipeline | LangGraph 0.2+ (LangChain 0.3+), Anthropic SDK |
| Data models | Pydantic v2, pydantic-settings |
| Database | PostgreSQL + asyncpg + pgvector + Alembic |
| Graph DB | Neo4j (bolt driver) |
| Search | OpenSearch (opensearch-py — not yet wired) |
| Vector store | pgvector (default) or Qdrant |
| Object store | S3-compatible via aiobotocore |
| Embeddings | sentence-transformers |
| OSINT APIs | shodan, tavily-python, python-nmap, edgar-tool |
| Reports | WeasyPrint (PDF) |
| Observability | OpenTelemetry SDK, structlog, Sentry |
| CLI tools | ExifTool, Exiv2, stegoVeritas (subprocess) |
| Lint | ruff (E, F, I, UP, B, SIM), mypy (strict) |
| Tests | pytest, pytest-asyncio, pytest-cov, vcrpy |

### TypeScript (orchestration/)

| Category | Technology |
|---|---|
| Agent SDK | @anthropic-ai/sdk 0.95.0, deepagents |
| Queue | BullMQ + ioredis |
| Alt backend | @langchain/openrouter |
| Validation | Zod v4 |
| Logging | pino |
| Tracing | OpenTelemetry (auto-instrumentations) |
| Error tracking | @sentry/node |
| Graph DB | neo4j-driver |
| Lint | eslint, typescript (strict) |
| Tests | vitest |

---

## How the Pipeline Works

```
POST /api/v1/scan
  │
  ▼
planner (LangGraph node)
  ├── Resolves investigation_profile (general | company | social)
  ├── Checks authorization for active scans
  └── Calls interrupt() if HITL required (dev bypass: GROND_DEV_BYPASS_NMAP_HITL)
  │
  ▼
collector
  ├── Runs tools concurrently via asyncio.gather
  ├── Each tool wrapped in ToolAdapter.run() — retry, rate limit, audit
  ├── Partial failure tolerant — one tool failing doesn't abort scan
  └── Auto-triggers Tavily Extract on high-value URLs
  │
  ▼
enricher
  ├── Resolves CVE IDs → CVSS scores via NVD API
  └── Extensible: GeoIP, ASN, rDNS, CT logs (stubs present)
  │
  ▼
verifier
  ├── Deduplication — groups identical claims
  ├── Cross-source corroboration — verified=True when ≥2 confirm
  ├── Conflict detection — flags contradictory sources
  ├── Confidence scoring — 4-component weighted formula (no LLM)
  └── Review gating — flags high-risk items for analyst sign-off
  │
  ▼
reporter
  ├── Deterministic risk classification (rules-based)
  ├── Group findings into ReportSection objects
  ├── LLM synthesis — section summaries + executive summary
  │   (LLM receives ONLY structured evidence JSON, cannot invent facts)
  └── Returns IntelReport (Pydantic model → JSON response)
```

### Key Design Rules

1. **Evidence anchors every claim** — no floating assertions in reports
2. **Deterministic before LLM** — collector, enricher, verifier have zero LLM calls
3. **Conflict preservation** — contradictory sources are both kept; analyst adjudicates
4. **Authorization by design** — active scans gated; passive tools free
5. **Audit everything** — 11 event types, structlog with consistent schema

---

## Tool Adapter Pattern

Every external data source follows the `ToolAdapter` base class (`src/tools/base.py`):

```python
class MyToolAdapter(ToolAdapter[MyInput]):
    tool_name = "my_tool"

    async def _execute(self, input: MyInput) -> list[Evidence]:
        # 1. Call the external API / subprocess
        # 2. Map every claim to exactly one Evidence object
        # 3. Set provenance.raw_response = unmodified API payload
        # 4. Set confidence using source defaults from Settings
        # 5. Do NOT aggregate, filter, or enrich here — pipeline work
        ...
```

### Adapter provides automatically:
- **Retry** — 3 attempts, exponential backoff (1s, 2s, 4s)
- **Rate limiting** — per-adapter token bucket
- **Audit logging** — tool_start, tool_success, tool_failure, tool_call_retry events
- **Error classification** — ToolRateLimitError, ToolTimeoutError, ToolExecutionError

### How to add a new tool:

1. **Config** — Add any API keys / settings to `src/core/config.py`
2. **Adapter** — Create `src/tools/<name>_tool.py` with `ToolAdapter` subclass
3. **Route** — Add endpoint in `src/api/main.py` following the existing pattern
4. **TS wrapper** — Add function in `orchestration/src/tools/grond-api.ts`
5. **Test** — Add mocked test in `tests/test_tools.py`

---

## Coding Conventions

### Python

```python
# Always:
from __future__ import annotations  # first import in every file

# Logging — use structlog, never print()
import structlog
log = structlog.get_logger("grond.<module>")

# Models — Pydantic v2 with type annotations
from pydantic import BaseModel, Field

# Config — lru_cache singleton
from src.core.config import get_settings
settings = get_settings()

# Audit — instantiate per-request
from src.core.audit import AuditLogger
audit = AuditLogger(analyst_id=analyst_id, session_id=session_id)
```

### TypeScript

```typescript
// Validation — Zod v4 schemas for all I/O boundaries
import { z } from "zod/v3";

// Observability — wrap all tool calls
import { withSpan } from "../observability/tracer.js";
const result = await withSpan("tool.shodan", async () => { ... });

// Logging — use pino child loggers
const log = logger.child({ tool: "shodan" });

// Never use `any` — all types explicit or inferred
// Prefer named exports over default exports
```

### Both Sides

- No secrets in source code — environment variables only (validated at startup)
- No `shell=True` in subprocess calls — use argument-list invocation
- All tool calls MUST be audited
- Error messages MUST NOT leak API keys, internal paths, or DB credentials

---

## Testing

### Python

```bash
uv run pytest                          # Run all tests
uv run pytest tests/test_tools.py      # Single file
uv run pytest -k "shodan"              # Filter by name
uv run ruff check .                    # Lint
uv run mypy src/                       # Type check
```

All tests use mocks — no live network calls. Use `@patch.dict("os.environ", {...})` for config isolation, `unittest.mock.AsyncMock` for async APIs, and `pytest-asyncio` for async test functions.

### TypeScript

```bash
cd orchestration && npm run test       # vitest run
cd orchestration && npm run typecheck  # tsc --noEmit
cd orchestration && npm run lint       # eslint src --ext .ts
```

Currently zero test files — writing them is a P0 priority. Follow the same pattern: mock `apiFetch()`, mock `BullMQ`, test each tool wrapper with Zod schema validation.

---

## Common Commands

```bash
# Python — start API server
uv run uvicorn src.api.main:app --reload --port 8000

# Python — run a scan from CLI
uv run python scripts/trigger_scan.py

# Python — pipeline as module
uv run python -m src.pipeline.collector

# TypeScript — start worker
cd orchestration && npm run dev

# TypeScript — build
cd orchestration && npm run build

# TypeScript — enqueue a scan job
cd orchestration && npm run enqueue-scan

# Dashboard
cd examples/grond-dashboard && npm run dev

# All checks (Python)
uv run ruff check . && uv run mypy src/ && uv run pytest

# All checks (TypeScript)
cd orchestration && npm run lint && npm run typecheck && npm run test
```

---

## Gotchas & Pitfalls

| Issue | Explanation | Workaround |
|---|---|---|
| **CORS wildcard** | `main.py:82` hardcodes `allow_origins=["*"]` — ignores the `CORS_ORIGINS` env var | P0 fix: wire env var. Until then, know that any origin can call the API. |
| **HITL can't resume in sync HTTP** | LangGraph `interrupt()` pauses the graph; `POST /api/v1/scan` can't resume it | Use `run_nmap=false` for passive-only. For active, use orchestration layer or set `GROND_DEV_BYPASS_NMAP_HITL=true` in dev. |
| **theHarvester uses subprocess** | `harvester_tool.py` shells out to the CLI — validate all inputs | P1 audit planned. Don't pass unsanitized user input. |
| **exiftool / exiv2 / stegoveritas need CLI on PATH** | These are invoked via `subprocess.run()` | Install system packages: `apt install exiftool exiv2`. stegoVeritas via pip. |
| **pgvector extension required** | `CREATE EXTENSION vector;` must be run on PostgreSQL | Included in Alembic migrations. Verify extension is enabled on your PG instance. |
| **Qdrant vs pgvector** | Only one embedding backend is active | Set `EMBEDDING_BACKEND=pgvector` (default) or `qdrant`. |
| **OpenSearch listed but not wired** | Dependency exists in pyproject.toml, no code uses it yet | Safe to ignore. Decision pending: implement or remove. |
| **Ncrack returns 501** | Route exists but no adapter — intentional placeholder | Use CLI directly on authorized workstations until P1 implementation. |
| **Twitter free tier limited** | X API v2 free tier: recent tweets only (7 days), one app per 15-min window | Set `TWITTER_BEARER_TOKEN` for free tier. Academic/Pro tier needed for archive. |
| **LangGraph MemorySaver** | Default checkpointer is in-memory — lost on restart | Production should swap to PostgresSaver or SqliteSaver. |

---

## Key Files to Read First

If you're new to the codebase, read these in order:

1. `README.md` — architecture diagram, tech stack, quick start
2. `docs/PRD.md` — full product specification
3. `ROADMAP.md` — prioritized improvement gaps
4. `src/models/evidence.py` — canonical data model (358 lines)
5. `src/api/main.py` — all API routes (425 lines)
6. `src/pipeline/verifier.py` — confidence scoring, dedup, conflict detection
7. `src/pipeline/reporter.py` — risk classification, LLM summary synthesis
8. `src/tools/base.py` — ToolAdapter ABC (166 lines)
9. `src/core/config.py` — all settings, confidence weights (262 lines)
10. `orchestration/src/tools/grond-api.ts` — TypeScript HTTP wrappers (498 lines)
