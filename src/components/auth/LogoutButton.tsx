'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/supabase-clients/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default', 
  className = '' 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      } else {
        // Redirect to home page after successful logout
        router.push('/');
        router.refresh(); // Force refresh to clear any cached auth state
      }
    } catch (error) {
      console.error('Logout exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}