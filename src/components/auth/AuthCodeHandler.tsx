'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/supabase-clients/client';

export function AuthCodeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCode = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        console.log('Processing auth code:', code);
        
        try {
          const supabase = createClient();
          
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code for session:', error);
            // Redirect to login on error
            router.push('/login?error=auth_failed');
            return;
          }
          
          if (data.session) {
            console.log('Session created successfully:', data.session.user.email);
            // Redirect to dashboard on success
            router.push('/dashboard');
          }
          
        } catch (error) {
          console.error('Auth code processing error:', error);
          router.push('/login?error=auth_failed');
        }
      }
    };

    handleAuthCode();
  }, [searchParams, router]);

  // Show loading state while processing
  const code = searchParams.get('code');
  
  if (code) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Completing sign in...</p>
        </div>
      </div>
    );
  }

  return null;
}