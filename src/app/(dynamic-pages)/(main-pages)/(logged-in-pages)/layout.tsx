import { Button } from '@/components/ui/button';
import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { Home, Building2, AlertTriangle, FileText, MessageSquare, Users, UserCog } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { UserDropdown } from '@/components/navigation/UserDropdown';

export default async function Layout({ children }: { children: ReactNode }) {
  try {
    await getCachedLoggedInVerifiedSupabaseUser();
  } catch (error) {
    redirect('/auth?mode=login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Link
            href="/"
            className="font-semibold text-lg flex items-center gap-2"
          >
            <Home className="h-5 w-5" />
            <span>Fazil</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/communities"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Building2 className="h-4 w-4" />
              <span>Comunidades</span>
            </Link>
            <Link
              href="/incidents"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Incidencias</span>
            </Link>
            <Link
              href="/documents"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              <span>Documentos</span>
            </Link>
            <Link
              href="/chat-ia"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat IA</span>
            </Link>
            <Link
              href="/foro"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              <span>Foro</span>
            </Link>
            <Link
              href="/usuarios"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <UserCog className="h-4 w-4" />
              <span>Usuarios</span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
