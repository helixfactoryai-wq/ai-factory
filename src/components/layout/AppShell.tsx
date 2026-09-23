import { Outlet } from "react-router-dom";
import { NavLink, useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { LayoutDashboard, FolderKanban, LayoutTemplate, Settings, Zap } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/",          icon: LayoutDashboard },
  { label: "Projects",  href: "/projects",  icon: FolderKanban },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Settings",  href: "/settings",  icon: Settings },
];

function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-[#0F172A] border-r border-slate-700/60 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center glow-primary">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100">AI Factory</p>
          <p className="text-[10px] text-slate-500 font-mono">Phase 3</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <NavLink key={href} to={href} end={href === "/"}
              className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all " +
                (active
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 border border-transparent")}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Powered by</p>
          <p className="text-xs font-semibold text-indigo-400 mt-0.5">OpenRouter · Supabase · Vercel</p>
        </div>
      </div>
    </aside>
  );
}

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0F1E]">
      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar — mobile only */}
        <div className="lg:hidden">
          <TopBar />
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-[#0A0F1E] flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">AI Factory v1.0</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              A
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="px-4 lg:px-8 py-4 lg:py-6 w-full max-w-4xl mx-auto animate-in">
            <Outlet />
          </div>
        </main>

        {/* Bottom nav — mobile only */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
