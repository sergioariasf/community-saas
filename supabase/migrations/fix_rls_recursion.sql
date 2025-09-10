-- Fix RLS infinite recursion by dropping and recreating all policies

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow users to manage roles in their organization" ON user_roles;
DROP POLICY IF EXISTS "Users can view roles in their organization" ON user_roles;
DROP POLICY IF EXISTS "Organization admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_roles;

DROP POLICY IF EXISTS "Users can view their communities" ON communities;
DROP POLICY IF EXISTS "Users can create communities" ON communities;
DROP POLICY IF EXISTS "Users can update their communities" ON communities;
DROP POLICY IF EXISTS "Users can delete their communities" ON communities;
DROP POLICY IF EXISTS "Community members can view" ON communities;
DROP POLICY IF EXISTS "Organization members can create" ON communities;
DROP POLICY IF EXISTS "Community managers can update" ON communities;

DROP POLICY IF EXISTS "Users can view incidents in their communities" ON incidents;
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;
DROP POLICY IF EXISTS "Users can update incidents" ON incidents;
DROP POLICY IF EXISTS "Users can delete incidents" ON incidents;
DROP POLICY IF EXISTS "Community members can view incidents" ON incidents;
DROP POLICY IF EXISTS "Community members can create incidents" ON incidents;

-- Recreate user_roles policies without recursion
CREATE POLICY "user_roles_select_policy" ON user_roles
  FOR SELECT USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "user_roles_insert_policy" ON user_roles
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "user_roles_update_policy" ON user_roles
  FOR UPDATE USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "user_roles_delete_policy" ON user_roles
  FOR DELETE USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Recreate communities policies
CREATE POLICY "communities_select_policy" ON communities
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "communities_insert_policy" ON communities
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "communities_update_policy" ON communities
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "communities_delete_policy" ON communities
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Recreate incidents policies
CREATE POLICY "incidents_select_policy" ON incidents
  FOR SELECT USING (
    community_id IN (
      SELECT id FROM communities 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "incidents_insert_policy" ON incidents
  FOR INSERT WITH CHECK (
    community_id IN (
      SELECT id FROM communities 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "incidents_update_policy" ON incidents
  FOR UPDATE USING (
    community_id IN (
      SELECT id FROM communities 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "incidents_delete_policy" ON incidents
  FOR DELETE USING (
    community_id IN (
      SELECT id FROM communities 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );