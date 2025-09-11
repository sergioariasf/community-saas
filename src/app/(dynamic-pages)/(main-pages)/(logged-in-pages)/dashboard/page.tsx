import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { T } from '@/components/ui/Typography';
import { getAllItems } from '@/data/anon/items';
import { getAllPrivateItems } from '@/data/anon/privateItems';
import { PlusCircle, Users, Building2, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { ItemsList } from '../../ItemsList';
import { PrivateItemsList } from '../../PrivateItemsList';
import { PermissionsDebug } from '@/components/PermissionsDebug';
import { AdminQuickActions } from './AdminQuickActions';
import { LogoutButton } from '@/components/auth/LogoutButton';

export const dynamic = 'force-dynamic';

async function ItemsListContainer() {
  const items = await getAllItems();
  return <ItemsList items={items} showActions={false} />;
}

async function PrivateItemsListContainer() {
  const privateItems = await getAllPrivateItems();
  return <PrivateItemsList privateItems={privateItems} showActions={false} />;
}

function ListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <T.H1>Dashboard</T.H1>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> New Private Item
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* 🏗️ PANEL DE ADMINISTRACIÓN - Solo admins */}
      <Suspense fallback={<div>Cargando acciones...</div>}>
        <AdminQuickActions />
      </Suspense>

      {/* 🧪 COMPONENTE DE PRUEBA - Solo desarrollo */}
      <PermissionsDebug />

      <Tabs defaultValue="private" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="private">Private Items</TabsTrigger>
          <TabsTrigger value="public">Public Items</TabsTrigger>
        </TabsList>

        <TabsContent value="private" className="space-y-4">
          <Suspense fallback={<ListSkeleton />}>
            <PrivateItemsListContainer />
          </Suspense>
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <Suspense fallback={<ListSkeleton />}>
            <ItemsListContainer />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
