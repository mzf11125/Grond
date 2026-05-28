---
name: grond-authorization
description: >
  Active scan authorization model — matching rules, grant sources,
  HITL flow, admin API. Passive tools require no authorization.
---

# Grond Authorization Model

## Tool Classification

| Type | Tools | Authorization Required |
|------|-------|----------------------|
| **Passive** | Shodan, Tavily, EDGAR, OSINTMap, Twitter, Metadata, Steganography | No |
| **Active** | Nmap, Ncrack, theHarvester (active mode) | Yes — AuthorizationRecord required |

## Matching Rules (evaluated in order)

1. **Exact IP / hostname match** (hostnames case-insensitive)
2. **CIDR range containment** — both sides parsable as IP/network
3. **Hostname scope** — `customer.test` matches `api.customer.test` (parent → subdomain suffix)
4. **Wildcard host** — `*.customer.test` matches subdomains only, not the apex
5. **Tool wildcard** — `tool="*"` matches any tool
6. **Analyst wildcard** — `analyst_id="*"` matches any analyst (limited use)
7. **Expiry** — expired records rejected

## Grant Sources

| Source | Scope |
|--------|-------|
| `GROND_AUTHORIZED_SCAN_TARGETS` env var (CSV) | Dev/staging; analyst_id=*, tool=nmap |
| PostgreSQL `grond_active_scan_authorization` table | Production; loaded at startup + admin API |
| `POST /api/v1/admin/active-scan-authorizations` | Workflow automation after approval |

## Admin API

```
POST /api/v1/admin/active-scan-authorizations
Header: X-Grond-Authorization-Admin-Key: <admin-key>

Body:
{
  "target": "scanme.nmap.org",
  "analyst_id": "agent-001",
  "tool": "nmap",
  "legal_ref": "SOW-2024-001 §3.2",
  "notes": "Authorized per engagement contract",
  "expires_at": "2026-06-01T00:00:00Z"
}
```

Requires `GROND_AUTHORIZATION_ADMIN_KEY` to be set in server environment.

## HITL (Human-in-the-Loop)

When `run_nmap=true`, the LangGraph planner calls `interrupt()` before
collection. The synchronous `POST /api/v1/scan` cannot resume this —
production deployments must use a checkpoint-resume flow via the
TypeScript orchestration layer (BullMQ worker).

For local development:
- `GROND_DEV_BYPASS_NMAP_HITL=true` with `ENVIRONMENT=development`
- Lists targets in `GROND_AUTHORIZED_SCAN_TARGETS`
