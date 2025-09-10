-- FIX DATABASE SCHEMA - CORRECTED VERSION
-- Execute in Supabase SQL Editor

-- 1. First, check current communities table structure
SELECT 'Current communities table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'communities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add missing columns to communities table
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_communities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER communities_updated_at_trigger
    BEFORE UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION update_communities_updated_at();

-- 4. Fix RLS policy for incidents (handle admin NULL community_id)
DROP POLICY IF EXISTS "Users can view incidents from their communities" ON incidents;

CREATE POLICY "Users can view incidents from their communities" ON incidents
FOR SELECT USING (
  -- Admin users (community_id = NULL) can see all
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND (
      ur.community_id = incidents.community_id OR  -- Specific community access
      (ur.community_id IS NULL AND ur.role = 'admin') -- Global admin access
    )
  )
);

-- 5. Fix RLS policy for communities (proper admin access)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON communities;

CREATE POLICY "Users can view their accessible communities" ON communities
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND (
      ur.community_id = communities.id OR  -- Specific community access
      (ur.community_id IS NULL AND ur.role = 'admin') -- Global admin access
    )
  )
);

-- 6. Create proper test data (FIXED VERSION)
DO $$
DECLARE
    user_uuid UUID;
    community1_uuid UUID;
    community2_uuid UUID;
    community3_uuid UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'sergioariasf@gmail.com';
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email sergioariasf@gmail.com not found. Please register first.';
    END IF;
    
    RAISE NOTICE 'User ID found: %', user_uuid;
    
    -- Clear existing test data first
    DELETE FROM incidents WHERE reported_by = user_uuid;
    DELETE FROM user_roles WHERE user_id = user_uuid;
    DELETE FROM communities WHERE user_id = user_uuid;
    
    RAISE NOTICE 'Cleared existing test data';
    
    -- Create communities one by one (FIXED: no RETURNING)
    INSERT INTO communities (name, address, city, country, description, user_id, admin_contact, max_units) 
    VALUES ('Residencial Los Olivos', 'Calle Principal 123', 'Madrid', 'España', 'Residencial familiar con áreas verdes y piscina', user_uuid, 'admin@losolivos.com', 50);
    
    INSERT INTO communities (name, address, city, country, description, user_id, admin_contact, max_units) 
    VALUES ('Conjunto Villa Real', 'Avenida Central 456', 'Barcelona', 'España', 'Conjunto residencial moderno con gimnasio', user_uuid, 'admin@villareal.com', 75);
    
    INSERT INTO communities (name, address, city, country, description, user_id, admin_contact, max_units) 
    VALUES ('Torres del Parque', 'Plaza Mayor 789', 'Valencia', 'España', 'Torres residenciales de lujo con vista panorámica', user_uuid, 'admin@torresparque.com', 100);
    
    RAISE NOTICE 'Created 3 communities';
    
    -- Get community IDs after creation
    SELECT id INTO community1_uuid FROM communities WHERE name = 'Residencial Los Olivos' AND user_id = user_uuid;
    SELECT id INTO community2_uuid FROM communities WHERE name = 'Conjunto Villa Real' AND user_id = user_uuid;
    SELECT id INTO community3_uuid FROM communities WHERE name = 'Torres del Parque' AND user_id = user_uuid;
    
    IF community1_uuid IS NULL OR community2_uuid IS NULL OR community3_uuid IS NULL THEN
        RAISE EXCEPTION 'Failed to create communities properly';
    END IF;
    
    RAISE NOTICE 'Community IDs: %, %, %', community1_uuid, community2_uuid, community3_uuid;
    
    -- Create admin role (global access - community_id = NULL)
    INSERT INTO user_roles (user_id, community_id, role) VALUES
        (user_uuid, NULL, 'admin');
    
    -- Create specific community roles
    INSERT INTO user_roles (user_id, community_id, role) VALUES
        (user_uuid, community1_uuid, 'manager'),
        (user_uuid, community2_uuid, 'manager'),
        (user_uuid, community3_uuid, 'manager');
    
    RAISE NOTICE 'Created user roles: 1 admin + 3 managers';
    
    -- Create test incidents
    INSERT INTO incidents (title, description, status, priority, community_id, reported_by) VALUES
        ('Ruido excesivo en el patio', 'Vecinos del segundo piso hacen mucho ruido por las noches. Requiere intervención urgente para mantener la tranquilidad del conjunto residencial.', 'abierto', 'media', community1_uuid, user_uuid),
        ('Goteras en pasillo principal', 'Filtraciones de agua en el techo del pasillo del primer piso. Reparación urgente necesaria antes de daños estructurales mayores.', 'en_progreso', 'alta', community1_uuid, user_uuid),
        ('Problemas con cerradura del portón', 'Cerradura electrónica del portón principal no funciona correctamente. Compromete la seguridad del edificio.', 'cerrado', 'urgente', community2_uuid, user_uuid),
        ('Ascensor fuera de servicio', 'Ascensor del edificio A detenido entre segundo y tercer piso. Técnico especializado requerido urgentemente.', 'abierto', 'alta', community2_uuid, user_uuid),
        ('Falta iluminación en parqueadero', 'Múltiples luminarias fundidas en parqueadero subterráneo. Problema de seguridad nocturna para residentes.', 'abierto', 'baja', community3_uuid, user_uuid),
        ('Mantenimiento jardines comunitarios', 'Jardines de la zona social necesitan poda y fertilización urgente. Césped deteriorado por falta de mantenimiento.', 'en_progreso', 'media', community3_uuid, user_uuid);
    
    RAISE NOTICE 'Created 6 test incidents';
    RAISE NOTICE '=== DATABASE SETUP COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Access your incidents at: http://localhost:3002/incidents';
    
    -- Final verification
    RAISE NOTICE 'Final counts:';
    RAISE NOTICE '- Communities: %', (SELECT COUNT(*) FROM communities WHERE user_id = user_uuid);
    RAISE NOTICE '- User roles: %', (SELECT COUNT(*) FROM user_roles WHERE user_id = user_uuid);
    RAISE NOTICE '- Incidents: %', (SELECT COUNT(*) FROM incidents WHERE reported_by = user_uuid);
    
END $$;