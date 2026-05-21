# Grond — Product Requirements Document

**Version**: 1.0  
**Date**: 2026-05-19  
**Status**: Draft  

---

## Table of Contents

1. [Vision & Mission](#1-vision--mission)
2. [Target Personas](#2-target-personas)
3. [Core Principles](#3-core-principles)
4. [Architecture Overview](#4-architecture-overview)
5. [Feature Catalog](#5-feature-catalog)
6. [Confidence Model](#6-confidence-model)
7. [Authorization Model](#7-authorization-model)
8. [v0.3 Release Plan](#8-v03-release-plan)
9. [Success Metrics](#9-success-metrics)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Open Questions & Future](#11-open-questions--future)

---

## 1. Vision & Mission

### Vision

**Grond** makes OSINT evidence-first. Every claim is anchored to a source, every source is verified, and every report is auditable.

### Mission

Provide threat intel teams, red team operators, and investigative analysts with an **agentic OSINT platform** that:

- Collects intelligence from 12+ open-source tools
- Enriches raw data with CVE details, GeoIP, ASN, and certificate transparency logs
- Verifies claims through cross-source corroboration, deduplication, and confidence scoring
- Reports findings with deterministic risk classification and LLM-generated summaries (constrained to evidence)

### The Promise

| **Without Grond** | **With Grond** |
|---|---|
| Manually querying Shodan, Nmap, theHarvester, EDGAR, etc. one at a time | One scan orchestrates all tools concurrently |
| Copy-pasting results into a report template | Automated IntelReport with provenance trails |
| No systematic confidence — "this feels right" | 4-component weighted confidence formula with conflict preservation |
| No audit trail for active scans | Every tool call, authorization check, and pipeline event is logged |
| LLM hallucinations in final deliverables | LLM only summarizes structured evidence — never invents facts |

---

## 2. Target Personas

| Persona | Needs | Key Workflow |
|---|---|---|
| **Threat Intel Analyst (SOC/CTI)** | Passive recon on IOCs, domain intelligence, report generation | `POST /api/v1/scan` with `investigation_profile=company` → review report → export PDF |
| **Red Team Operator** | Authorized active scanning (Nmap, Ncrack), verified targets only | Admin grants target → scan with `run_nmap=true` → HITL approval → collect evidence |
| **Investigative Analyst / Journalist** | Public records search (EDGAR), web/social OSINT, metadata extraction | Multi-tool queries → domain relevance filtering → evidence audit trail |
| **Developer / Integrator** | Embed Grond into existing pipelines, SOC toolchains, or dashboards | REST API or BullMQ jobs → custom dashboards → export to SIEM/CMDB |
| **Platform Admin** | Manage authorization grants, monitor pipeline health, audit compliance | Admin API for grants → OTel dashboards → audit log review |

---

## 3. Core Principles

### P1: Evidence Anchors Every Claim
Every claim in an IntelReport maps to at least one `Evidence` object containing source URL, raw snippet, collection timestamp, and extractor identity. No floating assertions.

### P2: Deterministic Before LLM
Pipeline stages run in this order: **collect → enrich → verify → report**. The first three stages are entirely deterministic. The LLM (claude.ai) is only invoked in the Reporter stage to synthesize section summaries and executive summaries — and it receives ONLY the structured evidence JSON as input.

### P3: Conflict Preservation
When two sources disagree (e.g. Shodan reports port 443 open, Nmap reports it filtered), both claims are retained in the final report with a `conflict_flag=true`. The analyst — not the machine — adjudicates.

### P4: Authorization by Design
Active scans (Nmap, Ncrack, theHarvester in active mode) require a pre-existing `AuthorizationRecord` matching target, tool, and analyst. No self-serve active scanning. Passive tools (Shodan, Tavily, EDGAR) require no authorization gate.

### P5: Audit Everything
Every tool call, authorization check (pass and fail), pipeline stage transition, and error is logged via structlog with a structured schema (analyst_id, session_id, target, timestamp, event type). The audit trail is append-only within a session.

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Dashboard                      │
│              (examples/grond-dashboard/)                  │
│         Intel │ Recon │ Datasheet │ Admin                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│            TypeScript Orchestration Layer                 │
│                  (orchestration/)                         │
│   Claude Agent SDK / OpenRouter  │  BullMQ Worker Pool    │
│   ┌──────────────────────────────┼─────────────────────┐ │
│   │ OSINT Orchestrator Agent     │ Job Queue (Redis)   │ │
│   │ OpenRouter OSINT Agent       │ grond-api.ts tools  │ │
│   │ Neo4j Graph Indexer          │ OTel + pino logs    │ │
│   └──────────────────────────────┴─────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST
┌──────────────────────▼──────────────────────────────────┐
│              Python FastAPI Service                       │
│                    (src/api/main.py)                      │
│                                                           │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Collector│→ │ Enricher │→ │ Verifier │→ │ Reporter │ │
│  └────┬────┘  └──────────┘  └──────────┘  └────┬─────┘ │
│       │                                        │         │
│  ┌────▼────┐                            ┌─────▼──────┐  │
│  │  Tools   │                            │ IntelReport │  │
│  │  (12)    │                            │   (PDF)     │  │
│  └─────────┘                            └────────────┘  │
│                                                           │
│  Authorization │ Audit │ Config │ OTel │ Exceptions       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Data Layer                               │
│  PostgreSQL (pgvector) │ Neo4j │ Redis │ S3 │ OpenSearch │
└─────────────────────────────────────────────────────────┘
```

### Key Boundaries

| Boundary | Python Side | TypeScript Side |
|---|---|---|
| Tool execution | `src/tools/*.py` — adapters calling external APIs/subprocesses | `orchestration/src/tools/grond-api.ts` — HTTP wrappers calling Python routes |
| Pipeline orchestration | `src/core/orchestrator.py` — LangGraph state machine | `orchestration/src/queue/jobs.ts` — BullMQ worker dispatching to agents |
| Evidence model | `src/models/evidence.py` — Pydantic canonical model | `orchestration/src/types/evidence.ts` — Zod mirror |
| Observability | Python OTel + structlog | TypeScript OTel + pino — span context propagated via HTTP headers |

---

## 5. Feature Catalog

### 5.1 Collection Tools

| Tool | Type | Maturity | Input | Output |
|---|---|---|---|---|
| **Shodan** | Passive | Stable | IP/CIDR/hostname, query filter | Ports, banners, vulns, ASN, geo |
| **Tavily Search** | Passive | Stable | Query string, topic, time_range | Search result snippets as Evidence |
| **Tavily Extract** | Passive | Beta | Array of URLs | Clean markdown/text per URL |
| **Nmap** | Active | Stable | Target, scan profile (5 profiles) | Port state, service/version detection, OS guess |
| **theHarvester** | Passive/Active | Experimental | Domain, org name, source flags | Emails, subdomains, hosts, IPs |
| **SEC EDGAR** | Passive | Stable | Full-text search query | Regulatory filings with metadata |
| **Twitter/X** | Passive | Experimental | Query, time range | Tweets, profiles, media mentions |
| **OSINTMap** | Passive | Stable | Region/country query | Curated OSINT resource links |
| **Metadata** | Passive | Stable | Uploaded file + engine choice | ExifTool / Exiv2 metadata |
| **Steganography** | Passive | Stable | Uploaded file + engine + optional password | Hidden data, LSB payloads, stego signatures |
| **Ncrack** | Active | **Planned (501)** | Target + service | Brute-force audit results |
| **Npcap** | Info | Static | N/A | Windows driver reference (not server-side) |

### 5.2 Pipeline Stages

| Stage | File | Description |
|---|---|---|
| **Planner** | `src/core/orchestrator.py` | LangGraph entry: resolves investigation profile, checks authorization, gates active scans via HITL |
| **Collector** | `src/pipeline/collector.py` | Runs tools concurrently via `asyncio.gather`, partial failure tolerant, auto-triggers Tavily Extract on high-value URLs |
| **Enricher** | `src/pipeline/enricher.py` | Adds CVE details from NVD NIST API; extensible for GeoIP, ASN, rDNS, CT logs |
| **Verifier** | `src/pipeline/verifier.py` | Deduplication, cross-source corroboration, conflict detection, 4-component confidence scoring, high-risk review gating |
| **Domain Relevance** | `src/pipeline/domain_relevance.py` | Reduces polysemy noise for domain targets (e.g. "daemon" matching unrelated products) |
| **Reporter** | `src/pipeline/reporter.py` | Deterministic risk classification → groups findings into sections → LLM summary synthesis (last step) |

### 5.3 Dashboard (examples/grond-dashboard)

| Tab | Purpose |
|---|---|
| **Intel** | AI chat interface for scan orchestration, results display |
| **Recon** | Tool cards (Shodan, Nmap, EDGAR, Metadata, Stego, Twitter) for point queries |
| **Datasheet** | CSV enrichment with export to CSV/Excel/PDF |
| **Admin** | Authorization grant management |

### 5.4 Agent Playbooks (agents/)

| Playbook | Role |
|---|---|
| `osint-orchestrator.md` | Master controller — decomposes goals, fans out to tools, assembles report |
| `network-scanner.md` | Nmap/Ncrack specialist — profile selection, auth gating |
| `shodan-intel.md` | Shodan query expert — filter syntax, banner analysis |
| `web-intelligence.md` | Tavily/web specialist — search + extract flows |
| `report-generator.md` | Reporter — risk classification, section summaries, PDF output |

---

## 6. Confidence Model

### Formula

```
C = (w_s × source_reliability)
  + (w_c × cross_source_agreement)
  + (w_t × freshness)
  + (w_e × evidence_completeness)

Weights (configurable, must sum to 1.0):
  w_s = 0.40  (source reliability — provenance quality matters most)
  w_c = 0.25  (cross-source corroboration)
  w_t = 0.20  (temporal freshness — exponential decay)
  w_e = 0.15  (evidence completeness — fraction of expected fields)
```

### Source Tiering

| Tier | Reliability | Examples |
|---|---|---|
| **OFFICIAL** | 1.0 | Government databases, EDGAR filings |
| **REGULATOR** | 0.95 | CVE/NVD, CERT advisories |
| **MEDIA** | 0.70 | Established news outlets, press releases |
| **COMMUNITY** | 0.50 | GitHub, forums, social media |
| **ANONYMOUS** | 0.20 | Uncategorized, pastebins, dark web |

### Tool-Level Reliability (within source_reliability)

| Tool | Weight |
|---|---|
| Nmap | 0.95 |
| EDGAR | 0.88 |
| Shodan | 0.85 |
| stegoVeritas | 0.78 |
| ExifTool / Exiv2 | 0.72 |
| Tavily | 0.70 |
| theHarvester | 0.55 |
| stego_lsb | 0.55 |
| OSINTMap | 0.52 |
| Twitter | 0.50 |
| Manual | 1.00 |

### Review Gating

Evidence is flagged `requires_review=true` when:
- `claim_type == CREDENTIAL_EXPOSURE` (always)
- `VULNERABILITY` with `CVSS >= 9.0` (critical)
- Source tier is ANONYMOUS and confidence < 0.50
- `conflict_flag == true` (contradictory sources)
- `claim_type == STEGANOGRAPHY` or `STEGO_EMBEDDED`

---

## 7. Authorization Model

### Passive Tools (no gate)

Shodan, Tavily, EDGAR, OSINTMap, Twitter, Metadata, Steganography.

### Active Tools (require AuthorizationRecord)

Nmap, Ncrack, theHarvester in active mode.

### Matching Rules (in order)

1. **Exact IP / hostname** match (hostnames case-insensitive)
2. **CIDR range containment** (both sides parsable as IP/network)
3. **Hostname scope**: `customer.test` matches `api.customer.test` (parent → subdomain suffix)
4. **Wildcard**: `*.customer.test` matches subdomains only, not the apex
5. **Tool wildcard**: `tool="*"` matches any tool
6. **Analyst wildcard**: `analyst_id="*"` matches any analyst (use sparingly)
7. **Expiry**: Expired records are rejected

### Grant Sources

| Source | Scope |
|---|---|
| `GROND_AUTHORIZED_SCAN_TARGETS` env var (CSV) | Dev/staging; analyst_id=*, tool=nmap |
| PostgreSQL `grond_active_scan_authorization` table | Production; loaded at startup + admin API POST |
| `POST /api/v1/admin/active-scan-authorizations` | Workflow automation after approval process |

### HITL Flow

When `run_nmap=true`, the LangGraph planner calls `interrupt()` before collection. The synchronous `POST /api/v1/scan` cannot resume this — production deployments must use a checkpoint-resume flow (BullMQ worker or orchestration layer). For local development, `GROND_DEV_BYPASS_NMAP_HITL=true` with `ENVIRONMENT=development` skips the interrupt.

---

## 8. v0.3 Release Plan

### P0 — Blocking Production

#### P0.1: CORS Hardening
| Field | Detail |
|---|---|
| **User Story** | As a platform admin, I want the CORS policy to be configurable so that only authorized origins can call the API, preventing cross-site attacks. |
| **Acceptance Criteria** | `CORS_ORIGINS` env var is wired in `main.py` instead of `allow_origins=["*"]`. Default `localhost:3000`. Documented in `.env.example`. |
| **Files** | `src/api/main.py`, `.env.example` |
| **Effort** | 15 min |

#### P0.2: CI Lint Gate
| Field | Detail |
|---|---|
| **User Story** | As a developer, I want CI to block PRs with lint violations so that code quality doesn't degrade over time. |
| **Acceptance Criteria** | `continue-on-error: true` removed from Ruff step in `.github/workflows/ci.yml`. All existing violations fixed. `ruff check .` exits 0. |
| **Files** | `.github/workflows/ci.yml`, any files with outstanding lint violations |
| **Effort** | 30 min |

#### P0.3: TypeScript Test Coverage
| Field | Detail |
|---|---|
| **User Story** | As a developer, I want the TypeScript orchestration layer to have test coverage so that agent tools and queue workers are verified before deployment. |
| **Acceptance Criteria** | `vitest` run passes with ≥ 3 test files covering: `grond-api.ts` tool wrappers, `osint-orchestrator.ts` agent, `jobs.ts` queue handler. Added to CI matrix. |
| **Files** | `orchestration/src/__tests__/`, `.github/workflows/ci.yml` |
| **Effort** | 2-3 days |

### P1 — Next Sprint

#### P1.1: Ncrack Adapter
| Field | Detail |
|---|---|
| **User Story** | As a red team operator, I want to run authorized Ncrack brute-force audits through Grond so I don't need a separate toolchain. |
| **Acceptance Criteria** | `src/tools/ncrack_tool.py` exists following the `ToolAdapter` pattern. Route in `main.py` returns real results instead of 501. Authorization gate enforces record check. Mocked test in `tests/test_tools.py`. |
| **Files** | `src/tools/ncrack_tool.py`, `src/api/main.py`, `agents/network-scanner.md`, `tests/test_tools.py` |
| **Effort** | 1-2 days |

#### P1.2: DB-Backed Authorization Store
| Field | Detail |
|---|---|
| **User Story** | As a platform admin, I want authorization grants persisted in PostgreSQL so they survive restarts and can be audited. |
| **Acceptance Criteria** | `AuthorizationService` reads from `grond_active_scan_authorization` table. In-process store remains as fallback. Alembic migration added. Admin API route works end-to-end. |
| **Files** | `src/core/authorization.py`, `src/core/active_scan_authorization_db.py`, new Alembic migration |
| **Effort** | 2-3 days |

#### P1.3: theHarvester CLI Injection Audit
| Field | Detail |
|---|---|
| **User Story** | As a security reviewer, I need assurance that CLI arguments passed to theHarvester subprocess are sanitized against injection attacks. |
| **Acceptance Criteria** | All subprocess calls use argument-list invocation (no `shell=True`). Domain/org inputs are validated with regex. Findings documented in `docs/security-authorization.md`. |
| **Files** | `src/tools/harvester_tool.py`, `docs/security-authorization.md` |
| **Effort** | 1 day |

### P2 — This Quarter

#### P2.1: Integration Tests
| Field | Detail |
|---|---|
| **User Story** | As a developer, I want integration tests that exercise the full pipeline so I can refactor with confidence. |
| **Acceptance Criteria** | `tests/integration/` with full pipeline test (collect→enrich→verify→report against mocks). `tests/e2e/` with FastAPI `TestClient` for each `/api/v1/tools/*` endpoint. `pytest-cov` configured with ≥ 50% threshold. |
| **Files** | `tests/integration/`, `tests/e2e/`, `pyproject.toml` |
| **Effort** | 3-5 days |

#### P2.2: API Reference Documentation
| Field | Detail |
|---|---|
| **User Story** | As an integrator, I want narrative API documentation with request/response examples so I can onboard without reading source code. |
| **Acceptance Criteria** | `docs/api/` directory with one page per endpoint group (`tools.md`, `scan.md`, `admin.md`, `health.md`). Each page includes curl examples, request/response JSON, error codes, and auth requirements. |
| **Files** | `docs/api/*.md` |
| **Effort** | 2 days |

#### P2.3: Embeddings & Graph Module Tests
| Field | Detail |
|---|---|
| **User Story** | As a developer, I want test coverage for the embeddings and graph modules to ensure vector search and Neo4j indexing are correct. |
| **Acceptance Criteria** | Unit tests for pgvector indexer/retriever, Qdrant fallback, Neo4j client. Mocks for DB connections. |
| **Files** | `tests/test_embeddings.py`, `tests/test_graph.py` |
| **Effort** | 1-2 days |

#### P2.4: Dashboard README Fix
| Field | Detail |
|---|---|
| **User Story** | As a new developer, I want accurate setup instructions so I can run the dashboard on my machine. |
| **Acceptance Criteria** | `examples/grond-dashboard/README.md` no longer references `company-research-ui/` incorrectly. Both dashboards have working `npm install && npm run dev` instructions. |
| **Files** | `examples/grond-dashboard/README.md` |
| **Effort** | 5 min |

### P3 — Backlog (deferred from ROADMAP)

- Company Research UI implementation
- OpenSearch integration or removal
- RBAC / multi-tenant authorization
- Twitter adapter maturation
- Monitoring dashboard (Grafana)
- Domain glossary and formal pipeline specs
- Re-add AGENTS.md / CLAUDE.md (this PRD documents them being re-added)

---

## 9. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **Pipeline latency** (passive scan, single target) | < 60 seconds p95 | OTel traces end-to-end |
| **Test coverage** (Python) | ≥ 70% | `pytest-cov` in CI |
| **Test coverage** (TypeScript) | ≥ 70% | `vitest --coverage` in CI |
| **CI pass rate** | 100% (no `continue-on-error`) | GitHub Actions status |
| **Authorization bypass** | Zero incidents | Audit log review |
| **P0/P1 issues resolved** | 6/6 before v0.3 tag | ROADMAP tracking |

---

## 10. Non-Functional Requirements

### Security
- No secrets in source code — all via environment variables (validated at startup by pydantic-settings)
- No `shell=True` in subprocess calls — use argument-list invocation
- CORS restricted to configured origins
- Authorization enforced before every active tool call
- Audit log captures every authorization check (pass and fail)

### Reliability
- Collector stage is partial-failure tolerant: one tool failing does not abort the scan
- ToolAdapter base class provides retry with exponential backoff (3 attempts, base 1s)
- Rate limiting via per-adapter token bucket
- Timeout enforcement on all external calls

### Observability
- OpenTelemetry spans across Python and TypeScript boundaries (context propagated via HTTP headers)
- Structured logging (structlog in Python, pino in TypeScript) with consistent field names
- Sentry for error aggregation
- 11 audit event types covering the full pipeline lifecycle

### Performance
- Tools run concurrently via `asyncio.gather` in Collector
- Tavily Extract auto-triggers in parallel on high-value URLs
- Confidence scoring is pure math (no I/O, no LLM)
- Report generation is deterministic → LLM step (only summaries)

---

## 11. Open Questions & Future

| Topic | Status | Notes |
|---|---|---|
| **RBAC implementation** | Planned (P3) | Role hierarchy (admin, analyst, viewer) + per-role tool restrictions |
| **Multi-tenant isolation** | Planned (P3) | Tenant-scoped authorization, data partitioning |
| **Live collaboration** | Research | Multiple analysts working on the same scan session |
| **Plugin system** | Research | Third-party tool adapters without modifying core |
| **OpenSearch** | Decision needed | Listed as dependency but no usage — implement or remove |
| **Company Research UI** | Planned (P3) | Empty example directory to be built out |
| **Monitoring dashboard** | Planned (P3) | Grafana or built-in admin page |
| **Contract/API versioning** | Open | `/api/v1/` prefix exists but no deprecation policy yet |
