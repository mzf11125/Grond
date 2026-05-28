---
name: file-metadata
description: File metadata extraction via ExifTool and Exiv2 — Exif, IPTC, XMP
tool_type: passive
api_endpoint: POST /api/v1/tools/metadata (multipart/form-data)
maturity: stable
---

# File Metadata Tool

Extract metadata from uploaded files using ExifTool (broad format support)
and/or Exiv2 (specialized image Exif/IPTC/XMP).

## API

```
POST /api/v1/tools/metadata
Content-Type: multipart/form-data

Fields:
  file: <binary>
  target: "investigation-001"
  analyst_id: "<uuid>"
  session_id: "<uuid>"
  engine: "auto"     # auto | exiftool | exiv2
```

## Output

Evidence type: `FILE_METADATA`. Returns structured metadata fields
including camera info, GPS coordinates, timestamps, software traces,
document author, and more.

## Engines

| Engine | Coverage | Setup |
|--------|----------|-------|
| `exiftool` | Broad (images, documents, audio, video) | `apt install exiftool` |
| `exiv2` | Image-specific (Exif/IPTC/XMP) | `apt install exiv2` |
| `auto` | Exiv2 first, ExifTool fallback | Both required |

## Configuration

- `EXIFTOOL_BIN=exiftool`, `EXIV2_BIN=exiv2`
- `METADATA_MAX_UPLOAD_BYTES=52428800` (~50 MiB)
- Timeout: 120 seconds per engine

## Ethics

Analyst must only upload material they are authorized to hold and analyze.
No authorization gate on the API — passive trust model.
