'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function PermissionsDebug() {
  const permissions = usePermissions();

  if (permissions.loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (permissions.error) {
    return (
      <Card className="w-full max-w-2xl border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Error de Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{permissions.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Debug de Permisos
          {permissions.isAdmin && <Badge variant="destructive">ADMIN</Badge>}
          {permissions.isManager && <Badge variant="default">MANAGER</Badge>}
          {permissions.isResident && <Badge variant="secondary">RESIDENT</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Permisos Globales:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>✅ Ver todas: {permissions.canViewAllCommunities ? '✓' : '✗'}</div>
            <div>✅ Crear: {permissions.canCreateCommunity ? '✓' : '✗'}</div>
            <div>✅ Editar: {permissions.canEditCommunity ? '✓' : '✗'}</div>
            <div>✅ Eliminar: {permissions.canDeleteCommunity ? '✓' : '✗'}</div>
            <div>✅ Gestionar usuarios: {permissions.canManageUsers ? '✓' : '✗'}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Roles Asignados:</h4>
          {permissions.userRoles.length > 0 ? (
            <div className="space-y-1">
              {permissions.userRoles.map((role, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{role.role.toUpperCase()}</Badge>
                  <span>
                    {role.community_id ? 
                      `Comunidad: ${role.community_name || role.community_id}` : 
                      'Global (todas las comunidades)'
                    }
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No hay roles asignados</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Este componente es solo para desarrollo. Se eliminará en producción.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}