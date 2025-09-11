'use client';

import { useEffect } from 'react';
import { createClient } from '@/supabase-clients/client';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      const supabase = createClient();
      
      try {
        await supabase.auth.signOut();
        console.log('Logged out successfully');
        
        // Clear any local storage or session storage if needed
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        
        // Redirect to login page
        router.push('/login');
        router.refresh();
        
      } catch (error) {
        console.error('Error during logout:', error);
        router.push('/login');
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Logging out...</p>
      </div>
    </div>
  );
}