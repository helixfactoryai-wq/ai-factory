import { useState } from "react";
import type { Prompt, PromptInsert, PromptModel } from "@/types/prompt";
import { Spinner } from "@/components/ui/Loading";

const MODELS: { value: PromptModel; label: string }[] = [
  { value: "claude-sonnet", label: "Claude Sonnet" },
  { value: "claude-opus",   label: "Claude Opus" },
  { value: "claude-haiku",  label: "Claude Haiku" },
  { value: "gpt-4o",        label: "GPT-4o" },
  { value: "gpt-4-turbo",   label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gemini-pro",    label: "Gemini Pro" },
  { value: "gemini-flash",  label: "Gemini Flash" },
  { value: "deepseek-chat", label: "DeepSeek Chat" },
  { value: "other",         label: "Other" },
];

const estimateTokens = (text: string) => Math.ceil(text.length / 4);

interface Props {
  projectId: string;
  initialValues?: Prompt;
  onSubmit: (v: PromptInsert) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PromptForm({ projectId, initialValues, onSubmit, onCancel, isLoading }: Props) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [model, setModel] = useState<PromptModel>((initialValues?.model as PromptModel) ?? "claude-sonnet");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errors, setErrors] = useState<{ name?: string; content?: string }>({});

  const submit = () => {
    const e: { name?: string; content?: string } = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!content.trim()) e.content = "Content is required.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({
      project_id: projectId,
      name: name.trim(),
      content: content.trim(),
      model,
      notes: notes.trim() || null,
      version: initialValues ? initialValues.version + 1 : 1,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Name <span className="text-red-400">*</span></label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. System prompt v1"
          className={"input " + (errors.name ? "border-red-500" : "")} autoFocus />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label className="label">Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value as PromptModel)} className="input">
          {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">Content <span className="text-red-400">*</span></label>
          <span className="text-[10px] font-mono text-slate-500">
            {content.length} chars · ~{estimateTokens(content)} tokens
          </span>
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="You are a helpful assistant that..."
          rows={8} className={"input resize-none font-mono text-xs leading-relaxed " + (errors.content ? "border-red-500" : "")}
          style={{ minHeight: "180px" }} />
        {errors.content && <p className="mt-1 text-xs text-red-400">{errors.content}</p>}
      </div>

      <div>
        <label className="label">Notes <span className="text-slate-600 font-normal">(optional)</span></label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="What changed, known issues..."
          rows={2} className="input resize-none" style={{ minHeight: "64px" }} />
      </div>

      {initialValues && (
        <div className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs text-indigo-400">Saving creates version {initialValues.version + 1} (currently v{initialValues.version})</p>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-slate-700/60">
        <button onClick={onCancel} className="btn-secondary flex-1 justify-center" disabled={isLoading}>Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 justify-center" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : initialValues ? "Save version" : "Create prompt"}
        </button>
      </div>
    </div>
  );
}
