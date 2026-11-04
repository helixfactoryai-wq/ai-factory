import { useNavigate } from "react-router-dom";
import {
  BarChart3, TrendingUp, Zap, ShieldCheck, Wand2, FolderKanban,
  Trophy, Clock, ArrowRight, CheckCircle2, XCircle, Cpu,
} from "lucide-react";
import { useProjectAnalytics, useOverallStats, useAuditTrends } from "@/hooks/useAnalytics";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

function StatCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string; bg: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={"w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 " + bg}>
        <Icon className={"w-6 h-6 " + color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-slate-100 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E2939" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ - dash} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-[#1E2939] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-cyan-400"
        style={{ width: pct + "%" }} />
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Production: "text-emerald-400", Development: "text-blue-400",
  Testing: "text-amber-400", Idea: "text-slate-400",
};

const CATEGORY_COLORS: Record<string, string> = {
  Enterprise: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Education:  "bg-sky-500/20 text-sky-400 border-sky-500/30",
  Business:   "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Coding:     "bg-green-500/20 text-green-400 border-green-500/30",
  Personal:   "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Custom:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError } = useOverallStats();
  const { data: projects, isLoading: projectsLoading } = useProjectAnalytics();
  const { data: trends } = useAuditTrends();

  if (statsLoading || projectsLoading) return <PageLoader />;
  if (statsError) return <ErrorMessage message="Could not load analytics." />;

  const rows = projects ?? [];
  const providerBreakdown = rows.reduce((acc, p) => {
    acc[p.provider] = (acc[p.provider] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const maxProvider = Math.max(1, ...Object.values(providerBreakdown));

  const categoryBreakdown = rows.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const latencies = (trends ?? []).filter((t) => t.latency_ms);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((s, t) => s + (t.latency_ms ?? 0), 0) / latencies.length)
    : 0;

  const passRate = stats?.pass_rate ?? 0;

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">Platform-wide insights across all your AI systems</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FolderKanban} label="Total projects"  value={stats?.total_projects ?? 0} color="text-indigo-400"  bg="bg-indigo-500/10" />
        <StatCard icon={Wand2}        label="Total prompts"   value={stats?.total_prompts ?? 0}  color="text-cyan-400"    bg="bg-cyan-500/10" />
        <StatCard icon={ShieldCheck}  label="Audits run"      value={stats?.total_audits ?? 0}   color="text-violet-400"  bg="bg-violet-500/10" />
        <StatCard icon={Trophy}       label="Pass rate"       value={passRate + "%"} sub="of all audits" color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={Zap}          label="Avg audit score" value={(stats?.avg_score ?? 0) + "%"} color="text-amber-400" bg="bg-amber-500/10" />
        <StatCard icon={Clock}        label="Avg latency"     value={avgLatency + "ms"} sub="per AI call" color="text-blue-400" bg="bg-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">Quality Overview</span>
          </div>
          <div className="flex items-center gap-6">
            <ScoreRing score={stats?.avg_score ?? 0} />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 w-12">Passed</span>
                <div className="flex-1 h-1.5 bg-[#1E2939] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: passRate + "%" }} />
                </div>
                <span className="text-xs font-mono text-emerald-400 w-10 text-right">{passRate}%</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 w-12">Failed</span>
                <div className="flex-1 h-1.5 bg-[#1E2939] rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: (stats?.total_audits ? 100 - passRate : 0) + "%" }} />
                </div>
                <span className="text-xs font-mono text-red-400 w-10 text-right">{stats?.total_audits ? 100 - passRate : 0}%</span>
              </div>
              <p className="pt-2 border-t border-slate-700/40 text-xs text-slate-500">
                Tokens used: <span className="text-slate-300 font-mono">{(stats?.total_tokens ?? 0).toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">Provider Breakdown</span>
          </div>
          <div className="space-y-2.5">
            {Object.entries(providerBreakdown).sort(([, a], [, b]) => b - a).map(([provider, count]) => (
              <div key={provider} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-24 flex-shrink-0 truncate">{provider}</span>
                <MiniBar value={count} max={maxProvider} />
                <span className="text-xs font-mono text-slate-400 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">Project Performance</span>
          </div>
          <button onClick={() => navigate("/projects")} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {rows.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No project data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {["Project", "Status", "Prompts", "Audits", "Avg Score", "Tokens"].map((h, i) => (
                    <th key={h} className={"px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider " + (i < 2 ? "text-left" : "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {rows.slice(0, 10).map((p) => {
                  const score = Math.round(Number(p.avg_audit_score));
                  const scoreColor = p.audit_count === 0 ? "text-slate-600" : score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
                  return (
                    <tr key={p.project_id} className="hover:bg-slate-700/20 cursor-pointer transition-colors"
                      onClick={() => navigate("/projects/" + p.project_id)}>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{p.project_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.provider} · {p.category}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={"text-xs font-medium " + (STATUS_COLORS[p.status] ?? "text-slate-400")}>{p.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm text-slate-300 font-mono">{p.prompt_count}</td>
                      <td className="px-5 py-3.5 text-right text-sm text-slate-300 font-mono">{p.audit_count}</td>
                      <td className={"px-5 py-3.5 text-right text-sm font-mono font-bold " + scoreColor}>
                        {p.audit_count > 0 ? score + "%" : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-400 font-mono">
                        {Number(p.total_tokens_used) > 0 ? Number(p.total_tokens_used).toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-200 mb-4">Projects by Category</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a).map(([cat, count]) => (
              <div key={cat} className={"badge border px-3 py-1.5 text-sm " + (CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Custom)}>
                {cat} <span className="ml-1.5 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}