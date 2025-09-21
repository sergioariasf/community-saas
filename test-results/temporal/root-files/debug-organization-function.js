#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function debugOrganizationFunction() {
  console.log('🔍 DEPURANDO FUNCIÓN get_user_organization_id()');
  console.log('='.repeat(50));

  const userEmail = 'sergioariasf@gmail.com';
  const userId = '12e1976b-4bd0-4062-833c-9d1cf78c49eb';

  // 1. Check user_roles table directly
  console.log('\n📋 VERIFICANDO user_roles DIRECTAMENTE');
  console.log('-'.repeat(40));
  
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);

  if (rolesError) {
    console.error('❌ Error fetching user roles:', rolesError);
    return;
  }

  console.log('✅ Roles encontrados:', JSON.stringify(userRoles, null, 2));

  // 2. Simulate the function logic
  console.log('\n📋 SIMULANDO LÓGICA DE LA FUNCIÓN');
  console.log('-'.repeat(40));

  if (userRoles && userRoles.length > 0) {
    const distinctOrgIds = [...new Set(userRoles.map(r => r.organization_id))];
    console.log('🔍 Organization IDs únicos:', distinctOrgIds);
    
    const nonNullOrgIds = distinctOrgIds.filter(id => id !== null);
    console.log('🔍 Organization IDs no-nulos:', nonNullOrgIds);

    if (nonNullOrgIds.length > 0) {
      console.log('✅ La función debería retornar:', nonNullOrgIds[0]);
    } else {
      console.log('❌ Todos los organization_id son NULL');
    }
  }

  // 3. Test the function with a user session
  console.log('\n📋 PROBANDO CON SESIÓN DE USUARIO');
  console.log('-'.repeat(40));

  // Create a client session for the user
  const { data: authData, error: signInError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: userEmail,
  });

  if (signInError) {
    console.error('❌ Error generating auth link:', signInError);
    return;
  }

  console.log('✅ Link de autenticación generado');

  // Try to set the session and test the function
  // (This is complex because we need to simulate user context)

  // 4. Check if function exists
  console.log('\n📋 VERIFICANDO SI LA FUNCIÓN EXISTE');
  console.log('-'.repeat(40));

  const { data: functionExists, error: funcError } = await supabase
    .from('pg_proc')
    .select('proname')
    .eq('proname', 'get_user_organization_id');

  if (funcError) {
    console.log('⚠️ No se puede consultar pg_proc (normal en Supabase)');
  } else {
    console.log(`✅ Función existe: ${functionExists.length > 0}`);
  }

  // 5. Alternative: Manual SQL execution
  console.log('\n📋 EJECUTANDO SQL MANUAL');
  console.log('-'.repeat(40));

  const { data: manualResult, error: manualError } = await supabase
    .from('user_roles')
    .select('organization_id')
    .eq('user_id', userId)
    .limit(1);

  if (manualError) {
    console.error('❌ Error en consulta manual:', manualError);
  } else {
    console.log('✅ Resultado manual:', manualResult);
    if (manualResult && manualResult.length > 0) {
      console.log('   Organization ID encontrado:', manualResult[0].organization_id);
    }
  }

  // 6. Check organizations table
  console.log('\n📋 VERIFICANDO TABLA ORGANIZATIONS');
  console.log('-'.repeat(40));

  const { data: organizations, error: orgsError } = await supabase
    .from('organizations')
    .select('*');

  if (orgsError) {
    console.error('❌ Error fetching organizations:', orgsError);
  } else {
    console.log(`✅ Organizations encontradas: ${organizations.length}`);
    organizations.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.name} (${org.id})`);
      console.log(`      Owner: ${org.owner_id}`);
      console.log(`      Active: ${org.is_active}`);
    });
  }

  console.log('\n🏁 DEPURACIÓN COMPLETADA');
}

debugOrganizationFunction()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en script:', error);
    process.exit(1);
  });