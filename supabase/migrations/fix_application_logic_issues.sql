-- Fix Application Logic Issues
-- Date: 2025-01-10  
-- Objective: Fix organization_id assignment and user role issues
-- User ID: 12e1976b-4bd0-4062-833c-9d1cf78c49eb

-- ============================================================================
-- PHASE 1: DIAGNOSE CURRENT STATE
-- ============================================================================

-- Check if user exists in auth.users
DO $$
DECLARE
    target_user_id UUID := '12e1976b-4bd0-4062-833c-9d1cf78c49eb';
    user_exists BOOLEAN := FALSE;
    user_email TEXT;
    user_org_count INTEGER := 0;
    default_org_id UUID;
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '🔍 DIAGNOSING APPLICATION LOGIC ISSUES';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Target User ID: %', target_user_id;
    
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id), 
           (SELECT email FROM auth.users WHERE id = target_user_id LIMIT 1)
    INTO user_exists, user_email;
    
    IF user_exists THEN
        RAISE NOTICE '✅ User exists in auth.users with email: %', user_email;
    ELSE
        RAISE EXCEPTION '❌ User % does not exist in auth.users', target_user_id;
    END IF;
    
    -- Check user's current organization assignments
    SELECT COUNT(*) INTO user_org_count
    FROM public.user_roles ur
    WHERE ur.user_id = target_user_id;
    
    RAISE NOTICE '📊 User has % role assignments', user_org_count;
    
    -- Get default organization
    SELECT id INTO default_org_id
    FROM public.organizations
    WHERE name = 'Organización Principal'
    LIMIT 1;
    
    RAISE NOTICE '🏢 Default organization ID: %', default_org_id;
    
END $$;

-- ============================================================================  
-- PHASE 2: ENSURE USER HAS ORGANIZATION ASSIGNMENT
-- ============================================================================

DO $$
DECLARE
    target_user_id UUID := '12e1976b-4bd0-4062-833c-9d1cf78c49eb';
    default_org_id UUID;
    user_role_count INTEGER := 0;
    first_community_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FIXING USER ORGANIZATION ASSIGNMENT';
    RAISE NOTICE '============================================================================';
    
    -- Get default organization ID
    SELECT id INTO default_org_id
    FROM public.organizations
    WHERE name = 'Organización Principal'
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF default_org_id IS NULL THEN
        RAISE EXCEPTION '❌ No default organization found. Please run migration 010 first.';
    END IF;
    
    -- Check if user already has roles in this organization
    SELECT COUNT(*) INTO user_role_count
    FROM public.user_roles ur
    WHERE ur.user_id = target_user_id
    AND ur.organization_id = default_org_id;
    
    IF user_role_count = 0 THEN
        RAISE NOTICE '⚠️  User has no roles in default organization. Adding admin role...';
        
        -- Add organization-level admin role (community_id = NULL for org-wide access)
        INSERT INTO public.user_roles (user_id, community_id, organization_id, role)
        VALUES (target_user_id, NULL, default_org_id, 'admin')
        ON CONFLICT (user_id, community_id, organization_id) 
        DO UPDATE SET role = 'admin';
        
        RAISE NOTICE '✅ Added organization-level admin role for user';
        
        -- Also add a community-specific manager role for the first community
        SELECT id INTO first_community_id
        FROM public.communities
        WHERE organization_id = default_org_id
        ORDER BY created_at ASC
        LIMIT 1;
        
        IF first_community_id IS NOT NULL THEN
            INSERT INTO public.user_roles (user_id, community_id, organization_id, role)
            VALUES (target_user_id, first_community_id, default_org_id, 'manager')
            ON CONFLICT (user_id, community_id, organization_id)
            DO UPDATE SET role = 'manager';
            
            RAISE NOTICE '✅ Added community manager role for first community: %', first_community_id;
        END IF;
        
    ELSE
        RAISE NOTICE '✅ User already has % role(s) in default organization', user_role_count;
    END IF;
    
END $$;

-- ============================================================================
-- PHASE 3: ENSURE ALL COMMUNITIES HAVE ORGANIZATION_ID
-- ============================================================================

DO $$
DECLARE
    default_org_id UUID;
    orphaned_communities INTEGER := 0;
    updated_communities INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏘️  FIXING COMMUNITIES ORGANIZATION ASSIGNMENT';
    RAISE NOTICE '============================================================================';
    
    -- Get default organization ID
    SELECT id INTO default_org_id
    FROM public.organizations
    WHERE name = 'Organización Principal'
    LIMIT 1;
    
    -- Check for communities without organization_id
    SELECT COUNT(*) INTO orphaned_communities
    FROM public.communities
    WHERE organization_id IS NULL;
    
    IF orphaned_communities > 0 THEN
        RAISE NOTICE '⚠️  Found % communities without organization_id', orphaned_communities;
        
        -- Assign orphaned communities to default organization
        UPDATE public.communities
        SET organization_id = default_org_id
        WHERE organization_id IS NULL;
        
        GET DIAGNOSTICS updated_communities = ROW_COUNT;
        RAISE NOTICE '✅ Updated % communities to default organization', updated_communities;
    ELSE
        RAISE NOTICE '✅ All communities have organization_id assigned';
    END IF;
    
END $$;

-- ============================================================================
-- PHASE 4: ENSURE ALL INCIDENTS HAVE ORGANIZATION_ID
-- ============================================================================

DO $$
DECLARE
    orphaned_incidents INTEGER := 0;
    updated_incidents INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎫 FIXING INCIDENTS ORGANIZATION ASSIGNMENT';
    RAISE NOTICE '============================================================================';
    
    -- Check for incidents without organization_id
    SELECT COUNT(*) INTO orphaned_incidents
    FROM public.incidents
    WHERE organization_id IS NULL;
    
    IF orphaned_incidents > 0 THEN
        RAISE NOTICE '⚠️  Found % incidents without organization_id', orphaned_incidents;
        
        -- Update incidents to inherit organization_id from their community
        UPDATE public.incidents i
        SET organization_id = c.organization_id
        FROM public.communities c
        WHERE i.community_id = c.id
        AND i.organization_id IS NULL
        AND c.organization_id IS NOT NULL;
        
        GET DIAGNOSTICS updated_incidents = ROW_COUNT;
        RAISE NOTICE '✅ Updated % incidents with organization_id from community', updated_incidents;
        
        -- Handle any remaining orphaned incidents (no valid community)
        DECLARE
            default_org_id UUID;
            remaining_orphans INTEGER := 0;
        BEGIN
            SELECT id INTO default_org_id
            FROM public.organizations
            WHERE name = 'Organización Principal'
            LIMIT 1;
            
            SELECT COUNT(*) INTO remaining_orphans
            FROM public.incidents
            WHERE organization_id IS NULL;
            
            IF remaining_orphans > 0 THEN
                RAISE NOTICE '⚠️  Found % incidents with no valid community, assigning to default org', remaining_orphans;
                
                UPDATE public.incidents
                SET organization_id = default_org_id
                WHERE organization_id IS NULL;
                
                GET DIAGNOSTICS updated_incidents = ROW_COUNT;
                RAISE NOTICE '✅ Updated % orphaned incidents to default organization', updated_incidents;
            END IF;
        END;
        
    ELSE
        RAISE NOTICE '✅ All incidents have organization_id assigned';
    END IF;
    
END $$;

-- ============================================================================
-- PHASE 5: ENSURE ALL USER_ROLES HAVE ORGANIZATION_ID
-- ============================================================================

DO $$
DECLARE
    default_org_id UUID;
    orphaned_roles INTEGER := 0;
    updated_roles INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👥 FIXING USER_ROLES ORGANIZATION ASSIGNMENT';
    RAISE NOTICE '============================================================================';
    
    -- Get default organization ID
    SELECT id INTO default_org_id
    FROM public.organizations
    WHERE name = 'Organización Principal'
    LIMIT 1;
    
    -- Check for user_roles without organization_id
    SELECT COUNT(*) INTO orphaned_roles
    FROM public.user_roles
    WHERE organization_id IS NULL;
    
    IF orphaned_roles > 0 THEN
        RAISE NOTICE '⚠️  Found % user roles without organization_id', orphaned_roles;
        
        -- First, try to inherit organization_id from community
        UPDATE public.user_roles ur
        SET organization_id = c.organization_id
        FROM public.communities c
        WHERE ur.community_id = c.id
        AND ur.organization_id IS NULL
        AND c.organization_id IS NOT NULL;
        
        GET DIAGNOSTICS updated_roles = ROW_COUNT;
        RAISE NOTICE '✅ Updated % user roles with organization_id from community', updated_roles;
        
        -- Handle global admin roles (community_id IS NULL)
        UPDATE public.user_roles
        SET organization_id = default_org_id
        WHERE organization_id IS NULL
        AND community_id IS NULL;
        
        GET DIAGNOSTICS updated_roles = ROW_COUNT;
        RAISE NOTICE '✅ Updated % global admin roles to default organization', updated_roles;
        
        -- Handle any remaining orphaned roles
        UPDATE public.user_roles
        SET organization_id = default_org_id
        WHERE organization_id IS NULL;
        
        GET DIAGNOSTICS updated_roles = ROW_COUNT;
        IF updated_roles > 0 THEN
            RAISE NOTICE '✅ Updated % remaining orphaned roles to default organization', updated_roles;
        END IF;
        
    ELSE
        RAISE NOTICE '✅ All user roles have organization_id assigned';
    END IF;
    
END $$;

-- ============================================================================
-- PHASE 6: VERIFICATION AND SUMMARY
-- ============================================================================

DO $$
DECLARE
    target_user_id UUID := '12e1976b-4bd0-4062-833c-9d1cf78c49eb';
    user_roles_count INTEGER := 0;
    user_org_id UUID;
    communities_without_org INTEGER := 0;
    incidents_without_org INTEGER := 0;
    roles_without_org INTEGER := 0;
    total_orgs INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ VERIFICATION AND SUMMARY';
    RAISE NOTICE '============================================================================';
    
    -- Check user's final role status
    SELECT COUNT(*), MIN(organization_id) INTO user_roles_count, user_org_id
    FROM public.user_roles
    WHERE user_id = target_user_id;
    
    RAISE NOTICE '👤 Target user role status:';
    RAISE NOTICE '   - Total roles: %', user_roles_count;
    RAISE NOTICE '   - Primary organization: %', user_org_id;
    
    -- Display user's roles
    FOR record IN (
        SELECT 
            ur.role,
            ur.organization_id,
            ur.community_id,
            c.name as community_name,
            o.name as org_name
        FROM public.user_roles ur
        LEFT JOIN public.communities c ON ur.community_id = c.id
        LEFT JOIN public.organizations o ON ur.organization_id = o.id
        WHERE ur.user_id = target_user_id
        ORDER BY ur.role, ur.community_id NULLS FIRST
    ) LOOP
        IF record.community_id IS NULL THEN
            RAISE NOTICE '   - % (organization-wide) in "%"', record.role, record.org_name;
        ELSE
            RAISE NOTICE '   - % in community "%" (org: "%")', record.role, record.community_name, record.org_name;
        END IF;
    END LOOP;
    
    -- Check for any remaining orphaned records
    SELECT COUNT(*) INTO communities_without_org FROM public.communities WHERE organization_id IS NULL;
    SELECT COUNT(*) INTO incidents_without_org FROM public.incidents WHERE organization_id IS NULL;
    SELECT COUNT(*) INTO roles_without_org FROM public.user_roles WHERE organization_id IS NULL;
    SELECT COUNT(*) INTO total_orgs FROM public.organizations;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Database integrity status:';
    RAISE NOTICE '   - Total organizations: %', total_orgs;
    RAISE NOTICE '   - Communities without organization_id: % (should be 0)', communities_without_org;
    RAISE NOTICE '   - Incidents without organization_id: % (should be 0)', incidents_without_org;
    RAISE NOTICE '   - User roles without organization_id: % (should be 0)', roles_without_org;
    
    IF communities_without_org = 0 AND incidents_without_org = 0 AND roles_without_org = 0 AND user_roles_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 SUCCESS! All application logic issues have been resolved:';
        RAISE NOTICE '   ✅ User has proper organization assignment';
        RAISE NOTICE '   ✅ All communities have organization_id';
        RAISE NOTICE '   ✅ All incidents have organization_id';
        RAISE NOTICE '   ✅ All user roles have organization_id';
        RAISE NOTICE '   ✅ Ready for community/incident creation';
    ELSE
        RAISE WARNING '⚠️  Some issues remain. Please review the output above.';
    END IF;
    
    RAISE NOTICE '============================================================================';
    
END $$;

-- ============================================================================
-- PHASE 7: CREATE HELPER FUNCTION FOR APPLICATION
-- ============================================================================

-- Function to ensure user has organization access before operations
CREATE OR REPLACE FUNCTION ensure_user_has_organization()
RETURNS UUID AS $$
DECLARE
    current_user_id UUID := auth.uid();
    user_org_id UUID;
    default_org_id UUID;
BEGIN
    -- Check if user already has an organization
    SELECT DISTINCT ur.organization_id INTO user_org_id
    FROM public.user_roles ur
    WHERE ur.user_id = current_user_id
    LIMIT 1;
    
    IF user_org_id IS NOT NULL THEN
        RETURN user_org_id;
    END IF;
    
    -- If no organization, assign to default
    SELECT id INTO default_org_id
    FROM public.organizations
    WHERE name = 'Organización Principal'
    LIMIT 1;
    
    IF default_org_id IS NULL THEN
        RAISE EXCEPTION 'No default organization found. Please contact administrator.';
    END IF;
    
    -- Add user to default organization with resident role
    INSERT INTO public.user_roles (user_id, community_id, organization_id, role)
    VALUES (current_user_id, NULL, default_org_id, 'resident')
    ON CONFLICT (user_id, community_id, organization_id)
    DO NOTHING;
    
    RETURN default_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_user_has_organization() TO authenticated;

COMMENT ON FUNCTION ensure_user_has_organization() IS 'Ensures current user has organization access, assigning to default if needed. Returns organization_id.';