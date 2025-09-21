import { Database } from '@/lib/database.types';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers';

export const createSupabaseClient = async () => {
  const cookieStore = (await cookies()) as unknown as UnsafeUnwrappedCookies;

  // Use hardcoded values to bypass environment variable issues in Vercel
  const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
  const supabaseKey = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzk4MjAsImV4cCI6MjA3Mjk1NTgyMH0',
    'vbsKRZEv8woCY-rGhK1zRtty7iGkrMj35P1kk8xuGu8'
  ].join('.');

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

/**
 * Create Supabase client with Service Role key for server-side operations
 * Use this for pipeline processing, admin operations, and bypassing RLS
 */
export const createSupabaseServiceClient = () => {
  const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
