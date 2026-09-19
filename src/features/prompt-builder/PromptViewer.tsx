import { useState } from "react";
import { Copy, GitBranch, Cpu, X, Check } from "lucide-react";
import type { Prompt } from "@/types/prompt";

const MODEL_LABELS: Record<string, string> = {
  "claude-sonnet":"Claude Sonnet","claude-opus":"Claude Opus","claude-haiku":"Claude Haiku",
  "gpt-4o":"GPT-4o","gpt-4-turbo":"GPT-4 Turbo","gpt-3.5-turbo":"GPT-3.5 Turbo",
  "gemini-pro":"Gemini Pro","gemini-flash":"Gemini Flash","deepseek-chat":"DeepSeek Chat","other":"Other",
};

interface Props { prompt: Prompt; onClose: () => void; onEdit: () => void; }

export function PromptViewer({ prompt, onClose, onEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111827] border-t border-slate-700/60 rounded-t-2xl flex flex-col animate-in" style={{ maxHeight: "90vh" }}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-100 truncate">{prompt.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs text-slate-500"><Cpu className="w-3 h-3" />{MODEL_LABELS[prompt.model] ?? prompt.model}</span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1 text-xs text-slate-500"><GitBranch className="w-3 h-3" />v{prompt.version}</span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-500">~{Math.ceil(prompt.content.length / 4)} tokens</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 text-slate-400 flex-shrink-0 ml-3">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap break-words bg-[#0F172A] rounded-xl p-4 border border-slate-700/60">
            {prompt.content}
          </pre>
          {prompt.notes && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs font-medium text-amber-400 mb-1">Notes</p>
              <p className="text-xs text-slate-400">{prompt.notes}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-slate-700/60 flex-shrink-0">
          <button onClick={handleCopy} className="btn-secondary flex-1 justify-center">
            {copied ? <><Check className="w-4 h-4 text-emerald-400" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
          </button>
          <button onClick={onEdit} className="btn-primary flex-1 justify-center">
            <GitBranch className="w-4 h-4" />New version
          </button>
        </div>
      </div>
    </div>
  );
}
