'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function AuthCodeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCode = () => {
      const code = searchParams.get('code');
      
      if (code) {
        console.log('Auth code detected, redirecting to callback handler:', code);
        
        // Redirect to server-side route handler to process the code
        const currentUrl = new URL(window.location.href);
        const callbackUrl = new URL('/auth/callback', window.location.origin);
        
        // Copy all search params to the callback URL
        currentUrl.searchParams.forEach((value, key) => {
          callbackUrl.searchParams.set(key, value);
        });
        
        // Add next parameter for dashboard redirect
        callbackUrl.searchParams.set('next', '/dashboard');
        
        console.log('Redirecting to:', callbackUrl.toString());
        
        // Use window.location.href for server-side processing
        window.location.href = callbackUrl.toString();
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