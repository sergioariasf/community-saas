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
  X,
  ChevronDown
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { createClient } from '@/supabase-clients/client';
import { EditUserModal } from '@/components/usuarios/EditUserModal';
import Link from 'next/link';

interface UsuariosContentProps {
  user: SupabaseUser;
}

// Tipo para usuario del sistema
interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
  community: string;
  status: string;
  lastLogin: string | null;
  created: string;
}

// Tipo para datos de usuario de la base de datos
interface UserRoleData {
  id: string;
  user_id: string;
  organization_id: string;
  community_id: string | null;
  role: string;
  created_at: string;
  auth_users: {
    email: string;
    raw_user_meta_data: any;
    last_sign_in_at?: string;
  };
  communities?: {
    name: string;
  } | null;
  organizations?: {
    name: string;
  } | null;
}

export function UsuariosContent({ user }: UsuariosContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    managers: 0,
    pending: 0
  });

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

  const openUserDetail = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowUserDetail(true);
  };

  const closeUserDetail = () => {
    setSelectedUser(null);
    setShowUserDetail(false);
  };

  const openEditModal = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setShowEditModal(false);
  };

  const handleUserUpdated = () => {
    loadUsers(); // Recargar la lista de usuarios
  };

  // Función para cargar usuarios de la organización del admin
  const loadUsers = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 1. Obtener la organización del usuario actual
      const { data: currentUserRole, error: userError } = await supabase
        .from('user_roles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();


      if (userError || !currentUserRole) {
        console.error('Error getting current user organization:', userError);
        return;
      }

      // 2. Obtener todos los user_roles de la misma organización
      
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          organization_id,
          community_id,
          role,
          created_at,
          communities (
            name
          ),
          organizations (
            name
          )
        `)
        .eq('organization_id', currentUserRole.organization_id);


      if (userRolesError || !userRolesData) {
        console.error('Error loading user roles:', userRolesError);
        return;
      }

      // 3. Por ahora, crear datos simples basados en los user_ids
      // TODO: Mejorar esto cuando tengamos acceso a auth.users
      const userIds = userRolesData.map(ur => ur.user_id);

      // Crear datos temporales usando los emails conocidos
      const knownEmails: { [key: string]: string } = {
        'ff97047d-9ce5-4d8f-80bc-a0da476d7f8b': 'sergioariasf@outlook.es',
        '4d98258e-a547-467b-a239-ad1be3a41fa4': 'sergio.arias@fazilonline.com'
      };

      // 4. Combinar datos con emails conocidos
      const usersData = userRolesData.map(userRole => {
        const email = knownEmails[userRole.user_id] || `user-${userRole.user_id.slice(0,8)}@domain.com`;
        return {
          ...userRole,
          auth_users: { 
            email: email, 
            raw_user_meta_data: { name: email.split('@')[0] }, 
            last_sign_in_at: userRole.role === 'admin' ? new Date().toISOString() : null 
          }
        };
      });


      // 5. Transformar datos para la UI  
      const transformedUsers: Usuario[] = (usersData || []).map((userData: any) => {
        const fullName = userData.auth_users.raw_user_meta_data?.full_name || 
                        userData.auth_users.raw_user_meta_data?.name || 
                        userData.auth_users.email.split('@')[0];
        
        return {
          id: userData.user_id,
          name: fullName,
          email: userData.auth_users.email,
          role: userData.role,
          community: userData.communities?.name || userData.organizations?.name || 'Global',
          status: userData.auth_users.last_sign_in_at ? 'active' : 'pending',
          lastLogin: userData.auth_users.last_sign_in_at || null,
          created: userData.created_at
        };
      });

      setUsuarios(transformedUsers);
      
      // 6. Calcular estadísticas
      const totalUsers = transformedUsers.length;
      const adminCount = transformedUsers.filter(u => u.role === 'admin').length;
      const managerCount = transformedUsers.filter(u => u.role === 'manager').length;
      const pendingCount = transformedUsers.filter(u => u.status === 'pending').length;
      
      setStats({
        total: totalUsers,
        admins: adminCount,
        managers: managerCount,
        pending: pendingCount
      });

    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar usuarios
  const filteredUsers = usuarios.filter(usuario => {
    const matchesSearch = usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || usuario.role === filterRole;
    const matchesStatus = filterStatus === 'all' || usuario.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [user.id]);

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
                <p className="text-2xl font-bold">{loading ? '...' : stats.total}</p>
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
                <p className="text-2xl font-bold">{loading ? '...' : stats.admins}</p>
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
                <p className="text-2xl font-bold">{loading ? '...' : stats.managers}</p>
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
                <p className="text-2xl font-bold">{loading ? '...' : stats.pending}</p>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          
          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por rol
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="admin">👑 Administrador</option>
                    <option value="manager">🛡️ Manager</option>
                    <option value="resident">👤 Residente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por estado
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilterRole('all');
                      setFilterStatus('all');
                      setSearchTerm('');
                    }}
                    className="w-full"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Usuarios</span>
            <span className="text-sm font-normal text-gray-500">
              {loading ? 'Cargando...' : `${filteredUsers.length} de ${usuarios.length} usuarios`}
            </span>
          </CardTitle>
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {usuarios.length === 0 
                        ? "No se encontraron usuarios en tu organización"
                        : "No se encontraron usuarios que coincidan con los filtros"
                      }
                    </td>
                  </tr>
                ) : filteredUsers.map((usuario) => (
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Editar usuario"
                          onClick={() => openEditModal(usuario)}
                        >
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

      {/* Modal de edición de usuario */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={showEditModal}
          onClose={closeEditModal}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}