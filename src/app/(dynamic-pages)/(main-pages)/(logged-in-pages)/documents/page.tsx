/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Página principal de gestión de documentos con botón "Borrar Todo"
 * ESTADO: production
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents, CleanAllButton
 * OUTPUTS: Vista principal de documentos con funcionalidades de limpieza y subida
 * ACTUALIZADO: 2025-09-15
 */
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { T } from '@/components/ui/Typography';
import { getAllDocuments } from '@/data/anon/documents';
import { PlusCircle, Settings, Trash2, Layers } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { DocumentsList } from './DocumentsList';
import { CleanAllButton } from './CleanAllButton';

export const dynamic = 'force-dynamic';

async function DocumentsListContainer() {
  const documents = await getAllDocuments();
  return <DocumentsList documents={documents} showActions={false} />;
}

function DocumentsSkeleton() {
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

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <T.H1>Gestión de Documentos</T.H1>
          <T.Subtle>
            Administra todos tus documentos: actas, facturas, comunicados y más
          </T.Subtle>
        </div>
        <div className="flex gap-2">
          <Link href="/documents/system-check">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Verificar Sistema
            </Button>
          </Link>
          <Link href="/documents/templates">
            <Button variant="outline" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Plantillas
            </Button>
          </Link>
          <CleanAllButton />
          <Link href="/documents/upload">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> Subir Documento
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<DocumentsSkeleton />}>
        <DocumentsListContainer />
      </Suspense>
    </div>
  );
}