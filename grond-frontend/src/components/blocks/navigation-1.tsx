"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
  { href: "https://docs.grond.daemonprotocol.com", label: "Docs", external: true },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navigation1() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/80">
      <div className="mx-auto max-w-[1400px] px-6 flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 text-xl font-medium text-neutral-900 dark:text-white z-50">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" className="fill-neutral-900 dark:fill-white" />
            <path d="M7 14L12 19L21 9" stroke="#fff" className="dark:stroke-neutral-950" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Grond
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white no-underline"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            Sign In
          </Link>
          <Link
            to="/demo"
            className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Request Demo
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 lg:hidden z-50"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white dark:bg-neutral-950 lg:hidden"
          >
            <div className="h-[65px] border-b border-neutral-200 dark:border-neutral-800" />
            <div className="mx-auto flex h-[calc(100%-65px)] max-w-[1400px] flex-col px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-1 flex-col gap-2 overflow-y-auto py-8"
              >
                {navLinks.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="text-2xl font-medium text-neutral-900 dark:text-white no-underline py-2"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-2xl font-medium text-neutral-900 dark:text-white py-2"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </motion.div>

              {/* Mobile Bottom Actions */}
              <div className="flex flex-col gap-3 border-t border-neutral-200 py-6 dark:border-neutral-800">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Link
                    to="/demo"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    Request Demo
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
