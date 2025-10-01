/**
 * ARCHIVO: supabase-admin.ts
 * PROPÓSITO: Cliente Supabase con Service Role Key para operaciones admin
 * ESTADO: development
 * DEPENDENCIAS: .env.local (SUPABASE_SERVICE_ROLE_KEY)
 * OUTPUTS: Cliente admin que bypassa RLS
 * ACTUALIZADO: 2025-10-01
 */

import { createClient } from '@supabase/supabase-js';

// Cliente admin que bypassa RLS para operaciones administrativas
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Función helper para verificar si el usuario actual es admin
export async function isAdminUser(userEmail: string): Promise<boolean> {
  return userEmail === 'sergioariasf@gmail.com';
}

// Función para obtener todas las organizaciones (solo para admin)
export async function getAllOrganizations() {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .order('name');
  
  return { data, error };
}

// Función para obtener todos los user_roles (solo para admin)
export async function getAllUserRoles() {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}