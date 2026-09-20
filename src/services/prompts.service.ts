import { supabase } from "@/lib/supabase";
import type { Prompt, PromptInsert, PromptUpdate } from "@/types/prompt";

const TABLE = "prompts";

export const promptsService = {
  async getByProject(projectId: string): Promise<Prompt[]> {
    const { data, error } = await supabase
      .from(TABLE).select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Prompt[];
  },

  async create(payload: PromptInsert): Promise<Prompt> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        project_id: payload.project_id,
        name: payload.name,
        content: payload.content,
        version: payload.version ?? 1,
        model: payload.model ?? "claude-sonnet",
        notes: payload.notes ?? null,
        is_active: true,
        user_id: user?.id ?? null,
      } as never)
      .select().single();
    if (error) throw error;
    return data as unknown as Prompt;
  },

  async update({ id, ...payload }: PromptUpdate): Promise<Prompt> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id).select().single();
    if (error) throw error;
    return data as unknown as Prompt;
  },

  async duplicate(prompt: Prompt): Promise<Prompt> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        project_id: prompt.project_id,
        name: prompt.name + " (copy)",
        content: prompt.content,
        version: prompt.version + 1,
        model: prompt.model,
        notes: prompt.notes,
        is_active: true,
        user_id: user?.id ?? null,
      } as never)
      .select().single();
    if (error) throw error;
    return data as unknown as Prompt;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },
};
