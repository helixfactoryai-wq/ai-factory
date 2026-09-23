import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Wand2, Search, X, Download } from "lucide-react";
import { usePrompts, useCreatePrompt, useUpdatePrompt, useDeletePrompt, useDuplicatePrompt } from "@/hooks/usePrompts";
import { useProject } from "@/hooks/useProjects";
import { PromptCard } from "./PromptCard";
import { PromptForm } from "./PromptForm";
import { PromptViewer } from "./PromptViewer";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import type { Prompt, PromptInsert } from "@/types/prompt";

export function PromptBuilderPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: project } = useProject(projectId ?? "");
  const { data: prompts, isLoading, error, refetch } = usePrompts(projectId ?? "");

  const createPrompt    = useCreatePrompt();
  const updatePrompt    = useUpdatePrompt();
  const deletePrompt    = useDeletePrompt();
  const duplicatePrompt = useDuplicatePrompt();

  const [search, setSearch]             = useState("");
  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState<Prompt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null);
  const [viewTarget, setViewTarget]     = useState<Prompt | null>(null);

  const filtered = (prompts ?? []).filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (values: PromptInsert) => {
    try { await createPrompt.mutateAsync(values); setCreateOpen(false); toast("success", "Prompt created"); }
    catch { toast("error", "Failed to create prompt"); }
  };

  const handleEdit = async (values: PromptInsert) => {
    if (!editTarget) return;
    try { await updatePrompt.mutateAsync({ id: editTarget.id, ...values }); setEditTarget(null); toast("success", "New version saved"); }
    catch { toast("error", "Failed to save prompt"); }
  };

  const handleDuplicate = async (prompt: Prompt) => {
    try { await duplicatePrompt.mutateAsync(prompt); toast("success", "Prompt duplicated"); }
    catch { toast("error", "Failed to duplicate"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !projectId) return;
    try { await deletePrompt.mutateAsync({ id: deleteTarget.id, projectId }); setDeleteTarget(null); toast("success", "Prompt deleted"); }
    catch { toast("error", "Failed to delete prompt"); }
  };

  const exportJSON = () => {
    if (!prompts || prompts.length === 0) { toast("warning", "No prompts to export"); return; }
    const data = {
      project: project?.name ?? "Unknown",
      exported_at: new Date().toISOString(),
      prompts: prompts.map((p) => ({
        name: p.name, model: p.model, version: p.version,
        content: p.content, notes: p.notes,
        created_at: p.created_at, updated_at: p.updated_at,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (project?.name ?? "prompts").replace(/\s+/g, "-").toLowerCase() + "-prompts.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("success", "Exported as JSON", prompts.length + " prompts downloaded");
  };

  const exportMarkdown = () => {
    if (!prompts || prompts.length === 0) { toast("warning", "No prompts to export"); return; }
    const lines = [
      "# " + (project?.name ?? "Prompts"),
      "",
      "Exported: " + new Date().toLocaleString(),
      "",
      "---",
      "",
    ];
    prompts.forEach((p, i) => {
      lines.push("## " + (i + 1) + ". " + p.name);
      lines.push("");
      lines.push("**Model:** " + p.model + " · **Version:** v" + p.version);
      if (p.notes) lines.push("**Notes:** " + p.notes);
      lines.push("");
      lines.push("```");
      lines.push(p.content);
      lines.push("```");
      lines.push("");
      lines.push("---");
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (project?.name ?? "prompts").replace(/\s+/g, "-").toLowerCase() + "-prompts.md";
    a.click();
    URL.revokeObjectURL(url);
    toast("success", "Exported as Markdown", prompts.length + " prompts downloaded");
  };

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/projects/" + projectId)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm truncate max-w-[200px]">{project?.name ?? "Project"}</span>
        </button>
        <div className="flex items-center gap-2">
          {(prompts?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <button onClick={exportJSON}
                className="btn-secondary px-2.5 py-1.5 min-h-0 h-8 text-xs gap-1.5">
                <Download className="w-3 h-3" />JSON
              </button>
              <button onClick={exportMarkdown}
                className="btn-secondary px-2.5 py-1.5 min-h-0 h-8 text-xs gap-1.5">
                <Download className="w-3 h-3" />MD
              </button>
            </div>
          )}
          <button onClick={() => setCreateOpen(true)} className="btn-primary px-3 min-h-0 h-9 text-xs">
            <Plus className="w-4 h-4" />New prompt
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Wand2 className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100">Prompt Builder</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {prompts?.length ?? 0} prompt{(prompts?.length ?? 0) !== 1 ? "s" : ""} · {project?.name}
          </p>
        </div>
      </div>

      {(prompts?.length ?? 0) > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..." className="input pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><X className="w-4 h-4" /></button>}
        </div>
      )}

      {isLoading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>}
      {error && <ErrorMessage message="Could not load prompts." onRetry={() => refetch()} />}

      {!isLoading && !error && filtered.length === 0 && (
        search
          ? <EmptyState icon={Search} title="No results" description="Try a different search."
              action={<button onClick={() => setSearch("")} className="btn-secondary">Clear</button>} />
          : <EmptyState icon={Wand2} title="No prompts yet" description="Create your first prompt for this project."
              action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="w-4 h-4" />Create prompt</button>} />
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((p) => (
            <PromptCard key={p.id} prompt={p}
              onEdit={setEditTarget} onDuplicate={handleDuplicate}
              onDelete={setDeleteTarget} onSelect={setViewTarget} />
          ))}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New prompt">
        <PromptForm projectId={projectId ?? ""} onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)} isLoading={createPrompt.isPending} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit prompt">
        {editTarget && <PromptForm projectId={projectId ?? ""} initialValues={editTarget}
          onSubmit={handleEdit} onCancel={() => setEditTarget(null)} isLoading={updatePrompt.isPending} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete prompt?" description={"Delete " + (deleteTarget?.name ?? "") + "?"}
        confirmLabel="Delete" isLoading={deletePrompt.isPending} />

      {viewTarget && <PromptViewer prompt={viewTarget} onClose={() => setViewTarget(null)}
        onEdit={() => { setEditTarget(viewTarget); setViewTarget(null); }} />}
    </div>
  );
}
