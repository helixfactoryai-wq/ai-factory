export type PromptModel =
  | "claude-sonnet" | "claude-opus" | "claude-haiku"
  | "gpt-4o" | "gpt-4-turbo" | "gpt-3.5-turbo"
  | "gemini-pro" | "gemini-flash" | "deepseek-chat" | "other";

export interface Prompt {
  id: string;
  project_id: string;
  name: string;
  content: string;
  version: number;
  model: PromptModel;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromptInsert {
  project_id: string;
  name: string;
  content: string;
  version?: number;
  model?: PromptModel;
  notes?: string | null;
  is_active?: boolean;
}

export interface PromptUpdate extends Partial<Omit<PromptInsert, "project_id">> {
  id: string;
}
