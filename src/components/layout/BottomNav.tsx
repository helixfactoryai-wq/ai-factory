import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, LayoutTemplate, Settings, BarChart3 } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/",          icon: LayoutDashboard },
  { label: "Projects",  href: "/projects",  icon: FolderKanban },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Settings",  href: "/settings",  icon: Settings },
];

export function BottomNav() {
  const { pathname } = useLocation();
  if (pathname.match(/^\/projects\/[^/]+/)) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass border-t border-slate-700/60 flex">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <NavLink key={href} to={href} end={href === "/"}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] relative group">
            <div className={"p-1 rounded-lg transition-all duration-200 " + (active ? "bg-indigo-500/20" : "group-hover:bg-slate-700/30")}>
              <Icon className={"w-4 h-4 transition-colors " + (active ? "text-indigo-400" : "text-slate-500")} />
            </div>
            <span className={"text-[9px] font-medium " + (active ? "text-indigo-400" : "text-slate-500")}>{label}</span>
            {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-500 rounded-t-full" />}
          </NavLink>
        );
      })}
    </nav>
  );
}