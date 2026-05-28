"use client";

import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function CTA1() {
  return (
    <section className="relative w-full flex items-center justify-center py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-950 overflow-hidden">
      {/* Subtle dot pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "radial-gradient(circle, rgb(255 255 255 / 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-tight mb-6"
        >
          Ready to Transform Your OSINT Workflow?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base sm:text-lg md:text-xl text-neutral-400 leading-relaxed mb-10 max-w-2xl mx-auto"
        >
          Join security teams using Grond for evidence-first intelligence. Deploy on-premise,
          maintain full data sovereignty, and scale investigations with AI-orchestrated tools.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            to="/demo"
            className="inline-flex items-center rounded-md bg-white px-8 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-200 transition-colors"
          >
            Request Demo
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-md border border-neutral-700 px-8 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Start Investigating
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
