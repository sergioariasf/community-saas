/**
 * ARCHIVO: PendingRegistrationsPanel.tsx
 * PROPÓSITO: Panel para gestionar solicitudes de registro de nuevos admins
 * ESTADO: development
 * DEPENDENCIAS: Supabase, UI components
 * OUTPUTS: Interface de solicitudes pendientes
 * ACTUALIZADO: 2025-10-04
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Users,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getPendingRegistrationsAction,
  approveRegistrationAction,
  rejectRegistrationAction,
} from '@/data/users/registrations';

interface Registration {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  phone: string | null;
  vertical_type: string | null;
  message: string | null;
  estimated_communities: number | null;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
}

export function PendingRegistrationsPanel() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state para aprobación
  const [approvalData, setApprovalData] = useState({
    subscriptionPlan: 'basic' as 'basic' | 'premium' | 'enterprise',
    maxCommunities: 5,
  });

  // Form state para rechazo
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadPendingRegistrations();
  }, []);

  const loadPendingRegistrations = async () => {
    setLoading(true);
    try {
      const result = await getPendingRegistrationsAction();

      if (result?.data?.success) {
        setRegistrations((result.data.requests || []) as unknown as Registration[]);
        setStats(result.data.stats);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al cargar solicitudes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRegistration) return;

    setSubmitting(true);
    try {
      const result = await approveRegistrationAction({
        registrationId: selectedRegistration.id,
        subscriptionPlan: approvalData.subscriptionPlan,
        maxCommunities: approvalData.maxCommunities,
      });

      if (result?.data?.success) {
        toast({
          title: 'Éxito',
          description: `Solicitud aprobada. Código: ${result.data.invitationCode}`,
        });

        setShowApprovalDialog(false);
        setSelectedRegistration(null);
        await loadPendingRegistrations();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al aprobar solicitud',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration || !rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Debes proporcionar una razón para el rechazo (mínimo 10 caracteres)',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await rejectRegistrationAction({
        registrationId: selectedRegistration.id,
        reason: rejectReason,
      });

      if (result?.data?.success) {
        toast({
          title: 'Éxito',
          description: 'Solicitud rechazada exitosamente',
        });

        setShowRejectDialog(false);
        setSelectedRegistration(null);
        setRejectReason('');
        await loadPendingRegistrations();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al rechazar solicitud',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Solicitudes de Registro Pendientes
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Revisa y aprueba nuevas solicitudes de administradores
          </p>
        </CardHeader>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Activas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando solicitudes...
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay solicitudes pendientes</p>
              <p className="text-sm text-gray-500 mt-2">
                Las nuevas solicitudes aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.filter(r => r.status === 'pending').map((reg) => (
              <div key={reg.id} className="border rounded-lg p-6 space-y-4">
                {/* Header de la solicitud */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{reg.company_name}</h3>
                      <p className="text-sm text-gray-600">
                        Solicitado el {new Date(reg.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                </div>

                {/* Información del solicitante */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Nombre completo</p>
                      <p className="font-medium">{reg.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{reg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="font-medium">{reg.phone || 'No proporcionado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Tipo de negocio</p>
                      <p className="font-medium capitalize">{reg.vertical_type || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* Mensaje del solicitante */}
                {reg.message && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                    <p className="text-xs text-gray-500 font-medium">Mensaje</p>
                  </div>
                  <p className="text-sm text-gray-700 ml-6">{reg.message}</p>
                </div>
                )}

                {reg.estimated_communities && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Comunidades estimadas:</span> {reg.estimated_communities}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setSelectedRegistration(reg);
                      setShowApprovalDialog(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar Solicitud
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedRegistration(reg);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de solicitudes procesadas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {registrations.filter(r => r.status !== 'pending').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay solicitudes procesadas recientemente
              </div>
            ) : (
              registrations.filter(r => r.status !== 'pending').slice(0, 5).map((reg) => (
                <div key={reg.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{reg.company_name}</p>
                    <p className="text-sm text-gray-600">{reg.email}</p>
                  </div>
                  <Badge variant={reg.status === 'approved' ? 'default' : 'destructive'}>
                    {reg.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de aprobación */}
      {showApprovalDialog && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Aprobar Solicitud</CardTitle>
              <p className="text-sm text-gray-600">
                Configurar acceso para {selectedRegistration.company_name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plan de Suscripción</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={approvalData.subscriptionPlan}
                  onChange={(e) => {
                    const plan = e.target.value as 'basic' | 'premium' | 'enterprise';
                    const maxComm = plan === 'basic' ? 5 : plan === 'premium' ? 20 : 100;
                    setApprovalData({ subscriptionPlan: plan, maxCommunities: maxComm });
                  }}
                >
                  <option value="basic">Basic (5 comunidades)</option>
                  <option value="premium">Premium (20 comunidades)</option>
                  <option value="enterprise">Enterprise (100 comunidades)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Máximo de Comunidades
                </label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={approvalData.maxCommunities}
                  onChange={(e) => setApprovalData({ ...approvalData, maxCommunities: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? 'Aprobando...' : 'Aprobar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalDialog(false);
                    setSelectedRegistration(null);
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog de rechazo */}
      {showRejectDialog && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Rechazar Solicitud</CardTitle>
              <p className="text-sm text-gray-600">
                Proporciona una razón para rechazar a {selectedRegistration.company_name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Razón del rechazo (mínimo 10 caracteres)
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Ej: La solicitud no cumple con los requisitos mínimos..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={submitting || rejectReason.length < 10}
                  className="flex-1"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? 'Rechazando...' : 'Rechazar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setSelectedRegistration(null);
                    setRejectReason('');
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
