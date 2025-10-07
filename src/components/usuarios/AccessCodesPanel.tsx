/**
 * ARCHIVO: AccessCodesPanel.tsx
 * PROPÓSITO: Panel para gestionar códigos de acceso pre-configurados para admins
 * ESTADO: development
 * DEPENDENCIAS: Supabase, UI components
 * OUTPUTS: Interface de códigos de acceso
 * ACTUALIZADO: 2025-10-04
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Key,
  Plus,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Calendar,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  createAccessCodeAction,
  getAccessCodesAction,
  cancelAccessCodeAction,
} from '@/data/users/access-codes';

interface AccessCode {
  id: string;
  invitation_code: string;
  organization_name: string;
  subscription_plan: string;
  max_communities: number;
  status: string;
  expires_at: string;
  created_at: string;
  used_at: string | null;
  created_by: string;
  notes: string | null;
}

interface Stats {
  total: number;
  pending: number;
  used: number;
  expired: number;
  cancelled: number;
}

export function AccessCodesPanel() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    used: 0,
    expired: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    organizationName: '',
    subscriptionPlan: 'basic' as 'basic' | 'premium' | 'enterprise',
    maxCommunities: 5,
    expirationDays: 90,
    notes: '',
  });

  useEffect(() => {
    loadAccessCodes();
  }, []);

  const loadAccessCodes = async () => {
    setLoading(true);
    try {
      const result = await getAccessCodesAction();

      if (result?.data?.success) {
        setCodes(result.data.codes);
        setStats(result.data.stats);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al cargar códigos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!formData.organizationName.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la organización es requerido',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAccessCodeAction({
        organizationName: formData.organizationName,
        subscriptionPlan: formData.subscriptionPlan,
        maxCommunities: formData.maxCommunities,
        maxUsersPerCommunity: 500,
        expirationDays: formData.expirationDays,
        notes: formData.notes || undefined,
      });

      if (result?.data?.success) {
        toast({
          title: 'Éxito',
          description: 'Código creado exitosamente',
        });

        setShowCreateForm(false);
        setFormData({
          organizationName: '',
          subscriptionPlan: 'basic',
          maxCommunities: 5,
          expirationDays: 90,
          notes: '',
        });

        await loadAccessCodes();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear código',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelCode = async (codeId: string) => {
    if (!confirm('¿Estás seguro de cancelar este código?')) {
      return;
    }

    try {
      const result = await cancelAccessCodeAction({ codeId });

      if (result?.data?.success) {
        toast({
          title: 'Éxito',
          description: 'Código cancelado exitosamente',
        });
        await loadAccessCodes();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al cancelar código',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: 'Copiado',
      description: 'Código copiado al portapapeles',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'used':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Usado</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Códigos de Acceso
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Genera códigos pre-configurados para nuevos administradores
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Generar Código
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Advertencia de seguridad */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Importante</p>
              <p className="text-sm text-orange-700 mt-1">
                Solo tú como super admin puedes crear códigos. Los códigos son únicos y
                tienen límites de comunidades según el plan asignado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de creación de código */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Generar Nuevo Código de Acceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre de la Organización
                </label>
                <Input
                  placeholder="Ej: Gestión Inmobiliaria ABC"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Plan</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.subscriptionPlan}
                    onChange={(e) => {
                      const plan = e.target.value as 'basic' | 'premium' | 'enterprise';
                      const maxComm = plan === 'basic' ? 5 : plan === 'premium' ? 20 : 100;
                      setFormData({ ...formData, subscriptionPlan: plan, maxCommunities: maxComm });
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
                    value={formData.maxCommunities}
                    onChange={(e) => setFormData({ ...formData, maxCommunities: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Duración del código
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.expirationDays}
                  onChange={(e) => setFormData({ ...formData, expirationDays: parseInt(e.target.value) })}
                >
                  <option value="7">7 días</option>
                  <option value="30">30 días</option>
                  <option value="90">90 días (recomendado)</option>
                  <option value="180">180 días</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notas internas (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                  placeholder="Ej: Código para cliente referido por Juan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateCode} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? 'Generando...' : 'Generar Código'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={submitting}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Códigos</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm text-gray-600">Usados</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.used}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Expirados</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de códigos */}
      <Card>
        <CardHeader>
          <CardTitle>Códigos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando códigos...
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay códigos de acceso</p>
              <p className="text-sm text-gray-500 mt-2">
                Genera un nuevo código para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {codes.map((code) => (
                <div key={code.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{code.organization_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {code.subscription_plan}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Hasta {code.max_communities} comunidades
                          </span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(code.status)}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-gray-400" />
                      <code className="font-mono text-lg font-semibold">
                        {code.invitation_code}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(code.invitation_code)}
                    >
                      {copiedCode === code.invitation_code ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Creado:{' '}
                        <span className="font-medium">
                          {new Date(code.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Expira:{' '}
                        <span className="font-medium">
                          {new Date(code.expires_at).toLocaleDateString('es-ES')}
                        </span>
                      </span>
                    </div>
                  </div>

                  {code.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Notas:</span> {code.notes}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    {code.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelCode(code.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar Código
                      </Button>
                    )}
                    {code.status === 'used' && code.used_at && (
                      <span className="text-sm text-gray-500">
                        Usado el {new Date(code.used_at).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
