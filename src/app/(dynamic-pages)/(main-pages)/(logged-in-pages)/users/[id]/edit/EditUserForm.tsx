'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Crown, 
  Shield, 
  User,
  ArrowLeft,
  Mail,
  Calendar
} from 'lucide-react';
import { updateUserRolesAction } from '@/data/anon/users';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Table } from '@/types';
import type { UserRole } from '@/lib/auth/permissions';

const updateUserRolesSchema = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.object({
    role: z.enum(['admin', 'manager', 'resident']),
    community_id: z.string().nullable()
  })).min(0) // Permitir 0 roles para poder eliminar todos
});

type UpdateUserRolesFormData = z.infer<typeof updateUserRolesSchema>;

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

interface EditUserFormProps {
  user: UserData;
  communities: Table<'communities'>[];
}

const RoleIcon = ({ role }: { role: UserRole }) => {
  switch (role) {
    case 'admin':
      return <Crown className="h-4 w-4 text-yellow-600" />;
    case 'manager':
      return <Shield className="h-4 w-4 text-blue-600" />;
    case 'resident':
      return <User className="h-4 w-4 text-green-600" />;
    default:
      return null;
  }
};

export const EditUserForm = ({ user, communities }: EditUserFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UpdateUserRolesFormData>({
    resolver: zodResolver(updateUserRolesSchema),
    defaultValues: {
      userId: user.id,
      roles: user.roles.map(role => ({
        role: role.role,
        community_id: role.community_id
      }))
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'roles'
  });

  const watchedRoles = watch('roles');

  const addRole = () => {
    append({ role: 'resident', community_id: null });
  };

  const onSubmit = (data: UpdateUserRolesFormData) => {
    startTransition(async () => {
      try {
        await updateUserRolesAction(data);
        toast.success(`Roles de ${user.email} actualizados correctamente`);
        router.push('/users');
      } catch (error) {
        console.error('Error updating user roles:', error);
        toast.error(
          error instanceof Error 
            ? error.message 
            : 'Error al actualizar roles'
        );
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header con botón volver */}
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Información del usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {user.email}
          </CardTitle>
          <CardDescription className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Desde: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
            <span>
              Último acceso: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Nunca'}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Asignación de roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Roles y Permisos</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRole}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Agregar Rol
              </Button>
            </CardTitle>
            <CardDescription>
              Gestiona los roles del usuario para diferentes comunidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Sin roles asignados</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Haz clic en "Agregar Rol" para asignar permisos
                </p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>Rol</Label>
                    <Select
                      value={watchedRoles[index]?.role || 'resident'}
                      onValueChange={(value: UserRole) => 
                        setValue(`roles.${index}.role`, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-600" />
                            <span>Admin (Global)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="manager">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span>Manager</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="resident">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600" />
                            <span>Residente</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label>Comunidad</Label>
                    <Select
                      value={watchedRoles[index]?.community_id || ''}
                      onValueChange={(value) => 
                        setValue(`roles.${index}.community_id`, value || null)
                      }
                      disabled={watchedRoles[index]?.role === 'admin'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar comunidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {watchedRoles[index]?.role === 'admin' 
                            ? 'Global (todas las comunidades)' 
                            : 'Sin comunidad específica'
                          }
                        </SelectItem>
                        {communities.map((community) => (
                          <SelectItem key={community.id} value={community.id}>
                            {community.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}

            {errors.roles && (
              <p className="text-sm text-red-600">
                {errors.roles.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Previsualización de permisos */}
        {watchedRoles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Permisos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {watchedRoles.map((roleInfo, index) => {
                  const community = roleInfo.community_id 
                    ? communities.find(c => c.id === roleInfo.community_id)
                    : null;

                  return (
                    <Badge key={index} variant="outline" className="flex items-center gap-2">
                      <RoleIcon role={roleInfo.role} />
                      <span>
                        {roleInfo.role === 'admin' ? 'Admin' : 
                         roleInfo.role === 'manager' ? 'Manager' : 'Residente'}
                        {roleInfo.role === 'admin' ? ' (Global)' :
                         community ? ` en ${community.name}` : ' (Sin comunidad)'}
                      </span>
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Link href="/users">
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};