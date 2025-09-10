'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, AlertTriangle, Clock, CheckCircle2, Filter, Eye } from 'lucide-react';
import { getIncidentsByCommunity, getIncidentsStats, updateIncidentStatus } from '@/data/anon/incidents_simple';
import { getUserCommunities } from '@/data/anon/communities';
import { usePermissions } from '@/hooks/usePermissions';
import type { Incident } from '@/data/anon/incidents_simple';

type IncidentStats = {
  total: number;
  abierto: number;
  en_progreso: number;
  cerrado: number;
};

export default function IncidentsClientPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats>({ total: 0, abierto: 0, en_progreso: 0, cerrado: 0 });
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  
  const router = useRouter();
  const { isAdmin, isManager } = usePermissions();

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      loadIncidents();
      loadStats();
    }
  }, [selectedCommunity]);

  const loadCommunities = async () => {
    try {
      const result = await getUserCommunities();
      if (result.success && result.data) {
        setCommunities(result.data);
        if (result.data.length > 0) {
          setSelectedCommunity(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  };

  const loadIncidents = async () => {
    if (!selectedCommunity) return;
    
    setIsLoading(true);
    try {
      const result = await getIncidentsByCommunity(selectedCommunity);
      if (result.success) {
        setIncidents(result.data || []);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedCommunity) return;
    
    try {
      const result = await getIncidentsStats(selectedCommunity);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStatusChange = async (incidentId: string, newStatus: 'abierto' | 'en_progreso' | 'cerrado') => {
    try {
      await updateIncidentStatus(incidentId, newStatus);
      loadIncidents();
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
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

  const filteredIncidents = incidents.filter(incident => 
    statusFilter === 'all' || incident.status === statusFilter
  );

  if (!selectedCommunity && communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">No tienes acceso a ninguna comunidad</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Incidencias</h1>
          <p className="text-muted-foreground">
            Gestiona reportes y tickets de tu comunidad
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger className="w-64">
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
          <Button onClick={() => router.push('/incidents/new')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nueva Incidencia
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">incidencias registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.abierto}</div>
            <p className="text-xs text-muted-foreground">pendientes de atención</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.en_progreso}</div>
            <p className="text-xs text-muted-foreground">siendo atendidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cerrado}</div>
            <p className="text-xs text-muted-foreground">resueltas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="abierto">Abierto</SelectItem>
            <SelectItem value="en_progreso">En Progreso</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Cargando incidencias...</div>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay incidencias</h3>
            <p className="text-muted-foreground text-center mb-4">
              {statusFilter === 'all' 
                ? 'No se encontraron incidencias en esta comunidad.'
                : `No se encontraron incidencias con estado "${statusFilter}".`
              }
            </p>
            <Button onClick={() => router.push('/incidents/new')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Crear Primera Incidencia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {incident.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(incident.priority)} className="capitalize">
                      {incident.priority}
                    </Badge>
                    <Badge variant={getStatusColor(incident.status)} className="flex items-center gap-1">
                      {getStatusIcon(incident.status)}
                      {incident.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Reportado: {new Date(incident.created_at).toLocaleDateString()}</p>
                    {incident.assigned_to && (
                      <p>Asignado a: {incident.assigned_to || 'Usuario'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(isAdmin || isManager) && (
                      <Select
                        value={incident.status}
                        onValueChange={(value) => handleStatusChange(
                          incident.id, 
                          value as 'abierto' | 'en_progreso' | 'cerrado'
                        )}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abierto">Abierto</SelectItem>
                          <SelectItem value="en_progreso">En Progreso</SelectItem>
                          <SelectItem value="cerrado">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/incidents/${incident.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}