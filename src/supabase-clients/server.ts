import { Database } from '@/lib/database.types';
import { createServerClient } from '@supabase/ssr';
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
