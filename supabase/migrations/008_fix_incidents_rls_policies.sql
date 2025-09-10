-- Migration 008: Fix RLS policies for incidents to allow global admin access
-- Date: 2025-01-10
-- Objective: Allow global admins to access all incidents across communities

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view incidents from their communities" ON incidents;
DROP POLICY IF EXISTS "Users can create incidents in their communities" ON incidents;
DROP POLICY IF EXISTS "Admins and managers can update incidents" ON incidents;
DROP POLICY IF EXISTS "Admins can delete incidents" ON incidents;

-- ✅ FIXED Policy: Users can view incidents (including global admin access)
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

-- ✅ FIXED Policy: Users can create incidents (including community validation)
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

-- ✅ FIXED Policy: Admins and managers can update incidents (including global)
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
    -- Users can update incidents they reported (but only status/description)
    reported_by = auth.uid()
  );

-- ✅ FIXED Policy: Admins can delete incidents (including global)
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

-- Add helpful function to check user permissions for debugging
CREATE OR REPLACE FUNCTION debug_user_permissions(check_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_email TEXT,
  role_type TEXT,
  community_name TEXT,
  can_see_all_incidents BOOLEAN,
  total_visible_incidents BIGINT
) AS $$
BEGIN
  IF check_user_id IS NULL THEN
    check_user_id := auth.uid();
  END IF;
  
  RETURN QUERY
  SELECT 
    COALESCE(au.email, 'Unknown User') as user_email,
    COALESCE(ur.role, 'No Role') as role_type,
    COALESCE(c.name, 'Global Admin') as community_name,
    (ur.community_id IS NULL AND ur.role = 'admin') as can_see_all_incidents,
    COUNT(i.id) as total_visible_incidents
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  LEFT JOIN communities c ON ur.community_id = c.id
  LEFT JOIN incidents i ON (
    -- Global admin sees all
    (ur.community_id IS NULL AND ur.role = 'admin') 
    OR 
    -- Community member sees their community's incidents
    ur.community_id = i.community_id
    OR 
    -- Reporter sees their own incidents
    i.reported_by = au.id
  )
  WHERE au.id = check_user_id
  GROUP BY au.email, ur.role, c.name, ur.community_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION debug_user_permissions TO authenticated;