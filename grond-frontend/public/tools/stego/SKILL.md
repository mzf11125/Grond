---
name: steganography
description: Steganography detection — stegoVeritas multi-method + pure-Python LSB fallback
tool_type: passive
api_endpoint: POST /api/v1/tools/stego (multipart/form-data)
maturity: stable
---

# Steganography Analysis Tool

Detect hidden data in images and other files using stegoVeritas
(comprehensive multi-method) and a pure-Python LSB extraction fallback.

## API

```
POST /api/v1/tools/stego
Content-Type: multipart/form-data

Fields:
  file: <binary>
  target: "investigation-001"
  analyst_id: "<uuid>"
  session_id: "<uuid>"
  engine: "auto"      # auto | stegoveritas | lsb
  password: ""        # optional password for extraction
```

## Output

Evidence types: `STEGANOGRAPHY` (detection), `STEGO_EMBEDDED` (extracted
payload). Output is always flagged `requires_review=true`.

## Engines

| Engine | Method | Weight |
|--------|--------|--------|
| `stegoveritas` | Multi-method (LSB, chi-square, histogram, etc.) | 0.78 |
| `lsb` | Pure-Python LSB extraction fallback | 0.55 |
| `auto` | stegoVeritas, then LSB fallback | — |

## Configuration

- `STEGOVERITAS_BIN=stegoveritas` — install via pip
- `STEGO_MAX_UPLOAD_BYTES=52428800` (~50 MiB)
- Timeout: 300 seconds

## Ethics

Analyst must only upload material they are authorized to analyze.
All stego findings are review-gated.
