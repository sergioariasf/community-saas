'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, User, Clock, CheckCircle2, AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import { getIncidentById, updateIncidentStatus, deleteIncident } from '@/data/anon/incidents_simple';
import { usePermissions } from '@/hooks/usePermissions';
import type { Incident } from '@/data/anon/incidents_simple';

interface ClientPageProps {
  incidentId: string;
}

export default function IncidentDetailClientPage({ incidentId }: ClientPageProps) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const router = useRouter();
  const { isAdmin, isManager } = usePermissions();

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    setIsLoading(true);
    try {
      const result = await getIncidentById(incidentId);
      if (result.success) {
        setIncident(result.data);
      } else {
        console.error('Error loading incident:', result.error);
        router.push('/incidents');
      }
    } catch (error) {
      console.error('Error loading incident:', error);
      router.push('/incidents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'abierto' | 'en_progreso' | 'cerrado') => {
    if (!incident) return;
    
    setIsUpdating(true);
    try {
      await updateIncidentStatus(incident.id, newStatus);
      loadIncident(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!incident || !confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) return;
    
    try {
      await deleteIncident(incident.id);
      router.push('/incidents');
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'abierto': return <AlertTriangle className="w-4 h-4" />;
      case 'en_progreso': return <Clock className="w-4 h-4" />;
      case 'cerrado': return <CheckCircle2 className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abierto': return 'destructive';
      case 'en_progreso': return 'default';
      case 'cerrado': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'destructive';
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baja': return 'secondary';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-muted-foreground">Cargando incidencia...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Incidencia no encontrada</h3>
        <p className="text-muted-foreground text-center mb-4">
          La incidencia que buscas no existe o no tienes permisos para verla.
        </p>
        <Button onClick={() => router.push('/incidents')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Incidencias
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/incidents')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{incident.title}</h1>
            <Badge variant={getStatusColor(incident.status)} className="flex items-center gap-1">
              {getStatusIcon(incident.status)}
              {incident.status.replace('_', ' ')}
            </Badge>
            <Badge variant={getPriorityColor(incident.priority)} className="capitalize">
              {incident.priority}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Incidencia #{incident.id.slice(0, 8)}
          </p>
        </div>
        {(isAdmin || isManager) && (
          <div className="flex items-center gap-2">
            <Select
              value={incident.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abierto">Abierto</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{incident.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(incident.status)}
                  <span className="capitalize">{incident.status.replace('_', ' ')}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Prioridad</Label>
                <div className="mt-1">
                  <Badge variant={getPriorityColor(incident.priority)} className="capitalize">
                    {incident.priority}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Reportado por</Label>
                <p className="mt-1">{incident.reported_by || 'Usuario'}</p>
              </div>
              
              {incident.assigned_to && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Asignado a</Label>
                    <p className="mt-1">{incident.assigned_to || 'Usuario'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Creado</Label>
                <p className="mt-1">{new Date(incident.created_at).toLocaleString()}</p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Última actualización</Label>
                <p className="mt-1">{new Date(incident.updated_at).toLocaleString()}</p>
              </div>
              
              {incident.resolved_at && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Resuelto</Label>
                    <p className="mt-1">{new Date(incident.resolved_at).toLocaleString()}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={className}>
      {children}
    </label>
  );
}