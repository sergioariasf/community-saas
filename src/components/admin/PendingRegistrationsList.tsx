/**
 * ARCHIVO: PendingRegistrationsList.tsx
 * PROPÓSITO: Lista de solicitudes de registro con acciones de aprobación/rechazo
 * ESTADO: production
 * DEPENDENCIAS: getPendingRegistrationsAction, approveRegistrationAction, rejectRegistrationAction
 * OUTPUTS: Table component con acciones
 * ACTUALIZADO: 2025-10-06
 */

'use client';

import { useEffect, useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import {
  getPendingRegistrationsAction,
  approveRegistrationAction,
  rejectRegistrationAction,
} from '@/data/users/registrations';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { toast } from 'sonner';

type Registration = {
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
  generated_invitation_code: string | null;
};

export function PendingRegistrationsList() {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending'
  );

  // Load registrations
  const {
    execute: loadRegistrations,
    result: registrationsResult,
    status: loadStatus,
  } = useAction(getPendingRegistrationsAction, {
    onError: (error) => {
      toast.error('Error al cargar solicitudes');
      console.error(error);
    },
  });

  // Load on mount
  useEffect(() => {
    loadRegistrations();
  }, []);

  const registrations = (registrationsResult?.data?.requests || []) as unknown as Registration[];
  const stats = registrationsResult?.data?.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    if (filterStatus === 'all') return true;
    return reg.status === filterStatus;
  });

  const handleApproveClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setApproveModalOpen(true);
  };

  const handleRejectClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setRejectModalOpen(true);
  };

  const handleApproveSuccess = () => {
    setApproveModalOpen(false);
    setSelectedRegistration(null);
    loadRegistrations();
    toast.success('Solicitud aprobada exitosamente');
  };

  const handleRejectSuccess = () => {
    setRejectModalOpen(false);
    setSelectedRegistration(null);
    loadRegistrations();
    toast.success('Solicitud rechazada');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Expirada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loadStatus === 'executing') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Rechazadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Registro</CardTitle>
          <CardDescription>
            Filtra y gestiona las solicitudes de acceso a la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              Todas ({stats.total})
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              Pendientes ({stats.pending})
            </Button>
            <Button
              variant={filterStatus === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('approved')}
            >
              Aprobadas ({stats.approved})
            </Button>
            <Button
              variant={filterStatus === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('rejected')}
            >
              Rechazadas ({stats.rejected})
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Comunidades</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No hay solicitudes {filterStatus !== 'all' && filterStatus}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{registration.company_name}</div>
                          {registration.message && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {registration.message}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{registration.full_name}</div>
                          <div className="text-gray-500">{registration.email}</div>
                          {registration.phone && (
                            <div className="text-gray-500 text-xs">{registration.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {registration.vertical_type || 'No especificado'}
                        </Badge>
                      </TableCell>
                      <TableCell>{registration.estimated_communities || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(registration.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell className="text-right">
                        {registration.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveClick(registration)}
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectClick(registration)}
                            >
                              Rechazar
                            </Button>
                          </div>
                        ) : registration.status === 'approved' &&
                          registration.generated_invitation_code ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {registration.generated_invitation_code}
                          </Badge>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedRegistration && (
        <>
          <ApproveModal
            open={approveModalOpen}
            onOpenChange={setApproveModalOpen}
            registration={selectedRegistration}
            onSuccess={handleApproveSuccess}
          />
          <RejectModal
            open={rejectModalOpen}
            onOpenChange={setRejectModalOpen}
            registration={selectedRegistration}
            onSuccess={handleRejectSuccess}
          />
        </>
      )}
    </div>
  );
}
