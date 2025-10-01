/**
 * ARCHIVO: EditableUserRolesTable.tsx
 * PROPÓSITO: Tabla editable para gestión de usuarios, organizaciones y roles
 * ESTADO: development
 * DEPENDENCIAS: Supabase client, UI components
 * OUTPUTS: Interface tipo DataTable para gestión completa
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search,
  Filter,
  RefreshCw,
  AlertTriangle 
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  description?: string;
  vertical_type: string;
  subscription_plan: string;
  contact_email: string;
  is_active: boolean;
}

interface UserRoleRow {
  id: string;
  user_id: string;
  user_email: string;
  organization_id: string;
  organization_name: string;
  vertical_type: string;
  role: 'admin' | 'manager' | 'resident';
  community_id?: string;
  created_at: string;
  isEditing?: boolean;
}

interface NewUserForm {
  email: string;
  organization_id: string;
  role: string;
}

export function EditableUserRolesTable() {
  const [userRoles, setUserRoles] = useState<UserRoleRow[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('all');
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<UserRoleRow>>({});
  
  // Estados para edición de organizaciones
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editingOrgData, setEditingOrgData] = useState<Partial<Organization>>({});
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    description: '',
    contact_email: '',
    vertical_type: 'oficinas' as 'oficinas' | 'comunidades'
  });
  
  // Form para nuevo usuario
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: '',
    organization_id: '',
    role: 'manager'
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando datos de organizaciones y user_roles (modo admin)...');
      
      // Cargar organizaciones usando API admin
      const orgsResponse = await fetch('/api/admin/organizations');
      if (!orgsResponse.ok) {
        throw new Error(`Error API organizaciones: ${orgsResponse.status}`);
      }
      const orgsResult = await orgsResponse.json();
      const orgsData = orgsResult.data;

      console.log('📊 Organizaciones cargadas:', orgsData?.length || 0);
      orgsData?.forEach((org: any) => {
        console.log(`- ${org.name} (${org.vertical_type}) - ${org.contact_email}`);
      });

      // Cargar user_roles usando API admin
      const rolesResponse = await fetch('/api/admin/user-roles');
      let rolesData: any[] = [];
      
      if (rolesResponse.ok) {
        const rolesResult = await rolesResponse.json();
        rolesData = rolesResult.data || [];
        console.log('👥 User roles cargados:', rolesData.length);
      } else {
        console.warn('Error cargando user_roles, continuando sin ellos');
      }

      // Mapeo de usuarios conocidos
      const userEmailMap: Record<string, string> = {
        '47bdbf6f-61c3-4b73-99f0-e08ca69b46c5': 'carlos.poggio@fazilonline.com',
        '12e1976b-4bd0-4062-833c-9d1cf78c49eb': 'sergioariasf@gmail.com'
      };
      
      // Para usuarios no conocidos, mostrar parte del ID
      rolesData?.forEach((role: any) => {
        if (!userEmailMap[role.user_id]) {
          userEmailMap[role.user_id] = `Usuario ${role.user_id.slice(0, 8)}...`;
        }
      });

      // Crear mapa de organizaciones
      const orgMap: Record<string, any> = {};
      orgsData?.forEach((org: any) => {
        orgMap[org.id] = org;
      });

      // Combinar datos de user_roles con organizaciones
      const combinedData: UserRoleRow[] = rolesData?.map((role: any) => {
        const org = orgMap[role.organization_id];
        return {
          id: role.id,
          user_id: role.user_id,
          user_email: userEmailMap[role.user_id] || 'Usuario no encontrado',
          organization_id: role.organization_id,
          organization_name: org?.name || 'Org no encontrada',
          vertical_type: org?.vertical_type || 'unknown',
          role: role.role,
          community_id: role.community_id,
          created_at: role.created_at
        };
      }) || [];

      setOrganizations(orgsData || []);
      setUserRoles(combinedData);
      
      console.log('✅ Datos cargados exitosamente:', { 
        organizations: orgsData?.length, 
        userRoles: combinedData.length 
      });

      // Si no hay user_roles, mostrar mensaje informativo
      if (combinedData.length === 0) {
        setMessage({ 
          type: 'error', 
          text: 'No hay usuarios asignados a organizaciones. Usa el formulario para crear asignaciones.' 
        });
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: `Error cargando datos: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const addNewUser = async () => {
    if (!newUserForm.email || !newUserForm.organization_id) {
      setMessage({ type: 'error', text: 'Email y organización son requeridos' });
      return;
    }

    setLoading(true);
    try {
      // Mapeo de emails conocidos a user_ids
      const knownUserEmails: Record<string, string> = {
        'carlos.poggio@fazilonline.com': '47bdbf6f-61c3-4b73-99f0-e08ca69b46c5',
        'carlos.poggio@altersc.com': '47bdbf6f-61c3-4b73-99f0-e08ca69b46c5', // Carlos tiene estos 2 emails
        'sergioariasf@gmail.com': '12e1976b-4bd0-4062-833c-9d1cf78c49eb'
      };
      
      const userId = knownUserEmails[newUserForm.email];
      if (!userId) {
        throw new Error(`Usuario con email ${newUserForm.email} no encontrado en la lista de usuarios conocidos`);
      }

      // Verificar si ya existe el rol
      const existingRole = userRoles.find(
        role => role.user_id === userId && role.organization_id === newUserForm.organization_id
      );

      if (existingRole) {
        throw new Error('El usuario ya tiene un rol en esta organización');
      }

      // Crear el rol
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          organization_id: newUserForm.organization_id,
          role: newUserForm.role,
          community_id: null
        });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Usuario ${newUserForm.email} asignado exitosamente` 
      });
      
      setNewUserForm({ email: '', organization_id: '', role: 'manager' });
      setShowNewUserForm(false);
      await loadData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row: UserRoleRow) => {
    setEditingRow(row.id);
    setEditingData({ ...row });
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditingData({});
  };

  const saveEdit = async () => {
    if (!editingRow || !editingData.role || !editingData.organization_id) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          role: editingData.role,
          organization_id: editingData.organization_id
        })
        .eq('id', editingRow);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Rol actualizado exitosamente' });
      setEditingRow(null);
      setEditingData({});
      await loadData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Rol eliminado exitosamente' });
      await loadData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Funciones CRUD para organizaciones
  const createOrganization = async () => {
    if (!newOrgForm.name || !newOrgForm.contact_email) {
      setMessage({ type: 'error', text: 'Nombre y email son requeridos' });
      return;
    }

    setLoading(true);
    try {
      // Verificar si la organización ya existe
      const { data: existing } = await supabase
        .from('organizations')
        .select('name')
        .eq('name', newOrgForm.name)
        .single();

      if (existing) {
        throw new Error(`Ya existe una organización con el nombre "${newOrgForm.name}"`);
      }

      // Obtener el user_id actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgForm.name,
          description: newOrgForm.description,
          owner_id: user.id,
          vertical_type: newOrgForm.vertical_type,
          vertical_config: {},
          contact_email: newOrgForm.contact_email,
          subscription_plan: 'premium',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setMessage({ type: 'success', text: `Organización "${newOrgForm.name}" creada exitosamente` });
      setNewOrgForm({ name: '', description: '', contact_email: '', vertical_type: 'oficinas' });
      setShowNewOrgForm(false);
      await loadData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const startEditOrg = (org: Organization) => {
    setEditingOrg(org.id);
    setEditingOrgData({ ...org });
  };

  const cancelEditOrg = () => {
    setEditingOrg(null);
    setEditingOrgData({});
  };

  const saveEditOrg = async () => {
    if (!editingOrg || !editingOrgData.name || !editingOrgData.contact_email) {
      setMessage({ type: 'error', text: 'Nombre y email son requeridos' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editingOrgData.name,
          description: editingOrgData.description || '',
          contact_email: editingOrgData.contact_email,
          vertical_type: editingOrgData.vertical_type,
          is_active: editingOrgData.is_active
        })
        .eq('id', editingOrg);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Organización actualizada exitosamente' });
      setEditingOrg(null);
      setEditingOrgData({});
      await loadData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (orgId: string, orgName: string) => {
    // Verificar si tiene usuarios asignados
    const usersInOrg = userRoles.filter(role => role.organization_id === orgId);
    
    let confirmMessage = `¿Estás seguro de que quieres eliminar la organización "${orgName}"?`;
    if (usersInOrg.length > 0) {
      confirmMessage += `\n\nATENCIÓN: Esta organización tiene ${usersInOrg.length} usuario(s) asignado(s). Se eliminarán también sus roles.`;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      // Primero eliminar todos los user_roles de esta organización
      if (usersInOrg.length > 0) {
        const { error: rolesError } = await supabase
          .from('user_roles')
          .delete()
          .eq('organization_id', orgId);

        if (rolesError) throw rolesError;
      }

      // Luego eliminar la organización
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Organización "${orgName}" eliminada exitosamente${usersInOrg.length > 0 ? ` junto con ${usersInOrg.length} rol(es)` : ''}` 
      });
      await loadData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredRoles = userRoles.filter(role => {
    const matchesSearch = role.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterOrg === 'all' || role.organization_id === filterOrg;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">Gestión de Usuarios y Roles</h2>
            <p className="text-muted-foreground">
              Tabla editable para gestionar asignaciones
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowNewUserForm(!showNewUserForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Usuario
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowNewOrgForm(!showNewOrgForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Organización
          </Button>
        </div>
      </div>

      {/* Mensajes */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Formulario nueva organización */}
      {showNewOrgForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Crear Nueva Organización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nombre de Organización</label>
                <Input
                  value={newOrgForm.name}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}
                  placeholder="ej: Nueva Empresa S.L."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email de Contacto</label>
                <Input
                  type="email"
                  value={newOrgForm.contact_email}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, contact_email: e.target.value })}
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={newOrgForm.description}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, description: e.target.value })}
                placeholder="Descripción de la organización..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo de Vertical</label>
              <Select 
                value={newOrgForm.vertical_type} 
                onValueChange={(value) => setNewOrgForm({ ...newOrgForm, vertical_type: value as 'oficinas' | 'comunidades' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oficinas">Oficinas - Gestión corporativa</SelectItem>
                  <SelectItem value="comunidades">Comunidades - Gestión de vecinos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={createOrganization} disabled={loading}>
                <Check className="w-4 h-4 mr-2" />
                Crear Organización
              </Button>
              <Button variant="outline" onClick={() => setShowNewOrgForm(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario nuevo usuario */}
      {showNewUserForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Agregar Nuevo Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Email del Usuario</label>
                <Input
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="carlos.poggio@fazilonline.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Organización</label>
                <Select 
                  value={newUserForm.organization_id} 
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, organization_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar organización" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} ({org.vertical_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <Select 
                  value={newUserForm.role} 
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Control total</SelectItem>
                    <SelectItem value="manager">Manager - Gestión</SelectItem>
                    <SelectItem value="resident">Resident - Usuario final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addNewUser} disabled={loading}>
                <Check className="w-4 h-4 mr-2" />
                Agregar Usuario
              </Button>
              <Button variant="outline" onClick={() => setShowNewUserForm(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por email o organización..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterOrg} onValueChange={setFilterOrg}>
              <SelectTrigger className="w-64">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las organizaciones</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sección Organizaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Organizaciones ({organizations.length})</CardTitle>
          <CardDescription>
            Gestión de organizaciones registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organización</TableHead>
                <TableHead>Tipo Vertical</TableHead>
                <TableHead>Email Contacto</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => {
                const orgUserCount = userRoles.filter(role => role.organization_id === org.id).length;
                const isEditing = editingOrg === org.id;
                
                return (
                  <TableRow key={org.id} className={isEditing ? 'bg-blue-50' : ''}>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingOrgData.name || ''}
                          onChange={(e) => setEditingOrgData({ ...editingOrgData, name: e.target.value })}
                          className="w-40"
                        />
                      ) : (
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-xs text-gray-500">{org.id.slice(0, 8)}...</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select 
                          value={editingOrgData.vertical_type || 'oficinas'} 
                          onValueChange={(value) => setEditingOrgData({ ...editingOrgData, vertical_type: value as 'oficinas' | 'comunidades' })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oficinas">Oficinas</SelectItem>
                            <SelectItem value="comunidades">Comunidades</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={org.vertical_type === 'oficinas' ? 'default' : 'secondary'}>
                          {org.vertical_type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editingOrgData.contact_email || ''}
                          onChange={(e) => setEditingOrgData({ ...editingOrgData, contact_email: e.target.value })}
                          className="w-44"
                        />
                      ) : (
                        org.contact_email
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.subscription_plan}</Badge>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select 
                          value={editingOrgData.is_active ? 'true' : 'false'} 
                          onValueChange={(value) => setEditingOrgData({ ...editingOrgData, is_active: value === 'true' })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Activa</SelectItem>
                            <SelectItem value="false">Inactiva</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={org.is_active ? 'default' : 'destructive'}>
                          {org.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{orgUserCount} usuarios</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={saveEditOrg} disabled={loading}>
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditOrg}>
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEditOrg(org)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => deleteOrganization(org.id, org.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {organizations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>No se encontraron organizaciones</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios y Roles ({filteredRoles.length})</CardTitle>
          <CardDescription>
            Click en una fila para editar. Los cambios se guardan automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Vertical</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id} className={editingRow === role.id ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{role.user_email}</p>
                      <p className="text-xs text-gray-500">{role.user_id.slice(0, 8)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingRow === role.id ? (
                      <Select 
                        value={editingData.organization_id} 
                        onValueChange={(value) => setEditingData({ ...editingData, organization_id: value })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>
                        <p className="font-medium">{role.organization_name}</p>
                        <p className="text-xs text-gray-500">{role.organization_id.slice(0, 8)}...</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.vertical_type === 'oficinas' ? 'default' : 'secondary'}>
                      {role.vertical_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingRow === role.id ? (
                      <Select 
                        value={editingData.role} 
                        onValueChange={(value) => setEditingData({ ...editingData, role: value as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="resident">Resident</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={
                        role.role === 'admin' ? 'destructive' : 
                        role.role === 'manager' ? 'default' : 'secondary'
                      }>
                        {role.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {new Date(role.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {editingRow === role.id ? (
                        <>
                          <Button size="sm" onClick={saveEdit} disabled={loading}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(role)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteRole(role.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRoles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>No se encontraron usuarios con los filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}