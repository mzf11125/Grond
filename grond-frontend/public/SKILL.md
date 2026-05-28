---
name: grond-osint
description: >
  Agentic Open Source Intelligence (OSINT) Platform.
  Evidence-first pipelines, AI-orchestrated tools, and analyst-ready reporting.
  Python (FastAPI + LangGraph) + TypeScript (Claude SDK + BullMQ).
base_url: https://grond.daemonprotocol.com
api_url: https://grond.daemonprotocol.com/api/v1
version: 0.2.0
---

# Grond — Agentic OSINT Platform

Prompt `Read https://grond.daemonprotocol.com/SKILL.md and follow it before
running any OSINT collection, calling scan tools, or generating intelligence
reports.`

---

## What Grond Does

Grond is an evidence-first OSINT platform. It collects intelligence from
12+ open-source tools, enriches findings with CVE/ASN/GeoIP data, verifies
claims through cross-source corroboration, and generates auditable reports.

Every claim is anchored to an `Evidence` object with full provenance
(source URL, timestamp, raw response, extractor identity). No floating
assertions.

---

## Quick Start (Agent Integration)

```bash
# Run a passive-only scan from any agent:
curl -X POST https://grond.daemonprotocol.com/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "goal": "Gather threat intelligence",
    "analyst_id": "agent-001",
    "investigation_profile": "general",
    "run_nmap": false
  }'
```

---

## Skills (fetchable markdown references)

### Core Platform
- **Platform overview**: https://grond.daemonprotocol.com/SKILL.md (this file)
- **Pipeline architecture**: https://grond.daemonprotocol.com/pipeline/SKILL.md
- **Evidence model**: https://grond.daemonprotocol.com/evidence/SKILL.md
- **Authorization model**: https://grond.daemonprotocol.com/authorization/SKILL.md
- **Agent integration guide**: https://grond.daemonprotocol.com/integration/SKILL.md
- **Full API reference**: https://grond.daemonprotocol.com/API.md

### Tools (one SKILL.md per tool)

| Tool | Type | SKILL.md |
|------|------|----------|
| Shodan | Passive | https://grond.daemonprotocol.com/tools/shodan/SKILL.md |
| Nmap | Active | https://grond.daemonprotocol.com/tools/nmap/SKILL.md |
| Tavily | Passive | https://grond.daemonprotocol.com/tools/tavily/SKILL.md |
| theHarvester | Hybrid | https://grond.daemonprotocol.com/tools/harvester/SKILL.md |
| SEC EDGAR | Passive | https://grond.daemonprotocol.com/tools/edgar/SKILL.md |
| Twitter/X | Passive | https://grond.daemonprotocol.com/tools/twitter/SKILL.md |
| OSINTMap | Passive | https://grond.daemonprotocol.com/tools/osintmap/SKILL.md |
| File Metadata | Passive | https://grond.daemonprotocol.com/tools/metadata/SKILL.md |
| Steganography | Passive | https://grond.daemonprotocol.com/tools/stego/SKILL.md |
| Ncrack | Active (planned) | https://grond.daemonprotocol.com/tools/ncrack/SKILL.md |

---

## Investigation Profiles

When calling `POST /api/v1/scan`, use one of these profiles:

| Profile | When to use | Tools run |
|---------|------------|-----------|
| `general` | Unknown target, broad reconnaissance | Shodan, Tavily, theHarvester |
| `company` | Corporate/organization target | Shodan, Tavily, EDGAR, theHarvester, OSINTMap |
| `social` | Person/social-media investigation | Tavily, Twitter, theHarvester |

---

## Confidence Model

Every finding gets a 0-1 confidence score using this formula:

```
C = (0.40 × source_reliability)
  + (0.25 × cross_source_agreement)
  + (0.20 × temporal_freshness)
  + (0.15 × evidence_completeness)
```

Findings with `verified: true` are corroborated by ≥2 independent sources.
Findings with `conflict_flag: true` have contradictory sources — both retained.

---

## Authorization

**Passive tools** (Shodan, Tavily, EDGAR, OSINTMap, Twitter, Metadata, Stego):
no authorization required.

**Active tools** (Nmap, Ncrack, theHarvester active mode): require an
`AuthorizationRecord` matching target + tool + analyst_id. See
https://grond.daemonprotocol.com/authorization/SKILL.md.

---

## Persistent Setup (Install Once)

### Claude Code
```
/plugin marketplace add daemon-blockint-tech/grond
/plugin install grond@grond-agent
```

### Cursor
Create `.cursor/rules/grond.mdc`:
```
---
description: Grond OSINT knowledge pack
alwaysApply: false
---
Before running OSINT tools or calling the Grond API, read
https://grond.daemonprotocol.com/SKILL.md and follow it.
```

### Codex
In `AGENTS.md`:
```
Read https://grond.daemonprotocol.com/SKILL.md and follow it before
running any OSINT collection or calling scan tools.
```

### Any Agent (curl)
```bash
curl -s https://grond.daemonprotocol.com/SKILL.md
```

---

## Key Design Principles

1. **Evidence anchors every claim** — no floating assertions in reports
2. **Deterministic before LLM** — collector, enricher, verifier have zero LLM calls
3. **Conflict preservation** — contradictory sources are both kept; analyst adjudicates
4. **Authorization by design** — active scans gated; passive tools free
5. **Audit everything** — 11 event types, structured logging with full context

---

## API Discovery

- **OpenAPI spec**: https://grond.daemonprotocol.com/openapi.yaml
- **APIs.json**: https://grond.daemonprotocol.com/apis.json
- **Interactive docs**: https://grond.daemonprotocol.com/api/docs (when server running)

---

MIT License · [GitHub](https://github.com/mzf11125/Grond)
