/**
 * ARCHIVO: InvitationsPanel.tsx
 * PROPÓSITO: Panel para gestionar invitaciones de managers y residents
 * ESTADO: development
 * DEPENDENCIAS: Supabase, UI components
 * OUTPUTS: Interface de invitaciones
 * ACTUALIZADO: 2025-10-04
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Send,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserPlus,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getOrganizationInvitationsAction,
  sendUserInvitationAction,
  cancelInvitationAction,
  resendInvitationAction,
} from '@/data/users/invitations';

interface InvitationsPanelProps {
  organizationId: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  custom_message: string | null;
}

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  cancelled: number;
}

export function InvitationsPanel({ organizationId }: InvitationsPanelProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'manager' as 'manager' | 'resident',
    customMessage: '',
  });

  useEffect(() => {
    if (organizationId) {
      loadInvitations();
    }
  }, [organizationId]);

  const loadInvitations = async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const result = await getOrganizationInvitationsAction({ organizationId });

      if (result?.data?.success) {
        setInvitations(result.data.invitations);
        setStats(result.data.stats);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al cargar invitaciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!organizationId || !formData.email.trim()) {
      toast({
        title: 'Error',
        description: 'El email es requerido',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendUserInvitationAction({
        email: formData.email,
        organizationId,
        role: formData.role,
        customMessage: formData.customMessage || undefined,
      });

      if (result?.data?.success) {
        const link = result.data.invitationLink;

        // Guardar el link en el estado para mostrarlo
        if (link) {
          setInvitationLink(link);

          // Intentar copiar al clipboard
          if (navigator.clipboard) {
            try {
              await navigator.clipboard.writeText(link);
              toast({
                title: 'Éxito',
                description: 'Link de invitación copiado al portapapeles',
              });
            } catch (err) {
              console.error('Error copying to clipboard:', err);
            }
          }
        } else {
          toast({
            title: 'Éxito',
            description: 'Invitación enviada exitosamente',
          });
        }

        setShowInviteForm(false);
        setFormData({ email: '', role: 'manager', customMessage: '' });
        await loadInvitations();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al enviar invitación',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta invitación?')) return;

    try {
      const result = await cancelInvitationAction({ invitationId });

      if (result?.data?.success) {
        toast({
          title: 'Éxito',
          description: 'Invitación cancelada exitosamente',
        });
        await loadInvitations();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al cancelar invitación',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const result = await resendInvitationAction({ invitationId });

      if (result?.data?.success) {
        toast({
          title: 'Éxito',
          description: 'Invitación reenviada exitosamente',
        });
        await loadInvitations();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al reenviar invitación',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal para mostrar link de invitación */}
      {invitationLink && (
        <Card className="border-blue-500 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900">Link de Invitación Generado</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInvitationLink(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-800">
              Copia este link y compártelo con el usuario invitado:
            </p>
            <div className="flex gap-2">
              <Input
                value={invitationLink}
                readOnly
                className="font-mono text-sm bg-white"
              />
              <Button
                onClick={async () => {
                  if (navigator.clipboard) {
                    await navigator.clipboard.writeText(invitationLink);
                    toast({
                      title: 'Copiado',
                      description: 'Link copiado al portapapeles',
                    });
                  }
                }}
              >
                Copiar
              </Button>
            </div>
            <p className="text-xs text-blue-700">
              El usuario podrá aceptar la invitación haciendo clic en este link e iniciando sesión con Google o Microsoft.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Header con botón crear invitación */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Invitaciones de Usuarios
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Invita a managers y residents a unirse a tu organización
              </p>
            </div>
            <Button onClick={() => setShowInviteForm(!showInviteForm)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nueva Invitación
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Formulario de invitación (oculto por defecto) */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Invitación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rol</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'manager' | 'resident' })}
                >
                  <option value="manager">Manager</option>
                  <option value="resident">Resident</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mensaje personalizado (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Escribe un mensaje de bienvenida..."
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendInvitation} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? 'Enviando...' : 'Enviar Invitación'}
                </Button>
                <Button variant="outline" onClick={() => setShowInviteForm(false)} disabled={submitting}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de invitaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Invitaciones Activas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando invitaciones...
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay invitaciones pendientes</p>
              <p className="text-sm text-gray-500 mt-2">
                Crea una nueva invitación para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.filter(inv => inv.status === 'pending').map((inv) => (
              <div key={inv.id} className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{inv.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="capitalize">{inv.role}</Badge>
                      <span className="text-sm text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Enviada el {new Date(inv.created_at).toLocaleDateString('es-ES')}
                      </span>
                      <span className="text-sm text-orange-600">
                        Expira: {new Date(inv.expires_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResendInvitation(inv.id)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reenviar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleCancelInvitation(inv.id)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitaciones aceptadas recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Invitaciones Aceptadas ({stats.accepted})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invitations.filter(inv => inv.status === 'accepted').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay invitaciones aceptadas recientemente
              </div>
            ) : (
              invitations.filter(inv => inv.status === 'accepted').slice(0, 5).map((inv) => (
                <div key={inv.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{inv.email}</p>
                    <p className="text-sm text-gray-600 capitalize">{inv.role}</p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aceptada
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
