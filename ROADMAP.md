# Grond Improvement Roadmap

Priority tiers: **P0** (blocks production) · **P1** (next sprint) · **P2** (this quarter) · **P3** (backlog)

---

## P0 — Blocks Production

### 1. CORS Hardening
**File:** `src/api/main.py:82`

```python
# Current (unsafe):
allow_origins=["*"]

# Target:
allow_origins=os.getenv("CORS_ORIGINS", "").split(",")
```

- Wire up the already-documented `CORS_ORIGINS` env var
- Ship with a safe default (e.g. `localhost` only) in `.env.example`

### 2. CI Lint Gate
**File:** `.github/workflows/ci.yml`

- Remove `continue-on-error: true` from the Ruff step
- Fix any remaining lint violations so the gate is clean
- Run `ruff check src/ tests/` to inventory current backlog

### 3. TypeScript Test Coverage
**Directory:** `orchestration/`

- Write vitest tests for `src/agents/osint-orchestrator.ts`, `src/tools/grond-api.ts`, and `src/queue/jobs.ts`
- Add `orchestration/` test run to CI
- Aim for ≥70% coverage on the orchestration layer

---

## P1 — Next Sprint

### 4. Ncrack Adapter
**Files to create:** `src/tools/ncrack_tool.py`

- Implement the adapter matching the `BaseToolAdapter` pattern used by Nmap
- Wire into `src/api/main.py` router
- Update `agents/network-scanner.md` playbook with the correct path
- Add mocked unit test in `tests/test_tools.py`

### 5. Authorization Store to DB-Backed
**File:** `src/core/authorization.py`

- Implement the documented PostgreSQL-backed authorization store (replace in-process dict)
- Add Alembic migration for an `authorization_grants` table
- Keep the env-var path for dev/staging

### 6. theHarvester CLI Injection Audit
**File:** `src/tools/harvester_tool.py`

- Audit all subprocess calls for shell-injection vectors
- Switch from `shell=True` to argument-list invocation where possible
- Add input sanitization for domain/organization arguments
- Document findings in `docs/security-authorization.md`

---

## P2 — This Quarter

### 7. Integration / E2E Tests
**Directory:** `tests/`

- Add a `tests/integration/` suite that exercises the full `collect → enrich → verify → report` pipeline against mock tool responses
- Add a `tests/e2e/` suite that brings up FastAPI `TestClient` and exercises each `/api/v1/tools/*` endpoint
- Wire `pytest-cov` with a minimum threshold (start at 50%, ratchet up)

### 8. Embeddings & Graph Module Tests
**Directories:** `src/embeddings/`, `src/graph/`

- Unit-test the pgvector/Qdrant indexer and retriever
- Unit-test the Neo4j graph indexer/client
- These modules have zero test coverage today

### 9. API Reference Docs
- Generate or write narrative API docs for each `/api/v1/*` endpoint group
- Document the OpenAPI schema at `/docs` with example requests/responses
- Add a `docs/api/` directory with per-endpoint pages

### 10. Fix Dashboard README
**File:** `examples/grond-dashboard/README.md`

- Correct the reference that points to `company-research-ui/` directory
- Ensure both dashboard and research-ui have working setup instructions

---

## P3 — Backlog

### 11. Company Research UI
**Directory:** `examples/company-research-ui/`

- Build out the Next.js app (currently only a `tsconfig.json`)
- Follow the same patterns as `grond-dashboard`

### 12. OpenSearch Integration
- Either implement the listed OpenSearch dependency in a search tool/adapter
- Or remove it from `pyproject.toml` and documentation if not planned

### 13. RBAC / Multi-Tenant
- Extend the authorization store to role-based access control
- Add tenant-partitioned data scoping for multi-team deployments

### 14. Twitter/X Adapter Maturation
**File:** `src/tools/twitter_tool.py`

- Move from "experimental" to "stable" by adding retry logic, rate-limit handling, and broader query coverage
- Add integration test with mocked X API responses

### 15. Monitoring Dashboard
- Stand up a Grafana board or lightweight admin page for:
  - Queue depth (BullMQ)
  - Pipeline latency (collect→report)
  - Error rates per tool
  - Authorization grant status

### 16. Domain Glossary & Spec Docs
- Add `docs/glossary.md` with canonical OSINT terminology
- Add `docs/specs/pipeline.md` formalizing each stage's contract
- Add `docs/specs/evidence-model.md` documenting the 4-component confidence formula and claim types

### 17. Re-add Agent Guidance Files
- Restore or recreate `AGENTS.md` and `CLAUDE.md` (removed in commit `afdbd50`)
- Ensure they accurately reflect current project structure

---

## Quick Wins (≤1 hour each)

| # | Item | Effort |
|---|------|--------|
| CORS fix | Wire `CORS_ORIGINS` env var | 15 min |
| CI lint gate | Remove `continue-on-error`, fix violations | 30 min |
| Dashboard README | Fix copy-paste directory reference | 5 min |
| Dead reference cleanup | Remove or restore CLAUDE.md/AGENTS.md references from README | 10 min |
| theHarvester audit | Review subprocess calls for injection | 30 min |

---

*Generated from codebase exploration on 2026-05-19. Maturity baseline: 2.67/4.0.*
