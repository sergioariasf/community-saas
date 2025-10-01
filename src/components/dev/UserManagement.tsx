/**
 * ARCHIVO: UserManagement.tsx
 * PROPÓSITO: Componente para gestión de usuarios y organizaciones en dev-panel
 * ESTADO: development
 * DEPENDENCIAS: Supabase client, UI components
 * OUTPUTS: Interface para crear organizaciones y asignar usuarios
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserClient } from '@supabase/ssr';
import { Users, Building, UserPlus, Plus, Check, AlertTriangle, Table as TableIcon } from 'lucide-react';
import { VerticalType } from '@/config/verticals/types';
import { EditableUserRolesTable } from './EditableUserRolesTable';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  vertical_type: string;
  owner_id: string;
  is_active: boolean;
}

interface UserRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  user_email?: string;
  organization_name?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'forms' | 'table'>('table');

  // Form states
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    description: '',
    vertical_type: 'oficinas' as VerticalType,
    contact_email: ''
  });

  const [assignUserForm, setAssignUserForm] = useState({
    user_email: '',
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
      // Cargar organizaciones (más simple y directo)
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) {
        console.error('Error loading organizations:', orgsError);
        throw new Error(`Error cargando organizaciones: ${orgsError.message}`);
      }

      // Cargar user_roles con joins básicos
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('Error loading user_roles:', rolesError);
        // No es crítico, seguimos sin esto
        setUserRoles([]);
      } else {
        setUserRoles(rolesData || []);
      }

      setOrganizations(orgsData || []);
      setUsers([]); // Simplificamos por ahora
      
      console.log('Datos cargados:', { organizations: orgsData?.length, roles: rolesData?.length });

    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgForm.name || !newOrgForm.contact_email) {
      setMessage({ type: 'error', text: 'Nombre y email son requeridos' });
      return;
    }

    setLoading(true);
    try {
      // Verificar si la organización ya existe
      const { data: existingOrg, error: checkError } = await supabase
        .from('organizations')
        .select('name')
        .eq('name', newOrgForm.name)
        .single();

      if (existingOrg) {
        throw new Error(`Ya existe una organización con el nombre "${newOrgForm.name}"`);
      }

      // Obtener el user_id actual (debe ser admin)
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

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error de base de datos: ${error.message} (Code: ${error.code})`);
      }

      setMessage({ type: 'success', text: `Organización "${newOrgForm.name}" creada exitosamente` });
      setNewOrgForm({ name: '', description: '', vertical_type: 'oficinas', contact_email: '' });
      await loadData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: `${errorMessage}` });
      console.error('Error completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignUserToOrganization = async () => {
    if (!assignUserForm.user_email || !assignUserForm.organization_id) {
      setMessage({ type: 'error', text: 'Email y organización son requeridos' });
      return;
    }

    setLoading(true);
    try {
      // Mapeo de emails conocidos a user_ids
      const knownUserEmails: Record<string, string> = {
        'carlos.poggio@fazilonline.com': '47bdbf6f-61c3-4b73-99f0-e08ca69b46c5',
        'carlos.poggio@altersc.com': '47bdbf6f-61c3-4b73-99f0-e08ca69b46c5',
        'sergioariasf@gmail.com': '12e1976b-4bd0-4062-833c-9d1cf78c49eb'
      };

      // Buscar el usuario en nuestro mapeo
      const userId = knownUserEmails[assignUserForm.user_email];
      if (!userId) {
        throw new Error(`Usuario con email ${assignUserForm.user_email} no encontrado. Emails disponibles: ${Object.keys(knownUserEmails).join(', ')}`);
      }

      // Verificar si ya tiene un rol en esta organización
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', assignUserForm.organization_id)
        .single();

      if (existingRole) {
        throw new Error('El usuario ya tiene un rol en esta organización');
      }

      // Crear el rol
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          organization_id: assignUserForm.organization_id,
          role: assignUserForm.role,
          community_id: null // Acceso a toda la organización
        });

      if (insertError) throw insertError;

      setMessage({ 
        type: 'success', 
        text: `Usuario ${assignUserForm.user_email} asignado como ${assignUserForm.role}` 
      });
      setAssignUserForm({ user_email: '', organization_id: '', role: 'manager' });
      await loadData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ type: 'error', text: `Error asignando usuario: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
            <p className="text-muted-foreground">
              Crear organizaciones y asignar usuarios
            </p>
          </div>
        </div>
        
        {/* Toggle entre modos */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2"
          >
            <TableIcon className="w-4 h-4" />
            Tabla Editable
          </Button>
          <Button
            variant={viewMode === 'forms' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('forms')}
            className="flex items-center gap-2"
          >
            <Building className="w-4 h-4" />
            Formularios
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

      {/* Contenido condicional */}
      {viewMode === 'table' ? (
        <EditableUserRolesTable />
      ) : (
        <>
          {/* Crear Organización */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Crear Nueva Organización
          </CardTitle>
          <CardDescription>
            Crear organización para asignar usuarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="org-name">Nombre de Organización</Label>
              <Input
                id="org-name"
                value={newOrgForm.name}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}
                placeholder="ej: Altium"
              />
            </div>
            <div>
              <Label htmlFor="org-email">Email de Contacto</Label>
              <Input
                id="org-email"
                type="email"
                value={newOrgForm.contact_email}
                onChange={(e) => setNewOrgForm({ ...newOrgForm, contact_email: e.target.value })}
                placeholder="ej: carlos.poggio@fazilonline.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="org-description">Descripción (Opcional)</Label>
            <Textarea
              id="org-description"
              value={newOrgForm.description}
              onChange={(e) => setNewOrgForm({ ...newOrgForm, description: e.target.value })}
              placeholder="Descripción de la organización..."
            />
          </div>

          <div>
            <Label htmlFor="org-vertical">Tipo de Vertical</Label>
            <Select 
              value={newOrgForm.vertical_type} 
              onValueChange={(value) => setNewOrgForm({ ...newOrgForm, vertical_type: value as VerticalType })}
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

          <Button 
            onClick={createOrganization} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Organización
          </Button>
        </CardContent>
      </Card>

      {/* Asignar Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Asignar Usuario a Organización
          </CardTitle>
          <CardDescription>
            Dar acceso a un usuario registrado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="user-email">Email del Usuario</Label>
              <Input
                id="user-email"
                type="email"
                value={assignUserForm.user_email}
                onChange={(e) => setAssignUserForm({ ...assignUserForm, user_email: e.target.value })}
                placeholder="carlos.poggio@fazilonline.com"
              />
            </div>
            <div>
              <Label htmlFor="user-org">Organización</Label>
              <Select 
                value={assignUserForm.organization_id} 
                onValueChange={(value) => setAssignUserForm({ ...assignUserForm, organization_id: value })}
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
              <Label htmlFor="user-role">Rol</Label>
              <Select 
                value={assignUserForm.role} 
                onValueChange={(value) => setAssignUserForm({ ...assignUserForm, role: value })}
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

          <Button 
            onClick={assignUserToOrganization} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Asignar Usuario
          </Button>
        </CardContent>
      </Card>

      {/* Estado Actual */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Organizaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Organizaciones ({organizations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.id}</p>
                  </div>
                  <Badge variant={org.vertical_type === 'oficinas' ? 'default' : 'secondary'}>
                    {org.vertical_type}
                  </Badge>
                </div>
              ))}
              {organizations.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay organizaciones</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usuarios Asignados */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Asignados ({userRoles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{role.user_email || 'Email no disponible'}</p>
                    <p className="text-xs text-gray-500">{role.organization_name || 'Org no disponible'}</p>
                  </div>
                  <Badge variant={
                    role.role === 'admin' ? 'destructive' : 
                    role.role === 'manager' ? 'default' : 'secondary'
                  }>
                    {role.role}
                  </Badge>
                </div>
              ))}
              {userRoles.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay usuarios asignados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}