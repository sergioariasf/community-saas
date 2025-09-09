'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  UserPlus, 
  PlusCircle, 
  BarChart3, 
  Settings,
  Shield,
  ExternalLink,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  buttonText,
  badge 
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  buttonText: string;
  badge?: string;
}) => (
  <Card className="relative group hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm mt-1">{description}</CardDescription>
          </div>
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <Link href={href}>
        <Button className="w-full group-hover:bg-primary/90 transition-colors">
          {buttonText}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);

export const AdminQuickActions = () => {
  const { isAdmin, isManager, loading, userRoles } = usePermissions();

  if (loading) {
    return null; // O un skeleton
  }

  // Solo mostrar si es admin o manager
  if (!isAdmin && !isManager) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {isAdmin ? 'Panel de Administración' : 'Panel de Gestión'}
        </h2>
        <Badge variant="outline" className="ml-2">
          {isAdmin ? 'Admin Global' : 'Manager'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 👥 GESTIÓN DE USUARIOS - Solo Admin */}
        {isAdmin && (
          <QuickActionCard
            title="Usuarios"
            description="Gestionar usuarios y roles del sistema"
            icon={Users}
            href="/users"
            buttonText="Ver Usuarios"
            badge="Admin"
          />
        )}

        {/* 🏢 GESTIÓN DE COMUNIDADES */}
        <QuickActionCard
          title="Comunidades"
          description={
            isAdmin 
              ? "Administrar todas las comunidades" 
              : "Gestionar tus comunidades asignadas"
          }
          icon={Building2}
          href="/communities"
          buttonText="Ver Comunidades"
          badge={isAdmin ? 'Admin' : 'Manager'}
        />

        {/* ➕ CREAR USUARIO - Solo Admin */}
        {isAdmin && (
          <QuickActionCard
            title="Nuevo Usuario"
            description="Crear usuario y asignar roles"
            icon={UserPlus}
            href="/users/new"
            buttonText="Crear Usuario"
            badge="Admin"
          />
        )}

        {/* ➕ CREAR COMUNIDAD */}
        {isAdmin && (
          <QuickActionCard
            title="Nueva Comunidad"
            description="Registrar nueva comunidad"
            icon={PlusCircle}
            href="/communities/new"
            buttonText="Crear Comunidad"
            badge="Admin"
          />
        )}

        {/* 📊 ANALYTICS - Futuro */}
        <QuickActionCard
          title="Analytics"
          description="Estadísticas y métricas del sistema"
          icon={BarChart3}
          href="/analytics"
          buttonText="Ver Estadísticas"
          badge="Próximamente"
        />

        {/* ⚙️ CONFIGURACIÓN - Futuro */}
        <QuickActionCard
          title="Configuración"
          description="Ajustes del sistema y plataforma"
          icon={Settings}
          href="/settings"
          buttonText="Configurar"
          badge="Próximamente"
        />
      </div>

      {/* 🔑 RESUMEN DE PERMISOS */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Tus Permisos Actuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userRoles.map((roleInfo, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {roleInfo.role === 'admin' ? '👑 Admin Global' :
                 roleInfo.role === 'manager' ? '🛡️ Manager' : '👤 Residente'}
                {roleInfo.community_name && ` - ${roleInfo.community_name}`}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};