'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/supabase-clients/client';
import type { Session } from '@supabase/supabase-js';

export function AuthNavLinks() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
    );
  }

  if (session) {
    // User is logged in - show Dashboard link
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
    return (
      <Link
        className="text-sm font-medium hover:underline underline-offset-4"
        href="/login"
      >
        Login
      </Link>
    );
  }
}