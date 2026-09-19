import { useState } from 'react';
import type { Project, ProjectInsert, ProjectCategory, ProjectProvider, DeploymentTarget, ProjectStatus } from '@/types';
import { Spinner } from '@/components/ui/Loading';

const CATEGORIES: ProjectCategory[] = ['Enterprise','Education','Business','Coding','Personal','Custom'];
const PROVIDERS: ProjectProvider[]  = ['ChatGPT','Claude','Gemini','DeepSeek','Kimi','OpenRouter','Other'];
const TARGETS: DeploymentTarget[]   = ['Supabase','Vercel','Railway','Cloud Run','Docker','Local'];
const STATUSES: ProjectStatus[]     = ['Idea','Development','Testing','Production'];

interface Props {
  initialValues?: Project;
  onSubmit: (v: ProjectInsert) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormValues {
  name: string; description: string;
  category: ProjectCategory; provider: ProjectProvider;
  deployment_target: DeploymentTarget; status: ProjectStatus; version: string;
}

function validate(v: FormValues): Partial<Record<keyof FormValues, string>> {
  const e: Partial<Record<keyof FormValues, string>> = {};
  if (!v.name.trim()) e.name = 'Name is required.';
  else if (v.name.trim().length < 2) e.name = 'At least 2 characters.';
  if (v.version && !/^\d+\.\d+\.\d+$/.test(v.version)) e.version = 'Use semver format e.g. 1.0.0';
  return e;
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
  const [v, setV] = useState<FormValues>({
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    category: (initialValues?.category as ProjectCategory) ?? 'Enterprise',
    provider: (initialValues?.provider as ProjectProvider) ?? 'Claude',
    deployment_target: (initialValues?.deployment_target as DeploymentTarget) ?? 'Vercel',
    status: (initialValues?.status as ProjectStatus) ?? 'Idea',
    version: initialValues?.version ?? '1.0.0',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

  const set = <K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    const next = { ...v, [key]: val };
    setV(next);
    if (touched[key]) setErrors(validate(next));
  };

  const blur = (key: keyof FormValues) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(v));
  };

  const submit = () => {
    const allTouched = Object.keys(v).reduce((a, k) => ({ ...a, [k]: true }), {} as Record<keyof FormValues, boolean>);
    setTouched(allTouched);
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({ name: v.name.trim(), description: v.description.trim() || null, category: v.category, provider: v.provider, deployment_target: v.deployment_target, status: v.status, version: v.version || '1.0.0' });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Name <span className="text-red-400">*</span></label>
        <input type="text" value={v.name} onChange={(e) => set('name', e.target.value)} onBlur={() => blur('name')}
          placeholder="e.g. Customer Support Agent"
          className={`input ${touched.name && errors.name ? 'border-red-500' : ''}`} autoFocus />
        {touched.name && errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea value={v.description} onChange={(e) => set('description', e.target.value)}
          placeholder="What does this AI system do?" rows={3} className="input resize-none" style={{ height: 'auto', minHeight: '80px' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Category" value={v.category} onChange={(val) => set('category', val)} options={CATEGORIES} />
        <Select label="Provider" value={v.provider} onChange={(val) => set('provider', val)} options={PROVIDERS} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Deploy To" value={v.deployment_target} onChange={(val) => set('deployment_target', val)} options={TARGETS} />
        <Select label="Status" value={v.status} onChange={(val) => set('status', val)} options={STATUSES} />
      </div>

      <div>
        <label className="label">Version</label>
        <input type="text" value={v.version} onChange={(e) => set('version', e.target.value)} onBlur={() => blur('version')}
          placeholder="1.0.0" className={`input font-mono ${touched.version && errors.version ? 'border-red-500' : ''}`} />
        {touched.version && errors.version && <p className="mt-1 text-xs text-red-400">{errors.version}</p>}
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-700/60">
        <button onClick={onCancel} className="btn-secondary flex-1 justify-center" disabled={isLoading}>Cancel</button>
        <button onClick={submit} className="btn-primary flex-1 justify-center" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : initialValues ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </div>
  );
}
