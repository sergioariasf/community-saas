/**
 * ARCHIVO: SettingsContent.tsx
 * PROPÓSITO: Componente de configuración de la herramienta y preferencias
 * ESTADO: development
 * DEPENDENCIAS: UI components, User data
 * OUTPUTS: Interface de configuración del sistema
 * ACTUALIZADO: 2025-09-16
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Users, 
  FileText, 
  AlertTriangle,
  Moon,
  Sun,
  Globe,
  Mail
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettingsContentProps {
  user: SupabaseUser;
}

export function SettingsContent({ user }: SettingsContentProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('es');

  const handleSave = () => {
    toast.success('Configuración guardada correctamente');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
        <p className="text-gray-600">Personaliza la herramienta según tus preferencias</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preferencias de Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferencias de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <Label htmlFor="dark-mode">Modo Oscuro</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Idioma
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ca">Català</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Zona Horaria</Label>
              <Select defaultValue="europe/madrid">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe/madrid">Europa/Madrid</SelectItem>
                  <SelectItem value="europe/london">Europa/Londres</SelectItem>
                  <SelectItem value="america/new_york">América/Nueva York</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="email-notifications">Notificaciones por Email</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="push-notifications">Notificaciones Push</Label>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <div className="space-y-2">
              <Label>Frecuencia de Resúmenes</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instantáneo</SelectItem>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="never">Nunca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Permisos y Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad y Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Roles Actuales</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Admin Global</Badge>
                <Badge variant="secondary">Gestor de Comunidades</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Autenticación de Dos Factores</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Deshabilitado</Badge>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sesiones Activas</Label>
              <div className="text-sm text-gray-600">
                <p>2 sesiones activas</p>
                <Button variant="outline" size="sm" className="mt-1">
                  Cerrar todas las sesiones
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuración del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 border rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                <div className="text-sm font-medium">Usuarios</div>
                <div className="text-xs text-gray-600">25 activos</div>
              </div>
              <div className="p-3 border rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <div className="text-sm font-medium">Documentos</div>
                <div className="text-xs text-gray-600">156 archivos</div>
              </div>
              <div className="p-3 border rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                <div className="text-sm font-medium">Incidencias</div>
                <div className="text-xs text-gray-600">8 pendientes</div>
              </div>
              <div className="p-3 border rounded-lg">
                <Database className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                <div className="text-sm font-medium">Almacenamiento</div>
                <div className="text-xs text-gray-600">2.3 GB usados</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Respaldo Automático</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default">Habilitado</Badge>
                <span className="text-xs text-gray-600">Último: Hoy 03:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de Acción */}
      <div className="mt-8 flex gap-4">
        <Button onClick={handleSave}>
          Guardar Cambios
        </Button>
        <Button variant="outline">
          Restablecer a Predeterminados
        </Button>
        <Button variant="destructive">
          Exportar Datos
        </Button>
      </div>
    </div>
  );
}