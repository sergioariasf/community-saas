-- Create incidents table for Community SaaS
-- Sistema de incidencias/tickets por comunidad

CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Datos básicos
  title TEXT NOT NULL CHECK (length(title) > 0),
  description TEXT NOT NULL CHECK (length(description) > 0),
  
  -- Estado de la incidencia
  status TEXT NOT NULL DEFAULT 'abierto' 
    CHECK (status IN ('abierto', 'en_progreso', 'cerrado')),
  
  -- Prioridad
  priority TEXT NOT NULL DEFAULT 'media'
    CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    
  -- Relaciones
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_incidents_community_id ON incidents(community_id);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view incidents from their communities
CREATE POLICY "Users can view incidents from their communities" ON incidents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = incidents.community_id
    )
  );

-- Policy: Users can create incidents in their communities
CREATE POLICY "Users can create incidents in their communities" ON incidents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = incidents.community_id
    )
    AND reported_by = auth.uid()
  );

-- Policy: Admins and managers can update incidents
CREATE POLICY "Admins and managers can update incidents" ON incidents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = incidents.community_id
      AND ur.role IN ('admin', 'manager')
    )
  );

-- Policy: Admins can delete incidents
CREATE POLICY "Admins can delete incidents" ON incidents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = incidents.community_id
      AND ur.role = 'admin'
    )
  );

-- Function para auto-update updated_at
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Si se cambia a 'cerrado', marcar resolved_at
  IF NEW.status = 'cerrado' AND OLD.status != 'cerrado' THEN
    NEW.resolved_at = NOW();
  END IF;
  
  -- Si se reabre, limpiar resolved_at
  IF NEW.status != 'cerrado' AND OLD.status = 'cerrado' THEN
    NEW.resolved_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-update
CREATE TRIGGER incidents_updated_at_trigger
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_incidents_updated_at();

-- Datos de prueba
INSERT INTO incidents (title, description, status, priority, community_id, reported_by) VALUES
  (
    'Ruido excesivo en el patio',
    'Vecinos del segundo piso hacen mucho ruido por las noches. Afecta el descanso de otros residentes.',
    'abierto',
    'media',
    (SELECT id FROM communities LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'sergioariasf@gmail.com')
  ),
  (
    'Goteras en pasillo principal',
    'Se han detectado filtraciones de agua en el techo del pasillo. Requiere reparación urgente.',
    'en_progreso', 
    'alta',
    (SELECT id FROM communities LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'sergioariasf@gmail.com')
  ),
  (
    'Problemas con la cerradura del portón',
    'La cerradura electrónica del portón principal no responde correctamente.',
    'cerrado',
    'urgente',
    (SELECT id FROM communities LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'sergioariasf@gmail.com')
  );