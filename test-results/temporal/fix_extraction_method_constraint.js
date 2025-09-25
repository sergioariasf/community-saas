/**
 * ARCHIVO: fix_extraction_method_constraint.js
 * PROPÓSITO: Arreglar constraint extraction_method para permitir nuevos valores
 * ESTADO: fixing
 * DEPENDENCIAS: supabase
 * OUTPUTS: SQL para actualizar constraint
 * ACTUALIZADO: 2025-09-20
 */

require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeConstraint() {
  console.log('🔍 [CONSTRAINT] Analyzing extraction_method constraint...\n');
  
  try {
    // Query to get constraint details
    const { data: constraints, error } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            conname,
            pg_get_constraintdef(c.oid) as constraint_definition
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          JOIN pg_namespace n ON t.relnamespace = n.oid
          WHERE t.relname = 'documents' 
          AND n.nspname = 'public'
          AND conname LIKE '%extraction_method%';
        `
      });
      
    if (error) {
      console.log('❌ Error getting constraint:', error.message);
    } else {
      console.log('📋 Current constraint:', constraints);
    }
  } catch (err) {
    console.log('⚠️  Cannot query constraint, providing manual fix...');
  }

  console.log('\n🛠️  PROPOSED FIX - SQL to update extraction_method constraint:\n');
  
  const fixSQL = `
-- 1. Drop existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_extraction_method_check;

-- 2. Add new constraint with all required values
ALTER TABLE documents ADD CONSTRAINT documents_extraction_method_check 
CHECK (extraction_method IN (
  'pdf-parse',
  'pdf-parse-external', 
  'google-vision-ocr',
  'gemini-flash-ocr-ia',
  'pdf-parse + google-vision-ocr',
  'google-vision-ocr-only'
));

-- 3. Verify the constraint works
SELECT constraint_name, check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'documents_extraction_method_check';
`;

  console.log(fixSQL);
  console.log('\n📝 Copy the above SQL and run it in Supabase SQL Editor');
  console.log('🔧 This will allow all extraction methods used by the pipeline');

  // Test the current values being used
  console.log('\n🧪 Testing current extraction methods in use...');
  
  const { data: methods, error: methodsError } = await supabase
    .from('documents')
    .select('extraction_method')
    .not('extraction_method', 'is', null);
    
  if (methodsError) {
    console.log('❌ Error getting methods:', methodsError.message);
  } else {
    const uniqueMethods = [...new Set(methods.map(m => m.extraction_method))];
    console.log('📊 Currently used extraction methods:', uniqueMethods);
  }
}

analyzeConstraint().catch(console.error);