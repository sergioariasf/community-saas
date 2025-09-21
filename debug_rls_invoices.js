/**
 * ARCHIVO: debug_rls_invoices.js
 * PROPÓSITO: Verificar y arreglar RLS policies para extracted_invoices
 * ESTADO: debugging
 * DEPENDENCIAS: supabase
 * OUTPUTS: Análisis de políticas RLS y propuesta de fix
 * ACTUALIZADO: 2025-09-20
 */

require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeRLSPolicies() {
  console.log('🔍 [RLS DEBUG] Analyzing extracted_invoices RLS policies...\n');
  
  // 1. Verificar si RLS está habilitado
  try {
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'extracted_invoices' });
    
    if (tableError) {
      console.log('⚠️  Cannot get table info, checking manually...');
    } else {
      console.log('📊 Table info:', tableInfo);
    }
  } catch (err) {
    console.log('⚠️  RPC not available, continuing...');
  }

  // 2. Verificar políticas existentes via query directa
  try {
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'extracted_invoices');
      
    if (policiesError) {
      console.log('❌ Error getting policies:', policiesError.message);
    } else {
      console.log('📋 Current RLS policies for extracted_invoices:');
      if (policies.length === 0) {
        console.log('   ❌ NO POLICIES FOUND - This explains the RLS error!');
      } else {
        policies.forEach(policy => {
          console.log(`   - ${policy.policyname} (${policy.cmd}): ${policy.qual || 'No condition'}`);
        });
      }
    }
  } catch (err) {
    console.log('⚠️  Cannot access pg_policies, using alternative method...');
  }

  // 3. Test directo de inserción
  console.log('\n🧪 Testing direct insertion with Service Role...');
  
  const testData = {
    document_id: '687e60c6-34ab-4b26-93f4-66bfaa630805',
    organization_id: 'e3f4370b-2235-45ad-869a-737ee9fd95ab',
    provider_name: 'TEST PROVIDER',
    client_name: 'TEST CLIENT', 
    amount: 100.0,
    currency: 'EUR'
  };
  
  const { data: insertResult, error: insertError } = await supabase
    .from('extracted_invoices')
    .insert(testData)
    .select();
  
  if (insertError) {
    console.log('❌ Test insertion failed:', insertError.message);
    console.log('   Code:', insertError.code);
    console.log('   Details:', insertError.details);
    console.log('   Hint:', insertError.hint);
  } else {
    console.log('✅ Test insertion successful:', insertResult);
    
    // Limpiar el test data
    await supabase
      .from('extracted_invoices')
      .delete()
      .eq('id', insertResult[0].id);
    console.log('🗑️  Test data cleaned up');
  }

  // 4. Verificar organización y documento
  console.log('\n📊 Verifying document and organization...');
  
  const { data: docData, error: docError } = await supabase
    .from('documents')
    .select('id, organization_id, community_id')
    .eq('id', '687e60c6-34ab-4b26-93f4-66bfaa630805')
    .single();
  
  if (docError) {
    console.log('❌ Document not found:', docError.message);
  } else {
    console.log('✅ Document found:', docData);
  }
}

async function generateRLSFix() {
  console.log('\n🛠️  PROPOSED RLS FIX for extracted_invoices:\n');
  
  const rlsSQL = `
-- 1. Enable RLS if not enabled
ALTER TABLE extracted_invoices ENABLE ROW LEVEL SECURITY;

-- 2. Policy for authenticated users to INSERT their own organization's data
CREATE POLICY "Users can insert invoices for their organization" ON extracted_invoices
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- 3. Policy for authenticated users to SELECT their own organization's data  
CREATE POLICY "Users can view invoices for their organization" ON extracted_invoices
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- 4. Policy for authenticated users to UPDATE their own organization's data
CREATE POLICY "Users can update invoices for their organization" ON extracted_invoices
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- 5. Policy for authenticated users to DELETE their own organization's data
CREATE POLICY "Users can delete invoices for their organization" ON extracted_invoices
FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- 6. Special policy for service role (for pipeline processing)
CREATE POLICY "Service role can manage all invoices" ON extracted_invoices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
`;

  console.log(rlsSQL);
  console.log('\n📝 Copy the above SQL and run it in Supabase SQL Editor');
  console.log('🔧 This will allow both authenticated users and service role to work with extracted_invoices');
}

analyzeRLSPolicies()
  .then(() => generateRLSFix())
  .catch(console.error);