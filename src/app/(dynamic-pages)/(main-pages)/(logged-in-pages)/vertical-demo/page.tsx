/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Página de demo para sistema de verticales multi-industria
 * ESTADO: development
 * DEPENDENCIAS: VerticalProvider, hooks
 * OUTPUTS: Demo funcional del sistema de verticales
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVertical } from '@/hooks/useVertical';
import { ModuleVisibility } from '@/components/vertical/ModuleVisibility';
import { Eye, EyeOff, Palette, Settings } from 'lucide-react';

export default function VerticalDemoPage() {
  const { 
    verticalType, 
    config, 
    loading, 
    error,
    isModuleVisible,
    getLabel,
    getNavigation,
    getTheme
  } = useVertical();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando configuración vertical...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  const theme = getTheme();
  const navigation = getNavigation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Demo Sistema de Verticales</h1>
        <p className="text-muted-foreground">
          Configuración activa: <Badge variant="secondary">{config.name}</Badge>
        </p>
      </div>

      {/* Información del Vertical Activo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración Vertical: {config.name}
          </CardTitle>
          <CardDescription>
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Tipo de Vertical:</h4>
            <Badge variant="outline" style={{ backgroundColor: theme.primary + '20', color: theme.primary }}>
              {verticalType}
            </Badge>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Tema de Colores:</h4>
            <div className="flex gap-2">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300"
                style={{ backgroundColor: theme.primary }}
                title={`Primary: ${theme.primary}`}
              />
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300"
                style={{ backgroundColor: theme.accent }}
                title={`Accent: ${theme.accent}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo de Labels Dinámicos */}
      <Card>
        <CardHeader>
          <CardTitle>🏷️ Labels Dinámicos</CardTitle>
          <CardDescription>
            Los mismos datos se muestran con diferentes terminologías según el vertical
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-sm text-gray-600">Clave</h5>
              <p className="font-mono text-sm">incidents</p>
            </div>
            <div>
              <h5 className="font-medium text-sm text-gray-600">Label</h5>
              <p className="font-semibold">{getLabel('incidents')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-sm text-gray-600">Clave</h5>
              <p className="font-mono text-sm">communities</p>
            </div>
            <div>
              <h5 className="font-medium text-sm text-gray-600">Label</h5>
              <p className="font-semibold">{getLabel('communities')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-sm text-gray-600">Clave</h5>
              <p className="font-mono text-sm">incidents.new</p>
            </div>
            <div>
              <h5 className="font-medium text-sm text-gray-600">Label</h5>
              <p className="font-semibold">{getLabel('incidents.new')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo de Visibilidad de Módulos */}
      <Card>
        <CardHeader>
          <CardTitle>👁️ Visibilidad de Módulos</CardTitle>
          <CardDescription>
            Algunos módulos se muestran u ocultan según el vertical activo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {['documents', 'incidents', 'communities', 'forum', 'chat'].map(moduleKey => (
            <div key={moduleKey} className="flex items-center justify-between p-3 border rounded">
              <span className="font-mono text-sm">{moduleKey}</span>
              <div className="flex items-center gap-2">
                {isModuleVisible(moduleKey) ? (
                  <>
                    <Eye className="w-4 h-4 text-green-600" />
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Visible
                    </Badge>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline" className="text-gray-500">
                      Oculto
                    </Badge>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Demo de Componente ModuleVisibility */}
      <Card>
        <CardHeader>
          <CardTitle>🧩 Componente ModuleVisibility</CardTitle>
          <CardDescription>
            Este componente se muestra u oculta automáticamente según la configuración
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModuleVisibility moduleKey="forum">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-semibold text-blue-900">Módulo Foro</h4>
              <p className="text-blue-700">Este contenido solo se ve si el foro está visible en el vertical activo.</p>
            </div>
          </ModuleVisibility>

          <ModuleVisibility 
            moduleKey="forum" 
            fallback={
              <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                <h4 className="font-semibold text-gray-700">Foro No Disponible</h4>
                <p className="text-gray-600">El foro está oculto en este vertical.</p>
              </div>
            }
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-900">Foro Activo</h4>
              <p className="text-green-700">El foro está disponible en este vertical.</p>
            </div>
          </ModuleVisibility>
        </CardContent>
      </Card>

      {/* Navegación Actual */}
      <Card>
        <CardHeader>
          <CardTitle>🗺️ Navegación Adaptativa</CardTitle>
          <CardDescription>
            Menú principal filtrado según módulos visibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {navigation.map(item => (
              <div key={item.key} className="flex items-center gap-3 p-2 border rounded">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs">{item.icon}</span>
                </div>
                <span className="font-medium">{item.label}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {item.key}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}