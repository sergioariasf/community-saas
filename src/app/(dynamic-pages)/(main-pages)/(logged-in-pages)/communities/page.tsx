import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { T } from '@/components/ui/Typography';
import { getAllCommunities } from '@/data/anon/communities';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { CommunitiesList } from '../../CommunitiesList';

export const dynamic = 'force-dynamic';

async function CommunitiesListContainer() {
  const communities = await getAllCommunities();
  return <CommunitiesList communities={communities} showActions={false} />;
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

export default function CommunitiesPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <T.H1>Gestión de Comunidades</T.H1>
          <T.Subtle>
            Administra todas tus comunidades de vecinos desde un solo lugar
          </T.Subtle>
        </div>
        <Link href="/communities/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Nueva Comunidad
          </Button>
        </Link>
      </div>

      <Suspense fallback={<CommunitiesSkeleton />}>
        <CommunitiesListContainer />
      </Suspense>
    </div>
  );
}