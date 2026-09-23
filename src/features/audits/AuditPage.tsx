import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Plus, ShieldCheck, Play, Trash2,
  CheckCircle2, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Cpu, BarChart3
} from "lucide-react";
import { useAudits, useCreateAudit, useDeleteAudit } from "@/hooks/useAudits";
import { useProject } from "@/hooks/useProjects";
import { usePrompts } from "@/hooks/usePrompts";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton, Spinner } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { auditsService, type Audit, type AuditStatus } from "@/services/audits.service";
import { supabase } from "@/lib/supabase";

const STATUS_CONFIG: Record<AuditStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock,        color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/30",     label: "Pending" },
  running: { icon: Play,         color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30",       label: "Running" },
  passed:  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Passed" },
  failed:  { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",         label: "Failed" },
  error:   { icon: AlertCircle,  color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30",     label: "Error" },
};

const MODELS = [
  "claude-sonnet", "claude-opus", "claude-haiku",
  "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo",
  "gemini-pro", "gemini-flash", "deepseek-chat",
];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-red-400";
  const textColor = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#1E2939] rounded-full overflow-hidden">
        <div className={"h-full rounded-full transition-all duration-700 " + color} style={{ width: score + "%" }} />
      </div>
      <span className={"text-sm font-mono font-bold w-10 text-right " + textColor}>{score}%</span>
    </div>
  );
}

function AuditCard({ audit, onDelete, projectId }: {
  audit: Audit; onDelete: () => void; projectId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const cfg = STATUS_CONFIG[audit.status];
  const Icon = cfg.icon;

  const runAudit = async () => {
    setRunning(true);
    try {
      await auditsService.updateResult(audit.id, {
        status: "running", actual_output: "", score: 0, latency_ms: 0, tokens_used: 0,
      });
      qc.invalidateQueries({ queryKey: ["audits", "project", projectId] });

      const { data, error } = await supabase.functions.invoke("run-audit", {
        body: {
          test_input: audit.test_input,
          expected_output: audit.expected_output ?? "",
          model: audit.model,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      await auditsService.updateResult(audit.id, {
        status: data.score >= 60 ? "passed" : "failed",
        actual_output: data.output,
        score: data.score,
        latency_ms: data.latency_ms,
        tokens_used: data.tokens_used,
      });

      toast("success", data.score >= 60 ? "✅ Audit passed!" : "❌ Audit failed", "Score: " + data.score + "%");
    } catch (err) {
      await auditsService.updateResult(audit.id, {
        status: "error", actual_output: err instanceof Error ? err.message : "Unknown error",
        score: 0, latency_ms: 0, tokens_used: 0,
      });
      toast("error", "Audit error", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunning(false);
      qc.invalidateQueries({ queryKey: ["audits", "project", projectId] });
    }
  };

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={"badge border text-xs " + cfg.bg}>
              <Icon className={"w-3 h-3 mr-1 " + cfg.color} />{cfg.label}
            </span>
            {audit.latency_ms ? <span className="text-[10px] text-slate-500 font-mono">{audit.latency_ms}ms</span> : null}
            {audit.tokens_used ? <span className="text-[10px] text-slate-500 font-mono">{audit.tokens_used} tokens</span> : null}
          </div>
          <h3 className="text-sm font-semibold text-slate-100">{audit.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Cpu className="w-3 h-3" />{audit.model}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={runAudit} disabled={running || audit.status === "running"}
            className="btn-primary px-3 py-1.5 min-h-0 h-8 text-xs gap-1.5">
            {running ? <Spinner size="sm" /> : <><Play className="w-3 h-3" />Run</>}
          </button>
          <button onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {audit.score !== null && <ScoreBar score={audit.score} />}

      <button onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors w-fit">
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Hide" : "Show"} details
      </button>

      {expanded && (
        <div className="space-y-3 pt-2 border-t border-slate-700/40">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Test Input</p>
            <pre className="text-xs text-slate-300 font-mono bg-[#0F172A] rounded-lg p-3 whitespace-pre-wrap break-words border border-slate-700/60 max-h-40 overflow-y-auto">
              {audit.test_input}
            </pre>
          </div>
          {audit.expected_output && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expected Output</p>
              <pre className="text-xs text-slate-400 font-mono bg-[#0F172A] rounded-lg p-3 whitespace-pre-wrap break-words border border-slate-700/60 max-h-40 overflow-y-auto">
                {audit.expected_output}
              </pre>
            </div>
          )}
          {audit.actual_output && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Actual Output</p>
              <pre className={"text-xs font-mono bg-[#0F172A] rounded-lg p-3 whitespace-pre-wrap break-words border max-h-40 overflow-y-auto " +
                (audit.status === "passed" ? "text-emerald-300 border-emerald-700/40" :
                 audit.status === "failed" ? "text-red-300 border-red-700/40" : "text-slate-300 border-slate-700/60")}>
                {audit.actual_output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateAuditForm({ projectId, onSubmit, onCancel, isLoading }: {
  projectId: string;
  onSubmit: (v: { name: string; test_input: string; expected_output: string; model: string; prompt_id: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { data: prompts } = usePrompts(projectId);
  const [name, setName] = useState("");
  const [testInput, setTestInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [promptId, setPromptId] = useState("");
  const [error, setError] = useState("");

  const handlePromptSelect = (id: string) => {
    setPromptId(id);
    const prompt = prompts?.find((p) => p.id === id);
    if (prompt) setTestInput(prompt.content);
  };

  const submit = () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!testInput.trim()) { setError("Test input is required."); return; }
    setError("");
    onSubmit({ name: name.trim(), test_input: testInput.trim(), expected_output: expectedOutput.trim(), model, prompt_id: promptId });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Audit name <span className="text-red-400">*</span></label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Test greeting response" className="input" autoFocus />
      </div>

      <div>
        <label className="label">Load from prompt <span className="text-slate-500 font-normal">(optional)</span></label>
        <select value={promptId} onChange={(e) => handlePromptSelect(e.target.value)} className="input">
          <option value="">Select a prompt to pre-fill...</option>
          {(prompts ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Test input <span className="text-red-400">*</span></label>
        <textarea value={testInput} onChange={(e) => setTestInput(e.target.value)}
          placeholder="The message or prompt to send to the AI..."
          rows={5} className="input resize-none font-mono text-xs" style={{ minHeight: "120px" }} />
      </div>

      <div>
        <label className="label">
          Expected output <span className="text-slate-500 font-normal">(optional — used for scoring)</span>
        </label>
        <textarea value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)}
          placeholder="Keywords or phrases the response should contain..."
          rows={3} className="input resize-none text-sm" style={{ minHeight: "80px" }} />
        <p className="text-xs text-slate-600 mt-1">Score is calculated by how many keywords appear in the response.</p>
      </div>

      <div>
        <label className="label">Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="input">
          {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <p className="text-xs text-slate-600 mt-1">DeepSeek and Gemini Flash are free on OpenRouter.</p>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>}

      <div className="flex gap-3 pt-2 border-t border-slate-700/60">
        <button onClick={onCancel} className="btn-secondary flex-1 justify-center" disabled={isLoading}>Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 justify-center" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : <><Plus className="w-4 h-4" />Create audit</>}
        </button>
      </div>
    </div>
  );
}

export function AuditPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: project } = useProject(projectId ?? "");
  const { data: audits, isLoading, error, refetch } = useAudits(projectId ?? "");
  const createAudit = useCreateAudit();
  const deleteAudit = useDeleteAudit();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const stats = {
    total:    audits?.length ?? 0,
    passed:   audits?.filter((a) => a.status === "passed").length ?? 0,
    failed:   audits?.filter((a) => a.status === "failed").length ?? 0,
    avgScore: audits?.filter((a) => a.score !== null).length
      ? Math.round(audits!.filter((a) => a.score !== null).reduce((s, a) => s + (a.score ?? 0), 0) / audits!.filter((a) => a.score !== null).length)
      : null,
  };

  const handleCreate = async (values: { name: string; test_input: string; expected_output: string; model: string; prompt_id: string }) => {
    try {
      await createAudit.mutateAsync({
        project_id: projectId ?? "",
        name: values.name,
        test_input: values.test_input,
        expected_output: values.expected_output || null,
        model: values.model,
        prompt_id: values.prompt_id || null,
      });
      setCreateOpen(false);
      toast("success", "Audit created", "Click Run to execute it.");
    } catch { toast("error", "Failed to create audit"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !projectId) return;
    try {
      await deleteAudit.mutateAsync({ id: deleteTarget, projectId });
      setDeleteTarget(null);
      toast("success", "Audit deleted");
    } catch { toast("error", "Failed to delete audit"); }
  };

  const runAll = async () => {
    if (!audits || !projectId) return;
    toast("success", "Running all audits...", "This may take a moment");
    for (const audit of audits) {
      try {
        await auditsService.updateResult(audit.id, {
          status: "running", actual_output: "", score: 0, latency_ms: 0, tokens_used: 0,
        });
        const { data, error } = await supabase.functions.invoke("run-audit", {
          body: { test_input: audit.test_input, expected_output: audit.expected_output ?? "", model: audit.model },
        });
        if (error || data.error) throw new Error(error?.message ?? data.error);
        await auditsService.updateResult(audit.id, {
          status: data.score >= 60 ? "passed" : "failed",
          actual_output: data.output, score: data.score,
          latency_ms: data.latency_ms, tokens_used: data.tokens_used,
        });
      } catch {
        await auditsService.updateResult(audit.id, {
          status: "error", actual_output: "Failed", score: 0, latency_ms: 0, tokens_used: 0,
        });
      }
    }
    qc.invalidateQueries({ queryKey: ["audits", "project", projectId] });
    toast("success", "All audits complete!");
  };

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/projects/" + projectId)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm truncate max-w-[200px]">{project?.name ?? "Project"}</span>
        </button>
        <button onClick={() => setCreateOpen(true)} className="btn-primary px-3 min-h-0 h-9 text-xs">
          <Plus className="w-4 h-4" />New audit
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100">Audits</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {stats.total} test{stats.total !== 1 ? "s" : ""} · {project?.name} · Powered by OpenRouter
          </p>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total",     value: String(stats.total),    color: "text-slate-300" },
            { label: "Passed",    value: String(stats.passed),   color: "text-emerald-400" },
            { label: "Failed",    value: String(stats.failed),   color: "text-red-400" },
            { label: "Avg Score", value: stats.avgScore !== null ? stats.avgScore + "%" : "—",
              color: stats.avgScore !== null && stats.avgScore >= 60 ? "text-emerald-400" : "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="card p-3 text-center">
              <p className={"text-xl font-bold " + s.color}>{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>}
      {error && <ErrorMessage message="Could not load audits." onRetry={() => refetch()} />}

      {!isLoading && !error && (audits?.length ?? 0) === 0 && (
        <EmptyState icon={ShieldCheck} title="No audits yet"
          description="Create test cases to evaluate your AI prompts. Powered by OpenRouter free models."
          action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="w-4 h-4" />Create first audit</button>} />
      )}

      {!isLoading && !error && (audits?.length ?? 0) > 0 && (
        <div className="space-y-3">
          {audits!.map((a) => (
            <AuditCard key={a.id} audit={a} projectId={projectId ?? ""} onDelete={() => setDeleteTarget(a.id)} />
          ))}
        </div>
      )}

      {(audits?.length ?? 0) > 1 && (
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <div>
              <p className="text-sm font-medium text-slate-200">Run all audits</p>
              <p className="text-xs text-slate-500">Runs {stats.total} tests sequentially</p>
            </div>
          </div>
          <button onClick={runAll} className="btn-primary px-3 min-h-0 h-8 text-xs">
            <Play className="w-3 h-3" />Run all
          </button>
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New audit">
        <CreateAuditForm projectId={projectId ?? ""} onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)} isLoading={createAudit.isPending} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete audit?" description="This audit and its results will be permanently deleted."
        confirmLabel="Delete" isLoading={deleteAudit.isPending} />
    </div>
  );
}
