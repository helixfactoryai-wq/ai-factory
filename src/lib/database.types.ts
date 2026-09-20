export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string; name: string; description: string | null;
          category: string; provider: string; deployment_target: string;
          status: string; version: string; created_at: string; updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string; name: string; description?: string | null;
          category: string; provider: string; deployment_target: string;
          status: string; version?: string; created_at?: string; updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string; name?: string; description?: string | null;
          category?: string; provider?: string; deployment_target?: string;
          status?: string; version?: string; updated_at?: string;
          user_id?: string | null;
        };
      };
      prompts: {
        Row: {
          id: string; project_id: string; name: string; content: string;
          version: number; model: string; notes: string | null;
          is_active: boolean; created_at: string; updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string; project_id: string; name: string; content: string;
          version?: number; model?: string; notes?: string | null;
          is_active?: boolean; created_at?: string; updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string; name?: string; content?: string;
          version?: number; model?: string; notes?: string | null;
          is_active?: boolean; updated_at?: string;
        };
      };
      templates: {
        Row: {
          id: string; name: string; description: string | null;
          content: string; model: string; category: string;
          tags: string[]; author: string | null; is_featured: boolean;
          use_count: number; created_at: string;
        };
        Insert: {
          id?: string; name: string; description?: string | null;
          content: string; model?: string; category?: string;
          tags?: string[]; author?: string | null; is_featured?: boolean;
          use_count?: number; created_at?: string;
        };
        Update: {
          name?: string; description?: string | null; content?: string;
          model?: string; category?: string; tags?: string[];
          author?: string | null; is_featured?: boolean; use_count?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
