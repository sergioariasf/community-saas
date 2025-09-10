-- FIX: Infinite recursion in user_roles RLS policies
-- The issue: policies were referencing user_roles table within user_roles policies
-- This creates circular dependency causing infinite recursion

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Community managers can view community roles" ON public.user_roles;

-- Replace with non-recursive policies

-- 1. Users can view their own roles (no recursion)
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- 2. Organization owners can manage all roles in their organization (no recursion)  
CREATE POLICY "Organization owners can manage all roles" ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = user_roles.organization_id
      AND o.owner_id = auth.uid()
    )
  );

-- 3. Allow inserting roles for organization members (no recursion needed)
CREATE POLICY "Organization owners can insert roles" ON public.user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = user_roles.organization_id
      AND o.owner_id = auth.uid()
    )
  );

-- 4. Users can update only their own profile-related role data (no recursion)
CREATE POLICY "Users can update their own role profile" ON public.user_roles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMENT ON POLICY "Users can view their own roles" ON public.user_roles IS 
'Non-recursive policy: users can only see roles directly assigned to them';

COMMENT ON POLICY "Organization owners can manage all roles" ON public.user_roles IS 
'Non-recursive policy: organization owners have full access to roles in their org';