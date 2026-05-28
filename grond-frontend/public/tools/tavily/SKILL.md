---
name: tavily
description: Tavily web search and URL content extraction
tool_type: passive
api_endpoints:
  - POST /api/v1/tools/tavily (search)
  - POST /api/v1/tools/tavily/extract (extract)
maturity: stable (search) / beta (extract)
---

# Tavily Search & Extract Tools

Web intelligence via Tavily API. Two modes: search (query → snippets)
and extract (URL → clean markdown/text).

## Tavily Search

```
POST /api/v1/tools/tavily
Content-Type: application/json

{
  "target": "example.com",
  "query": "security breach example.com 2024",
  "topic": "general",
  "search_depth": "basic",
  "time_range": "month",
  "max_results": 10,
  "analyst_id": "<uuid>",
  "session_id": "<uuid>"
}
```

Returns search-result snippets as Evidence objects with `WEB_MENTION` type.

## Tavily Extract

```
POST /api/v1/tools/tavily/extract
Content-Type: application/json

{
  "urls": ["https://example.com/page1", "https://example.com/page2"],
  "extract_depth": "basic",
  "analyst_id": "<uuid>",
  "session_id": "<uuid>"
}
```

Batch up to 20 URLs. Returns clean markdown/text per URL as Evidence.

## When to Use

- Ground-truth research about a target
- News/article mentions of a domain or organization
- Social media footprint discovery
- Auto-triggered by the Collector stage on high-value URLs

## Configuration

- Requires `TAVILY_API_KEY`
- `TAVILY_MAX_RESULTS`: 1-20 (default 10)
