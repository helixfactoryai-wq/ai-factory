import { supabase } from "@/lib/supabase";

export type AuditStatus = "pending" | "running" | "passed" | "failed" | "error";

export interface Audit {
  id: string;
  project_id: string;
  prompt_id: string | null;
  name: string;
  status: AuditStatus;
  score: number | null;
  test_input: string;
  expected_output: string | null;
  actual_output: string | null;
  model: string;
  latency_ms: number | null;
  tokens_used: number | null;
  notes: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditInsert {
  project_id: string;
  prompt_id?: string | null;
  name: string;
  test_input: string;
  expected_output?: string | null;
  model?: string;
  notes?: string | null;
}

const TABLE = "audits";

export const auditsService = {
  async getByProject(projectId: string): Promise<Audit[]> {
    const { data, error } = await supabase
      .from(TABLE).select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Audit[];
  },

  async create(payload: AuditInsert): Promise<Audit> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        project_id: payload.project_id,
        prompt_id: payload.prompt_id ?? null,
        name: payload.name,
        test_input: payload.test_input,
        expected_output: payload.expected_output ?? null,
        model: payload.model ?? "claude-sonnet",
        notes: payload.notes ?? null,
        status: "pending",
        user_id: user?.id ?? null,
      } as never)
      .select().single();
    if (error) throw error;
    return data as unknown as Audit;
  },

  async updateResult(id: string, result: {
    status: AuditStatus;
    actual_output: string;
    score: number;
    latency_ms: number;
    tokens_used: number;
  }): Promise<Audit> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...result, updated_at: new Date().toISOString() } as never)
      .eq("id", id).select().single();
    if (error) throw error;
    return data as unknown as Audit;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },
};
