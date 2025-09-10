-- Migration 007: Add missing columns to communities table
-- Date: 2025-01-10
-- Objective: Add missing columns that TypeScript types expect

-- Add missing columns to communities table
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'España',
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance on user_id lookup
CREATE INDEX IF NOT EXISTS idx_communities_user_id ON public.communities(user_id);

-- Add comments for documentation
COMMENT ON COLUMN public.communities.description IS 'Descripción detallada de la comunidad';
COMMENT ON COLUMN public.communities.city IS 'Ciudad donde se ubica la comunidad';
COMMENT ON COLUMN public.communities.country IS 'País donde se ubica la comunidad';
COMMENT ON COLUMN public.communities.user_id IS 'ID del usuario propietario/creador de la comunidad';

-- Update existing RLS policy to include user ownership
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.communities;

-- New RLS policies for proper multi-tenant security
CREATE POLICY "Users can view communities where they have roles" ON public.communities
  FOR SELECT 
  USING (
    -- Global admins can see all communities
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.role = 'admin'
    )
    OR
    -- Community-specific roles can see their community
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = communities.id
    )
    OR
    -- Community owners can see their communities
    user_id = auth.uid()
  );

CREATE POLICY "Admins can insert communities" ON public.communities
  FOR INSERT 
  WITH CHECK (
    -- Global admins can create communities
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.role = 'admin'
    )
    OR
    -- Users can create communities for themselves
    user_id = auth.uid()
  );

CREATE POLICY "Admins and owners can update communities" ON public.communities
  FOR UPDATE 
  USING (
    -- Global admins can update all communities
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.role = 'admin'
    )
    OR
    -- Community owners can update their communities
    user_id = auth.uid()
    OR
    -- Community admins/managers can update their community
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id = communities.id
      AND ur.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete communities" ON public.communities
  FOR DELETE 
  USING (
    -- Only global admins can delete communities
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.community_id IS NULL 
      AND ur.role = 'admin'
    )
  );