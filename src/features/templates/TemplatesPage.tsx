import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Wand2, Star, Copy, Check, ArrowRight, Cpu, Tag, LayoutTemplate } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useProjects } from "@/hooks/useProjects";
import { useCreatePrompt } from "@/hooks/usePrompts";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import type { Template } from "@/services/templates.service";

const MODEL_COLORS: Record<string, string> = {
  "claude-sonnet": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "claude-opus":   "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "claude-haiku":  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "gpt-4o":        "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "gpt-4-turbo":   "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "gemini-pro":    "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "gemini-flash":  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "deepseek-chat": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "other":         "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const MODEL_LABELS: Record<string, string> = {
  "claude-sonnet": "Claude Sonnet", "claude-opus": "Claude Opus", "claude-haiku": "Claude Haiku",
  "gpt-4o": "GPT-4o", "gpt-4-turbo": "GPT-4 Turbo", "gpt-3.5-turbo": "GPT-3.5",
  "gemini-pro": "Gemini Pro", "gemini-flash": "Gemini Flash",
  "deepseek-chat": "DeepSeek", "other": "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  Support:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Coding:    "bg-green-500/20 text-green-400 border-green-500/30",
  Marketing: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Business:  "bg-violet-500/20 text-violet-400 border-violet-500/30",
  General:   "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function TemplateCard({ template, onPreview, onUse }: {
  template: Template;
  onPreview: (t: Template) => void;
  onUse: (t: Template) => void;
}) {
  const tokenCount = Math.ceil(template.content.length / 4);
  const modelColor = MODEL_COLORS[template.model] ?? MODEL_COLORS["other"];
  const catColor = CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS["General"];

  return (
    <div className="card-hover p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {template.is_featured && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
            )}
            <h3 className="text-sm font-semibold text-slate-100 truncate">{template.name}</h3>
          </div>
          {template.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{template.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={"badge border " + catColor}><Tag className="w-2.5 h-2.5 mr-1" />{template.category}</span>
        <span className={"badge border " + modelColor}><Cpu className="w-2.5 h-2.5 mr-1" />{MODEL_LABELS[template.model] ?? template.model}</span>
        <span className="badge border bg-slate-500/10 text-slate-400 border-slate-500/20">~{tokenCount} tokens</span>
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-500">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1 border-t border-slate-700/40">
        <button onClick={() => onPreview(template)} className="btn-secondary flex-1 justify-center text-xs py-1.5 min-h-0 h-8">
          Preview
        </button>
        <button onClick={() => onUse(template)} className="btn-primary flex-1 justify-center text-xs py-1.5 min-h-0 h-8">
          <Wand2 className="w-3 h-3" /> Use template
        </button>
      </div>
    </div>
  );
}

function TemplatePreview({ template, onClose, onUse }: {
  template: Template; onClose: () => void; onUse: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(template.content).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={template.name}>
      <div className="space-y-4">
        {template.description && (
          <p className="text-sm text-slate-400">{template.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <span className={"badge border " + (CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS["General"])}>
            {template.category}
          </span>
          <span className={"badge border " + (MODEL_COLORS[template.model] ?? MODEL_COLORS["other"])}>
            {MODEL_LABELS[template.model] ?? template.model}
          </span>
          {template.author && (
            <span className="badge border bg-slate-500/10 text-slate-400 border-slate-500/20">
              by {template.author}
            </span>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Prompt content</p>
          <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap break-words bg-[#0F172A] rounded-xl p-4 border border-slate-700/60 max-h-64 overflow-y-auto">
            {template.content}
          </pre>
        </div>
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-500">#{tag}</span>
            ))}
          </div>
        )}
        <div className="flex gap-3 pt-2 border-t border-slate-700/60">
          <button onClick={handleCopy} className="btn-secondary flex-1 justify-center">
            {copied ? <><Check className="w-4 h-4 text-emerald-400" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
          </button>
          <button onClick={onUse} className="btn-primary flex-1 justify-center">
            <Wand2 className="w-4 h-4" />Use template
          </button>
        </div>
      </div>
    </Modal>
  );
}

function UseTemplateModal({ template, onClose }: { template: Template; onClose: () => void }) {
  const { data: projects } = useProjects();
  const createPrompt = useCreatePrompt();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUse = async () => {
    if (!selectedProject) { toast("warning", "Select a project first"); return; }
    setLoading(true);
    try {
      await createPrompt.mutateAsync({
        project_id: selectedProject,
        name: template.name,
        content: template.content,
        model: template.model as import("@/types/prompt").PromptModel,
        notes: "Forked from template: " + template.name,
        version: 1,
      });
      toast("success", "Template added to project!", "Opening Prompt Builder...");
      onClose();
      setTimeout(() => navigate("/projects/" + selectedProject + "/prompts"), 500);
    } catch {
      toast("error", "Failed to add template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={"Use: " + template.name}>
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          This will add the template as a prompt in your selected project.
          You can edit it after adding.
        </p>
        <div>
          <label className="label">Select project</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="input">
            <option value="">Choose a project...</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {selectedProject && (
          <div className="px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-indigo-400">
              Will be added to Prompt Builder and you will be taken there directly.
            </p>
          </div>
        )}
        <div className="flex gap-3 pt-2 border-t border-slate-700/60">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center" disabled={loading}>Cancel</button>
          <button onClick={handleUse} className="btn-primary flex-1 justify-center" disabled={loading || !selectedProject}>
            {loading ? "Adding..." : <><Wand2 className="w-4 h-4" />Add to project</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const CATEGORIES = ["All", "Support", "Coding", "Marketing", "Business", "General"];

export function TemplatesPage() {
  const { data: templates, isLoading, error, refetch } = useTemplates();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [useTemplate, setUseTemplate] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    if (!templates) return [];
    return templates.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        t.name.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q));
      const matchCat = category === "All" || t.category === category;
      return matchSearch && matchCat;
    });
  }, [templates, search, category]);

  const featured = filtered.filter((t) => t.is_featured);
  const rest = filtered.filter((t) => !t.is_featured);

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <LayoutTemplate className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100">Templates</h1>
          <p className="text-xs text-slate-500 mt-0.5">{templates?.length ?? 0} ready-to-use AI prompts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..." className="input pl-9" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={"flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all " +
              (category === cat ? "bg-indigo-600 text-white border-indigo-500" : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-500")}>
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      {templates && (
        <p className="text-xs text-slate-500">
          {filtered.length === templates.length ? templates.length + " templates" : filtered.length + " of " + templates.length}
        </p>
      )}

      {/* States */}
      {isLoading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>}
      {error && <ErrorMessage message="Could not load templates." onRetry={() => refetch()} />}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState icon={Search} title="No templates found" description="Try a different search or category."
          action={<button onClick={() => { setSearch(""); setCategory("All"); }} className="btn-secondary">Clear filters</button>} />
      )}

      {/* Featured */}
      {!isLoading && !error && featured.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Featured</p>
          </div>
          {featured.map((t) => (
            <TemplateCard key={t.id} template={t}
              onPreview={setPreviewTemplate} onUse={setUseTemplate} />
          ))}
        </div>
      )}

      {/* Rest */}
      {!isLoading && !error && rest.length > 0 && (
        <div className="space-y-3">
          {featured.length > 0 && (
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All templates</p>
          )}
          {rest.map((t) => (
            <TemplateCard key={t.id} template={t}
              onPreview={setPreviewTemplate} onUse={setUseTemplate} />
          ))}
        </div>
      )}

      {/* Modals */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => { setUseTemplate(previewTemplate); setPreviewTemplate(null); }}
        />
      )}
      {useTemplate && (
        <UseTemplateModal template={useTemplate} onClose={() => setUseTemplate(null)} />
      )}
    </div>
  );
}
