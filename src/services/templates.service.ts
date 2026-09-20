import { supabase } from "@/lib/supabase";

export interface Template {
  id: string;
  name: string;
  description: string | null;
  content: string;
  model: string;
  category: string;
  tags: string[];
  author: string | null;
  is_featured: boolean;
  use_count: number;
  created_at: string;
}

const TABLE = "templates";

export const templatesService = {
  async getAll(): Promise<Template[]> {
    const { data, error } = await supabase
      .from(TABLE).select("*")
      .order("is_featured", { ascending: false })
      .order("use_count", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Template[];
  },

  async getById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from(TABLE).select("*").eq("id", id).single();
    if (error) throw error;
    return data as Template | null;
  },
};
