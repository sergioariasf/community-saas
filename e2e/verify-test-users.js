#!/usr/bin/env node

/**
 * ARCHIVO: verify-test-users.js
 * PROPÓSITO: Verificar que los usuarios de prueba existen y tienen acceso correcto
 * ESTADO: production
 * DEPENDENCIAS: @supabase/supabase-js, .env.local
 * OUTPUTS: Verificación de usuarios y sus roles/comunidades
 * ACTUALIZADO: 2025-09-14
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TEST_USERS = [
  {
    email: 'sergioariasf@gmail.com',
    password: 'Elpato_46',
    expectedRole: 'admin',
    description: 'Admin Global'
  },
  {
    email: 'manager@test.com',
    password: 'TestManager123!',
    expectedRole: 'manager', 
    description: 'Manager Multi-Comunidad'
  },
  {
    email: 'resident@test.com',
    password: 'TestResident123!',
    expectedRole: 'resident',
    description: 'Resident Single-Comunidad'
  }
];

async function verifyTestUsers() {
  console.log('🔍 Verificando usuarios de prueba para testing RLS...\n');
  
  const results = [];
  
  for (const user of TEST_USERS) {
    console.log(`👤 Verificando: ${user.description} (${user.email})`);
    console.log('-'.repeat(60));
    
    try {
      // Intentar login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (authError) {
        console.log(`❌ Login falló: ${authError.message}`);
        results.push({ ...user, loginSuccess: false, error: authError.message });
        continue;
      }
      
      console.log(`✅ Login exitoso: ${authData.user.email}`);
      
      // Verificar roles y comunidades
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role,
          communities (
            id,
            name
          )
        `)
        .eq('user_id', authData.user.id);
      
      if (rolesError) {
        console.log(`⚠️ Error obteniendo roles: ${rolesError.message}`);
      } else {
        console.log(`📊 Roles encontrados: ${roles.length}`);
        roles.forEach(role => {
          console.log(`   - ${role.role} en ${role.communities?.name || 'N/A'}`);
        });
      }
      
      // Verificar acceso a documentos
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('id, filename')
        .limit(5);
      
      if (docsError) {
        console.log(`⚠️ Error accediendo documentos: ${docsError.message}`);
      } else {
        console.log(`📄 Documentos accesibles: ${documents.length}`);
        documents.forEach((doc, idx) => {
          console.log(`   ${idx + 1}. ${doc.filename || 'Sin nombre'} (${doc.id})`);
        });
      }
      
      results.push({
        ...user,
        loginSuccess: true,
        userId: authData.user.id,
        rolesCount: roles?.length || 0,
        documentsAccess: documents?.length || 0
      });
      
      // Cerrar sesión
      await supabase.auth.signOut();
      
    } catch (error) {
      console.log(`❌ Error inesperado: ${error.message}`);
      results.push({ ...user, loginSuccess: false, error: error.message });
    }
    
    console.log('\n');
  }
  
  // Resumen final
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.loginSuccess).length;
  console.log(`✅ Usuarios con login exitoso: ${successful}/${results.length}`);
  
  console.log('\n📋 Detalle por usuario:');
  results.forEach(result => {
    const status = result.loginSuccess ? '✅' : '❌';
    console.log(`${status} ${result.description}:`);
    console.log(`   Email: ${result.email}`);
    if (result.loginSuccess) {
      console.log(`   Roles: ${result.rolesCount}`);
      console.log(`   Documentos: ${result.documentsAccess}`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  });
  
  if (successful === results.length) {
    console.log('🎉 TODOS LOS USUARIOS DE PRUEBA ESTÁN LISTOS PARA TESTING');
    return 0;
  } else {
    console.log('⚠️ ALGUNOS USUARIOS NECESITAN CONFIGURACIÓN ADICIONAL');
    return 1;
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  verifyTestUsers()
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verifyTestUsers };