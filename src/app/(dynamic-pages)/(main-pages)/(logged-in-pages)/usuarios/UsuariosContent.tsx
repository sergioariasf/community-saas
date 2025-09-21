/**
 * ARCHIVO: UsuariosContent.tsx
 * PROPÓSITO: Componente principal de gestión de usuarios con tabla y acciones
 * ESTADO: development
 * DEPENDENCIAS: UI components, User data
 * OUTPUTS: Interface completa de gestión de usuarios
 * ACTUALIZADO: 2025-09-16
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  UserCog, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail,
  Shield,
  Users,
  Building2,
  Filter,
  Download,
  Eye,
  X
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useState } from 'react';
import Link from 'next/link';

interface UsuariosContentProps {
  user: SupabaseUser;
}

// Datos de ejemplo para demostración
const usuariosEjemplo = [
  {
    id: '1',
    name: 'Sergio Arias',
    email: 'sergioariasf@gmail.com',
    role: 'admin',
    community: 'Global',
    status: 'active',
    lastLogin: '2025-09-16',
    created: '2024-01-15'
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@email.com',
    role: 'manager',
    community: 'Residencial Las Flores',
    status: 'active',
    lastLogin: '2025-09-15',
    created: '2024-03-20'
  },
  {
    id: '3',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    role: 'resident',
    community: 'Residencial Las Flores',
    status: 'pending',
    lastLogin: null,
    created: '2025-09-10'
  },
  {
    id: '4',
    name: 'Ana López',
    email: 'ana.lopez@email.com',
    role: 'manager',
    community: 'Torre Azul',
    status: 'active',
    lastLogin: '2025-09-14',
    created: '2024-06-12'
  }
];

export function UsuariosContent({ user }: UsuariosContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">👑 Admin</Badge>;
      case 'manager':
        return <Badge variant="secondary">🛡️ Manager</Badge>;
      case 'resident':
        return <Badge variant="outline">👤 Residente</Badge>;
      default:
        return <Badge variant="outline">Usuario</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Activo</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactivo</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const openUserDetail = (usuario) => {
    setSelectedUser(usuario);
    setShowUserDetail(true);
  };

  const closeUserDetail = () => {
    setSelectedUser(null);
    setShowUserDetail(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserCog className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
            </div>
          </div>
          <Link href="/usuarios/new">
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Usuario</th>
                  <th className="text-left p-3 font-medium">Rol</th>
                  <th className="text-left p-3 font-medium">Comunidad</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Último Acceso</th>
                  <th className="text-left p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosEjemplo.map((usuario) => (
                  <tr key={usuario.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {usuario.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{usuario.name}</p>
                          <p className="text-sm text-gray-600">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {getRoleBadge(usuario.role)}
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{usuario.community}</span>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(usuario.status)}
                    </td>
                    <td className="p-3">
                      <span className="text-sm">
                        {usuario.lastLogin 
                          ? new Date(usuario.lastLogin).toLocaleDateString('es-ES')
                          : 'Nunca'
                        }
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openUserDetail(usuario)}
                          title="Ver detalles del usuario"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar usuario">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Enviar email">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Más opciones">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/usuarios/new">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Nuevo Usuario
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Invitar por Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Importar desde CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gestión de Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Configurar Permisos
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Asignar Roles Masivo
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Building2 className="h-4 w-4 mr-2" />
              Gestionar Comunidades
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Usuarios activos:</span>
              <span className="font-medium">18</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Registros este mes:</span>
              <span className="font-medium">6</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Última actividad:</span>
              <span className="font-medium">Hace 2 min</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalles del usuario */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detalles del Usuario
              </h2>
              <Button variant="ghost" size="sm" onClick={closeUserDetail}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                        {selectedUser.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        <div className="mt-2">{getRoleBadge(selectedUser.role)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Estado:</span>
                        {getStatusBadge(selectedUser.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Comunidad:</span>
                        <span>{selectedUser.community}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Registrado:</span>
                        <span>{new Date(selectedUser.created).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Último acceso:</span>
                        <span>
                          {selectedUser.lastLogin 
                            ? new Date(selectedUser.lastLogin).toLocaleDateString('es-ES')
                            : 'Nunca'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Permisos Globales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="font-medium">Ver todas:</span>
                        <span>✓</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="font-medium">Crear:</span>
                        <span>{selectedUser.role === 'admin' || selectedUser.role === 'manager' ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="font-medium">Editar:</span>
                        <span>{selectedUser.role === 'admin' || selectedUser.role === 'manager' ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">❌</span>
                        <span className="font-medium">Eliminar:</span>
                        <span>{selectedUser.role === 'admin' ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">❌</span>
                        <span className="font-medium">Gestionar usuarios:</span>
                        <span>{selectedUser.role === 'admin' ? '✓' : '✗'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Roles asignados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Roles Asignados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        {selectedUser.role === 'admin' && <Shield className="h-5 w-5 text-blue-600" />}
                        {selectedUser.role === 'manager' && <Users className="h-5 w-5 text-green-600" />}
                        {selectedUser.role === 'resident' && <Building2 className="h-5 w-5 text-gray-600" />}
                        <span className="font-semibold text-lg">
                          {selectedUser.role === 'admin' ? 'ADMINISTRADOR' : 
                           selectedUser.role === 'manager' ? 'MANAGER' : 'RESIDENTE'}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {selectedUser.role === 'admin' 
                          ? 'Global (todas las comunidades)' 
                          : `${selectedUser.community}`
                        }
                      </p>
                      
                      {selectedUser.role === 'admin' && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Capacidades especiales:</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span>• Gestión completa de usuarios</span>
                            <span>• Creación de comunidades</span>
                            <span>• Acceso a todas las comunidades</span>
                            <span>• Configuración del sistema</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.role === 'manager' && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Capacidades:</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span>• Gestión de incidencias</span>
                            <span>• Administración de documentos</span>
                            <span>• Gestión de residentes</span>
                            <span>• Reportes de la comunidad</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas de actividad */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-xs text-gray-600">Incidencias creadas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-xs text-gray-600">Documentos subidos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">24</div>
                      <div className="text-xs text-gray-600">Sesiones este mes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">156</div>
                      <div className="text-xs text-gray-600">Acciones totales</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <Button variant="outline" onClick={closeUserDetail}>
                Cerrar
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar Usuario
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}