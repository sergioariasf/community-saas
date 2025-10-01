/**
 * ARCHIVO: ClientPage.tsx
 * PROPÓSITO: Página cliente de comunidades con labels dinámicos según vertical
 * ESTADO: development
 * DEPENDENCIAS: useVerticalLabel, communities data
 * OUTPUTS: UI dinámica para gestión de comunidades/departamentos
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { T } from '@/components/ui/Typography';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { CommunitiesList } from '../../CommunitiesList';
import { useVerticalLabel } from '@/hooks/useVertical';
import { DynamicPageTitle } from '@/components/vertical/DynamicPageTitle';

interface CommunitiesClientPageProps {
  communities: any[];
}

function CommunitiesSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
      </div>
    </div>
  );
}

export default function CommunitiesClientPage({ communities }: CommunitiesClientPageProps) {
  // 🚀 VERTICAL LABELS - Títulos dinámicos según el vertical
  const communitiesLabel = useVerticalLabel('communities');
  const newCommunityLabel = useVerticalLabel('communities.new');

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Componente para actualizar título de pestaña dinámicamente */}
      <DynamicPageTitle labelKey="communities" fallback="Comunidades" />
      
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <T.H1>Gestión de {communitiesLabel}</T.H1>
          <T.Subtle>
            Administra todas tus {communitiesLabel.toLowerCase()} desde un solo lugar
          </T.Subtle>
        </div>
        <Link href="/communities/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> {newCommunityLabel}
          </Button>
        </Link>
      </div>

      <Suspense fallback={<CommunitiesSkeleton />}>
        <CommunitiesList communities={communities} showActions={false} />
      </Suspense>
    </div>
  );
}