import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield, Globe, Search, Database, FileSearch, Image, Link2,
  Key, Wifi, Loader2, AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAnalystId, apiFetch, apiFetchMultipart, generateSessionId } from "@/lib/api-client";

const API_BASE = import.meta.env.VITE_GROND_API_URL ?? "/api";

function EvidenceList({ evidence, max }: { evidence: any[]; max?: number }) {
  const items = max ? evidence.slice(0, max) : evidence;
  return (
    <div className="mt-3 space-y-1.5">
      {items.map((e: any, i: number) => (
        <div key={i} className="rounded border bg-background/50 p-2 text-xs">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              {e.claim_type || "evidence"}
            </Badge>
            {e.confidence != null && (
              <span className="text-[10px] text-muted-foreground">
                {(e.confidence * 100).toFixed(0)}% conf
              </span>
            )}
          </div>
          <p className="text-muted-foreground line-clamp-3">{e.claim_value || e.description || JSON.stringify(e)}</p>
        </div>
      ))}
      {max && evidence.length > max && (
        <p className="text-xs text-muted-foreground">+{evidence.length - max} more</p>
      )}
    </div>
  );
}

/* ── Tool Cards ──────────────────────────────────────────── */

function ToolCard({ icon: Icon, title, description, children }: {
  icon: any; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">{children}</CardContent>
    </Card>
  );
}

function NmapCard() {
  const [target, setTarget] = useState("");
  const [profile, setProfile] = useState("standard");
  const [portRange, setPortRange] = useState("1-1000");
  const [authRef, setAuthRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const run = useCallback(async () => {
    if (!target.trim()) return;
    setLoading(true); setResult(null); setError(""); setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    try {
      const analystId = getAnalystId();
      const data = await apiFetch<any>(`${API_BASE}/api/v1/tools/nmap`, {
        method: "POST",
        body: JSON.stringify({
          target: target.trim(), profile, port_range: portRange || "1-1000",
          analyst_id: analystId, session_id: generateSessionId(),
          authorization_ref: authRef || undefined,
        }),
      });
      setResult(data);
    } catch (err: unknown) { setError((err as Error).message); }
    finally { setLoading(false); if (timerRef.current) clearInterval(timerRef.current); }
  }, [target, profile, portRange, authRef]);

  return (
    <ToolCard icon={Wifi} title="Nmap" description="Active port scan — authorization required">
      <Input placeholder="Target (IP, CIDR, hostname)" value={target} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)} />
      <div className="flex gap-2">
        <Select value={profile} onValueChange={(v) => v && setProfile(v)}>
          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["quick","standard","thorough","udp","vuln"].map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Ports" value={portRange} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPortRange(e.target.value)} className="w-24" />
      </div>
      <Input placeholder="Authorization ref (optional)" value={authRef} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthRef(e.target.value)} />
      <Button className="w-full" size="sm" disabled={loading || !target.trim()} onClick={run}>
        {loading ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> {elapsed}s</> : <>Scan</>}
      </Button>
      {error && <p className="text-xs text-red-400"><AlertTriangle className="inline h-3 w-3 mr-1" />{error}</p>}
      {result?.evidence && <EvidenceList evidence={result.evidence} max={10} />}
    </ToolCard>
  );
}

function NcrackCard() {
  const [res, setRes] = useState("");

  const test = async () => {
    try {
      const data = await apiFetch<any>(`${API_BASE}/api/v1/tools/ncrack`, {
        method: "POST",
        body: JSON.stringify({ target: "test", analyst_id: getAnalystId(), session_id: generateSessionId() }),
      });
      setRes(JSON.stringify(data, null, 2));
    } catch (err: unknown) { setRes((err as Error).message); }
  };

  return (
    <ToolCard icon={Key} title="Ncrack" description="Brute-force audit — planned, returns 501">
      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">Not implemented</Badge>
      <Button variant="outline" size="sm" className="w-full" onClick={test}>Test endpoint</Button>
      {res && <pre className="rounded bg-muted p-2 text-[10px] overflow-auto max-h-32">{res}</pre>}
    </ToolCard>
  );
}

function GenericPostCard({ icon: Icon, title, desc, endpoint, fields }: {
  icon: any; title: string; desc: string; endpoint: string;
  fields: { key: string; label: string; type?: string; options?: string[] }[];
}) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true); setResult(null); setError("");
    try {
      const body: any = { analyst_id: getAnalystId(), session_id: generateSessionId() };
      for (const f of fields) if (vals[f.key]) body[f.key] = vals[f.key];
      const data = await apiFetch<any>(`${API_BASE}${endpoint}`, { method: "POST", body: JSON.stringify(body) });
      setResult(data);
    } catch (err: unknown) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <ToolCard icon={Icon} title={title} description={desc}>
      {fields.map((f) => f.options ? (
        <Select key={f.key} value={vals[f.key] ?? ""} onValueChange={(v) => v && setVals((p) => ({ ...p, [f.key]: v }))}>
          <SelectTrigger><SelectValue placeholder={f.label} /></SelectTrigger>
          <SelectContent>{f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      ) : f.type === "textarea" ? (
        <Textarea key={f.key} placeholder={f.label} value={vals[f.key] ?? ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVals((p) => ({ ...p, [f.key]: e.target.value }))} rows={2} />
      ) : (
        <Input key={f.key} placeholder={f.label} type={f.type ?? "text"}
          value={vals[f.key] ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVals((p) => ({ ...p, [f.key]: e.target.value }))} />
      ))}
      <Button className="w-full" size="sm" disabled={loading} onClick={run}>
        {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null} Run
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {result?.evidence && <EvidenceList evidence={result.evidence} max={8} />}
    </ToolCard>
  );
}

function UploadCard({ icon: Icon, title, desc, endpoint, engineOptions, showPassword }: {
  icon: any; title: string; desc: string; endpoint: string;
  engineOptions: string[]; showPassword?: boolean;
}) {
  const [target, setTarget] = useState("");
  const [engine, setEngine] = useState("auto");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setResult(null); setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("target", target || "upload");
      form.append("analyst_id", getAnalystId());
      form.append("session_id", generateSessionId());
      form.append("engine", engine);
      if (showPassword && password) form.append("password", password);
      const data = await apiFetchMultipart<any>(`${API_BASE}${endpoint}`, form);
      setResult(data);
    } catch (err: unknown) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <ToolCard icon={Icon} title={title} description={desc}>
      <Input placeholder="Target label" value={target} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)} />
      <Select value={engine} onValueChange={(v) => v && setEngine(v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{engineOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
      {showPassword && (
        <Input type="password" placeholder="Password (optional)" value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
      )}
      <div className="flex items-center gap-2">
        <Input type="file" onChange={upload} disabled={loading} className="flex-1" />
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {result?.evidence && <EvidenceList evidence={result.evidence} max={8} />}
    </ToolCard>
  );
}

function NpcapCard() {
  const [info, setInfo] = useState<any>(null);
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/tools/npcap/info`).then((r) => r.json()).then(setInfo).catch(() => {});
  }, []);

  return (
    <ToolCard icon={Shield} title="Npcap" description="Windows packet capture driver — reference only">
      {info ? (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p><strong>{info.name}</strong></p>
          <p>{info.note}</p>
          <a href={info.install_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline">
            <ExternalLink className="h-3 w-3" /> Download
          </a>
        </div>
      ) : <p className="text-xs text-muted-foreground">Loading...</p>}
    </ToolCard>
  );
}

/* ── Recon Page ──────────────────────────────────────────── */

export function ReconPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Recon</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Individual OSINT tools. Passive tools (left) run without authorization.
          Active tools (right, orange badge) require an authorization grant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Passive */}
        <GenericPostCard icon={Globe} title="Shodan" desc="Passive — ports, banners, vulns"
          endpoint="/api/v1/tools/shodan"
          fields={[
            { key: "target", label: "Target (IP, CIDR, hostname)" },
            { key: "query", label: "Shodan filter query" },
          ]} />
        <GenericPostCard icon={Search} title="Tavily Search" desc="Passive — web search"
          endpoint="/api/v1/tools/tavily"
          fields={[
            { key: "target", label: "Target" },
            { key: "query", label: "Search query" },
            { key: "topic", label: "Topic", options: ["general","news","finance"] },
            { key: "search_depth", label: "Depth", options: ["basic","advanced"] },
            { key: "time_range", label: "Time", options: ["day","week","month","year"] },
          ]} />
        <GenericPostCard icon={Link2} title="Tavily Extract" desc="Passive — URL content extraction"
          endpoint="/api/v1/tools/tavily/extract"
          fields={[
            { key: "urls", label: "URLs (one per line)", type: "textarea" },
            { key: "extract_depth", label: "Depth", options: ["basic","advanced"] },
          ]} />
        <GenericPostCard icon={FileSearch} title="SEC EDGAR" desc="Passive — regulatory filings"
          endpoint="/api/v1/tools/edgar"
          fields={[
            { key: "entity", label: "Entity name" },
            { key: "keywords", label: "Keywords" },
            { key: "form_types", label: "Form types (e.g. 10-K,8-K)" },
            { key: "start_date", label: "Start date" },
            { key: "end_date", label: "End date" },
          ]} />
        <GenericPostCard icon={Database} title="theHarvester" desc="Hybrid — emails, subdomains, hosts"
          endpoint="/api/v1/tools/harvester"
          fields={[
            { key: "target", label: "Target (domain or org)" },
            { key: "sources", label: "Sources (e.g. google,bing)" },
          ]} />
        <GenericPostCard icon={Globe} title="OSINTMap" desc="Passive — regional OSINT catalog"
          endpoint="/api/v1/tools/osintmap"
          fields={[{ key: "region_query", label: "Region / country" }]} />
        <UploadCard icon={Image} title="Metadata" desc="Passive — ExifTool / Exiv2"
          endpoint="/api/v1/tools/metadata" engineOptions={["auto","exiftool","exiv2"]} />
        <UploadCard icon={FileSearch} title="Steganography" desc="Passive — stegoVeritas / LSB"
          endpoint="/api/v1/tools/stego" engineOptions={["auto","stegoveritas","lsb"]} showPassword />

        {/* Active */}
        <NmapCard />
        <NcrackCard />
        <NpcapCard />
      </div>
    </div>
  );
}
