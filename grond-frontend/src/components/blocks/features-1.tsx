"use client";

import { motion } from "motion/react";
import { Search, Zap, Shield, Cpu, GitCompare, Globe, Bot, FileText } from "lucide-react";

export function Features1() {
const features = [
  { icon: Search, title: "12+ OSINT Tools", description: "Shodan, Nmap, Tavily, EDGAR, theHarvester, Twitter, OSINTMap, Metadata, and Steganography — all through one API." },
  { icon: Zap, title: "Evidence Pipeline", description: "Deterministic collection, enrichment, verification. LLM only touches summaries — never invents facts." },
  { icon: GitCompare, title: "Cross-Source Verification", description: "Findings marked verified only when ≥2 independent sources confirm the same claim." },
  { icon: Cpu, title: "4-Component Confidence", description: "C = 0.4×reliability + 0.25×corroboration + 0.2×freshness + 0.15×completeness." },
  { icon: Shield, title: "Authorization by Design", description: "Active scans gated behind authorization records. Passive tools free. Full audit trail." },
  { icon: Globe, title: "Conflict Preservation", description: "Contradictory sources both kept in the report. Analyst adjudicates — not the machine." },
  { icon: Bot, title: "Agent-Readable Docs", description: "Every tool has a SKILL.md at a predictable URL. Agents self-discover and integrate." },
  { icon: FileText, title: "Analyst-Ready Reports", description: "IntelReport with risk levels, confidence bars, full provenance trails, and PDF export." },
];

  return (
    <section className="w-full py-16 px-4 md:px-32 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-4"
          >
            Agentic OSINT Platform
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-neutral-900 dark:text-white mb-6"
          >
            Evidence-First Intelligence
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl"
          >
            Deterministic collection, enrichment, and verification. Every claim anchored to a source. Every source cross-referenced across tools. Zero LLM hallucinations in evidence.
          </motion.p>
        </div>

        {/* Features Grid - 2 rows x 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 md:gap-x-8 md:gap-y-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col"
              >
                {/* Icon and Title on same line */}
                <div className="flex items-center gap-3 mb-2">
                  {/* Icon with border and shadow */}
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900 dark:text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base tracking-tight font-light text-neutral-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>

                {/* Description - max 2 lines */}
                <p className="text-xs tracking-tight font-light max-w-[30ch] sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
