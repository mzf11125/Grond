---
name: grond-integration
description: >
  How to integrate Grond into your AI agent — Claude Code, Cursor, Codex,
  OpenClaw, or any HTTP-capable agent. API endpoints, auth flow, response
  schemas, and best practices.
---

# Integrating Grond into Your AI Agent

## Architecture

```
Your Agent (Claude/GPT/Codex/etc.)
  │
  ▼ HTTP
Grond API (Python FastAPI)
  ├── POST /api/v1/scan       ← Run full investigation pipeline
  ├── POST /api/v1/tools/*    ← Individual tool endpoints
  ├── GET  /api/v1/health     ← Health check
  └── POST /api/v1/admin/*    ← Authorization management
```

## Common Integration Patterns

### Pattern 1: Run a Passive Scan (Most Common)

```bash
curl -X POST https://grond.daemonprotocol.com/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "goal": "Investigate for security research",
    "analyst_id": "<your-agent-id>",
    "investigation_profile": "company",
    "run_nmap": false
  }'
```

Returns an `IntelReport` with:
- `executive_summary` — LLM-generated overview (or placeholder if no Anthropic key)
- `key_takeaways[]` — bullet list of critical findings
- `sections[]` — grouped findings by category
- `findings[]` — individual evidence items with confidence, risk level, cross-verification

### Pattern 2: Call Individual Tools

```
POST /api/v1/tools/shodan    — Shodan passive recon
POST /api/v1/tools/tavily    — Web search
POST /api/v1/tools/tavily/extract — URL content extraction
POST /api/v1/tools/edgar     — SEC EDGAR search
POST /api/v1/tools/harvester — theHarvester OSINT
POST /api/v1/tools/osintmap  — Regional OSINT links
POST /api/v1/tools/nmap      — Nmap scan (requires auth)
POST /api/v1/tools/metadata  — File metadata (multipart)
POST /api/v1/tools/stego     — Steganography analysis (multipart)
POST /api/v1/tools/ncrack    — Ncrack (returns 501 — planned)
GET  /api/v1/tools/npcap/info — Npcap reference (static)
```

### Pattern 3: Enrich Data in Bulk

Use the `POST /api/v1/scan` endpoint with the target and profile.
The pipeline runs all relevant tools and returns a unified report.

## Error Handling

| HTTP Status | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Parse IntelReport |
| 403 | Auth required / CORS | Check authorization or origin |
| 422 | Invalid input / pipeline error | Read detail.code for specific error |
| 500 | Server error | Retry once, then report |
| 501 | Not implemented (Ncrack) | Wait for P1 implementation |

## Rate Limits

- Tools run with per-adapter token bucket rate limiting
- Retry with exponential backoff built into ToolAdapter (3 attempts)
- Concurrent: tools run in parallel via `asyncio.gather` (no hard concurrent cap)

## Health Check

```bash
curl https://grond.daemonprotocol.com/api/v1/health
# → {"status": "ok"}
```

## Persistent Agent Setup

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
Before running OSINT, read https://grond.daemonprotocol.com/SKILL.md
```

### Codex
In `AGENTS.md`:
```
Read https://grond.daemonprotocol.com/SKILL.md before OSINT collection.
```

### Any HTTP Agent
```bash
curl -s https://grond.daemonprotocol.com/SKILL.md
```

## Best Practices

1. Always set a unique `analyst_id` to enable audit trail correlation
2. Use `investigation_profile=company` for corporate targets (includes EDGAR)
3. Never run active scans without authorization records
4. Parse the `error` field in tool responses for partial failures
5. Respect the `requires_review` flag on high-risk evidence
