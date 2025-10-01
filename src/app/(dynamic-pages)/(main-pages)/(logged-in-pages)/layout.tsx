import { Button } from '@/components/ui/button';
import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { UserDropdown } from '@/components/navigation/UserDropdown';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { DynamicNavigation } from '@/components/navigation/DynamicNavigation';

export default async function Layout({ children }: { children: ReactNode }) {
  try {
    await getCachedLoggedInVerifiedSupabaseUser();
  } catch (error) {
    redirect('/auth?mode=login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Link
            href="/"
            className="font-semibold text-lg flex items-center gap-2"
          >
            <Home className="h-5 w-5" />
            <span>Fazil</span>
          </Link>

          <DynamicNavigation />

          <div className="flex items-center gap-4">
            <SimpleThemeToggle />
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
