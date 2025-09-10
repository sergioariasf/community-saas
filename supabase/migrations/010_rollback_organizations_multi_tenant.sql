-- ROLLBACK for Migration 010: Organizations Multi-Tenant Architecture
-- Date: 2025-01-10
-- CAUTION: This rollback will completely remove multi-tenant organization structure
-- USE ONLY IN EMERGENCY - WILL CAUSE DATA LOSS

-- ============================================================================
-- ROLLBACK VERIFICATION AND SAFETY
-- ============================================================================

-- Safety check: Prevent accidental execution
DO $$
BEGIN
    RAISE NOTICE '⚠️  ROLLBACK MIGRATION 010 - ORGANIZATIONS MULTI-TENANT';
    RAISE NOTICE '⚠️  This will PERMANENTLY DELETE the organizations table and all organization_id columns';
    RAISE NOTICE '⚠️  Uncomment the sections below ONLY if you are absolutely sure';
    RAISE NOTICE '⚠️  Consider backing up your database before proceeding';
    RAISE NOTICE '';
    RAISE NOTICE 'Current data counts:';
    RAISE NOTICE '  Organizations: % (WILL BE DELETED)', (SELECT COUNT(*) FROM public.organizations);
    RAISE NOTICE '  Communities: % (organization_id will be removed)', (SELECT COUNT(*) FROM public.communities);
    RAISE NOTICE '  User roles: % (organization_id will be removed)', (SELECT COUNT(*) FROM public.user_roles);
    RAISE NOTICE '  Incidents: % (organization_id will be removed)', (SELECT COUNT(*) FROM public.incidents);
    RAISE NOTICE '';
    RAISE NOTICE 'To proceed with rollback, uncomment the code sections in this file.';
END $$;

-- ============================================================================
-- PHASE 1: DROP ORGANIZATION-AWARE POLICIES (UNCOMMENT TO EXECUTE)
-- ============================================================================

/*
-- Drop new organization policies
DROP POLICY IF EXISTS "Organization owners can manage their organization" ON public.organizations;
DROP POLICY IF EXISTS "Global admins can view all organizations" ON public.organizations;

-- Drop organization-aware community policies
DROP POLICY IF EXISTS "Organization owners can manage their communities" ON public.communities;
DROP POLICY IF EXISTS "Users can view communities in their organization" ON public.communities;

-- Drop organization-aware user_roles policies  
DROP POLICY IF EXISTS "Organization owners can manage roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Community managers can view community roles" ON public.user_roles;

-- Drop organization-aware incident policies
DROP POLICY IF EXISTS "Organization owners can manage organization incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can view incidents in their organization scope" ON public.incidents;
DROP POLICY IF EXISTS "Users can create incidents in their organization communities" ON public.incidents;
DROP POLICY IF EXISTS "Managers can update incidents in their organization scope" ON public.incidents;
DROP POLICY IF EXISTS "Admins can delete incidents in their organization scope" ON public.incidents;
*/

-- ============================================================================
-- PHASE 2: DROP ORGANIZATION FUNCTIONS AND VIEWS (UNCOMMENT TO EXECUTE)
-- ============================================================================

/*
-- Drop organization-related views
DROP VIEW IF EXISTS organization_dashboard CASCADE;

-- Drop organization helper functions
DROP FUNCTION IF EXISTS get_user_organization_id() CASCADE;
DROP FUNCTION IF EXISTS can_access_organization(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_organization_updated_at() CASCADE;
*/

-- ============================================================================
-- PHASE 3: REMOVE ORGANIZATION_ID FOREIGN KEY CONSTRAINTS (UNCOMMENT TO EXECUTE)
-- ============================================================================

/*
-- Remove foreign key constraints first
ALTER TABLE public.communities DROP CONSTRAINT IF EXISTS communities_organization_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_organization_id_fkey;
ALTER TABLE public.incidents DROP CONSTRAINT IF EXISTS incidents_organization_id_fkey;

-- Drop indexes
DROP INDEX IF EXISTS idx_communities_organization_id;
DROP INDEX IF EXISTS idx_user_roles_organization_id;
DROP INDEX IF EXISTS idx_incidents_organization_id;
*/

-- ============================================================================
-- PHASE 4: REMOVE ORGANIZATION_ID COLUMNS (UNCOMMENT TO EXECUTE)
-- ============================================================================

/*
-- Remove organization_id columns from all tables
ALTER TABLE public.communities DROP COLUMN IF EXISTS organization_id;
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS organization_id;
ALTER TABLE public.incidents DROP COLUMN IF EXISTS organization_id;
*/

-- ============================================================================
-- PHASE 5: DROP ORGANIZATIONS TABLE (UNCOMMENT TO EXECUTE)
-- ============================================================================

/*
-- Drop the organizations table completely
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Drop organization-related indexes
DROP INDEX IF EXISTS idx_organizations_owner_id;
DROP INDEX IF EXISTS idx_organizations_subscription_plan;
DROP INDEX IF EXISTS idx_organizations_is_active;
DROP INDEX IF EXISTS idx_organizations_created_at;
*/

-- ============================================================================
-- PHASE 6: RESTORE ORIGINAL USER_ROLES CONSTRAINT (UNCOMMENT TO EXECUTE)
-- ============================================================================

/*
-- Remove the organization-aware constraint
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS unique_user_community_organization_role;

-- Restore original constraint
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_community_role UNIQUE(user_id, community_id);
*/

-- ============================================================================
-- PHASE 7: RESTORE ORIGINAL RLS POLICIES (UNCOMMENT TO EXECUTE)
-- ============================================================================

/*
-- Restore original communities policy
CREATE POLICY "Allow all for authenticated users" ON public.communities
FOR ALL USING (auth.role() = 'authenticated');

-- Restore original user_roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own roles" 
ON public.user_roles FOR UPDATE 
USING (auth.uid() = user_id);

-- Restore original incident policies (from migration 008)
CREATE POLICY "Users can view incidents with admin support" ON incidents
  FOR SELECT
  USING (
    -- Global admins can see ALL incidents
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.role = 'admin'
    )
    OR
    -- Community-specific users can see incidents from their communities
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = incidents.community_id
    )
    OR
    -- Users can always see incidents they reported
    reported_by = auth.uid()
  );

CREATE POLICY "Users can create incidents with proper validation" ON incidents
  FOR INSERT
  WITH CHECK (
    -- Global admins can create incidents in any community
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.role = 'admin'
    )
    OR
    -- Community members can create incidents in their communities
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = incidents.community_id
    )
  );

CREATE POLICY "Admins and managers can update incidents globally" ON incidents
  FOR UPDATE
  USING (
    -- Global admins can update ALL incidents
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.role = 'admin'
    )
    OR
    -- Community admins/managers can update incidents in their community
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = incidents.community_id
      AND ur.role IN ('admin', 'manager')
    )
    OR
    -- Users can update incidents they reported
    reported_by = auth.uid()
  );

CREATE POLICY "Admins can delete incidents globally" ON incidents
  FOR DELETE
  USING (
    -- Global admins can delete ALL incidents
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.role = 'admin'
    )
    OR
    -- Community admins can delete incidents in their community
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = incidents.community_id
      AND ur.role = 'admin'
    )
  );
*/

-- ============================================================================
-- ROLLBACK VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ROLLBACK SCRIPT PREPARED';
    RAISE NOTICE '';
    RAISE NOTICE 'To execute the rollback:';
    RAISE NOTICE '1. Uncomment all sections marked with /* */';
    RAISE NOTICE '2. Run each phase carefully in order';
    RAISE NOTICE '3. Verify data integrity after each phase';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  WARNING: This rollback will permanently delete:';
    RAISE NOTICE '   - All organization data';
    RAISE NOTICE '   - organization_id columns from all tables';
    RAISE NOTICE '   - Organization-level security policies';
    RAISE NOTICE '';
    RAISE NOTICE 'Make sure you have a database backup before proceeding!';
END $$;