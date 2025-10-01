/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Panel de desarrollo para cambiar verticales dinámicamente
 * ESTADO: development
 * DEPENDENCIAS: VerticalProvider, Supabase client
 * OUTPUTS: Interface de desarrollo para testing de verticales
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVertical } from '@/hooks/useVertical';
import { useUserOrganization } from '@/hooks/useUserOrganization';
import { VerticalType, VERTICAL_CONFIGS } from '@/config/verticals';
import { createBrowserClient } from '@supabase/ssr';
import { Settings, Database, Palette, Eye, EyeOff, RefreshCw, AlertTriangle, Users } from 'lucide-react';
import { UserManagement } from '@/components/dev/UserManagement';

export default function DevPanelPage() {
  // Todos los hooks deben ir AL PRINCIPIO antes de cualquier return condicional
  const [isChanging, setIsChanging] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<VerticalType>('comunidades');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'verticales' | 'usuarios'>('verticales');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Hooks de contexto - SIEMPRE deben ejecutarse en el mismo orden
  const { verticalType, config, getTheme, refresh } = useVertical();
  const { organization, refresh: refreshOrg } = useUserOrganization();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Verificar autorización de administrador
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setIsAuthorized(false);
          return;
        }

        const userEmail = user.email;
        setCurrentUser(userEmail || 'Usuario sin email');

        // Solo sergioariasf@gmail.com tiene acceso al dev-panel
        if (userEmail === 'sergioariasf@gmail.com') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error verificando autorización:', error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [supabase]);

  useEffect(() => {
    if (verticalType) {
      setSelectedVertical(verticalType);
    }
  }, [verticalType]);

  // Verificación de autorización
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Acceso denegado</strong><br />
            Solo el administrador del sistema puede acceder a este panel.<br />
            Usuario actual: <code>{currentUser}</code><br />
            Se requiere: <code>sergioariasf@gmail.com</code>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Panel de desarrollo no disponible en producción
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleVerticalChange = async () => {
    if (!organization) {
      setMessage({ type: 'error', text: 'No se encontró organización del usuario' });
      return;
    }

    if (selectedVertical === verticalType) {
      setMessage({ type: 'error', text: 'El vertical seleccionado ya está activo' });
      return;
    }

    setIsChanging(true);
    setMessage(null);

    try {
      // Actualizar vertical_type en la organización
      const { error } = await supabase
        .from('organizations')
        .update({ 
          vertical_type: selectedVertical,
          vertical_config: VERTICAL_CONFIGS[selectedVertical] || {}
        })
        .eq('id', organization.id);

      if (error) {
        throw new Error(error.message);
      }

      // Refrescar contextos
      await refreshOrg();
      await refresh();

      setMessage({ 
        type: 'success', 
        text: `Vertical cambiado exitosamente a "${VERTICAL_CONFIGS[selectedVertical].name}"` 
      });

      // Auto-refresh después de 2 segundos para ver cambios
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: `Error al cambiar vertical: ${errorMessage}` });
    } finally {
      setIsChanging(false);
    }
  };

  const theme = getTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Desarrollo</h1>
            <p className="text-muted-foreground">
              Herramientas para testing y gestión del sistema
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          Development Only
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={activeTab === 'verticales' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('verticales')}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Verticales
        </Button>
        <Button
          variant={activeTab === 'usuarios' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('usuarios')}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Usuarios
        </Button>
      </div>

      {/* Mensajes */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Contenido condicional basado en tab activa */}
      {activeTab === 'usuarios' ? (
        <UserManagement />
      ) : (
        <>
          {/* Estado Actual */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Estado Actual del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Organización</h4>
              <p>{organization?.name || 'No encontrada'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Vertical Activo</h4>
              <div className="flex items-center gap-2">
                <Badge style={{ backgroundColor: theme.primary + '20', color: theme.primary }}>
                  {config.name}
                </Badge>
                <span className="text-xs text-gray-500">({verticalType})</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Tema Actual</h4>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: theme.primary }}
                  title={`Primary: ${theme.primary}`}
                />
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: theme.accent }}
                  title={`Accent: ${theme.accent}`}
                />
              </div>
              <span className="text-sm text-gray-600">{theme.primary} / {theme.accent}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cambiar Vertical */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Cambiar Vertical
          </CardTitle>
          <CardDescription>
            Cambia el tipo de vertical para probar diferentes configuraciones de UI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedVertical} onValueChange={(value) => setSelectedVertical(value as VerticalType)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecciona vertical" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VERTICAL_CONFIGS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: config.theme.primary }}
                      />
                      {config.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleVerticalChange}
              disabled={isChanging || selectedVertical === verticalType}
              className="flex items-center gap-2"
            >
              {isChanging ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              {isChanging ? 'Cambiando...' : 'Aplicar Cambio'}
            </Button>
          </div>

          {selectedVertical !== verticalType && (
            <Alert>
              <AlertDescription>
                Se cambiará de <strong>{config.name}</strong> a <strong>{VERTICAL_CONFIGS[selectedVertical].name}</strong>. 
                La página se recargará automáticamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Previsualización de Configuraciones */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(VERTICAL_CONFIGS).map(([key, verticalConfig]) => (
          <Card key={key} className={key === verticalType ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: verticalConfig.theme.primary }}
                />
                {verticalConfig.name}
                {key === verticalType && (
                  <Badge variant="secondary" className="ml-auto">Activo</Badge>
                )}
              </CardTitle>
              <CardDescription>{verticalConfig.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h5 className="font-medium text-sm mb-2">Módulos</h5>
                <div className="flex flex-wrap gap-1">
                  {verticalConfig.modules.visible.map(module => (
                    <Badge key={module} variant="outline" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      {module}
                    </Badge>
                  ))}
                  {verticalConfig.modules.hidden.map(module => (
                    <Badge key={module} variant="outline" className="text-xs text-gray-400">
                      <EyeOff className="w-3 h-3 mr-1" />
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-sm mb-2">Labels Clave</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">incidents:</span>
                    <span className="font-medium">{verticalConfig.labels.incidents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">communities:</span>
                    <span className="font-medium">{verticalConfig.labels.communities}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Links de Testing */}
      <Card>
        <CardHeader>
          <CardTitle>🔗 Links de Testing</CardTitle>
          <CardDescription>
            Páginas para probar la funcionalidad de verticales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Button variant="outline" asChild>
              <a href="/incidents" target="_blank" className="justify-start">
                📋 Página de {config.labels.incidents}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/communities" target="_blank" className="justify-start">
                🏢 Página de {config.labels.communities}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/vertical-demo" target="_blank" className="justify-start">
                🧪 Demo Completo de Verticales
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}