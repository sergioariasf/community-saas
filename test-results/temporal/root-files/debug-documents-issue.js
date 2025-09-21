#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function debugDocumentsIssue() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE DOCUMENTOS');
  console.log('='.repeat(60));

  // Get user info
  const userEmail = 'sergioariasf@gmail.com';
  
  // 1. Check if user exists and get their ID
  console.log('\n📋 PASO 1: VERIFICANDO USUARIO');
  console.log('-'.repeat(40));
  
  const { data: user, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('❌ Error getting users:', userError);
    return;
  }
  
  const targetUser = user.users.find(u => u.email === userEmail);
  if (!targetUser) {
    console.error(`❌ Usuario ${userEmail} no encontrado`);
    return;
  }
  
  console.log(`✅ Usuario encontrado: ${targetUser.email}`);
  console.log(`   ID: ${targetUser.id}`);
  console.log(`   Creado: ${targetUser.created_at}`);
  console.log(`   Último login: ${targetUser.last_sign_in_at}`);

  // 2. Check user roles and organization
  console.log('\n📋 PASO 2: VERIFICANDO ROLES Y ORGANIZACIÓN');
  console.log('-'.repeat(40));
  
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      role,
      community_id,
      organization_id,
      organizations!inner(
        id,
        name,
        subscription_plan,
        is_active
      )
    `)
    .eq('user_id', targetUser.id);

  if (rolesError) {
    console.error('❌ Error fetching user roles:', rolesError);
    return;
  }

  console.log(`✅ Roles encontrados: ${userRoles.length}`);
  userRoles.forEach((role, index) => {
    console.log(`   ${index + 1}. Rol: ${role.role}`);
    console.log(`      Org ID: ${role.organization_id}`);
    console.log(`      Org Name: ${role.organizations?.name || 'N/A'}`);
    console.log(`      Community ID: ${role.community_id || 'Global'}`);
  });

  // 3. Test get_user_organization_id() function
  console.log('\n📋 PASO 3: PROBANDO FUNCIÓN get_user_organization_id()');
  console.log('-'.repeat(40));
  
  // First, check if the function works with direct SQL
  const { data: orgIdResult, error: orgIdError } = await supabase
    .rpc('get_user_organization_id');

  if (orgIdError) {
    console.error('❌ Error calling get_user_organization_id():', orgIdError);
  } else {
    console.log(`✅ get_user_organization_id() resultado: ${orgIdResult || 'NULL'}`);
  }

  // 4. Check documents table structure and content
  console.log('\n📋 PASO 4: VERIFICANDO TABLA DOCUMENTS');
  console.log('-'.repeat(40));
  
  const { data: documentsSchema, error: schemaError } = await supabase
    .from('documents')
    .select('*')
    .limit(0);

  if (schemaError) {
    console.error('❌ Error accediendo a tabla documents:', schemaError);
    console.log('   Posible causa: RLS bloqueando acceso o tabla no existe');
  } else {
    console.log('✅ Tabla documents accesible');
  }

  // Try with service role to bypass RLS
  console.log('\n📋 PASO 5: VERIFICANDO CONTENIDO DE DOCUMENTS (SERVICE ROLE)');
  console.log('-'.repeat(40));
  
  const { data: allDocuments, error: allDocsError } = await supabase
    .from('documents')
    .select('*');

  if (allDocsError) {
    console.error('❌ Error fetching all documents with service role:', allDocsError);
  } else {
    console.log(`✅ Total documentos en base de datos: ${allDocuments.length}`);
    
    if (allDocuments.length > 0) {
      console.log('\n   📄 Primeros documentos:');
      allDocuments.slice(0, 3).forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.filename}`);
        console.log(`      Org ID: ${doc.organization_id}`);
        console.log(`      Status: ${doc.status}`);
        console.log(`      Created: ${doc.created_at}`);
      });

      // Check organization distribution
      const orgGroups = allDocuments.reduce((acc, doc) => {
        acc[doc.organization_id] = (acc[doc.organization_id] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n   📊 Distribución por organización:');
      Object.entries(orgGroups).forEach(([orgId, count]) => {
        console.log(`      ${orgId}: ${count} documentos`);
      });
    }
  }

  // 6. Check RLS policies
  console.log('\n📋 PASO 6: VERIFICANDO POLÍTICAS RLS');
  console.log('-'.repeat(40));
  
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('schemaname, tablename, policyname, cmd, qual, with_check')
    .eq('tablename', 'documents');

  if (policiesError) {
    console.error('❌ Error fetching RLS policies:', policiesError);
  } else {
    console.log(`✅ Políticas RLS encontradas: ${policies.length}`);
    policies.forEach((policy, index) => {
      console.log(`   ${index + 1}. ${policy.policyname}`);
      console.log(`      Comando: ${policy.cmd}`);
      console.log(`      Condición: ${policy.qual}`);
    });
  }

  // 7. Test direct query with organization filter
  console.log('\n📋 PASO 7: PROBANDO CONSULTA CON FILTRO DE ORGANIZACIÓN');
  console.log('-'.repeat(40));
  
  if (userRoles.length > 0 && userRoles[0].organization_id) {
    const targetOrgId = userRoles[0].organization_id;
    const { data: orgDocuments, error: orgDocsError } = await supabase
      .from('documents')
      .select('*')
      .eq('organization_id', targetOrgId);

    if (orgDocsError) {
      console.error('❌ Error fetching documents for organization:', orgDocsError);
    } else {
      console.log(`✅ Documentos para org ${targetOrgId}: ${orgDocuments.length}`);
    }
  }

  // 8. Check storage bucket
  console.log('\n📋 PASO 8: VERIFICANDO BUCKET DE ALMACENAMIENTO');
  console.log('-'.repeat(40));
  
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error listing storage buckets:', bucketsError);
  } else {
    console.log(`✅ Buckets encontrados: ${buckets.length}`);
    buckets.forEach((bucket, index) => {
      console.log(`   ${index + 1}. ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
    });

    // Look for documents bucket
    const documentsBucket = buckets.find(b => b.name === 'documents');
    if (!documentsBucket) {
      console.log('❌ Bucket "documents" no encontrado');
    } else {
      console.log('✅ Bucket "documents" encontrado');
      
      // List files in documents bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('documents')
        .list('', { limit: 10 });
      
      if (filesError) {
        console.error('❌ Error listing files in documents bucket:', filesError);
      } else {
        console.log(`   📁 Archivos en bucket: ${files.length}`);
      }
    }
  }

  // 9. Recommendations
  console.log('\n📋 PASO 9: DIAGNÓSTICO Y RECOMENDACIONES');
  console.log('='.repeat(60));
  
  let hasIssues = false;
  
  if (userRoles.length === 0) {
    console.log('❌ PROBLEMA: Usuario no tiene roles asignados');
    console.log('   Solución: Asignar rol con organization_id al usuario');
    hasIssues = true;
  }
  
  if (userRoles.length > 0 && !userRoles[0].organization_id) {
    console.log('❌ PROBLEMA: Usuario tiene rol pero sin organization_id');
    console.log('   Solución: Actualizar user_roles con organization_id válido');
    hasIssues = true;
  }
  
  const documentsBucketExists = buckets && buckets.some(b => b.name === 'documents');
  if (!documentsBucketExists) {
    console.log('❌ PROBLEMA: Bucket "documents" no existe');
    console.log('   Solución: Crear bucket "documents" en Supabase Storage');
    hasIssues = true;
  }
  
  if (!hasIssues) {
    console.log('✅ Sistema parece estar configurado correctamente');
    console.log('   Posible causa del problema: Sin documentos subidos exitosamente');
  }
  
  console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
}

debugDocumentsIssue()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en script:', error);
    process.exit(1);
  });