import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { T } from '@/components/ui/Typography';
import { Users, Building2, FileText, AlertTriangle, MessageSquare, UserCog } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { PermissionsDebug } from '@/components/PermissionsDebug';
import { AdminQuickActions } from './AdminQuickActions';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <T.H1>Dashboard</T.H1>
      </div>

      {/* 🏗️ PANEL DE ADMINISTRACIÓN - Solo admins */}
      <Suspense fallback={<div>Cargando acciones...</div>}>
        <AdminQuickActions />
      </Suspense>

      {/* 🧪 COMPONENTE DE PRUEBA - Solo desarrollo */}
      <PermissionsDebug />

      {/* 📊 RESUMEN DE MÓDULOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/communities" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comunidades
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gestión de comunidades de propietarios
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/incidents" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Incidencias
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema de gestión de incidencias
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/documents" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documentos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gestión inteligente de documentos con IA
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/chat-ia" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Chat IA
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Próximamente</span>
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600 ml-auto" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Asistente inteligente para gestión comunitaria
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/foro" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-green-50/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Foro
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Próximamente</span>
              </CardTitle>
              <Users className="h-4 w-4 text-green-600 ml-auto" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Espacio de comunicación para la comunidad
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/usuarios" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios
              </CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gestión de usuarios, roles y permisos
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido al Sistema de Gestión</CardTitle>
          <CardDescription>
            Sistema completo para la administración de comunidades de propietarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Utiliza la navegación superior para acceder a los diferentes módulos del sistema.
            Cada módulo está diseñado para cubrir aspectos específicos de la gestión comunitaria.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
