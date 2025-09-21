/**
 * ARCHIVO: ForoContent.tsx
 * PROPÓSITO: Componente placeholder para Foro con información de desarrollo futuro
 * ESTADO: development
 * DEPENDENCIAS: UI components, User data
 * OUTPUTS: Interface placeholder de Foro
 * ACTUALIZADO: 2025-09-16
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Reply, 
  Pin, 
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Shield
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ForoContentProps {
  user: SupabaseUser;
}

export function ForoContent({ user }: ForoContentProps) {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Foro</h1>
          <Badge variant="secondary" className="ml-2">Próximamente</Badge>
        </div>
        <p className="text-gray-600">
          Espacio de comunicación y debate para propietarios y administradores
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Descripción del Módulo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              ¿Qué es el Foro?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Un espacio centralizado donde propietarios, inquilinos y administradores pueden 
              comunicarse, compartir información y resolver dudas de manera colaborativa.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Características principales:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Discusiones organizadas por categorías
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Sistema de moderación y permisos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Notificaciones en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Búsqueda avanzada de conversaciones
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Categorías Planificadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-blue-600" />
              Categorías del Foro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Avisos Oficiales</div>
                  <div className="text-xs text-gray-600">Solo administradores</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Consultas Generales</div>
                  <div className="text-xs text-gray-600">Preguntas de propietarios</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Propuestas y Sugerencias</div>
                  <div className="text-xs text-gray-600">Mejoras para la comunidad</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Normativas y Reglamentos</div>
                  <div className="text-xs text-gray-600">Dudas sobre normativas</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Mantenimiento</div>
                  <div className="text-xs text-gray-600">Temas de conservación</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funcionalidades Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Funcionalidades Sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-sm">Sistema de Reputación</div>
                  <div className="text-xs text-gray-600">Puntos por participación útil</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Reply className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium text-sm">Respuestas Anidadas</div>
                  <div className="text-xs text-gray-600">Conversaciones organizadas</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Moderación Automática</div>
                  <div className="text-xs text-gray-600">Filtros de contenido</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium text-sm">Temas Populares</div>
                  <div className="text-xs text-gray-600">Destacar discusiones activas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Desarrollo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Estado de Desarrollo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Diseño de base de datos</span>
                <Badge variant="default">Completado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sistema de permisos</span>
                <Badge variant="secondary">En planificación</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Interface de usuario</span>
                <Badge variant="outline">Pendiente</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Moderación y seguridad</span>
                <Badge variant="outline">Pendiente</Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Fecha estimada de lanzamiento:</strong> Q3 2025
              </p>
              <Button disabled className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Acceder al Foro (Próximamente)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mockup de Discusiones */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Vista Previa de Discusiones</CardTitle>
          <p className="text-sm text-gray-600">Así se verán las conversaciones en el foro</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mockup Thread 1 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">Admin</span>
                    <Badge variant="outline" className="text-xs">Administrador</Badge>
                    <span className="text-xs text-gray-500">hace 2 horas</span>
                  </div>
                  <h4 className="font-medium mb-1">📢 Aviso: Mantenimiento del ascensor</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    El próximo martes se realizará el mantenimiento anual del ascensor...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> 5 respuestas
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> 12 reacciones
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Thread 2 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  M
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">María García</span>
                    <Badge variant="secondary" className="text-xs">Propietario</Badge>
                    <span className="text-xs text-gray-500">hace 1 día</span>
                  </div>
                  <h4 className="font-medium mb-1">💡 Propuesta: Instalación de paneles solares</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    He estado investigando sobre paneles solares para la comunidad...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> 18 respuestas
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> 25 reacciones
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">¿Qué temas te gustaría discutir?</h3>
            <p className="text-gray-600 mb-4">
              Ayúdanos a diseñar el foro perfecto para tu comunidad
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline">
                Enviar Ideas
              </Button>
              <Button>
                Solicitar Beta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}