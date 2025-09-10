'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { createIncident } from '@/data/anon/incidents_simple';
import { getUserCommunities } from '@/data/anon/communities';
import { createClient } from '@/supabase-clients/client';

export default function NewIncidentClientPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'urgente'>('media');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [userId, setUserId] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    loadCommunities();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const loadCommunities = async () => {
    setIsLoadingCommunities(true);
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
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !selectedCommunity || !userId) {
      return;
    }

    setIsLoading(true);
    try {
      const incidentData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        community_id: selectedCommunity,
        reported_by: userId,
        status: 'abierto' as const,
      };

      const result = await createIncident(incidentData);
      
      if (result.success) {
        router.push('/incidents');
      } else {
        console.error('Error creating incident:', result.error);
      }
    } catch (error) {
      console.error('Error creating incident:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = title.trim() && description.trim() && selectedCommunity && userId;

  if (isLoadingCommunities) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sin acceso a comunidades</h3>
        <p className="text-muted-foreground text-center mb-4">
          No tienes acceso a ninguna comunidad para reportar incidencias.
        </p>
        <Button onClick={() => router.push('/communities')}>
          Ver Comunidades
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Incidencia</h1>
          <p className="text-muted-foreground">
            Reporta un problema o solicita asistencia
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Incidencia</CardTitle>
          <CardDescription>
            Proporciona información detallada para que podamos atender tu reporte correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community Selection */}
            <div className="space-y-2">
              <Label htmlFor="community">Comunidad</Label>
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
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

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ej: Goteras en el pasillo principal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe detalladamente el problema, cuándo ocurrió, dónde se encuentra, y cualquier información adicional relevante..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Proporciona todos los detalles posibles para facilitar la resolución
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={!isFormValid || isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <>Creando...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Incidencia
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/incidents')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}