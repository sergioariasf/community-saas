'use client';

import { T } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Table as TableType } from '@/types';
import { Clock, ExternalLink, PlusCircle, Building2, MapPin, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DeleteCommunityButton } from './(logged-in-pages)/communities/[id]/DeleteCommunityButton';
import { usePermissions, useCanEditCommunity, useIsAdmin } from '@/hooks/usePermissions';

interface CommunitiesListProps {
  communities: TableType<'communities'>[];
  showActions?: boolean;
}

export const CommunitiesList = ({ communities, showActions = true }: CommunitiesListProps) => {
  const { canCreateCommunity, canEditCommunity, canDeleteCommunity, hasRoleForCommunity, loading } = usePermissions();
  const isAdmin = useIsAdmin();
  return (
    <div className="space-y-8">
      {showActions && (
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <T.H2>Mis Comunidades</T.H2>
            <T.Subtle>
              {isAdmin ? 
                'Gestiona todas las comunidades del sistema' : 
                'Gestiona tus comunidades asignadas'
              }
            </T.Subtle>
          </div>
          {canCreateCommunity && (
            <Link href="/communities/new">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Nueva Comunidad
              </Button>
            </Link>
          )}
        </div>
      )}

      {communities.length ? (
        <Card className="shadow-sm border-muted/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Dirección</TableHead>
                <TableHead className="hidden lg:table-cell">Contacto</TableHead>
                <TableHead className="text-center">Viviendas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community) => (
                <TableRow key={community.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {community.name}
                    </div>
                    {community.created_at && (
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(community.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {community.address ? 
                          `${community.address.slice(0, 50)}${community.address.length > 50 ? '...' : ''}` 
                          : 'Sin dirección'}
                      </span>
                    </div>
                    {community.postal_code && (
                      <div className="text-xs text-muted-foreground mt-1">
                        CP: {community.postal_code}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {community.admin_contact || 'Sin contacto'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {community.max_units || 100}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1">
                      {/* 👁️ VER - Siempre disponible si tienes acceso a la comunidad */}
                      <Link href={`/communities/${community.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Ver
                        </Button>
                      </Link>
                      
                      {/* ✏️ EDITAR - Solo admin o manager de esta comunidad */}
                      {(canEditCommunity && (isAdmin || hasRoleForCommunity(community.id, 'manager'))) && (
                        <Link href={`/communities/${community.id}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                      
                      {/* 🗑️ ELIMINAR - Solo admin */}
                      {canDeleteCommunity && (
                        <DeleteCommunityButton 
                          communityId={community.id} 
                          communityName={community.name}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No hay comunidades</CardTitle>
            <CardDescription>
              Aún no tienes comunidades registradas. ¡Crea tu primera comunidad!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/communities/new">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Crear Primera Comunidad
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};