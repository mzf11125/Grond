"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer1() {
  const footerCards = [
    {
      title: "Product",
      links: [
        { text: "Features", href: "/#features" },
        { text: "FAQ", href: "/#faq" },
        { text: "Pricing", href: "/pricing" },
        { text: "Documentation", href: "https://docs.grond.daemonprotocol.com", external: true },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Dashboard", href: "/dashboard" },
        { text: "API Reference", href: "/api" },
        { text: "Agent Docs", href: "/SKILL.md", external: true },
        { text: "GitHub", href: "https://github.com/zidan-daemon/Grond", external: true },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", href: "/about" },
        { text: "Blog", href: "/blog" },
        { text: "Contact", href: "/contact" },
        { text: "Security", href: "/security" },
        { text: "Privacy Policy", href: "/privacy" },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="relative w-full overflow-hidden bg-white dark:bg-neutral-950 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-6"
        >
          {/* Top Section - 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            {/* First Column - Branding */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col justify-between space-y-6 mb-6 lg:mb-0"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white">
                  <span className="text-lg font-bold text-white dark:text-neutral-900">G</span>
                </div>
                <span className="text-lg font-medium text-neutral-900 dark:text-white">Grond</span>
              </div>
              <div>
                <h3 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-white sm:text-xl">
                  Evidence-first OSINT
                  <br />
                  for security teams
                </h3>
              </div>
              <div className="mt-auto">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  MIT License · v0.2.0 · Agent-ready
                </p>
              </div>
            </motion.div>

            {footerCards.map((card, index) => {
              let marginClass = "";
              if (index > 0) marginClass = "-mt-px";
              if (index === 0) marginClass += " md:mt-0";
              else if (index === 1) marginClass += " md:-mt-px md:ml-0";
              else if (index === 2) marginClass += " md:-mt-px md:-ml-px";
              marginClass += " lg:mt-0";
              if (index > 0) marginClass += " lg:-ml-px";

              return (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  className={`group relative min-h-[300px] overflow-hidden border border-neutral-300 p-6 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900 sm:p-8 ${marginClass}`}
                >
                  <h4 className="mb-6 text-sm font-medium tracking-tight text-neutral-900 dark:text-white sm:text-base">
                    {card.title}
                  </h4>
                  <ul className="space-y-3">
                    {card.links.map((link) => (
                      <li key={link.text}>
                        {link.href.startsWith("/") && !link.external ? (
                          <Link
                            to={link.href}
                            className="inline-flex font-light items-center gap-1 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:text-base"
                          >
                            {link.text}
                            {link.external && <ArrowUpRight className="h-3 w-3" />}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noopener noreferrer" : undefined}
                            className="inline-flex font-light items-center gap-1 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:text-base"
                          >
                            {link.text}
                            {link.external && <ArrowUpRight className="h-3 w-3" />}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Section */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center border-t border-neutral-200 dark:border-neutral-800 pt-8"
          >
            <p className="text-sm text-neutral-500">
              Copyright &copy; {new Date().getFullYear()} Grond. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
