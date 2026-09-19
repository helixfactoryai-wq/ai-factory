import type { ProjectStatus, ProjectCategory, ProjectProvider } from '@/types';

const statusCfg: Record<ProjectStatus, { classes: string; dot: string }> = {
  Idea:        { classes: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',        dot: 'bg-slate-400' },
  Development: { classes: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',           dot: 'bg-blue-400' },
  Testing:     { classes: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',        dot: 'bg-amber-400' },
  Production:  { classes: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',  dot: 'bg-emerald-400' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = statusCfg[status];
  return (
    <span className={`badge ${c.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0 ${c.dot}`} />
      {status}
    </span>
  );
}

const categoryColors: Record<ProjectCategory, string> = {
  Enterprise: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  Education:  'bg-sky-500/20 text-sky-400 border border-sky-500/30',
  Business:   'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  Coding:     'bg-green-500/20 text-green-400 border border-green-500/30',
  Personal:   'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  Custom:     'bg-orange-500/20 text-orange-400 border border-orange-500/30',
};

export function CategoryBadge({ category }: { category: ProjectCategory }) {
  return <span className={`badge ${categoryColors[category]}`}>{category}</span>;
}

const providerColors: Record<ProjectProvider, string> = {
  ChatGPT:    'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  Claude:     'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  Gemini:     'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  DeepSeek:   'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  Kimi:       'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  OpenRouter: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  Other:      'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

export function ProviderBadge({ provider }: { provider: ProjectProvider }) {
  return <span className={`badge ${providerColors[provider]}`}>{provider}</span>;
}
