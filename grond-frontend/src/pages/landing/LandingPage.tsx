import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, FileSearch, ArrowRight, ExternalLink, Terminal, Code2, Globe, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Navigation1 from "@/components/blocks/navigation-1";
import { Features1 } from "@/components/blocks/features-1";
import FAQ1 from "@/components/blocks/faq-1";
import CTA1 from "@/components/blocks/cta-1";
import Footer1 from "@/components/blocks/footer-1";

import SilkWaves from "@/components/react-bits/silk-waves";

const skills = [
  { name: "Platform Overview", url: "/SKILL.md", desc: "Master catalog — start here" },
  { name: "Pipeline Architecture", url: "/pipeline/SKILL.md", desc: "Collect → Enrich → Verify → Report" },
  { name: "Evidence Model", url: "/evidence/SKILL.md", desc: "4-component confidence formula" },
  { name: "Authorization Model", url: "/authorization/SKILL.md", desc: "Active scan gating rules" },
  { name: "Agent Integration", url: "/integration/SKILL.md", desc: "How to integrate Grond into your agent" },
  { name: "Shodan", url: "/tools/shodan/SKILL.md", desc: "Passive port/banner/vuln recon" },
  { name: "Nmap", url: "/tools/nmap/SKILL.md", desc: "Active port scan — auth required" },
  { name: "Tavily", url: "/tools/tavily/SKILL.md", desc: "Web search + URL extraction" },
  { name: "theHarvester", url: "/tools/harvester/SKILL.md", desc: "Email/subdomain/host discovery" },
  { name: "SEC EDGAR", url: "/tools/edgar/SKILL.md", desc: "Regulatory filings search" },
  { name: "Twitter/X", url: "/tools/twitter/SKILL.md", desc: "Social media intelligence" },
  { name: "OSINTMap", url: "/tools/osintmap/SKILL.md", desc: "Regional OSINT resources" },
  { name: "Metadata", url: "/tools/metadata/SKILL.md", desc: "ExifTool / Exiv2 file analysis" },
  { name: "Steganography", url: "/tools/stego/SKILL.md", desc: "Hidden data detection" },
  { name: "Ncrack", url: "/tools/ncrack/SKILL.md", desc: "Brute-force audit — planned" },
];

const pipelineSteps = [
  { label: "Collect", desc: "Run 12 tools concurrently via asyncio.gather — partial failure tolerant", color: "bg-violet-500/10 border-violet-500/30" },
  { label: "Enrich", desc: "Resolve CVEs, add GeoIP/ASN/rDNS context from NVD and intelligence feeds", color: "bg-blue-500/10 border-blue-500/30" },
  { label: "Verify", desc: "Deduplicate, cross-reference sources, score confidence, flag conflicts", color: "bg-cyan-500/10 border-cyan-500/30" },
  { label: "Report", desc: "Risk classification → LLM summaries constrained to evidence → IntelReport JSON + PDF", color: "bg-emerald-500/10 border-emerald-500/30" },
];

const agentPrompts = {
  cursor: `---
description: Grond OSINT knowledge pack
alwaysApply: false
---
Before running OSINT, read https://grond.daemonprotocol.com/SKILL.md`,
  codex: `Read https://grond.daemonprotocol.com/SKILL.md and follow it before running OSINT.`,
  claude: `/plugin marketplace add daemon-blockint-tech/grond
/plugin install grond@grond-agent`,
  openclaw: `clawhub install grond`,
  curl: `curl -s https://grond.daemonprotocol.com/SKILL.md`,
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
      {label}
    </Button>
  );
}

export function LandingPage() {
  return (
    <div className="landing-light min-h-screen text-foreground">
      {/* Navigation */}
      <Navigation1 />

      {/* Hero with animated background — no images, pure text + WebGL */}
      <section className="relative overflow-hidden border-b py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 opacity-20">
          <SilkWaves
            speed={0.3}
            scale={2.5}
            colors={["#1a0533", "#2d1b69", "#4a2c8a", "#6b3fa0", "#8b52b8", "#ab65d0", "#cb78e8", "#eb8bff"]}
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            OSINT That Agents<br />
            <span className="text-primary">Can Actually Use</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Grond is an evidence-first open source intelligence platform. 12+ tools,
            deterministic pipelines, AI-orchestrated reporting, and every endpoint
            documented in markdown so your AI agent can read it directly.
            No scraping. No guessing. Just structured knowledge at predictable URLs.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <ArrowRight className="h-4 w-4" /> Start Investigation
            </Link>
            <a href="/SKILL.md" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent">
              <Bot className="h-4 w-4" /> Agent Docs
            </a>
          </div>
        </div>
      </section>


      {/* Features block */}
      <Features1 />

      {/* Pipeline stages */}
      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Deterministic Before LLM</h2>
          <p className="mt-3 text-muted-foreground">One API call. Four pipeline stages. LLM only handles summaries — never facts.</p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pipelineSteps.map((s, i) => (
              <div key={s.label} className={cn("rounded-lg border p-5 text-left", s.color)}>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
                <h3 className="text-lg font-bold">{s.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Catalog — the core value prop */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1.5">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Agent-Readable Documentation</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">AI Agent Knowledge Pack</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Every tool and concept has a SKILL.md at a predictable URL.
              Your agent fetches these directly — no scraping, no guessing, no hallucinations.
              Same pattern as{" "}
              <a href="https://ethskills.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                ethskills.com
              </a>.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <CopyButton
                text="Read https://grond.daemonprotocol.com/SKILL.md and follow it before running any OSINT collection or calling scan tools."
                label="Copy agent prompt"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="mt-0.5 rounded bg-primary/10 p-1.5">
                  <FileSearch className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground/60 truncate">{s.url}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Persistent Agent Setup */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Persistent Agent Setup</h2>
            <p className="mt-3 text-muted-foreground">
              Install once. Your agent reads Grond knowledge on every OSINT task.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Claude Code", icon: Terminal, prompt: agentPrompts.claude },
              { label: "Cursor", icon: Code2, prompt: agentPrompts.cursor },
              { label: "Codex", icon: Terminal, prompt: agentPrompts.codex },
              { label: "OpenClaw", icon: Terminal, prompt: agentPrompts.openclaw },
              { label: "Any Agent (curl)", icon: Globe, prompt: agentPrompts.curl },
              { label: "Direct Link", icon: ExternalLink, prompt: "https://grond.daemonprotocol.com/SKILL.md" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold">{item.label}</h3>
                </div>
                <pre className="rounded bg-muted p-2 text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                  {item.prompt}
                </pre>
                <CopyButton text={item.prompt} label="Copy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30">
        <FAQ1 />
      </section>

      {/* CTA */}
      <CTA1 />

      {/* Footer */}
      <Footer1 />

      {/* Agent tagline */}
      <div className="border-t bg-muted/30 py-3">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs text-muted-foreground">
            <Bot className="inline h-3 w-3 mr-1" />
            Agent-ready ·{" "}
            <a href="/SKILL.md" className="text-primary hover:underline">
              grond.daemonprotocol.com/SKILL.md
            </a>
            {" · "}MIT License · v0.2.0
          </p>
        </div>
      </div>
    </div>
  );
}
