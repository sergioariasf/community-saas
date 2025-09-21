'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/supabase-clients/client';
import type { Session } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';

export function AuthNavLinks() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        console.log('AuthNavLinks - Initial session:', session?.user?.email || 'No session');
        setSession(session);
        setLoading(false);
      } catch (error) {
        console.error('Exception getting session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with logging
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthNavLinks - Auth state change:', event, session?.user?.email || 'No session');
      setSession(session);
      setLoading(false);
      
      // Force router refresh when auth state changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
    );
  }

  if (session && session.user) {
    // User is logged in - show Dashboard link
    console.log('AuthNavLinks - Rendering Dashboard link for user:', session.user.email);
    return (
      <Link
        className="text-sm font-medium hover:underline underline-offset-4"
        href="/dashboard"
      >
        Dashboard
      </Link>
    );
  } else {
    // User is not logged in - show Login link
    console.log('AuthNavLinks - Rendering Login link - no session');
    return (
      <Link
        className="text-sm font-medium hover:underline underline-offset-4"
        href="/auth?mode=login"
      >
        Login
      </Link>
    );
  }
}