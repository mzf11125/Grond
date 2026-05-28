import { useState, useCallback } from "react";
import { Plus, Play, CheckCircle2, XCircle, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAnalystId, apiFetch, generateSessionId } from "@/lib/api-client";
import type { TavilySearchOutput } from "@/lib/types";

const API_BASE = import.meta.env.VITE_GROND_API_URL ?? "/api";

interface Row {
  id: string;
  entity: string;
  prompt: string;
  status: "idle" | "loading" | "done" | "error";
  result?: TavilySearchOutput;
  error?: string;
  selected: boolean;
}

function emptyRow(): Row {
  return { id: crypto.randomUUID(), entity: "", prompt: "", status: "idle", selected: false };
}

export function DatasheetPage() {
  const [rows, setRows] = useState<Row[]>([
    { ...emptyRow(), entity: "example.com", prompt: "What technology stack does this use?" },
  ]);
  const [enriching, setEnriching] = useState(false);

  const doneCount = rows.filter((r) => r.status === "done").length;
  const totalSelected = rows.filter((r) => r.selected && r.status !== "done").length;

  const updateRow = useCallback((id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const addRow = () => setRows((p) => [...p, emptyRow()]);
  const removeSelected = () => setRows((p) => p.filter((r) => !r.selected));

  const selectAll = rows.length > 0 && rows.every((r) => r.selected);

  const toggleAll = () => {
    const val = !selectAll;
    setRows((p) => p.map((r) => ({ ...r, selected: val })));
  };

  const enrichSelected = async () => {
    const toEnrich = rows.filter((r) => r.selected && r.status !== "done");
    if (toEnrich.length === 0) return;
    setEnriching(true);

    for (const row of toEnrich) {
      updateRow(row.id, { status: "loading", error: undefined });
      try {
        const data = await apiFetch<TavilySearchOutput>(`${API_BASE}/api/v1/tools/tavily`, {
          method: "POST",
          body: JSON.stringify({
            target: row.entity.trim() || "unknown",
            query: row.prompt.trim() || "general information",
            analyst_id: getAnalystId(),
            session_id: generateSessionId(),
          }),
        });
        updateRow(row.id, { status: "done", result: data, selected: false });
      } catch (err: unknown) {
        updateRow(row.id, { status: "error", error: (err as Error).message });
      }
    }
    setEnriching(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Datasheet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enrich entities with OSINT data. Enter targets and prompts, then run enrichment.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={addRow}><Plus className="mr-1 h-3 w-3" /> Add Row</Button>
        <Button size="sm" variant="outline" disabled={enriching || totalSelected === 0}
          onClick={enrichSelected}>
          {enriching ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Play className="mr-1 h-3 w-3" />}
          Enrich {totalSelected > 0 ? `(${totalSelected})` : ""}
        </Button>
        <Button size="sm" variant="ghost" disabled={enriching}
          onClick={() => setRows([emptyRow()])}>Clear</Button>
        <Button size="sm" variant="ghost" disabled={enriching}
          onClick={removeSelected}>Remove</Button>
        {doneCount > 0 && (
          <Badge variant="secondary">{doneCount}/{rows.length} enriched</Badge>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="min-w-[600px]">
          <div className="mb-2 grid grid-cols-[40px_1fr_1fr_80px] gap-2 px-1 text-xs font-medium text-muted-foreground">
            <div className="flex items-center">
              <input type="checkbox" checked={selectAll} onChange={toggleAll}
                className="h-3.5 w-3.5 rounded border-gray-600" />
            </div>
            <span>Entity</span>
            <span>Prompt</span>
            <span>Status</span>
          </div>

          {rows.map((row) => (
            <div key={row.id} className="mb-1">
              <div className="grid grid-cols-[40px_1fr_1fr_80px] gap-2 rounded border bg-card p-2">
                <div className="flex items-center">
                  <input type="checkbox" checked={row.selected}
                    onChange={() => updateRow(row.id, { selected: !row.selected })}
                    className="h-3.5 w-3.5 rounded border-gray-600" />
                </div>
                <Input value={row.entity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRow(row.id, { entity: e.target.value })}
                  placeholder="Target entity" className="h-8 text-xs" />
                <Input value={row.prompt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRow(row.id, { prompt: e.target.value })}
                  placeholder="What to search for" className="h-8 text-xs" />
                <div className="flex items-center">
                  {row.status === "idle" && <Badge variant="outline" className="text-xs">Idle</Badge>}
                  {row.status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {row.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {row.status === "error" && (
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-[10px] text-red-400" title={row.error}>Error</span>
                    </div>
                  )}
                </div>
              </div>
              {row.result?.evidence && row.result.evidence.length > 0 && (
                <div className="mx-2 rounded-b border-x border-b bg-muted/30 p-2">
                  <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                    Top results ({row.result.evidence.length} found)
                  </p>
                  {row.result.evidence.slice(0, 3).map((e: any, i: number) => (
                    <div key={i} className="mb-1 rounded bg-background/50 p-1.5 text-[11px]">
                      <p className="line-clamp-2 text-muted-foreground">
                        {e.claim_value || e.description || "No description"}
                      </p>
                      {e.provenance?.url && (
                        <a href={e.provenance.url} target="_blank" rel="noopener noreferrer"
                          className="text-primary/70 hover:underline text-[10px]">
                          {new URL(e.provenance.url).hostname}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {rows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Database className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No data yet</p>
              <p className="text-xs text-muted-foreground">Add rows and enrich them with OSINT data.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={addRow}>
                <Plus className="mr-1 h-3 w-3" /> Add Row
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
