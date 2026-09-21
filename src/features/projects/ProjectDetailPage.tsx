import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, GitBranch, Server, Calendar, Clock, Globe, Tag, Info, CheckCircle2, Code2, Lightbulb, FlaskConical, Wand2, ChevronRight, Cpu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { usePrompts } from "@/hooks/usePrompts";
import { useAudits } from "@/hooks/useAudits";
import { StatusBadge, CategoryBadge, ProviderBadge } from "@/components/ui/Badges";
import { PageLoader } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProjectForm } from "./ProjectForm";
import { useToast } from "@/components/ui/Toast";
import type { ProjectInsert, ProjectStatus } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-700/40 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#1E2939] flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-200 font-medium truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const statusIcons: Record<ProjectStatus, React.ElementType> = {
  Idea: Lightbulb, Development: Code2, Testing: FlaskConical, Production: CheckCircle2,
};
const statusProgress: Record<ProjectStatus, number> = {
  Idea: 10, Development: 40, Testing: 75, Production: 100,
};
const statusColors: Record<ProjectStatus, string> = {
  Idea: "bg-slate-400", Development: "bg-blue-400", Testing: "bg-amber-400", Production: "bg-emerald-400",
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: project, isLoading, error, refetch } = useProject(id ?? "");
  const { data: prompts } = usePrompts(id ?? "");
  const { data: audits } = useAudits(id ?? "");
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = async (values: ProjectInsert) => {
    if (!project) return;
    try {
      await updateProject.mutateAsync({ id: project.id, ...values });
      setEditOpen(false);
      toast("success", "Project updated");
    } catch { toast("error", "Failed to update project"); }
  };

  const handleDelete = async () => {
    if (!project) return;
    try {
      await deleteProject.mutateAsync(project.id);
      toast("success", "Project deleted");
      navigate("/projects");
    } catch { toast("error", "Failed to delete project"); }
  };

  if (isLoading) return <PageLoader />;
  if (error || !project) return <ErrorMessage message="Could not load project." onRetry={() => refetch()} />;

  const status = project.status as ProjectStatus;
  const StatusIcon = statusIcons[status];
  const progress = statusProgress[status];
  const progressColor = statusColors[status];
  const promptCount = prompts?.length ?? 0;
  const auditCount = audits?.length ?? 0;
  const passedAudits = audits?.filter((a) => a.status === "passed").length ?? 0;

  return (
    <div className="space-y-5 animate-in">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/projects")} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Projects</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1E2939] border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-100 leading-snug">{project.name}</h1>
            {project.description && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{project.description}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <StatusBadge status={status} />
          <CategoryBadge category={project.category as import("@/types").ProjectCategory} />
          <ProviderBadge provider={project.provider as import("@/types").ProjectProvider} />
        </div>
        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <StatusIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">Pipeline progress</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{progress}%</span>
          </div>
          <div className="h-2 bg-[#1E2939] rounded-full overflow-hidden">
            <div className={"h-full rounded-full " + progressColor} style={{ width: progress + "%" }} />
          </div>
          <div className="flex justify-between mt-1.5">
            {(["Idea","Development","Testing","Production"] as ProjectStatus[]).map((s) => (
              <span key={s} className={"text-[10px] " + (s === status ? "text-slate-300 font-medium" : "text-slate-600")}>
                {s === "Development" ? "Dev" : s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Prompt Builder */}
        <button onClick={() => navigate("/projects/" + project.id + "/prompts")}
          className="card p-4 flex flex-col gap-2 hover:border-indigo-500/40 transition-all text-left group">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
            <Wand2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Prompts</p>
            <p className="text-xs text-slate-500 mt-0.5">{promptCount} prompt{promptCount !== 1 ? "s" : ""}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors self-end" />
        </button>

        {/* Audits */}
        <button onClick={() => navigate("/projects/" + project.id + "/audits")}
          className="card p-4 flex flex-col gap-2 hover:border-violet-500/40 transition-all text-left group">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:border-violet-500/40 transition-colors">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Audits</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {auditCount > 0 ? passedAudits + "/" + auditCount + " passed" : "No audits yet"}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors self-end" />
        </button>
      </div>

      {/* Details */}
      <div className="card px-4">
        <div className="flex items-center gap-2 py-3 border-b border-slate-700/60">
          <Info className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">Details</span>
        </div>
        <InfoRow icon={Globe}     label="Provider"          value={project.provider} />
        <InfoRow icon={Server}    label="Deployment target" value={project.deployment_target} />
        <InfoRow icon={Tag}       label="Category"          value={project.category} />
        <InfoRow icon={GitBranch} label="Version"           value={"v" + project.version} />
        <InfoRow icon={Calendar}  label="Created"           value={formatDate(project.created_at)} />
        <InfoRow icon={Clock}     label="Last updated"      value={formatDateTime(project.updated_at)} />
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
        <ProjectForm initialValues={project} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} isLoading={updateProject.isPending} />
      </Modal>
      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Delete project?" description={"Delete " + project.name + "? This cannot be undone."}
        confirmLabel="Delete" isLoading={deleteProject.isPending} />
    </div>
  );
}
