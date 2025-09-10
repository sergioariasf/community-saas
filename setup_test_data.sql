-- Setup test data for Community SaaS
-- Este SQL debe ejecutarse en Supabase SQL Editor

-- 1. Primero, obtener tu user_id (reemplaza con tu email)
DO $$
DECLARE
    user_uuid UUID;
    community1_uuid UUID;
    community2_uuid UUID;
BEGIN
    -- Obtener tu user ID (cambia el email si es diferente)
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'sergioariasf@gmail.com';
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado. Verifica el email.';
    END IF;
    
    RAISE NOTICE 'User ID encontrado: %', user_uuid;
    
    -- 2. Crear comunidades de prueba
    INSERT INTO communities (id, name, address, city, postal_code, admin_contact, max_units, user_id) 
    VALUES 
        (gen_random_uuid(), 'Residencial Los Olivos', 'Calle Principal 123', 'Madrid', '28001', 'admin@losolivos.com', 50, user_uuid),
        (gen_random_uuid(), 'Conjunto Villa Real', 'Avenida Central 456', 'Barcelona', '08001', 'admin@villareal.com', 75, user_uuid),
        (gen_random_uuid(), 'Torres del Parque', 'Plaza Mayor 789', 'Valencia', '46001', 'admin@torresparque.com', 100, user_uuid)
    RETURNING id INTO community1_uuid;
    
    -- Obtener IDs de las comunidades creadas
    SELECT id INTO community1_uuid FROM communities WHERE name = 'Residencial Los Olivos';
    SELECT id INTO community2_uuid FROM communities WHERE name = 'Conjunto Villa Real';
    
    RAISE NOTICE 'Community 1 ID: %', community1_uuid;
    RAISE NOTICE 'Community 2 ID: %', community2_uuid;
    
    -- 3. Asignar roles al usuario para todas las comunidades
    INSERT INTO user_roles (user_id, community_id, role) VALUES
        (user_uuid, community1_uuid, 'admin'),
        (user_uuid, community2_uuid, 'manager');
    
    -- Para la tercera comunidad, obtener su ID y asignar rol
    INSERT INTO user_roles (user_id, community_id, role) 
    SELECT user_uuid, id, 'admin' 
    FROM communities 
    WHERE name = 'Torres del Parque';
    
    -- 4. Crear incidencias de prueba
    INSERT INTO incidents (title, description, status, priority, community_id, reported_by) VALUES
        (
            'Ruido excesivo en el patio',
            'Los vecinos del segundo piso hacen mucho ruido por las noches. Afecta el descanso de otros residentes.',
            'abierto',
            'media',
            community1_uuid,
            user_uuid
        ),
        (
            'Goteras en pasillo principal',
            'Se han detectado filtraciones de agua en el techo del pasillo. Requiere reparación urgente.',
            'en_progreso',
            'alta',
            community1_uuid,
            user_uuid
        ),
        (
            'Problemas con la cerradura del portón',
            'La cerradura electrónica del portón principal no responde correctamente.',
            'cerrado',
            'urgente',
            community2_uuid,
            user_uuid
        ),
        (
            'Ascensor fuera de servicio',
            'El ascensor del edificio A no está funcionando desde esta mañana.',
            'abierto',
            'alta',
            community2_uuid,
            user_uuid
        );
    
    RAISE NOTICE 'Datos de prueba creados exitosamente!';
END $$;