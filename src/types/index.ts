export type ProjectCategory = 'Enterprise' | 'Education' | 'Business' | 'Coding' | 'Personal' | 'Custom';
export type ProjectProvider = 'ChatGPT' | 'Claude' | 'Gemini' | 'DeepSeek' | 'Kimi' | 'OpenRouter' | 'Other';
export type DeploymentTarget = 'Supabase' | 'Vercel' | 'Railway' | 'Cloud Run' | 'Docker' | 'Local';
export type ProjectStatus = 'Idea' | 'Development' | 'Testing' | 'Production';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  category: ProjectCategory;
  provider: ProjectProvider;
  deployment_target: DeploymentTarget;
  status: ProjectStatus;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  name: string;
  description?: string | null;
  category: ProjectCategory;
  provider: ProjectProvider;
  deployment_target: DeploymentTarget;
  status: ProjectStatus;
  version?: string;
}

export interface ProjectUpdate extends Partial<ProjectInsert> {
  id: string;
}
