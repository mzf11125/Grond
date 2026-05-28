---
name: sec-edgar
description: SEC EDGAR full-text search via Bellingcat edgar-tool — regulatory filings
tool_type: passive
api_endpoint: POST /api/v1/tools/edgar
maturity: stable
---

# SEC EDGAR Full-Text Search

Search US SEC EDGAR regulatory filings using the Bellingcat `edgar-tool`.
Free, no API key required. Covers 10-K, 10-Q, 8-K, S-1, and more.

## API

```
POST /api/v1/tools/edgar
Content-Type: application/json

{
  "entity": "Example Corp",
  "keywords": "cybersecurity breach",
  "form_types": "10-K,8-K",
  "start_date": "2020-01-01",
  "end_date": "2025-12-31",
  "analyst_id": "<uuid>",
  "session_id": "<uuid>"
}
```

## Output

Evidence type: `COMPANY_INFO`. Each filing returns metadata (CIK, filing date,
form type) and matching text snippets.

## When to Use

- Corporate due diligence on US-listed companies
- Investigative research on public company disclosures
- Part of `investigation_profile=company` scan

## Notes

- Follows SEC fair-access / rate guidelines
- No API key required
- Source weight: 0.88 (REGULATOR tier)
