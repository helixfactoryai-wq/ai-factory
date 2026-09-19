import { useState, useMemo } from 'react';
import { Plus, Search, FolderKanban, X } from 'lucide-react';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Loading';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useToast } from '@/components/ui/Toast';
import type { Project, ProjectInsert, ProjectStatus } from '@/types';

const STATUSES: Array<ProjectStatus | 'All'> = ['All','Idea','Development','Testing','Production'];

export function ProjectsPage() {
  const { data: projects, isLoading, error, refetch } = useProjects();
  const create = useCreateProject();
  const update = useUpdateProject();
  const remove = useDeleteProject();
  const { toast } = useToast();

  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<ProjectStatus | 'All'>('All');
  const [createOpen, setCreate]   = useState(false);
  const [editTarget, setEdit]     = useState<Project | null>(null);
  const [deleteTarget, setDelete] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const q = search.toLowerCase();
      return (!search || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q))
          && (filter === 'All' || p.status === filter);
    });
  }, [projects, search, filter]);

  const handleCreate = async (values: ProjectInsert) => {
    try { await create.mutateAsync(values); setCreate(false); toast('success', 'Project created', `"${values.name}" ready.`); }
    catch { toast('error', 'Failed to create project'); }
  };

  const handleEdit = async (values: ProjectInsert) => {
    if (!editTarget) return;
    try { await update.mutateAsync({ id: editTarget.id, ...values }); setEdit(null); toast('success', 'Project updated'); }
    catch { toast('error', 'Failed to update project'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await remove.mutateAsync(deleteTarget.id); setDelete(null); toast('success', 'Project deleted'); }
    catch { toast('error', 'Failed to delete project'); }
  };

  return (
    <div className="space-y-4">
      {/* Search + add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..." className="input pl-9" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={() => setCreate(true)} className="btn-primary px-3 min-h-0 h-11 flex-shrink-0">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === s ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-transparent text-slate-400 border-slate-700'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Count */}
      {projects && projects.length > 0 && (
        <p className="text-xs text-slate-500">
          {filtered.length === projects.length ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : `${filtered.length} of ${projects.length}`}
        </p>
      )}

      {/* States */}
      {isLoading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>}
      {error && <ErrorMessage message="Could not load projects." onRetry={() => refetch()} />}

      {!isLoading && !error && filtered.length === 0 && (
        search || filter !== 'All' ? (
          <EmptyState icon={Search} title="No results" description="Try a different search or filter."
            action={<button onClick={() => { setSearch(''); setFilter('All'); }} className="btn-secondary">Clear filters</button>} />
        ) : (
          <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first AI project to get started."
            action={<button onClick={() => setCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create project</button>} />
        )
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} onEdit={setEdit} onDelete={setDelete} />)}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreate(false)} title="New project">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setCreate(false)} isLoading={create.isPending} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEdit(null)} title="Edit project">
        {editTarget && <ProjectForm initialValues={editTarget} onSubmit={handleEdit} onCancel={() => setEdit(null)} isLoading={update.isPending} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={handleDelete}
        title="Delete project?" description={`"${deleteTarget?.name}" will be permanently deleted.`}
        confirmLabel="Delete" isLoading={remove.isPending} />
    </div>
  );
}
