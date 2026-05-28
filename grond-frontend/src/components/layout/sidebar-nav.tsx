"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Search,
  Crosshair,
  Table2,
  Shield,
  Sun,
  Moon,
  Menu,
  ChevronLeft,
  Plus,
  ExternalLink,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_GROND_API_URL ?? "/api";

interface RecentInvestigation {
  id: string;
  target: string;
  goal: string;
  timestamp: number;
}

const navItems = [
  { to: "/dashboard", icon: Search, label: "Intel" },
  { to: "/dashboard/recon", icon: Crosshair, label: "Recon" },
  { to: "/dashboard/datasheet", icon: Table2, label: "Datasheet" },
  { to: "/dashboard/admin", icon: Shield, label: "Admin" },
];

function HealthDot() {
  const [status, setStatus] = useState<"ok" | "error" | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/health`, { signal: AbortSignal.timeout(3000) });
        if (!cancelled) setStatus(res.ok ? "ok" : "error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "ok" && "bg-green-500",
          status === "error" && "bg-red-500",
          status === "loading" && "animate-pulse bg-yellow-500",
        )}
        title={status === "ok" ? "API Online" : status === "error" ? "API Unreachable" : "Checking..."}
      />
      <span className="text-xs text-muted-foreground">
        {status === "ok" ? "Online" : status === "error" ? "Offline" : "..."}
      </span>
    </div>
  );
}

export function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [recent, setRecent] = useState<RecentInvestigation[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("grond-recent-investigations");
      if (stored) setRecent(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem("grond-recent-investigations");
        if (stored) setRecent(JSON.parse(stored));
      } catch { /* ignore */ }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const newInvestigation = useCallback(() => {
    navigate("/dashboard");
    setMobileOpen(false);
  }, [navigate]);

  const sidebarContent = (
    <div className={cn("flex h-full flex-col transition-all", collapsed ? "w-16" : "w-60")}>
      <div className="flex items-center gap-2 p-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="text-primary">Grond</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto hidden lg:flex", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <div className="px-3">
        <Button
          className={cn("w-full gap-2", collapsed && "px-2")}
          onClick={newInvestigation}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && "New Investigation"}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
            return (
              <Button
                key={to}
                variant={active ? "secondary" : "ghost"}
                className={cn("justify-start gap-2", collapsed && "justify-center px-2")}
                onClick={() => { navigate(to); setMobileOpen(false); }}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{label}</span>}
              </Button>
            );
          })}
        </nav>

        {recent.length > 0 && !collapsed && (
          <>
            <Separator className="my-3" />
            <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Recent</p>
            <div className="flex flex-col gap-1">
              {recent.slice(0, 5).map((inv) => (
                <Button
                  key={inv.id}
                  variant="ghost"
                  size="sm"
                  className="justify-start truncate text-left text-xs"
                  onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}
                >
                  <span className="truncate">{inv.target || inv.goal || "Untitled"}</span>
                </Button>
              ))}
            </div>
          </>
        )}
      </ScrollArea>

      <div className={cn("border-t p-3", collapsed && "flex flex-col items-center gap-2")}>
        {!collapsed && (
          <>
            <HealthDot />
            <a
              href="/SKILL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-2 mb-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Bot className="h-3 w-3" />
              Agent Docs
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </>
        )}
        <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {!collapsed && (
            <span className="text-xs text-muted-foreground">Analyst</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden h-screen border-r bg-sidebar lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile */}
      <div className="fixed left-0 top-0 z-50 flex items-center gap-2 p-3 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <div className="h-full">{sidebarContent}</div>
          </SheetContent>
        </Sheet>
        <Link to="/" className="text-lg font-bold tracking-tight">
          <span className="text-primary">Grond</span>
        </Link>
      </div>
    </>
  );
}
