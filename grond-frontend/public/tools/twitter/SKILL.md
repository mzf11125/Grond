---
name: twitter
description: Twitter/X API v2 OSINT — tweets, profiles, media mentions, hashtag activity
tool_type: passive
api_endpoint: POST /api/v1/tools/twitter
maturity: experimental
---

# Twitter/X OSINT Tool

Search recent tweets (free tier) or full archive (academic/pro tier)
via X API v2. Returns social media intelligence as Evidence.

## API

```
POST /api/v1/tools/twitter
Content-Type: application/json

{
  "target": "examplecorp",
  "query": "from:examplecorp OR @examplecorp",
  "time_range": "week",
  "max_results": 100,
  "analyst_id": "<uuid>",
  "session_id": "<uuid>"
}
```

## Output

Evidence types: SOCIAL_POST, HASHTAG_ACTIVITY, ACCOUNT_NETWORK,
MEDIA_MENTION, SOCIAL_PROFILE.

## Tiers

| Tier | Scope | Rate |
|------|-------|------|
| Free | Recent tweets (7 days), 1 app / 15-min window | `TWITTER_BEARER_TOKEN` |
| Academic/Pro | Full archive (back to 2006) | Upgrade at developer.twitter.com |

## Configuration

- `TWITTER_BEARER_TOKEN` — X API v2 bearer token
- `TWITTER_MAX_RESULTS` — 10-500 (default 100)

## When to Use

- Social media footprint of individuals/orgs
- Part of `investigation_profile=social` scan
- Monitoring brand mentions or threat actor activity
