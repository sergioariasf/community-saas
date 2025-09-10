'use server';

import { Database } from '@/lib/database.types';
import { createSupabaseClient } from '@/supabase-clients/server';

export type Incident = Database['public']['Tables']['incidents']['Row'];
export type IncidentInsert = Database['public']['Tables']['incidents']['Insert'];
export type IncidentUpdate = Database['public']['Tables']['incidents']['Update'];

// Obtener todas las incidencias de una comunidad
export async function getIncidentsByCommunity(communityId: string) {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        communities:community_id(name),
        reporter:reported_by(email),
        assignee:assigned_to(email)
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getIncidentsByCommunity:', error);
    return { success: false, error: 'Failed to fetch incidents' };
  }
}

// Obtener una incidencia específica
export async function getIncidentById(id: string) {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        communities:community_id(name),
        reporter:reported_by(email),
        assignee:assigned_to(email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching incident:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getIncidentById:', error);
    return { success: false, error: 'Failed to fetch incident' };
  }
}

// Crear nueva incidencia
export async function createIncident(incident: IncidentInsert) {
  try {
    const supabase = await createSupabaseClient();
    
    // Get user's organization_id from user_roles
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (roleError || !userRole?.organization_id) {
      throw new Error('User has no organization assigned');
    }

    // Include organization_id in the insert
    const { data, error } = await supabase
      .from('incidents')
      .insert([{
        ...incident,
        organization_id: userRole.organization_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating incident:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createIncident:', error);
    return { success: false, error: 'Failed to create incident' };
  }
}

// Actualizar incidencia
export async function updateIncident(id: string, updates: IncidentUpdate) {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating incident:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateIncident:', error);
    return { success: false, error: 'Failed to update incident' };
  }
}

// Eliminar incidencia
export async function deleteIncident(id: string) {
  try {
    const supabase = await createSupabaseClient();
    
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting incident:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteIncident:', error);
    return { success: false, error: 'Failed to delete incident' };
  }
}

// Asignar incidencia a un usuario
export async function assignIncident(incidentId: string, userId: string) {
  return updateIncident(incidentId, { 
    assigned_to: userId, 
    status: 'en_progreso' 
  });
}

// Cambiar estado de incidencia
export async function updateIncidentStatus(
  incidentId: string, 
  status: 'abierto' | 'en_progreso' | 'cerrado'
) {
  const updates: IncidentUpdate = { status };
  
  // Si se cierra la incidencia, marcar fecha de resolución
  if (status === 'cerrado') {
    updates.resolved_at = new Date().toISOString();
  } else {
    // Si se reabre, limpiar fecha de resolución
    updates.resolved_at = null;
  }
  
  return updateIncident(incidentId, updates);
}

// Obtener estadísticas de incidencias por comunidad
export async function getIncidentsStats(communityId: string) {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from('incidents')
      .select('status')
      .eq('community_id', communityId);

    if (error) {
      console.error('Error fetching incident stats:', error);
      throw error;
    }

    const stats = {
      total: data.length,
      abierto: data.filter(i => i.status === 'abierto').length,
      en_progreso: data.filter(i => i.status === 'en_progreso').length,
      cerrado: data.filter(i => i.status === 'cerrado').length,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error in getIncidentsStats:', error);
    return { success: false, error: 'Failed to fetch incident statistics' };
  }
}