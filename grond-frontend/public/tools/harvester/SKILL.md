---
name: theharvester
description: theHarvester OSINT — emails, subdomains, hosts, IPs from public sources
tool_type: hybrid (passive-first, active on request)
api_endpoint: POST /api/v1/tools/harvester
maturity: experimental
---

# theHarvester OSINT Tool

Wrapper around laramies/theHarvester CLI. Collects emails, subdomains,
hostnames, IPs, and URLs from public sources (search engines, DNS, PGP).

## API

```
POST /api/v1/tools/harvester
Content-Type: application/json

{
  "target": "example.com",
  "sources": "google,bing,linkedin",
  "limit": 500,
  "analyst_id": "<uuid>",
  "session_id": "<uuid>"
}
```

## Output

Evidence types: SUBDOMAIN, EMAIL_DISCOVERY, HOST_DISCOVERY, SOCIAL_PROFILE.

## Notes

- **Experimental** — CLI subprocess wrapper
- Passive by default; active sources require authorization
- Requires theHarvester installed on server PATH
- Some sources require API keys in `~/.theHarvester/api-keys.yaml`

## Security

- Input validation: domain/organization arguments are regex-validated
- Subprocess uses argument-list invocation (no `shell=True`)
- P1 audit planned for CLI injection hardening
