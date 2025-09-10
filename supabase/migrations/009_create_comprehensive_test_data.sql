-- Migration 009: Create comprehensive test data with proper relationships
-- Date: 2025-01-10
-- Objective: Create realistic test data ensuring proper ownership and visibility

-- Clean up any existing test data to avoid conflicts
DO $$
BEGIN
    RAISE NOTICE 'Cleaning up existing test data to avoid conflicts...';
    
    -- Remove incidents from test communities
    DELETE FROM public.incidents 
    WHERE community_id IN (
        SELECT id FROM public.communities 
        WHERE name IN ('Residencial Los Álamos', 'Urbanización Bella Vista', 'Complejo Jardines del Sur')
    );
    
    -- Remove test communities
    DELETE FROM public.communities 
    WHERE name IN ('Residencial Los Álamos', 'Urbanización Bella Vista', 'Complejo Jardines del Sur');
    
    RAISE NOTICE 'Cleanup completed';
END $$;

-- Helper function to get user ID with proper error handling
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_address text)
RETURNS uuid AS $$
DECLARE
    user_uuid uuid;
    user_count integer;
BEGIN
    -- First check how many users exist with this email
    SELECT COUNT(*) INTO user_count 
    FROM auth.users 
    WHERE email = email_address;
    
    -- Handle different scenarios
    IF user_count = 0 THEN
        RAISE EXCEPTION 'No user found with email: %', email_address;
    ELSIF user_count > 1 THEN
        RAISE NOTICE 'WARNING: Multiple users found with email %. Using the most recently created one.', email_address;
        -- Use LIMIT 1 and ORDER BY to get the most recent user
        SELECT id INTO user_uuid 
        FROM auth.users 
        WHERE email = email_address
        ORDER BY created_at DESC
        LIMIT 1;
    ELSE
        -- Exactly one user found - the ideal case
        SELECT id INTO user_uuid 
        FROM auth.users 
        WHERE email = email_address;
    END IF;
    
    RAISE NOTICE 'Found user ID % for email %', user_uuid, email_address;
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Get the admin user ID
DO $$
DECLARE
    admin_user_id uuid;
    community1_id uuid;
    community2_id uuid;
    community3_id uuid;
BEGIN
    RAISE NOTICE 'Starting test data creation...';
    
    -- Get admin user ID with validation
    BEGIN
        SELECT get_user_id_by_email('sergioariasf@gmail.com') INTO admin_user_id;
        
        IF admin_user_id IS NULL THEN
            RAISE EXCEPTION 'Failed to get admin user ID for sergioariasf@gmail.com';
        END IF;
        
        RAISE NOTICE 'Using admin user ID: %', admin_user_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error getting admin user: %', SQLERRM;
    END;
    
    -- Create sample communities with proper ownership
    INSERT INTO public.communities (
        name, 
        description, 
        address, 
        city, 
        country, 
        postal_code, 
        admin_contact, 
        max_units, 
        user_id
    ) VALUES 
    (
        'Residencial Los Álamos',
        'Comunidad residencial moderna con amplias zonas verdes y piscina comunitaria. Ubicada en zona tranquila con fácil acceso al transporte público.',
        'Calle de los Álamos, 15',
        'Madrid',
        'España',
        '28034',
        'admin.alamos@ejemplo.com',
        120,
        admin_user_id
    ),
    (
        'Urbanización Bella Vista',
        'Exclusiva urbanización con casas unifamiliares, parque infantil y zona deportiva. Vigilancia 24 horas.',
        'Avenida Bella Vista, 42',
        'Barcelona',
        'España',
        '08015',
        'administracion@bellavista.com',
        80,
        admin_user_id
    ),
    (
        'Complejo Jardines del Sur',
        'Moderno complejo de apartamentos con jardines tropicales, gimnasio y sala social. Pet-friendly.',
        'Plaza de los Jardines, 8',
        'Sevilla',
        'España',
        '41013',
        'info@jardinesdelsur.es',
        200,
        admin_user_id
    );

    -- Get the actual IDs of the communities created
    SELECT id INTO community1_id FROM public.communities WHERE name = 'Residencial Los Álamos';
    SELECT id INTO community2_id FROM public.communities WHERE name = 'Urbanización Bella Vista';  
    SELECT id INTO community3_id FROM public.communities WHERE name = 'Complejo Jardines del Sur';
    
    -- Validate that all communities were created successfully
    IF community1_id IS NULL OR community2_id IS NULL OR community3_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create all communities. IDs: %, %, %', community1_id, community2_id, community3_id;
    END IF;
    
    RAISE NOTICE 'Created communities with IDs: %, %, %', community1_id, community2_id, community3_id;

    -- Ensure admin has global role (might already exist from previous migration)
    INSERT INTO public.user_roles (user_id, community_id, role) 
    VALUES (admin_user_id, NULL, 'admin')
    ON CONFLICT (user_id, community_id) DO NOTHING;
    
    RAISE NOTICE 'Assigned global admin role to user %', admin_user_id;

    -- Add community-specific roles for testing
    INSERT INTO public.user_roles (user_id, community_id, role) VALUES
    (admin_user_id, community1_id, 'manager'),
    (admin_user_id, community2_id, 'manager')
    ON CONFLICT (user_id, community_id) DO NOTHING;
    
    RAISE NOTICE 'Assigned community manager roles for communities % and %', community1_id, community2_id;

    -- Create diverse incidents across all communities
    INSERT INTO public.incidents (
        title, 
        description, 
        status, 
        priority, 
        community_id, 
        reported_by,
        created_at
    ) VALUES
    -- Community 1: Los Álamos
    (
        'Ruido excesivo en zona de piscina',
        'Vecinos reportan música alta y gritos en el área de piscina durante horas de descanso (22:00-08:00). Afecta principalmente a los bloques A y B.',
        'abierto',
        'media',
        community1_id,
        admin_user_id,
        NOW() - INTERVAL '2 days'
    ),
    (
        'Goteras en aparcamiento subterráneo',
        'Se han detectado filtraciones de agua en el techo del aparcamiento, zona C, plazas 45-60. El agua está dañando vehículos estacionados.',
        'en_progreso',
        'alta',
        community1_id,
        admin_user_id,
        NOW() - INTERVAL '5 days'
    ),
    
    -- Community 2: Bella Vista  
    (
        'Farola fundida en entrada principal',
        'La iluminación de la entrada principal no funciona desde hace 3 días. Representa un problema de seguridad durante las horas nocturnas.',
        'abierto',
        'alta',
        community2_id,
        admin_user_id,
        NOW() - INTERVAL '1 day'
    ),
    (
        'Problema con cerradura electrónica',
        'La cerradura del portón principal falla intermitentemente. Algunos residentes no pueden acceder con su tarjeta.',
        'cerrado',
        'urgente',
        community2_id,
        admin_user_id,
        NOW() - INTERVAL '7 days'
    ),
    
    -- Community 3: Jardines del Sur
    (
        'Aire acondicionado del gimnasio averiado',
        'El sistema de climatización del gimnasio comunitario no funciona. La temperatura es insoportable durante el ejercicio.',
        'en_progreso',
        'media',
        community3_id,
        admin_user_id,
        NOW() - INTERVAL '3 days'
    ),
    (
        'Jardín necesita mantenimiento urgente',
        'Los jardines tropicales presentan plagas y algunas plantas están muriendo. Se requiere intervención de jardinería profesional.',
        'abierto',
        'baja',
        community3_id,
        admin_user_id,
        NOW() - INTERVAL '1 day'
    );
    
    RAISE NOTICE 'Created 6 test incidents across all communities';

    -- Update resolved_at for closed incidents
    UPDATE public.incidents 
    SET resolved_at = NOW() - INTERVAL '2 days'
    WHERE status = 'cerrado';
    
    RAISE NOTICE 'Updated resolved_at timestamps for closed incidents';

END $$;

-- Create view for easy incident monitoring
CREATE OR REPLACE VIEW incidents_summary AS
SELECT 
    i.id,
    i.title,
    i.status,
    i.priority,
    c.name as community_name,
    c.city as community_city,
    au.email as reporter_email,
    i.created_at,
    i.updated_at,
    CASE 
        WHEN i.status = 'cerrado' THEN i.resolved_at
        ELSE NULL
    END as resolved_at,
    CASE 
        WHEN i.status = 'abierto' THEN EXTRACT(days FROM NOW() - i.created_at)
        ELSE NULL
    END as days_open
FROM incidents i
JOIN communities c ON i.community_id = c.id
JOIN auth.users au ON i.reported_by = au.id
ORDER BY i.created_at DESC;

-- Grant view access to authenticated users
GRANT SELECT ON incidents_summary TO authenticated;

-- Final verification query
DO $$
DECLARE
    total_communities integer;
    total_incidents integer;
    total_roles integer;
BEGIN
    SELECT COUNT(*) INTO total_communities FROM public.communities;
    SELECT COUNT(*) INTO total_incidents FROM public.incidents;
    SELECT COUNT(*) INTO total_roles FROM public.user_roles;
    
    RAISE NOTICE '✅ Migration 009 completed successfully:';
    RAISE NOTICE '   - Communities created: %', total_communities;
    RAISE NOTICE '   - Incidents created: %', total_incidents;
    RAISE NOTICE '   - User roles: %', total_roles;
    RAISE NOTICE '   - Admin user: sergioariasf@gmail.com should now see all incidents';
END $$;