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
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Crown, 
  Shield, 
  User,
  Mail,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { DeleteUserButton } from './DeleteUserButton';
import { usePermissions } from '@/hooks/usePermissions';
import type { UserRole } from '@/lib/auth/permissions';

interface UserData {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
  roles: Array<{
    role: UserRole;
    community_id: string | null;
    community_name?: string;
  }>;
}

interface UsersListProps {
  users: UserData[];
}

const RoleIcon = ({ role }: { role: UserRole }) => {
  switch (role) {
    case 'admin':
      return <Crown className="h-3.5 w-3.5 text-yellow-600" />;
    case 'manager':
      return <Shield className="h-3.5 w-3.5 text-blue-600" />;
    case 'resident':
      return <User className="h-3.5 w-3.5 text-green-600" />;
    default:
      return null;
  }
};

const RoleBadge = ({ role }: { role: UserRole }) => {
  const colors = {
    admin: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    manager: 'bg-blue-100 text-blue-800 border-blue-300',
    resident: 'bg-green-100 text-green-800 border-green-300'
  };

  const labels = {
    admin: 'Admin',
    manager: 'Manager',
    resident: 'Residente'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${colors[role]} flex items-center gap-1 text-xs`}
    >
      <RoleIcon role={role} />
      {labels[role]}
    </Badge>
  );
};

export const UsersList = ({ users }: UsersListProps) => {
  
  const { isAdmin, loading } = usePermissions();

  if (loading) {
    return <div>Cargando permisos...</div>;
  }

  if (!isAdmin) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
          <CardDescription>
            Solo los administradores pueden gestionar usuarios.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <T.H3>Usuarios del Sistema ({users.length})</T.H3>
        </div>
        <Link href="/users/new">
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> 
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      {/* Tabla de usuarios */}
      {users.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="hidden md:table-cell">Comunidades</TableHead>
                <TableHead className="hidden lg:table-cell">Último acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  {/* Información del usuario */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                      {user.created_at && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Desde {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Roles */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((roleInfo, index) => (
                          <RoleBadge key={index} role={roleInfo.role} />
                        ))
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-dashed">
                          Sin roles
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Comunidades */}
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-1 text-sm">
                      {user.roles.length > 0 ? (
                        user.roles.map((roleInfo, index) => {
                          const communityText = roleInfo.community_name || 
                             (roleInfo.role === 'admin' ? 'Global' : 'Sin asignar');
                          return (
                            <div key={index} className="text-muted-foreground">
                              {communityText}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-muted-foreground italic">
                          Sin asignaciones
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Último acceso */}
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {user.last_sign_in_at ? 
                      new Date(user.last_sign_in_at).toLocaleDateString() : 
                      'Nunca'
                    }
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* Editar roles */}
                      <Link href={`/users/${user.id}/edit`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                      </Link>
                      
                      {/* Eliminar usuario */}
                      <DeleteUserButton 
                        userId={user.id} 
                        userEmail={user.email}
                      />
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
            <CardTitle>No hay usuarios</CardTitle>
            <CardDescription>
              Aún no hay usuarios en el sistema. ¡Crea el primer usuario!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/users/new">
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Crear Primer Usuario
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};