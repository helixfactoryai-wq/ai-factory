import { supabase } from "@/lib/supabase";
import type { Project, ProjectInsert, ProjectUpdate } from "@/types";

const TABLE = "projects";

export const projectsService = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from(TABLE).select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Project[];
  },

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from(TABLE).select("*").eq("id", id).single();
    if (error) throw error;
    return data as Project | null;
  },

  async getRecent(limit = 5): Promise<Project[]> {
    const { data, error } = await supabase
      .from(TABLE).select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []) as Project[];
  },

  async create(payload: ProjectInsert): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from(TABLE).insert({
        ...payload,
        version: payload.version ?? "1.0.0",
        user_id: user?.id,
      }).select().single();
    if (error) throw error;
    return data as Project;
  },

  async update({ id, ...payload }: ProjectUpdate): Promise<Project> {
    const { data, error } = await supabase
      .from(TABLE).update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (error) throw error;
    return data as Project;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },
};
