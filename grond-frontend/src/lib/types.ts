import { z } from "zod";

export const EvidenceSchema = z.object({
  claim_type: z.string().optional(),
  claim_value: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  source_tier: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  cross_verified: z.boolean().optional(),
  conflict_flag: z.boolean().optional(),
  requires_review: z.boolean().optional(),
  risk_level: z.string().optional(),
  cvss_score: z.number().optional(),
  provenance: z
    .object({
      url: z.string().optional(),
      raw_snippet: z.string().optional(),
      collected_at: z.string().optional(),
      extractor: z.string().optional(),
    })
    .optional(),
}).passthrough();

export const ReportFindingSchema = z.object({
  claim_type: z.string().optional(),
  claim_value: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  risk_level: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  cross_verified: z.boolean().optional(),
  conflict_flag: z.boolean().optional(),
  requires_review: z.boolean().optional(),
  evidence: z.array(EvidenceSchema).optional(),
}).passthrough();

export const ReportSectionSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  findings: z.array(ReportFindingSchema).optional(),
});

export const IntelReportSchema = z.object({
  scan_id: z.string().optional(),
  target: z.string().optional(),
  executive_summary: z.string().optional(),
  key_takeaways: z.array(z.string()).optional(),
  risk_level: z.string().optional(),
  sections: z.array(ReportSectionSchema).optional(),
  findings: z.array(ReportFindingSchema).optional(),
  generated_at: z.string().optional(),
}).passthrough();

export type Evidence = z.infer<typeof EvidenceSchema>;
export type ReportFinding = z.infer<typeof ReportFindingSchema>;
export type ReportSection = z.infer<typeof ReportSectionSchema>;
export type IntelReport = z.infer<typeof IntelReportSchema>;

export const ShodanOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  error: z.string().nullable(),
});

export const NmapOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  scan_stats: z.record(z.string(), z.unknown()).optional(),
  error: z.string().nullable(),
});

export const TavilySearchOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  error: z.string().nullable(),
});

export const TavilyExtractOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  error: z.string().nullable(),
});

export const EdgarOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  error: z.string().nullable(),
});

export const OsintmapOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  error: z.string().nullable(),
});

export const HarvesterOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  error: z.string().nullable(),
});

export const MetadataOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  error: z.string().nullable(),
});

export const StegoOutputSchema = z.object({
  evidence: z.array(EvidenceSchema),
  error: z.string().nullable(),
});

export type ShodanOutput = z.infer<typeof ShodanOutputSchema>;
export type NmapOutput = z.infer<typeof NmapOutputSchema>;
export type TavilySearchOutput = z.infer<typeof TavilySearchOutputSchema>;
