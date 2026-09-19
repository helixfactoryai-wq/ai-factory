export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string; name: string; description: string | null;
          category: string; provider: string; deployment_target: string;
          status: string; version: string; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; name: string; description?: string | null;
          category: string; provider: string; deployment_target: string;
          status: string; version?: string; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; name?: string; description?: string | null;
          category?: string; provider?: string; deployment_target?: string;
          status?: string; version?: string; updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
