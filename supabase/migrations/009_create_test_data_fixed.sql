-- Create comprehensive test data (FIXED VERSION)
-- Fixes the "multiple rows" error

DO $$
DECLARE
    admin_user_id uuid;
    community1_id uuid;
    community2_id uuid;
    community3_id uuid;
BEGIN
    -- Get admin user ID (FIXED: Use LIMIT 1 to ensure single row)
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'sergioariasf@gmail.com'
    LIMIT 1;
    
    -- Verify user exists
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email sergioariasf@gmail.com not found. Please register first.';
    END IF;
    
    RAISE NOTICE 'Admin user ID: %', admin_user_id;
    
    -- Clean existing test data first
    DELETE FROM public.incidents WHERE reported_by = admin_user_id;
    DELETE FROM public.user_roles WHERE user_id = admin_user_id;
    DELETE FROM public.communities WHERE user_id = admin_user_id;
    
    RAISE NOTICE 'Cleaned existing test data';
    
    -- Create communities one by one (avoiding RETURNING multiple rows issue)
    INSERT INTO public.communities (
        name, description, address, city, country, postal_code, admin_contact, max_units, user_id
    ) VALUES (
        'Residencial Los Álamos',
        'Comunidad residencial moderna con amplias zonas verdes y piscina comunitaria.',
        'Calle de los Álamos, 15',
        'Madrid',
        'España',
        '28034',
        'admin.alamos@ejemplo.com',
        120,
        admin_user_id
    );
    
    INSERT INTO public.communities (
        name, description, address, city, country, postal_code, admin_contact, max_units, user_id
    ) VALUES (
        'Urbanización Bella Vista',
        'Conjunto residencial de lujo con gimnasio, spa y zonas de recreación familiar.',
        'Avenida Bella Vista, 42',
        'Barcelona',
        'España',
        '08015',
        'contacto@bellavista.es',
        85,
        admin_user_id
    );
    
    INSERT INTO public.communities (
        name, description, address, city, country, postal_code, admin_contact, max_units, user_id
    ) VALUES (
        'Complejo Jardines del Sur',
        'Residencial ecológico con jardines verticales y sistema de energía solar.',
        'Paseo de los Jardines, 78',
        'Valencia',
        'España',
        '46021',
        'info@jardinesdelsur.com',
        200,
        admin_user_id
    );
    
    RAISE NOTICE 'Created 3 communities';
    
    -- Get community IDs after creation
    SELECT id INTO community1_id FROM public.communities WHERE name = 'Residencial Los Álamos' AND user_id = admin_user_id;
    SELECT id INTO community2_id FROM public.communities WHERE name = 'Urbanización Bella Vista' AND user_id = admin_user_id;
    SELECT id INTO community3_id FROM public.communities WHERE name = 'Complejo Jardines del Sur' AND user_id = admin_user_id;
    
    -- Verify communities were created
    IF community1_id IS NULL OR community2_id IS NULL OR community3_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create communities properly';
    END IF;
    
    -- Create user roles
    INSERT INTO public.user_roles (user_id, community_id, role) VALUES
        (admin_user_id, NULL, 'admin'),                    -- Global admin access
        (admin_user_id, community1_id, 'manager'),         -- Manager of Los Álamos
        (admin_user_id, community2_id, 'manager'),         -- Manager of Bella Vista  
        (admin_user_id, community3_id, 'manager');         -- Manager of Jardines del Sur
    
    RAISE NOTICE 'Created user roles: 1 global admin + 3 community managers';
    
    -- Create diverse incidents with different statuses and priorities
    INSERT INTO public.incidents (title, description, status, priority, community_id, reported_by) VALUES
        (
            'Ruido excesivo en zona de piscina',
            'Los vecinos de la torre A organizan fiestas muy ruidosas los fines de semana en el área de la piscina. El ruido se prolonga hasta altas horas afectando el descanso de las familias con niños pequeños. Se requiere mediación urgente.',
            'abierto',
            'media',
            community1_id,
            admin_user_id
        ),
        (
            'Fuga de agua en garaje subterráneo',
            'Se ha detectado una fuga importante en las tuberías del garaje subterráneo nivel -1. El agua está afectando varios espacios de parqueo y existe riesgo de daños a los vehículos. Se requiere plomero especializado urgente.',
            'en_progreso',
            'alta',
            community1_id,
            admin_user_id
        ),
        (
            'Cerradura digital del portón principal dañada',
            'La cerradura digital del acceso principal no reconoce las tarjetas de varios residentes. Los habitantes deben esperar que otros les abran o usar la entrada de emergencia. Compromete la seguridad del conjunto.',
            'cerrado',
            'urgente',
            community2_id,
            admin_user_id
        ),
        (
            'Ascensor del Edificio B fuera de servicio',
            'El ascensor principal del Edificio B se quedó atascado entre el piso 3 y 4 esta mañana. Técnico ya lo revisó y requiere repuesto específico que llegará en 3 días. Residentes mayores tienen dificultades.',
            'en_progreso',
            'alta',
            community2_id,
            admin_user_id
        ),
        (
            'Iluminación deficiente en senderos exteriores',
            'Varias luminarias de los senderos del jardín están fundidas o intermitentes. Durante la noche, los residentes reportan inseguridad al caminar por las áreas verdes. Se requiere revisión eléctrica completa.',
            'abierto',
            'baja',
            community3_id,
            admin_user_id
        ),
        (
            'Sistema de riego automatizado no funciona',
            'El sistema de riego inteligente instalado hace 6 meses no está activándose según la programación. Los jardines muestran signos de sequedad. Posible problema con los sensores de humedad.',
            'abierto',
            'media',
            community3_id,
            admin_user_id
        );
    
    RAISE NOTICE 'Created 6 diverse incidents with realistic scenarios';
    
    -- Final verification and summary
    RAISE NOTICE '=== TEST DATA CREATION COMPLETED ===';
    RAISE NOTICE 'Communities created: %', (SELECT COUNT(*) FROM public.communities WHERE user_id = admin_user_id);
    RAISE NOTICE 'User roles created: %', (SELECT COUNT(*) FROM public.user_roles WHERE user_id = admin_user_id);
    RAISE NOTICE 'Incidents created: %', (SELECT COUNT(*) FROM public.incidents WHERE reported_by = admin_user_id);
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCCESS: Your incidents dashboard should now work!';
    RAISE NOTICE '📱 Visit: http://localhost:3002/incidents';
    RAISE NOTICE '👤 Admin: sergioariasf@gmail.com can see ALL incidents';
    RAISE NOTICE '';
    
END $$;