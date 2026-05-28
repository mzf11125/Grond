---
name: ncrack
description: Ncrack brute-force audit tool — planned, returns HTTP 501
tool_type: active
api_endpoint: POST /api/v1/tools/ncrack
maturity: planned
status: not_implemented
---

# Ncrack Active Audit Tool

**Not yet implemented.** The API endpoint returns HTTP 501.

## Current Status

```
POST /api/v1/tools/ncrack → 501 Not Implemented
{
  "code": "NCRACK_NOT_IMPLEMENTED",
  "message": "Ncrack is not exposed via Grond API yet."
}
```

## Planned Implementation

When available, Ncrack will:
- Run authorized brute-force audits against network services
- Support SSH, RDP, FTP, HTTP, and other protocols
- Require AuthorizationRecord (matching target + tool=ncrack + analyst_id)
- Return service credential strength assessments as Evidence

## Workaround

Until the adapter is implemented, run Ncrack CLI directly on authorized
engagement workstations. See `recon/build.sh` for build scripts.

## When Available

P1 on the roadmap — see https://github.com/mzf11125/Grond/blob/main/ROADMAP.md
