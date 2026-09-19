import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Copy, GitBranch, Cpu, Clock } from "lucide-react";
import type { Prompt } from "@/types/prompt";

const MODEL_LABELS: Record<string, string> = {
  "claude-sonnet":"Claude Sonnet","claude-opus":"Claude Opus","claude-haiku":"Claude Haiku",
  "gpt-4o":"GPT-4o","gpt-4-turbo":"GPT-4 Turbo","gpt-3.5-turbo":"GPT-3.5",
  "gemini-pro":"Gemini Pro","gemini-flash":"Gemini Flash","deepseek-chat":"DeepSeek","other":"Other",
};
const MODEL_COLORS: Record<string, string> = {
  "claude-sonnet":"bg-orange-500/20 text-orange-400 border-orange-500/30",
  "claude-opus":"bg-orange-500/20 text-orange-400 border-orange-500/30",
  "claude-haiku":"bg-orange-500/20 text-orange-400 border-orange-500/30",
  "gpt-4o":"bg-teal-500/20 text-teal-400 border-teal-500/30",
  "gpt-4-turbo":"bg-teal-500/20 text-teal-400 border-teal-500/30",
  "gpt-3.5-turbo":"bg-teal-500/20 text-teal-400 border-teal-500/30",
  "gemini-pro":"bg-blue-500/20 text-blue-400 border-blue-500/30",
  "gemini-flash":"bg-blue-500/20 text-blue-400 border-blue-500/30",
  "deepseek-chat":"bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "other":"bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return days + "d ago";
  if (hours > 0) return hours + "h ago";
  if (mins > 0) return mins + "m ago";
  return "just now";
}

function Menu({ onEdit, onDuplicate, onCopy, onDelete, onClose }: {
  onEdit:()=>void; onDuplicate:()=>void; onCopy:()=>void; onDelete:()=>void; onClose:()=>void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute top-full right-0 mt-1 w-40 card border-slate-600/60 shadow-xl z-20 py-1 animate-in">
      <button onClick={() => { onEdit(); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-3 text-sm text-slate-300 hover:bg-[#1E2939]"><Pencil className="w-3.5 h-3.5" />Edit</button>
      <button onClick={() => { onCopy(); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-3 text-sm text-slate-300 hover:bg-[#1E2939]"><Copy className="w-3.5 h-3.5" />Copy text</button>
      <button onClick={() => { onDuplicate(); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-3 text-sm text-slate-300 hover:bg-[#1E2939]"><GitBranch className="w-3.5 h-3.5" />Duplicate</button>
      <div className="my-1 border-t border-slate-700/60" />
      <button onClick={() => { onDelete(); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-3 text-sm text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" />Delete</button>
    </div>
  );
}

interface Props {
  prompt: Prompt;
  onEdit: (p: Prompt) => void;
  onDuplicate: (p: Prompt) => void;
  onDelete: (p: Prompt) => void;
  onSelect: (p: Prompt) => void;
}

export function PromptCard({ prompt, onEdit, onDuplicate, onDelete, onSelect }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="card-hover p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => onSelect(prompt)} className="flex-1 text-left min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 truncate">{prompt.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-mono leading-relaxed">
            {prompt.content.slice(0, 120)}{prompt.content.length > 120 ? "..." : ""}
          </p>
        </button>
        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenuOpen((v) => !v)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-[#1E2939]">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && <Menu onEdit={() => onEdit(prompt)} onDuplicate={() => onDuplicate(prompt)} onCopy={handleCopy} onDelete={() => onDelete(prompt)} onClose={() => setMenuOpen(false)} />}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={"badge border " + (MODEL_COLORS[prompt.model] ?? MODEL_COLORS["other"])}>
          <Cpu className="w-2.5 h-2.5 mr-1" />{MODEL_LABELS[prompt.model] ?? prompt.model}
        </span>
        <span className="badge border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
          <GitBranch className="w-2.5 h-2.5 mr-1" />v{prompt.version}
        </span>
        <span className="badge border bg-slate-500/10 text-slate-400 border-slate-500/20">
          ~{Math.ceil(prompt.content.length / 4)} tokens
        </span>
        {copied && <span className="badge border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Copied!</span>}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[11px] text-slate-500">
        <span className="truncate max-w-[60%] italic">{prompt.notes ?? "No notes"}</span>
        <span className="flex items-center gap-1 flex-shrink-0"><Clock className="w-3 h-3" />{timeAgo(prompt.updated_at)}</span>
      </div>
    </div>
  );
}
