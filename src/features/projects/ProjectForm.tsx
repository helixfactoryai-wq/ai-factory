import { useState } from "react";
import type { Project, ProjectInsert, ProjectCategory, ProjectProvider, DeploymentTarget, ProjectStatus } from "@/types";
import { Spinner } from "@/components/ui/Loading";

const CATEGORIES: ProjectCategory[] = ["Enterprise","Education","Business","Coding","Personal","Custom"];
const PROVIDERS: ProjectProvider[]  = ["ChatGPT","Claude","Gemini","DeepSeek","Kimi","OpenRouter","Other"];
const TARGETS: DeploymentTarget[]   = ["Supabase","Vercel","Railway","Cloud Run","Docker","Local"];
const STATUSES: ProjectStatus[]     = ["Idea","Development","Testing","Production"];

interface Props {
  initialValues?: Project;
  onSubmit: (v: ProjectInsert) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function Select<T extends string>({ label, value, onChange, options }: {
  label: string; value: T; onChange: (v: T) => void; options: T[];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="input">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function ProjectForm({ initialValues, onSubmit, onCancel, isLoading }: Props) {
  const [name, setName]       = useState(initialValues?.name ?? "");
  const [desc, setDesc]       = useState(initialValues?.description ?? "");
  const [category, setCategory] = useState<ProjectCategory>((initialValues?.category as ProjectCategory) ?? "Enterprise");
  const [provider, setProvider] = useState<ProjectProvider>((initialValues?.provider as ProjectProvider) ?? "Claude");
  const [target, setTarget]   = useState<DeploymentTarget>((initialValues?.deployment_target as DeploymentTarget) ?? "Vercel");
  const [status, setStatus]   = useState<ProjectStatus>((initialValues?.status as ProjectStatus) ?? "Idea");
  const [version, setVersion] = useState(initialValues?.version ?? "1.0.0");
  const [nameError, setNameError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validate = (n: string) => {
    if (!n.trim()) return "Name is required.";
    if (n.trim().length < 2) return "At least 2 characters.";
    return "";
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const err = validate(name);
    setNameError(err);
    if (err) return;
    onSubmit({
      name: name.trim(),
      description: desc.trim() || null,
      category, provider,
      deployment_target: target,
      status,
      version: version || "1.0.0",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Name <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (submitted) setNameError(validate(e.target.value));
          }}
          placeholder="e.g. Customer Support Agent"
          className={"input " + (nameError ? "border-red-500" : "")}
          autoFocus
        />
        {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="What does this AI system do?"
          rows={3} className="input resize-none" style={{ minHeight: "80px" }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
        <Select label="Provider" value={provider} onChange={setProvider} options={PROVIDERS} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Deploy To" value={target} onChange={setTarget} options={TARGETS} />
        <Select label="Status" value={status} onChange={setStatus} options={STATUSES} />
      </div>

      <div>
        <label className="label">Version</label>
        <input type="text" value={version} onChange={(e) => setVersion(e.target.value)}
          placeholder="1.0.0" className="input font-mono" />
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-700/60">
        <button onClick={onCancel} className="btn-secondary flex-1 justify-center" disabled={isLoading}>
          Cancel
        </button>
        <button onClick={handleSubmit} className="btn-primary flex-1 justify-center" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : initialValues ? "Save changes" : "Create project"}
        </button>
      </div>
    </div>
  );
}
