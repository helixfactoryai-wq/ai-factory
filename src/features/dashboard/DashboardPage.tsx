import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, Lightbulb, Code2, CheckCircle2, ArrowRight, Cpu, FlaskConical, TrendingUp } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { ProviderBadge } from "@/components/ui/Badges";
import { StatSkeleton, CardSkeleton } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Project, ProjectStatus, ProjectProvider } from "@/types";

function StatCard({ label, value, icon: Icon, color, bg, trend }: {
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string; trend?: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-3 hover:border-slate-600/60 transition-all">
      <div className={"w-10 h-10 rounded-xl " + bg + " flex items-center justify-center flex-shrink-0"}>
        <Icon className={"w-5 h-5 " + color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-slate-100 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
      {trend && <span className="text-[10px] text-emerald-400 font-medium flex-shrink-0">{trend}</span>}
    </div>
  );
}

function RecentRow({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/20 active:bg-slate-700/30 transition-colors text-left group">
      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/40 transition-colors">
        <Cpu className="w-4 h-4 text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{project.name}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{project.description ?? "No description"}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ProviderBadge provider={project.provider as ProjectProvider} />
        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: projects, isLoading, error, refetch } = useProjects();

  const stats = useMemo(() => {
    if (!projects) return null;
    const byStatus = projects.reduce((acc, p) => {
      acc[p.status as ProjectStatus] = (acc[p.status as ProjectStatus] ?? 0) + 1;
      return acc;
    }, {} as Partial<Record<ProjectStatus, number>>);
    const byProvider = projects.reduce((acc, p) => {
      acc[p.provider as ProjectProvider] = (acc[p.provider as ProjectProvider] ?? 0) + 1;
      return acc;
    }, {} as Partial<Record<ProjectProvider, number>>);
    const recent = [...projects]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
    return { total: projects.length, byStatus, byProvider, recent };
  }, [projects]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.email?.split("@")[0] ?? "there";

  if (error) return <ErrorMessage message="Could not load dashboard." onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 animate-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {greeting()}, <span className="text-gradient">{firstName}</span> 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Here is what is happening with your AI systems</p>
        </div>
        <button onClick={() => navigate("/projects")}
          className="btn-primary text-xs px-3 py-2 min-h-0 h-9">
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total projects" value={stats?.total ?? 0}                 icon={FolderKanban} color="text-indigo-400"  bg="bg-indigo-500/10" />
          <StatCard label="Production"     value={stats?.byStatus?.Production ?? 0}  icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" />
          <StatCard label="Development"    value={stats?.byStatus?.Development ?? 0} icon={Code2}        color="text-blue-400"    bg="bg-blue-500/10" />
          <StatCard label="Ideas"          value={stats?.byStatus?.Idea ?? 0}        icon={Lightbulb}    color="text-amber-400"   bg="bg-amber-500/10" />
        </div>
      )}

      {/* Recent projects */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">Recent projects</span>
          </div>
          <button onClick={() => navigate("/projects")}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : stats && stats.recent.length > 0 ? (
          <div className="divide-y divide-slate-700/40">
            {stats.recent.map((p) => (
              <RecentRow key={p.id} project={p} onClick={() => navigate("/projects/" + p.id)} />
            ))}
          </div>
        ) : (
          <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first AI project."
            action={<button onClick={() => navigate("/projects")} className="btn-primary"><Plus className="w-4 h-4" />Create project</button>} />
        )}
      </div>

      {/* Pipeline */}
      {stats && stats.total > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-slate-200">Pipeline overview</span>
          </div>
          <div className="space-y-3">
            {(["Idea","Development","Testing","Production"] as ProjectStatus[]).map((s) => {
              const count = stats.byStatus?.[s] ?? 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const colors: Record<ProjectStatus, string> = {
                Idea: "bg-slate-400", Development: "bg-blue-400",
                Testing: "bg-amber-400", Production: "bg-emerald-400",
              };
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-24 flex-shrink-0">{s}</span>
                  <div className="flex-1 h-1.5 bg-[#1E2939] rounded-full overflow-hidden">
                    <div className={"h-full rounded-full transition-all duration-700 " + colors[s]}
                      style={{ width: pct + "%" }} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
