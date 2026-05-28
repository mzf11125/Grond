---
name: grond-pipeline
description: LangGraph pipeline architecture — collect → enrich → verify → report
---

# Grond Pipeline Architecture

## Pipeline Flow

```
POST /api/v1/scan
  │
  ▼
planner
  ├── Resolves investigation_profile (general | company | social)
  ├── Checks authorization for active scans
  └── HITL interrupt for active scans (dev bypass available)
  │
  ▼
collector
  ├── Runs tools concurrently via asyncio.gather
  ├── Each tool wrapped in ToolAdapter.run() — retry, rate limit, audit
  ├── Partial failure tolerant — one tool failing does not abort scan
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

## Key Design Rules

1. **Evidence anchors every claim** — no floating assertions in reports
2. **Deterministic before LLM** — collector, enricher, verifier have zero LLM calls
3. **Conflict preservation** — contradictory sources both kept; analyst adjudicates
4. **Authorization by design** — active scans gated; passive tools free
5. **Audit everything** — 11 event types, structlog with consistent schema

## Adding a New Tool

1. **Config** — Add API keys / settings to `src/core/config.py`
2. **Adapter** — Create `src/tools/<name>_tool.py` with `ToolAdapter` subclass
3. **Route** — Add endpoint in `src/api/main.py`
4. **TS wrapper** — Add function in `orchestration/src/tools/grond-api.ts`
5. **Test** — Add mocked test in `tests/test_tools.py`

## Adding a Pipeline Stage

1. Create module in `src/pipeline/`
2. Add LangGraph node in `src/core/orchestrator.py`
3. Add configuration in `src/core/config.py`
4. Add test in `tests/`
