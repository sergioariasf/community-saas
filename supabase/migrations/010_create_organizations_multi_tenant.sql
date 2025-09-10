-- Migration 010: Create Organizations Multi-Tenant Architecture
-- Date: 2025-01-10
-- Objective: Implement organizations as root tenant isolation level
-- Architecture: organizations → communities → users → incidents

-- ============================================================================
-- PHASE 1: CREATE ORGANIZATIONS TABLE
-- ============================================================================

-- Create organizations table with complete schema
CREATE TABLE IF NOT EXISTS public.organizations (
  -- Primary identifier
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Organization details
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(trim(name)) <= 255),
  description TEXT CHECK (description IS NULL OR length(trim(description)) <= 1000),
  
  -- Ownership and contact
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  contact_email TEXT CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_phone TEXT CHECK (contact_phone IS NULL OR length(trim(contact_phone)) >= 10),
  
  -- Subscription configuration
  subscription_plan TEXT NOT NULL DEFAULT 'basic' 
    CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  max_communities INTEGER NOT NULL DEFAULT 5 
    CHECK (max_communities > 0 AND max_communities <= 1000),
  max_users_per_community INTEGER NOT NULL DEFAULT 500
    CHECK (max_users_per_community > 0 AND max_users_per_community <= 10000),
  
  -- Business settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'es-ES',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure unique organization names (business constraint)
  CONSTRAINT unique_organization_name UNIQUE(name)
);

-- Performance indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_plan ON public.organizations(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON public.organizations(created_at DESC);

-- ============================================================================
-- PHASE 2: ADD ORGANIZATION_ID TO EXISTING TABLES
-- ============================================================================

-- Add organization_id to communities table
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to user_roles table  
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to incidents table
ALTER TABLE public.incidents
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create performance indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_communities_organization_id ON public.communities(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON public.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_organization_id ON public.incidents(organization_id);

-- ============================================================================
-- PHASE 3: DATA MIGRATION - CREATE DEFAULT ORGANIZATION
-- ============================================================================

-- Create a default organization for existing data
DO $$
DECLARE
    default_org_id UUID;
    admin_user_id UUID;
    affected_communities INTEGER := 0;
    affected_user_roles INTEGER := 0;
    affected_incidents INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting organizations multi-tenant migration...';
    
    -- Get the current admin user (assumed to be the owner of existing data)
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'sergioariasf@gmail.com'
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user sergioariasf@gmail.com not found. Cannot proceed with migration.';
    END IF;
    
    RAISE NOTICE 'Using admin user ID: %', admin_user_id;
    
    -- Create default organization
    INSERT INTO public.organizations (
        name,
        description,
        owner_id,
        contact_email,
        subscription_plan,
        max_communities,
        max_users_per_community,
        is_active
    ) VALUES (
        'Organización Principal',
        'Organización por defecto creada durante la migración a arquitectura multi-tenant',
        admin_user_id,
        'sergioariasf@gmail.com',
        'enterprise',
        100,
        1000,
        true
    ) 
    RETURNING id INTO default_org_id;
    
    RAISE NOTICE 'Created default organization with ID: %', default_org_id;
    
    -- Update communities to belong to the default organization
    UPDATE public.communities 
    SET organization_id = default_org_id
    WHERE organization_id IS NULL;
    
    GET DIAGNOSTICS affected_communities = ROW_COUNT;
    RAISE NOTICE 'Updated % communities to belong to default organization', affected_communities;
    
    -- Update user_roles to belong to the default organization
    UPDATE public.user_roles 
    SET organization_id = default_org_id
    WHERE organization_id IS NULL;
    
    GET DIAGNOSTICS affected_user_roles = ROW_COUNT;
    RAISE NOTICE 'Updated % user roles to belong to default organization', affected_user_roles;
    
    -- Update incidents to belong to the default organization
    UPDATE public.incidents 
    SET organization_id = default_org_id
    WHERE organization_id IS NULL;
    
    GET DIAGNOSTICS affected_incidents = ROW_COUNT;
    RAISE NOTICE 'Updated % incidents to belong to default organization', affected_incidents;
    
    RAISE NOTICE 'Data migration completed successfully:';
    RAISE NOTICE '  - Default organization created: %', default_org_id;
    RAISE NOTICE '  - Communities migrated: %', affected_communities;
    RAISE NOTICE '  - User roles migrated: %', affected_user_roles;
    RAISE NOTICE '  - Incidents migrated: %', affected_incidents;
    
END $$;

-- ============================================================================
-- PHASE 4: ENFORCE REFERENTIAL INTEGRITY
-- ============================================================================

-- Make organization_id NOT NULL after data migration
ALTER TABLE public.communities 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.user_roles
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.incidents
ALTER COLUMN organization_id SET NOT NULL;

-- ============================================================================
-- PHASE 5: ENABLE RLS ON ORGANIZATIONS TABLE
-- ============================================================================

-- Enable RLS on organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization owners can see and manage their own organization
CREATE POLICY "Organization owners can manage their organization" ON public.organizations
  FOR ALL
  USING (auth.uid() = owner_id);

-- Global admins can see all organizations (for super admin purposes)
CREATE POLICY "Global admins can view all organizations" ON public.organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.organization_id IS NULL
      AND ur.role = 'admin'
    )
  );

-- ============================================================================
-- PHASE 6: UPDATE EXISTING RLS POLICIES FOR ORGANIZATION ISOLATION
-- ============================================================================

-- Drop all existing policies that need organization-level updates
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.communities;
DROP POLICY IF EXISTS "Users can view incidents with admin support" ON public.incidents;
DROP POLICY IF EXISTS "Users can create incidents with proper validation" ON public.incidents;
DROP POLICY IF EXISTS "Admins and managers can update incidents globally" ON public.incidents;
DROP POLICY IF EXISTS "Admins can delete incidents globally" ON public.incidents;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- ============================================================================
-- NEW ORGANIZATION-AWARE POLICIES FOR COMMUNITIES
-- ============================================================================

-- Communities: Organization owners can manage their communities
CREATE POLICY "Organization owners can manage their communities" ON public.communities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = communities.organization_id
      AND o.owner_id = auth.uid()
    )
  );

-- Communities: Users can view communities within their organization
CREATE POLICY "Users can view communities in their organization" ON public.communities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = communities.organization_id
    )
  );

-- ============================================================================
-- NEW ORGANIZATION-AWARE POLICIES FOR USER_ROLES  
-- ============================================================================

-- User roles: Organization owners can manage all roles in their organization
CREATE POLICY "Organization owners can manage roles in their organization" ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = user_roles.organization_id
      AND o.owner_id = auth.uid()
    )
  );

-- User roles: Users can view roles within their organization
CREATE POLICY "Users can view roles in their organization" ON public.user_roles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT ur.organization_id 
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
    )
  );

-- User roles: Community managers can view roles in their communities
CREATE POLICY "Community managers can view community roles" ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = user_roles.organization_id
      AND ur.role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- NEW ORGANIZATION-AWARE POLICIES FOR INCIDENTS
-- ============================================================================

-- Incidents: Organization owners can manage all incidents in their organization  
CREATE POLICY "Organization owners can manage organization incidents" ON public.incidents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = incidents.organization_id
      AND o.owner_id = auth.uid()
    )
  );

-- Incidents: Users can view incidents within their organization scope
CREATE POLICY "Users can view incidents in their organization scope" ON public.incidents
  FOR SELECT
  USING (
    -- Users can see incidents from communities they belong to within their organization
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = incidents.organization_id
      AND (
        ur.community_id = incidents.community_id OR 
        ur.community_id IS NULL  -- Organization-level roles
      )
    )
    OR
    -- Users can always see incidents they reported
    reported_by = auth.uid()
  );

-- Incidents: Users can create incidents in communities within their organization
CREATE POLICY "Users can create incidents in their organization communities" ON public.incidents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = incidents.organization_id
      AND (
        ur.community_id = incidents.community_id OR
        ur.community_id IS NULL  -- Organization-level roles can create anywhere
      )
    )
  );

-- Incidents: Managers and admins can update incidents in their scope
CREATE POLICY "Managers can update incidents in their organization scope" ON public.incidents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = incidents.organization_id
      AND ur.role IN ('admin', 'manager')
      AND (
        ur.community_id = incidents.community_id OR
        ur.community_id IS NULL  -- Organization-level roles
      )
    )
    OR
    -- Users can update their own reported incidents
    reported_by = auth.uid()
  );

-- Incidents: Admins can delete incidents in their organization scope
CREATE POLICY "Admins can delete incidents in their organization scope" ON public.incidents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = incidents.organization_id
      AND ur.role = 'admin'
    )
  );

-- ============================================================================
-- PHASE 7: HELPER FUNCTIONS AND VIEWS
-- ============================================================================

-- Function to get organization ID for current user
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT DISTINCT ur.organization_id INTO org_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organization summary view with computed metrics
CREATE OR REPLACE VIEW organization_dashboard AS
SELECT 
    o.id,
    o.name,
    o.description,
    o.subscription_plan,
    o.max_communities,
    o.max_users_per_community,
    o.is_active,
    o.created_at,
    
    -- Computed metrics
    (SELECT COUNT(*) FROM public.communities c WHERE c.organization_id = o.id) as total_communities,
    (SELECT COUNT(*) FROM public.user_roles ur WHERE ur.organization_id = o.id) as total_users,
    (SELECT COUNT(*) FROM public.incidents i WHERE i.organization_id = o.id AND i.status = 'abierto') as open_incidents,
    (SELECT COUNT(*) FROM public.incidents i WHERE i.organization_id = o.id) as total_incidents,
    
    -- Owner information
    au.email as owner_email
FROM public.organizations o
JOIN auth.users au ON o.owner_id = au.id
WHERE 
    -- Only show if user has access to this organization
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.organization_id = o.id
    )
    OR o.owner_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON organization_dashboard TO authenticated;

-- Function to check if user can access organization
CREATE OR REPLACE FUNCTION can_access_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.organization_id = org_id
    ) OR EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = org_id
        AND o.owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PHASE 8: UPDATE CONSTRAINTS AND TRIGGERS
-- ============================================================================

-- Update user_roles constraint to include organization_id
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS unique_user_community_role;

-- New constraint: user can have one role per community per organization
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_community_organization_role 
UNIQUE(user_id, community_id, organization_id);

-- Add trigger to auto-update organization updated_at
CREATE OR REPLACE FUNCTION update_organization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at_trigger
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_updated_at();

-- ============================================================================
-- PHASE 9: FINAL VERIFICATION
-- ============================================================================

-- Verification query to ensure migration success
DO $$
DECLARE
    total_organizations INTEGER;
    total_communities INTEGER;
    total_user_roles INTEGER;
    total_incidents INTEGER;
    orphaned_records INTEGER := 0;
BEGIN
    -- Count all records
    SELECT COUNT(*) INTO total_organizations FROM public.organizations;
    SELECT COUNT(*) INTO total_communities FROM public.communities;
    SELECT COUNT(*) INTO total_user_roles FROM public.user_roles;
    SELECT COUNT(*) INTO total_incidents FROM public.incidents;
    
    -- Check for orphaned records (should be 0)
    SELECT COUNT(*) INTO orphaned_records FROM (
        SELECT 'community' as table_name, id FROM public.communities WHERE organization_id IS NULL
        UNION ALL
        SELECT 'user_role' as table_name, id FROM public.user_roles WHERE organization_id IS NULL
        UNION ALL
        SELECT 'incident' as table_name, id FROM public.incidents WHERE organization_id IS NULL
    ) orphaned;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '✅ MIGRATION 010 COMPLETED SUCCESSFULLY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Multi-tenant architecture with organizations implemented:';
    RAISE NOTICE '  📊 Organizations: %', total_organizations;
    RAISE NOTICE '  🏘️  Communities: %', total_communities;
    RAISE NOTICE '  👥 User roles: %', total_user_roles;
    RAISE NOTICE '  🎫 Incidents: %', total_incidents;
    RAISE NOTICE '  ⚠️  Orphaned records: % (should be 0)', orphaned_records;
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Security: All tables now have organization-level RLS policies';
    RAISE NOTICE '📈 Performance: Indexes created for organization_id foreign keys';
    RAISE NOTICE '🔧 Views: organization_dashboard view available for metrics';
    RAISE NOTICE '🔨 Functions: Helper functions created for organization access';
    RAISE NOTICE '';
    
    IF orphaned_records > 0 THEN
        RAISE WARNING 'Found % orphaned records! Please investigate.', orphaned_records;
    ELSE
        RAISE NOTICE '✅ All records successfully migrated to organization structure';
    END IF;
    
    RAISE NOTICE '============================================================================';
END $$;

-- Add table comments for documentation
COMMENT ON TABLE public.organizations IS 'Root tenant table for multi-tenant SaaS. Each organization isolates all data.';
COMMENT ON COLUMN public.organizations.id IS 'Primary key and tenant isolation identifier';
COMMENT ON COLUMN public.organizations.name IS 'Organization name (property management company)';
COMMENT ON COLUMN public.organizations.owner_id IS 'Organization owner (main admin user)';
COMMENT ON COLUMN public.organizations.subscription_plan IS 'Subscription tier: basic, premium, enterprise';
COMMENT ON COLUMN public.organizations.max_communities IS 'Maximum communities allowed for this organization';
COMMENT ON COLUMN public.organizations.max_users_per_community IS 'Maximum users per community';

COMMENT ON COLUMN public.communities.organization_id IS 'Organization this community belongs to (tenant isolation)';
COMMENT ON COLUMN public.user_roles.organization_id IS 'Organization scope for this role (tenant isolation)';
COMMENT ON COLUMN public.incidents.organization_id IS 'Organization this incident belongs to (tenant isolation)';