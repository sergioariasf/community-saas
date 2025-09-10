-- Setup test data for Community SaaS (FIXED VERSION)
-- Este SQL debe ejecutarse en Supabase SQL Editor

-- Primero, vamos a verificar qué columnas existen realmente
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'communities';

-- Script simplificado que solo usa columnas básicas
DO $$
DECLARE
    user_uuid UUID;
    community1_uuid UUID;
    community2_uuid UUID;
    community3_uuid UUID;
BEGIN
    -- 1. Obtener tu user ID (cambia el email si es diferente)
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'sergioariasf@gmail.com';
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado con email sergioariasf@gmail.com. Verifica que te hayas registrado.';
    END IF;
    
    RAISE NOTICE 'User ID encontrado: %', user_uuid;
    
    -- 2. Crear comunidades de prueba (solo columnas básicas)
    INSERT INTO communities (name, address, user_id) VALUES
        ('Residencial Los Olivos', 'Calle Principal 123, Madrid', user_uuid),
        ('Conjunto Villa Real', 'Avenida Central 456, Barcelona', user_uuid),
        ('Torres del Parque', 'Plaza Mayor 789, Valencia', user_uuid);
    
    -- Obtener IDs de las comunidades creadas
    SELECT id INTO community1_uuid FROM communities WHERE name = 'Residencial Los Olivos';
    SELECT id INTO community2_uuid FROM communities WHERE name = 'Conjunto Villa Real';  
    SELECT id INTO community3_uuid FROM communities WHERE name = 'Torres del Parque';
    
    RAISE NOTICE 'Communities creadas:';
    RAISE NOTICE '- Community 1 ID: %', community1_uuid;
    RAISE NOTICE '- Community 2 ID: %', community2_uuid;
    RAISE NOTICE '- Community 3 ID: %', community3_uuid;
    
    -- 3. Asignar roles al usuario para todas las comunidades
    INSERT INTO user_roles (user_id, community_id, role) VALUES
        (user_uuid, community1_uuid, 'admin'),
        (user_uuid, community2_uuid, 'manager'),
        (user_uuid, community3_uuid, 'admin');
    
    RAISE NOTICE 'User roles asignados exitosamente';
    
    -- 4. Crear incidencias de prueba
    INSERT INTO incidents (title, description, status, priority, community_id, reported_by) VALUES
        (
            'Ruido excesivo en el patio',
            'Los vecinos del segundo piso hacen mucho ruido por las noches. Afecta el descanso de otros residentes. Se requiere intervención para mantener la tranquilidad del conjunto.',
            'abierto',
            'media',
            community1_uuid,
            user_uuid
        ),
        (
            'Goteras en pasillo principal',
            'Se han detectado filtraciones de agua en el techo del pasillo del primer piso. El agua está cayendo sobre el área común y requiere reparación urgente antes de que cause daños mayores.',
            'en_progreso',
            'alta',
            community1_uuid,
            user_uuid
        ),
        (
            'Problemas con la cerradura del portón',
            'La cerradura electrónica del portón principal no responde correctamente. Los residentes tienen dificultades para ingresar y esto compromete la seguridad del edificio.',
            'cerrado',
            'urgente',
            community2_uuid,
            user_uuid
        ),
        (
            'Ascensor fuera de servicio',
            'El ascensor del edificio A no está funcionando desde esta mañana. Se quedó detenido entre el segundo y tercer piso. Necesitamos técnico especializado urgente.',
            'abierto',
            'alta',
            community2_uuid,
            user_uuid
        ),
        (
            'Falta de iluminación en parqueadero',
            'Varias luminarias del parqueadero subterráneo están fundidas. Esto genera inseguridad para los residentes durante la noche.',
            'abierto',
            'baja',
            community3_uuid,
            user_uuid
        ),
        (
            'Mantenimiento jardines comunitarios',
            'Los jardines de la zona social necesitan poda y fertilización. El césped está deteriorado y las plantas ornamentales requieren cuidado.',
            'en_progreso',
            'media',
            community3_uuid,
            user_uuid
        );
    
    RAISE NOTICE 'Incidencias de prueba creadas exitosamente';
    RAISE NOTICE '=== SETUP COMPLETADO ===';
    RAISE NOTICE 'Puedes ir a http://localhost:3002/incidents para ver el sistema funcionando';
    
END $$;