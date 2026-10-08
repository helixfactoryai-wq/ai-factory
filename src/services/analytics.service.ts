import { supabase } from "@/lib/supabase";

export interface ProjectAnalytics {
  project_id: string;
  project_name: string;
  status: string;
  provider: string;
  category: string;
  created_at: string;
  prompt_count: number;
  audit_count: number;
  avg_audit_score: number;
  passed_audits: number;
  failed_audits: number;
  avg_latency_ms: number;
  total_tokens_used: number;
}

export interface OverallStats {
  total_projects: number;
  total_prompts: number;
  total_audits: number;
  avg_score: number;
  total_tokens: number;
  pass_rate: number;
}

export const analyticsService = {
  async getProjectAnalytics(): Promise<ProjectAnalytics[]> {
    const { data, error } = await supabase
      .from("project_analytics")
      .select("*")
      .order("audit_count", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ProjectAnalytics[];
  },

  async getOverallStats(): Promise<OverallStats> {
    const { data, error } = await supabase
      .from("project_analytics")
      .select("*");
    if (error) throw error;
    const rows = (data ?? []) as ProjectAnalytics[];
    const total_projects = rows.length;
    const total_prompts = rows.reduce((s, r) => s + r.prompt_count, 0);
    const total_audits = rows.reduce((s, r) => s + r.audit_count, 0);
    const total_tokens = rows.reduce((s, r) => s + r.total_tokens_used, 0);
    const scored = rows.filter((r) => r.audit_count > 0);
    const avg_score = scored.length
      ? Math.round(scored.reduce((s, r) => s + r.avg_audit_score, 0) / scored.length)
      : 0;
    const total_passed = rows.reduce((s, r) => s + r.passed_audits, 0);
    const pass_rate = total_audits > 0
      ? Math.round((total_passed / total_audits) * 100)
      : 0;
    return { total_projects, total_prompts, total_audits, avg_score, total_tokens, pass_rate };
  },

  async getRecentActivity() {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return [];
    return data ?? [];
  },

  async getAuditTrends() {
    const { data, error } = await supabase
      .from("audits")
      .select("created_at, score, status, latency_ms")
      .not("score", "is", null)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) return [];
    return data ?? [];
  },
};
