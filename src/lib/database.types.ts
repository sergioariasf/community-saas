export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          contact_email: string | null
          contact_phone: string | null
          subscription_plan: 'basic' | 'premium' | 'enterprise'
          max_communities: number
          max_users_per_community: number
          is_active: boolean
          timezone: string
          locale: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          contact_email?: string | null
          contact_phone?: string | null
          subscription_plan?: 'basic' | 'premium' | 'enterprise'
          max_communities?: number
          max_users_per_community?: number
          is_active?: boolean
          timezone?: string
          locale?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          contact_email?: string | null
          contact_phone?: string | null
          subscription_plan?: 'basic' | 'premium' | 'enterprise'
          max_communities?: number
          max_users_per_community?: number
          is_active?: boolean
          timezone?: string
          locale?: string
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          admin_contact: string | null
          max_units: number | null
          created_at: string
          updated_at: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          admin_contact?: string | null
          max_units?: number | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          admin_contact?: string | null
          max_units?: number | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          user_id?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          community_id: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          community_id?: string | null
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          community_id?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      private_items: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      incidents: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string
          status: 'abierto' | 'en_progreso' | 'cerrado'
          priority: 'baja' | 'media' | 'alta' | 'urgente'
          community_id: string
          reported_by: string
          assigned_to: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description: string
          status?: 'abierto' | 'en_progreso' | 'cerrado'
          priority?: 'baja' | 'media' | 'alta' | 'urgente'
          community_id: string
          reported_by: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string
          status?: 'abierto' | 'en_progreso' | 'cerrado'
          priority?: 'baja' | 'media' | 'alta' | 'urgente'
          community_id?: string
          reported_by?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
    }
    Views: {
      organization_dashboard: {
        Row: {
          id: string
          name: string
          description: string | null
          subscription_plan: 'basic' | 'premium' | 'enterprise'
          max_communities: number
          max_users_per_community: number
          is_active: boolean
          created_at: string
          total_communities: number
          total_users: number
          open_incidents: number
          total_incidents: number
          owner_email: string
        }
      }
      incidents_summary: {
        Row: {
          id: string
          title: string
          status: 'abierto' | 'en_progreso' | 'cerrado'
          priority: 'baja' | 'media' | 'alta' | 'urgente'
          community_name: string
          community_city: string
          reporter_email: string
          created_at: string
          updated_at: string
          resolved_at: string | null
          days_open: number | null
        }
      }
    }
    Functions: {
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string | null
      }
      can_access_organization: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      debug_user_permissions: {
        Args: {
          check_user_id?: string
        }
        Returns: {
          user_email: string
          role_type: string
          community_name: string
          can_see_all_incidents: boolean
          total_visible_incidents: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}