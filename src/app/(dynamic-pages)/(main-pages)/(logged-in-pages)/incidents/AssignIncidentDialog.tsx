'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { assignIncident } from '@/data/anon/incidents';
import { getCommunityUsers } from '@/data/anon/communities';

interface AssignIncidentDialogProps {
  incidentId: string;
  communityId: string;
  currentAssigneeId?: string | null;
  onAssigned?: () => void;
}

type CommunityUser = {
  id: string;
  email: string;
  role: string;
};

export default function AssignIncidentDialog({
  incidentId,
  communityId,
  currentAssigneeId,
  onAssigned
}: AssignIncidentDialogProps) {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCommunityUsers();
      setSelectedUserId(currentAssigneeId || '');
    }
  }, [isOpen, currentAssigneeId]);

  const loadCommunityUsers = async () => {
    try {
      const result = await getCommunityUsers(communityId);
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error loading community users:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;

    setIsLoading(true);
    try {
      await assignIncident(incidentId, selectedUserId);
      setIsOpen(false);
      onAssigned?.();
    } catch (error) {
      console.error('Error assigning incident:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          {currentAssigneeId ? 'Reasignar' : 'Asignar'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Incidencia</DialogTitle>
          <DialogDescription>
            Selecciona el usuario responsable de resolver esta incidencia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin asignar</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleAssign} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Asignando...' : 'Asignar'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}