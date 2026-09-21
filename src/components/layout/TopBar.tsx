import { useLocation, useNavigate } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const TITLES: Record<string, string> = {
  "/":          "Dashboard",
  "/projects":  "Projects",
  "/templates": "Templates",
  "/settings":  "Settings",
  "/audits":    "Audits",
  "/deploy":    "Deploy",
};

export function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isDetail  = !!pathname.match(/^\/projects\/[^/]+$/);
  const isPrompts = !!pathname.match(/^\/projects\/[^/]+\/prompts$/);
  const isAudits  = !!pathname.match(/^\/projects\/[^/]+\/audits$/);

  const key   = Object.keys(TITLES).filter((k) => k !== "/").find((k) => pathname.startsWith(k)) ?? "/";
  const title = isPrompts ? "Prompt Builder" : isAudits ? "Audits" : isDetail ? "Project" : (TITLES[key] ?? "AI Factory");

  const showBack = isDetail || isPrompts || isAudits;
  const backPath = isPrompts
    ? pathname.replace("/prompts", "")
    : isAudits
    ? pathname.replace("/audits", "")
    : "/projects";

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 glass border-b border-slate-700/60 flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button onClick={() => navigate(backPath)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0 glow-primary">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        <span className="text-sm font-bold text-slate-100">{title}</span>
      </div>
      <button onClick={() => navigate("/settings")}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white hover:opacity-90 transition-opacity">
        {initials}
      </button>
    </header>
  );
}
