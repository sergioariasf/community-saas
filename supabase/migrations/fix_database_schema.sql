-- FIX DATABASE SCHEMA - Execute in Supabase SQL Editor
-- Based on Database Expert Agent analysis

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

-- 6. Create proper test data
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
    
    -- Create communities with all required fields
    INSERT INTO communities (name, address, city, country, description, user_id, admin_contact, max_units) VALUES
        ('Residencial Los Olivos', 'Calle Principal 123', 'Madrid', 'España', 'Residencial familiar con áreas verdes y piscina', user_uuid, 'admin@losolivos.com', 50),
        ('Conjunto Villa Real', 'Avenida Central 456', 'Barcelona', 'España', 'Conjunto residencial moderno con gimnasio', user_uuid, 'admin@villareal.com', 75),
        ('Torres del Parque', 'Plaza Mayor 789', 'Valencia', 'España', 'Torres residenciales de lujo con vista panorámica', user_uuid, 'admin@torresparque.com', 100)
    RETURNING id INTO community1_uuid;
    
    -- Get community IDs
    SELECT id INTO community1_uuid FROM communities WHERE name = 'Residencial Los Olivos';
    SELECT id INTO community2_uuid FROM communities WHERE name = 'Conjunto Villa Real';
    SELECT id INTO community3_uuid FROM communities WHERE name = 'Torres del Parque';
    
    -- Create admin role (global access - community_id = NULL)
    INSERT INTO user_roles (user_id, community_id, role) VALUES
        (user_uuid, NULL, 'admin');
    
    -- Create specific community roles
    INSERT INTO user_roles (user_id, community_id, role) VALUES
        (user_uuid, community1_uuid, 'manager'),
        (user_uuid, community2_uuid, 'manager'),
        (user_uuid, community3_uuid, 'manager');
    
    -- Create test incidents
    INSERT INTO incidents (title, description, status, priority, community_id, reported_by) VALUES
        ('Ruido excesivo en el patio', 'Vecinos del segundo piso hacen mucho ruido por las noches. Requiere intervención urgente.', 'abierto', 'media', community1_uuid, user_uuid),
        ('Goteras en pasillo principal', 'Filtraciones de agua en el techo del pasillo. Reparación urgente necesaria.', 'en_progreso', 'alta', community1_uuid, user_uuid),
        ('Problemas con cerradura del portón', 'Cerradura electrónica no funciona correctamente. Compromete la seguridad.', 'cerrado', 'urgente', community2_uuid, user_uuid),
        ('Ascensor fuera de servicio', 'Ascensor del edificio A detenido entre pisos. Técnico especializado requerido.', 'abierto', 'alta', community2_uuid, user_uuid),
        ('Falta iluminación en parqueadero', 'Luminarias fundidas en parqueadero subterráneo. Problema de seguridad nocturna.', 'abierto', 'baja', community3_uuid, user_uuid),
        ('Mantenimiento jardines comunitarios', 'Jardines necesitan poda y fertilización. Césped deteriorado.', 'en_progreso', 'media', community3_uuid, user_uuid);
    
    RAISE NOTICE 'Database schema fixed and test data created successfully!';
    RAISE NOTICE 'You can now access: http://localhost:3002/incidents';
    
END $$;