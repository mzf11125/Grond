---
name: grond-evidence
description: >
  Canonical Evidence model — 4-component confidence formula, 22 claim types,
  5 source reliability tiers, conflict preservation, review gating.
---

# Grond Evidence Model

## Confidence Formula

```
C = (w_s × source_reliability) + (w_c × cross_source_agreement)
  + (w_t × freshness) + (w_e × evidence_completeness)

Weights:
  w_s = 0.40  (provenance quality matters most)
  w_c = 0.25  (cross-source corroboration)
  w_t = 0.20  (exponential decay with age)
  w_e = 0.15  (fraction of expected fields populated)
```

## Claim Types (22)

| Type | Description |
|------|-------------|
| `open_port` | Network port found open |
| `service_banner` | Service version/name exposed |
| `vulnerability` | CVE or security finding |
| `hostname` | Hostname associated with target |
| `asn` | Autonomous System Number info |
| `geolocation` | Physical location data |
| `web_mention` | Web search/source mention |
| `social_profile` | Social media account |
| `company_info` | Corporate/organization data |
| `credential_exposure` | Leaked credentials (always flagged for review) |
| `certificate` | TLS/SSL certificate data |
| `dns_record` | DNS record discovery |
| `whois` | Domain registration data |
| `tech_stack` | Technology stack fingerprinting |
| `social_post` | Specific social media post |
| `hashtag_activity` | Hashtag campaign/trend data |
| `account_network` | Social account interaction graph |
| `media_mention` | Tweet with image/video evidence |
| `subdomain` | Subdomain discovered |
| `email_discovery` | Email address found (PII-sensitive) |
| `file_metadata` | Uploaded artifact metadata |
| `steganography` | Hidden data detected |
| `stego_embedded` | Extracted embedded payload |

## Source Reliability Tiers

| Tier | Weight | Examples |
|------|--------|----------|
| OFFICIAL | 1.0 | Government databases, EDGAR filings |
| REGULATOR | 0.95 | NVD/CVE, CERT advisories |
| MEDIA | 0.70 | News outlets, press releases |
| COMMUNITY | 0.50 | GitHub, forums, social media |
| ANONYMOUS | 0.20 | Uncategorized, pastebins, dark web |

## Tool-Level Reliability Multipliers

| Tool | Weight |
|------|--------|
| Nmap | 0.95 |
| EDGAR | 0.88 |
| Shodan | 0.85 |
| stegoVeritas | 0.78 |
| ExifTool / Exiv2 | 0.72 |
| Tavily | 0.70 |
| theHarvester | 0.55 |
| OSINTMap | 0.52 |
| Twitter | 0.50 |

## Review Gating

Evidence flagged `requires_review=true` when:
- `claim_type == CREDENTIAL_EXPOSURE` (always)
- `VULNERABILITY` with `CVSS >= 9.0`
- Source tier ANONYMOUS and confidence < 0.50
- `conflict_flag == true`
- `STEGANOGRAPHY` or `STEGO_EMBEDDED`
