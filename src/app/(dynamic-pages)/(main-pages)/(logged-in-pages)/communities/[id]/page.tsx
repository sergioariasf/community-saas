import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { T } from '@/components/ui/Typography';
import { getCommunity } from '@/data/anon/communities';
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  MapPin, 
  Mail, 
  Users,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ConfirmDeleteCommunityDialog } from './ConfirmDeleteCommunityDialog';

async function Community({ communityId }: { communityId: string }) {
  try {
    const community = await getCommunity(communityId);

    return (
      <Card className="shadow-md border-t-4 border-t-blue-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Link
              href="/communities"
              className="text-sm text-muted-foreground hover:text-blue-500 flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> 
              <span>Volver a Comunidades</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6 text-blue-500" />
            <T.H2 className="mb-0">{community.name}</T.H2>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Building2 className="h-3 w-3" />
            <span>Comunidad de Vecinos</span>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-5">
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <T.Small className="text-muted-foreground mb-2 block">
                  Dirección
                </T.Small>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <T.P className="mb-0">
                      {community.address || 'No especificada'}
                    </T.P>
                    {community.postal_code && (
                      <T.Small className="text-muted-foreground">
                        CP: {community.postal_code}
                      </T.Small>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <T.Small className="text-muted-foreground mb-2 block">
                  Contacto Administrador
                </T.Small>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <T.P className="mb-0">
                    {community.admin_contact || 'No especificado'}
                  </T.P>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <T.Small className="text-muted-foreground mb-2 block">
                  Número de Viviendas
                </T.Small>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <T.P className="mb-0">
                    {community.max_units || 100} viviendas
                  </T.P>
                </div>
              </div>

              <div>
                <T.Small className="text-muted-foreground mb-2 block">
                  Estado
                </T.Small>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${community.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                  <T.P className="mb-0">
                    {community.is_active ? 'Activa' : 'Inactiva'}
                  </T.P>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div>
              <T.Small className="text-muted-foreground mb-2 block">
                Información de Registro
              </T.Small>
              <div className="space-y-1">
                {community.created_at && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Registrada el {new Date(community.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
                {community.updated_at && community.updated_at !== community.created_at && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Edit className="h-3 w-3" />
                    <span>
                      Última actualización: {new Date(community.updated_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" asChild>
            <Link href="/communities">Volver a Comunidades</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/communities/${community.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <ConfirmDeleteCommunityDialog 
              communityId={community.id} 
              communityName={community.name}
            />
          </div>
        </CardFooter>
      </Card>
    );
  } catch (error) {
    return notFound();
  }
}

// Loading skeleton component
function CommunitySkeleton() {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-32 mb-4" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-72" />
        </div>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <Separator />
      <CardContent className="pt-5">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default async function CommunityPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = await props.params;
  const { id } = params;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Suspense fallback={<CommunitySkeleton />}>
        <Community communityId={id} />
      </Suspense>
    </div>
  );
}