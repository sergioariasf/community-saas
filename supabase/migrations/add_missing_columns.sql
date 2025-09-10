-- Add missing columns to communities table
-- Execute this first, then run the test data script

-- Add the missing columns
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Verify the columns were added
SELECT 'Updated communities table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'communities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current data count
SELECT 'Current data count:' as info;
SELECT 
  'communities' as table_name, COUNT(*) as count FROM communities
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL  
SELECT 'incidents', COUNT(*) FROM incidents;