import { useState, useEffect } from "react";
import { Activity, Shield, Key, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_GROND_API_URL ?? "/api";

function HealthCard() {
  const [status, setStatus] = useState<"ok" | "error" | "loading">("loading");
  const [json, setJson] = useState("");

  useEffect(() => {
    const check = async () => {
      setStatus("loading");
      try {
        const res = await fetch(`${API_BASE}/api/v1/health`);
        const data = await res.json();
        if (res.ok) { setStatus("ok"); setJson(JSON.stringify(data, null, 2)); }
        else { setStatus("error"); setJson(JSON.stringify(data)); }
      } catch { setStatus("error"); setJson("Connection failed"); }
    };
    check();
    const i = setInterval(check, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          API Health
        </CardTitle>
        <CardDescription className="text-xs">Checks every 30s</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("h-2.5 w-2.5 rounded-full",
            status === "ok" && "bg-green-500",
            status === "error" && "bg-red-500",
            status === "loading" && "animate-pulse bg-yellow-500",
          )} />
          <span className="text-sm font-medium">
            {status === "ok" ? "Online" : status === "error" ? "Offline" : "Checking"}
          </span>
        </div>
        <pre className="rounded bg-muted p-2 text-[10px] max-h-48 overflow-auto">{json}</pre>
      </CardContent>
    </Card>
  );
}

function AuthGrantCard() {
  const [target, setTarget] = useState("");
  const [tool, setTool] = useState("nmap");
  const [analystId, setAnalystId] = useState("*");
  const [legalRef, setLegalRef] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; id?: string; message?: string } | null>(null);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!target.trim() || !adminKey.trim()) return;
    setLoading(true); setResult(null); setError("");
    try {
      const data = await apiFetch<any>(`${API_BASE}/api/v1/admin/active-scan-authorizations`, {
        method: "POST",
        body: JSON.stringify({
          target: target.trim(), tool, analyst_id: analystId.trim() || "*",
          legal_ref: legalRef.trim(), notes: notes.trim(),
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
        headers: { "X-Grond-Authorization-Admin-Key": adminKey, "Content-Type": "application/json" },
      });
      setResult(data);
    } catch (err: unknown) { setError((err as Error).message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" /> Authorization Grant
        </CardTitle>
        <CardDescription className="text-xs">
          Create an active-scan authorization record. Requires admin key.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Target (IP, CIDR, hostname) *" value={target}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)} />
        <Select value={tool} onValueChange={(v) => v && setTool(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["nmap","ncrack","theharvester","*"].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Analyst ID (default: *)" value={analystId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnalystId(e.target.value)} />
        <Input placeholder="Legal ref (e.g. SOW-001 §3.2)" value={legalRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLegalRef(e.target.value)} />
        <Textarea placeholder="Notes" value={notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)} rows={2} />
        <Input type="datetime-local" value={expiresAt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)} />
        <div className="flex items-center gap-1.5">
          <Key className="h-3.5 w-3.5 text-muted-foreground" />
          <Input type="password" placeholder="Admin key *" value={adminKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminKey(e.target.value)} />
        </div>
        <Button className="w-full" size="sm" disabled={loading || !target.trim() || !adminKey.trim()}
          onClick={submit}>
          {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null} Submit
        </Button>
        {error && <p className="flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3 w-3" />{error}</p>}
        {result && (
          <div className="rounded border bg-muted/50 p-2 text-xs">
            {result.ok && <Badge className="mb-1 bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />OK</Badge>}
            <pre className="text-[10px]">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform health, authorization grants, and administration.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HealthCard />
        <AuthGrantCard />
      </div>
    </div>
  );
}
