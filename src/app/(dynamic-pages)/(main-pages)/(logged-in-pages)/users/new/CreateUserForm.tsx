'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  UserPlus, 
  Loader2, 
  Plus, 
  Trash2, 
  Crown, 
  Shield, 
  User,
  ArrowLeft
} from 'lucide-react';
import { createUserAction } from '@/data/anon/users';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Table } from '@/types';
import type { UserRole } from '@/lib/auth/permissions';

const createUserSchema = z.object({
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  roles: z.array(z.object({
    role: z.enum(['admin', 'manager', 'resident']),
    community_id: z.string().nullable()
  })).min(1, 'Debe asignar al menos un rol')
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
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

export const CreateUserForm = ({ communities }: CreateUserFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      roles: [{ role: 'resident', community_id: null }]
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

  const onSubmit = (data: CreateUserFormData) => {
    startTransition(async () => {
      try {
        await createUserAction(data);
        toast.success(`Usuario ${data.email} creado correctamente`);
        router.push('/users');
      } catch (error) {
        console.error('Error creating user:', error);
        toast.error(
          error instanceof Error 
            ? error.message 
            : 'Error al crear usuario'
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información del usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Datos básicos para crear la cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>
          </CardContent>
        </Card>

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
              Asigna roles al usuario para diferentes comunidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
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

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {errors.roles && (
              <p className="text-sm text-red-600">
                {errors.roles.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Previsualización de permisos */}
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
                Creando Usuario...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};