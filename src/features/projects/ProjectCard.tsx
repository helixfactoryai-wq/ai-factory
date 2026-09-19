import { MoreVertical, Pencil, Trash2, GitBranch, Server, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Project, ProjectStatus, ProjectCategory, ProjectProvider } from '@/types';
import { StatusBadge, CategoryBadge, ProviderBadge } from '@/components/ui/Badges';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function Menu({ onEdit, onDelete, onClose }: { onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full right-0 mt-1 w-36 card border-slate-600/60 shadow-xl z-20 py-1 animate-in">
      <button onClick={() => { onEdit(); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-3 text-sm text-slate-300 active:bg-[#1E2939]">
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
      <button onClick={() => { onDelete(); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-3 text-sm text-red-400 active:bg-red-500/10">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
}

interface Props { project: Project; onEdit: (p: Project) => void; onDelete: (p: Project) => void; }

export function ProjectCard({ project, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card-hover p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 truncate">{project.name}</h3>
          {project.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>}
        </div>
        <div className="relative flex-shrink-0">
          <button onClick={() => setMenuOpen((v) => !v)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && <Menu onEdit={() => onEdit(project)} onDelete={() => onDelete(project)} onClose={() => setMenuOpen(false)} />}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <StatusBadge status={project.status as ProjectStatus} />
        <CategoryBadge category={project.category as ProjectCategory} />
        <ProviderBadge provider={project.provider as ProjectProvider} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />v{project.version}</span>
          <span className="flex items-center gap-1"><Server className="w-3 h-3" />{project.deployment_target}</span>
        </div>
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(project.created_at)}</span>
      </div>
    </div>
  );
}
