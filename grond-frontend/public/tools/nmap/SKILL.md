---
name: nmap
description: Authorized Nmap active scanning — 5 scan profiles, port/version/OS detection
tool_type: active
api_endpoint: POST /api/v1/tools/nmap
maturity: stable
authorization: required
---

# Nmap Active Scan Tool

**Authorization required.** Must have matching AuthorizationRecord
(target + tool=nmap + analyst_id) before scan runs.

## API

```
POST /api/v1/tools/nmap
Content-Type: application/json

{
  "target": "scanme.nmap.org",
  "profile": "standard",
  "port_range": "1-1000",
  "analyst_id": "<uuid>",
  "session_id": "<uuid>",
  "authorization_ref": "SOW-2024-001"
}
```

## Scan Profiles

| Profile | Flags | Use Case |
|---------|-------|----------|
| `quick` | `-T4 -F` | Fast top-100 port scan |
| `standard` | `-sV -sC` | Version detection + default scripts |
| `thorough` | `-sV -sC -O -A` | Full service/OS/script scan |
| `udp` | `-sU -F` | Top UDP ports |
| `vuln` | `-sV --script=vuln` | Vulnerability script scan |

## Output

Returns `{"evidence": [...], "scan_stats": {...}, "error": null}`.
Evidence types: OPEN_PORT, SERVICE_BANNER, HOSTNAME, VULNERABILITY.

## Authorization

Before running Nmap:

1. Ensure target has an AuthorizationRecord (via admin API or env grants)
2. Set `analyst_id` matching the grant
3. For production: complete HITL approval via orchestration layer
4. For dev: `GROND_DEV_BYPASS_NMAP_HITL=true` with `ENVIRONMENT=development`

See https://grond.daemonprotocol.com/authorization/SKILL.md for full auth model.

## Configuration

- `NMAP_DEFAULT_TIMEOUT_SECONDS=300` (max 1800)
- Requires `python-nmap` library
- Nmap binary must be on server PATH
