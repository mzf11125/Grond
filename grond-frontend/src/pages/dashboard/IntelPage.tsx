import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Loader2,
  ShieldAlert,
  Globe,
  Users,
  Building2,
  Target,
  FileSearch,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getAnalystId, apiFetch, generateSessionId } from "@/lib/api-client";
import type { IntelReport } from "@/lib/types";

const API_BASE = import.meta.env.VITE_GROND_API_URL ?? "/api";

const profiles = [
  { value: "general", label: "General", icon: Globe, desc: "Broad reconnaissance" },
  { value: "company", label: "Company", icon: Building2, desc: "Corporate/organization intel" },
  { value: "social", label: "Social", icon: Users, desc: "Person/social-media intel" },
] as const;

const timeRanges = [
  { value: "day", label: "24h" },
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "year", label: "1 year" },
];

interface ScanEntry {
  id: string;
  type: "query" | "report";
  query?: { target: string; goal: string; profile: string; timeRange?: string; runNmap: boolean };
  report?: IntelReport;
  error?: string;
  loading?: boolean;
}

function IntelReportView({ report }: { report: IntelReport }) {
  return (
    <div className="space-y-4 fade-in-up">
      {report.executive_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSearch className="h-4 w-4" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {report.executive_summary}
            </p>
          </CardContent>
        </Card>
      )}

      {report.key_takeaways && report.key_takeaways.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Takeaways</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {report.key_takeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {report.sections?.map((section, si) => (
        <Card key={si}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
            {section.summary && (
              <p className="text-sm text-muted-foreground">{section.summary}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.findings?.map((finding, fi) => (
                <div key={fi} className="rounded-lg border p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        finding.risk_level === "CRITICAL" && "border-red-500/50 text-red-400",
                        finding.risk_level === "HIGH" && "border-orange-500/50 text-orange-400",
                        finding.risk_level === "MEDIUM" && "border-yellow-500/50 text-yellow-400",
                        finding.risk_level === "LOW" && "border-blue-500/50 text-blue-400",
                      )}
                    >
                      {finding.risk_level}
                    </Badge>
                    {finding.confidence != null && (
                      <span className="text-xs text-muted-foreground">
                        Confidence: {(finding.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                    {finding.cross_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                    {finding.conflict_flag && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Conflict
                      </Badge>
                    )}
                    {finding.requires_review && (
                      <Badge variant="outline" className="border-yellow-500/50 text-xs text-yellow-400">
                        Review
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{finding.claim_value || finding.description}</p>
                  {finding.source && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Source: {finding.source}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UserQueryBubble({ entry }: { entry: ScanEntry }) {
  return (
    <div className="mb-4 rounded-lg border bg-card/50 p-3">
      <div className="mb-1 text-xs font-medium text-muted-foreground">Investigation</div>
      <p className="text-sm font-medium">{entry.query?.goal || "Untitled"}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="text-xs">
          {entry.query?.target}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {entry.query?.profile}
        </Badge>
        {entry.query?.timeRange && (
          <Badge variant="outline" className="text-xs">
            {entry.query.timeRange}
          </Badge>
        )}
        {entry.query?.runNmap && (
          <Badge variant="outline" className="border-orange-500/50 text-xs text-orange-400">
            Nmap
          </Badge>
        )}
      </div>
    </div>
  );
}

export function IntelPage() {
  const [target, setTarget] = useState("");
  const [goal, setGoal] = useState("");
  const [profile, setProfile] = useState<string>("general");
  const [timeRange, setTimeRange] = useState<string>("week");
  const [runNmap, setRunNmap] = useState(false);
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const handleScan = useCallback(async () => {
    if (!target.trim() || !goal.trim()) return;
    const entryId = crypto.randomUUID();
    const queryEntry: ScanEntry = {
      id: entryId,
      type: "query",
      query: { target: target.trim(), goal: goal.trim(), profile, timeRange: timeRange || undefined, runNmap },
    };
    const loadingEntry: ScanEntry = { id: entryId + "-loading", type: "report", loading: true };

    setEntries((prev) => [...prev, queryEntry, loadingEntry]);
    setGoal("");
    setLoading(true);

    try {
      const analystId = getAnalystId();
      const data = await apiFetch<IntelReport>(`${API_BASE}/api/v1/scan`, {
        method: "POST",
        body: JSON.stringify({
          target: target.trim(),
          goal: goal.trim(),
          analyst_id: analystId,
          investigation_profile: profile,
          tavily_time_range: timeRange || undefined,
          run_nmap: runNmap,
          session_id: generateSessionId(),
        }),
      });

      const reportEntry: ScanEntry = { id: entryId + "-report", type: "report", report: data };
      setEntries((prev) => [...prev.filter((e) => e.id !== loadingEntry.id), reportEntry]);

      try {
        const stored = JSON.parse(localStorage.getItem("grond-recent-investigations") ?? "[]");
        stored.unshift({ id: entryId, target: target.trim(), goal: goal.trim(), timestamp: Date.now() });
        localStorage.setItem("grond-recent-investigations", JSON.stringify(stored.slice(0, 20)));
        window.dispatchEvent(new Event("storage"));
      } catch { /* ignore */ }
    } catch (err: unknown) {
      const errorEntry: ScanEntry = {
        id: entryId + "-error",
        type: "report",
          error: (err as Error)?.message || "Unknown error",
      };
      setEntries((prev) => [...prev.filter((e) => e.id !== loadingEntry.id), errorEntry]);
    } finally {
      setLoading(false);
    }
  }, [target, goal, profile, timeRange, runNmap]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Intel</h1>
        <p className="text-sm text-muted-foreground">Run an OSINT investigation with automatic collection, enrichment, verification, and reporting.</p>
      </div>

      <div className="mb-4 space-y-3 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Target (domain, IP, or CIDR)"
            value={target}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
            className="min-w-0 flex-[2]"
            onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleScan()}
          />
          <Select value={profile} onValueChange={(v) => v && setProfile(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <span className="flex items-center gap-1.5">
                    <p.icon className="h-3.5 w-3.5" />
                    {p.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(v) => v && setTimeRange(v)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={runNmap ? "default" : "outline"}
            size="sm"
            className={cn("gap-1.5", runNmap && "bg-orange-600 hover:bg-orange-700")}
            onClick={() => setRunNmap(!runNmap)}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Nmap
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="What are you investigating? (goal / context)"
            value={goal}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoal(e.target.value)}
            className="min-h-[60px] flex-1 resize-none"
            rows={2}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleScan();
              }
            }}
          />
          <Button onClick={handleScan} disabled={loading || !target.trim() || !goal.trim()} className="self-end">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline ml-1">Scan</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No investigations yet</p>
            <p className="text-sm text-muted-foreground">Enter a target and goal above to start your first OSINT scan.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {entries.map((entry) => {
              if (entry.type === "query") return <UserQueryBubble key={entry.id} entry={entry} />;
              if (entry.loading) {
                return (
                  <div key={entry.id} className="space-y-3">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                );
              }
              if (entry.error) {
                return (
                  <Card key={entry.id} className="border-red-500/30 bg-red-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400">{entry.error}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              if (entry.report) return <IntelReportView key={entry.id} report={entry.report} />;
              return null;
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="border-t bg-background p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a follow-up question about this investigation..."
              className="flex-1"
              disabled
            />
            <Button disabled size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Follow-up Q&A coming in v0.3 — for now, start a new investigation above.
          </p>
        </div>
      )}
    </div>
  );
}
