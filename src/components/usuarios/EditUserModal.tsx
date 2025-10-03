/**
 * ARCHIVO: EditUserModal.tsx
 * PROPÓSITO: Modal para editar roles y información de usuarios
 * ESTADO: development
 * DEPENDENCIAS: UI components, Supabase
 * OUTPUTS: Modal de edición de usuarios
 * ACTUALIZADO: 2025-10-03
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  Save, 
  Shield,
  Users,
  Building2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/supabase-clients/client';

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

interface Community {
  id: string;
  name: string;
}

interface EditUserModalProps {
  user: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserModal({ user, isOpen, onClose, onUserUpdated }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    community_id: '',
    status: user.status
  });

  // Cargar comunidades disponibles
  const loadCommunities = async () => {
    try {
      const supabase = createClient();
      
      // Obtener comunidades (necesitaremos la organización del usuario actual)
      const { data: communitiesData, error } = await supabase
        .from('communities')
        .select('id, name');

      if (error) {
        console.error('Error loading communities:', error);
        return;
      }

      setCommunities(communitiesData || []);
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCommunities();
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        community_id: '',
        status: user.status
      });
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const supabase = createClient();

      // Actualizar rol del usuario
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          role: formData.role,
          community_id: formData.role === 'admin' ? null : formData.community_id || null
        })
        .eq('user_id', user.id);

      if (roleError) {
        throw new Error('Error actualizando rol: ' + roleError.message);
      }

      // Actualizar metadatos del usuario si es necesario
      // TODO: Implementar actualización de metadatos en auth.users

      alert('Usuario actualizado exitosamente');
      onUserUpdated();
      onClose();

    } catch (error) {
      console.error('Error updating user:', error);
      alert(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setLoading(true);
    
    try {
      const supabase = createClient();

      // Eliminar rol del usuario (esto no elimina el usuario de auth, solo lo remueve de la organización)
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Error eliminando usuario: ' + error.message);
      }

      alert('Usuario removido de la organización exitosamente');
      onUserUpdated();
      onClose();

    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Editar Usuario</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Formulario de edición */}
          <div className="space-y-4">
            
            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="role">Rol del usuario</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>👑 Administrador</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>🛡️ Manager</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resident">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-600" />
                      <span>👤 Residente</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comunidad (solo si no es admin) */}
            {formData.role !== 'admin' && communities.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="community">Comunidad</Label>
                <Select 
                  value={formData.community_id} 
                  onValueChange={(value) => setFormData({ ...formData, community_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una comunidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((community) => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Información adicional</h4>
            <div className="text-sm space-y-1">
              <p><strong>Registrado:</strong> {new Date(user.created).toLocaleDateString('es-ES')}</p>
              <p><strong>Último acceso:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}</p>
            </div>
          </div>

          {/* Zona de peligro */}
          <div className="border-t pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-red-900">Zona de Peligro</h4>
              </div>
              <p className="text-sm text-red-800 mb-3">
                Remover usuario de la organización. Esta acción no se puede deshacer.
              </p>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleteConfirm ? 'Confirmar Eliminación' : 'Remover Usuario'}
              </Button>
              {deleteConfirm && (
                <p className="text-xs text-red-600 mt-2">
                  Haz click de nuevo para confirmar la eliminación
                </p>
              )}
            </div>
          </div>

        </div>
        
        {/* Botones de acción */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}