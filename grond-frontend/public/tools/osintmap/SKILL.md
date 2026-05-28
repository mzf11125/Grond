---
name: osintmap
description: OSINTMap — cipher387 worldwide curated OSINT resource catalog
tool_type: passive
api_endpoint: POST /api/v1/tools/osintmap
maturity: stable
---

# OSINTMap Tool

Passive lookup in cipher387's worldwide curated OSINT link table.
Fetches the upstream README from GitHub and returns matching rows
for a given region/country.

## API

```
POST /api/v1/tools/osintmap
Content-Type: application/json

{
  "region_query": "Indonesia",
  "max_rows": 50,
  "analyst_id": "<uuid>",
  "session_id": "<uuid>"
}
```

## Output

Evidence type: `WEB_MENTION`. Each row is a curated OSINT resource link
(government databases, business registries, court records, etc.) for
the specified region.

## When to Use

- Regional OSINT resource discovery
- Finding country-specific public records
- Part of `investigation_profile=company` scan
