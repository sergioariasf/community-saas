/**
 * ARCHIVO: ProfileContent.tsx
 * PROPÓSITO: Componente de contenido del perfil de usuario
 * ESTADO: development
 * DEPENDENCIAS: UI components, User data
 * OUTPUTS: Interface de perfil de usuario
 * ACTUALIZADO: 2025-09-16
 */

'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileContentProps {
  user: SupabaseUser;
}

export function ProfileContent({ user }: ProfileContentProps) {
  const userInitials = user.email?.charAt(0).toUpperCase() || 'U';
  const createdAt = new Date(user.created_at || '').toLocaleDateString('es-ES');

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{user.user_metadata?.full_name || 'Usuario'}</h3>
                <p className="text-gray-600">Administrador de Comunidad</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Miembro desde:</span>
                <span>{createdAt}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="font-medium">ID de Usuario:</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles y Permisos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles y Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Roles Actuales</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Admin Global</Badge>
                <Badge variant="secondary">Gestor de Comunidades</Badge>
                <Badge variant="outline">Visor de Documentos</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Permisos</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✅ Gestionar usuarios y roles</li>
                <li>✅ Administrar todas las comunidades</li>
                <li>✅ Crear y editar incidencias</li>
                <li>✅ Subir y gestionar documentos</li>
                <li>✅ Ver estadísticas del sistema</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Información de la Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Método de autenticación:</span>
              <span>{user.app_metadata?.provider || 'Email/Password'}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="font-medium">Estado de email:</span>
              <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
                {user.email_confirmed_at ? "Verificado" : "Sin verificar"}
              </Badge>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-medium">Último acceso:</span>
              <span>{new Date(user.last_sign_in_at || '').toLocaleDateString('es-ES')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-xs text-gray-600">Incidencias creadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-xs text-gray-600">Documentos subidos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-xs text-gray-600">Comunidades gestionadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">24</div>
                <div className="text-xs text-gray-600">Sesiones este mes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}