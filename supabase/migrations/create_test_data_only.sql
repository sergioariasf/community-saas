-- Create test data only (after columns are added)
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
    
    -- Create communities one by one
    INSERT INTO communities (name, address, city, country, description, user_id, admin_contact, max_units) 
    VALUES ('Residencial Los Olivos', 'Calle Principal 123', 'Madrid', 'España', 'Residencial familiar con áreas verdes y piscina', user_uuid, 'admin@losolivos.com', 50);
    
    INSERT INTO communities (name, address, city, country, description, user_id, admin_contact, max_units) 
    VALUES ('Conjunto Villa Real', 'Avenida Central 456', 'Barcelona', 'España', 'Conjunto residencial moderno con gimnasio', user_uuid, 'admin@villareal.com', 75);
    
    INSERT INTO communities (name, address, city, country, description, user_id, admin_contact, max_units) 
    VALUES ('Torres del Parque', 'Plaza Mayor 789', 'Valencia', 'España', 'Torres residenciales de lujo con vista panorámica', user_uuid, 'admin@torresparque.com', 100);
    
    RAISE NOTICE 'Created 3 communities';
    
    -- Get community IDs
    SELECT id INTO community1_uuid FROM communities WHERE name = 'Residencial Los Olivos' AND user_id = user_uuid;
    SELECT id INTO community2_uuid FROM communities WHERE name = 'Conjunto Villa Real' AND user_id = user_uuid;
    SELECT id INTO community3_uuid FROM communities WHERE name = 'Torres del Parque' AND user_id = user_uuid;
    
    -- Create admin role (global access)
    INSERT INTO user_roles (user_id, community_id, role) VALUES (user_uuid, NULL, 'admin');
    
    -- Create specific community roles
    INSERT INTO user_roles (user_id, community_id, role) VALUES
        (user_uuid, community1_uuid, 'manager'),
        (user_uuid, community2_uuid, 'manager'),
        (user_uuid, community3_uuid, 'manager');
    
    -- Create test incidents
    INSERT INTO incidents (title, description, status, priority, community_id, reported_by) VALUES
        ('Ruido excesivo en el patio', 'Vecinos hacen ruido por las noches. Requiere intervención urgente.', 'abierto', 'media', community1_uuid, user_uuid),
        ('Goteras en pasillo principal', 'Filtraciones de agua en el techo. Reparación urgente necesaria.', 'en_progreso', 'alta', community1_uuid, user_uuid),
        ('Problemas con cerradura del portón', 'Cerradura electrónica no funciona. Compromete la seguridad.', 'cerrado', 'urgente', community2_uuid, user_uuid),
        ('Ascensor fuera de servicio', 'Ascensor detenido entre pisos. Técnico especializado requerido.', 'abierto', 'alta', community2_uuid, user_uuid),
        ('Falta iluminación en parqueadero', 'Luminarias fundidas. Problema de seguridad nocturna.', 'abierto', 'baja', community3_uuid, user_uuid),
        ('Mantenimiento jardines comunitarios', 'Jardines necesitan poda y fertilización. Césped deteriorado.', 'en_progreso', 'media', community3_uuid, user_uuid);
    
    RAISE NOTICE '=== SUCCESS: 3 communities, 4 roles, 6 incidents created ===';
    RAISE NOTICE 'Access: http://localhost:3002/incidents';
    
END $$;