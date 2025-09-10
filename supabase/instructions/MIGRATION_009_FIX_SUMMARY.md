# Migration 009 Fix Summary

## Problem Identified
The original `009_create_comprehensive_test_data.sql` migration was failing with:
```
ERROR: P0003: query returned more than one row  
HINT: Make sure the query returns a single row, or use LIMIT 1.
CONTEXT: PL/pgSQL function inline_code_block line 12 at SQL statement
```

## Root Cause Analysis
The error occurred in the `get_user_id_by_email()` function at line 12 where:
```sql
SELECT id INTO user_uuid 
FROM auth.users 
WHERE email = email_address;
```

This query was failing because multiple users with the same email `sergioariasf@gmail.com` existed in the `auth.users` table, which violates PostgreSQL's expectation for `SELECT INTO` statements to return exactly one row.

## Fixes Applied

### 1. Enhanced `get_user_id_by_email()` Function
- **Added duplicate detection**: Function now counts matching users first
- **Proper error handling**: Handles 0, 1, or multiple user scenarios
- **Smart selection**: If multiple users exist, selects the most recently created one
- **Informative logging**: Provides NOTICE messages for debugging

### 2. Improved Main Migration Block
- **Added validation**: Validates that admin user ID was successfully retrieved
- **Better error handling**: Wraps user lookup in try-catch block
- **Progress tracking**: Added NOTICE messages throughout the process
- **Community validation**: Ensures all communities were created successfully

### 3. Fixed RETURNING Clause Issue
- **Removed invalid RETURNING**: The original code tried to return multiple INSERT results into a single variable
- **Proper ID retrieval**: Uses separate SELECT statements to get community IDs
- **Validation checks**: Ensures all community IDs were retrieved successfully

### 4. Added Cleanup Mechanism
- **Conflict prevention**: Removes any existing test data before creating new data
- **Safe execution**: Allows migration to be run multiple times without conflicts

### 5. Enhanced Monitoring and Debugging
- **Progress notifications**: Added NOTICE messages at each major step
- **Validation checks**: Ensures each operation completed successfully
- **Detailed logging**: Includes user IDs, community IDs, and operation status

## Key Improvements in the Fixed Version

### Robust User Lookup
```sql
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
```

### Safe Community Creation
```sql
-- Validate that all communities were created successfully
IF community1_id IS NULL OR community2_id IS NULL OR community3_id IS NULL THEN
    RAISE EXCEPTION 'Failed to create all communities. IDs: %, %, %', community1_id, community2_id, community3_id;
END IF;
```

## Expected Output When Running Fixed Migration
```
NOTICE:  Cleaning up existing test data to avoid conflicts...
NOTICE:  Cleanup completed
NOTICE:  Starting test data creation...
NOTICE:  Found user ID [uuid] for email sergioariasf@gmail.com
NOTICE:  Using admin user ID: [uuid]
NOTICE:  Created communities with IDs: [uuid1], [uuid2], [uuid3]
NOTICE:  Assigned global admin role to user [uuid]
NOTICE:  Assigned community manager roles for communities [uuid1] and [uuid2]
NOTICE:  Created 6 test incidents across all communities
NOTICE:  Updated resolved_at timestamps for closed incidents
NOTICE:  ✅ Migration 009 completed successfully:
NOTICE:     - Communities created: 3
NOTICE:     - Incidents created: 6
NOTICE:     - User roles: [count]
NOTICE:     - Admin user: sergioariasf@gmail.com should now see all incidents
```

## Data Created
- **3 Communities**: Residencial Los Álamos, Urbanización Bella Vista, Complejo Jardines del Sur
- **6 Incidents**: 2 per community with different statuses (abierto, en_progreso, cerrado)
- **User Roles**: Global admin + community manager roles for test user
- **Monitoring View**: `incidents_summary` view for easy incident tracking

## How to Execute
1. Ensure your Supabase database connection is active
2. Run the corrected migration file:
   ```bash
   supabase db reset --db-url "your-db-url"
   # or
   psql -f supabase/migrations/009_create_comprehensive_test_data.sql "your-db-url"
   ```

The migration is now idempotent and can be safely executed multiple times.