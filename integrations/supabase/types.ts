// Stub Supabase Database types
// These types can be generated from your Supabase schema using the Supabase CLI
// For now, this is a minimal stub to make TypeScript happy

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: Record<string, any>;
    Enums: Record<string, any>;
  };
}
