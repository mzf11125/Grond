---
name: shodan
description: Passive Shodan reconnaissance — ports, banners, vulns, ASN, geo
tool_type: passive
api_endpoint: POST /api/v1/tools/shodan
maturity: stable
---

# Shodan OSINT Tool

Passive reconnaissance against IP addresses, CIDR ranges, or hostnames
using the Shodan API. Returns open ports, service banners, CVE
vulnerabilities, ASN organization, and geolocation data.

## API

```
POST /api/v1/tools/shodan
Content-Type: application/json

{
  "target": "1.1.1.1",
  "query": "port:443",
  "analyst_id": "<uuid>",
  "session_id": "<uuid>",
  "max_results": 100
}
```

## Output

Returns `{"evidence": [...], "error": null}`. Each evidence item includes:
- `claim_type`: OPEN_PORT, SERVICE_BANNER, VULNERABILITY, HOSTNAME, ASN, GEOLOCATION
- `claim_value`: e.g. "443/tcp open HTTPS"
- `confidence`: 0-1 score using Shodan's 0.85 tool weight
- `provenance`: URL, timestamp, raw response

## Configuration

- Requires `SHODAN_API_KEY` in server environment
- Rate limited to 1 request/second (configurable via `SHODAN_RATE_LIMIT_RPS`)

## When to Use

- Initial reconnaissance on unknown IP/CIDR
- Service enumeration before Nmap (no auth needed)
- CVE scanning against known services
- Part of `investigation_profile=general` or `company` scan
