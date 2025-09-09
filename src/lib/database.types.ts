export type Database = {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          postal_code: string | null;
          admin_contact: string | null;
          max_units: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          postal_code?: string | null;
          admin_contact?: string | null;
          max_units?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          postal_code?: string | null;
          admin_contact?: string | null;
          max_units?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      items: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string | null;
        };
      };
      private_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          user_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          user_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          user_id?: string;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};