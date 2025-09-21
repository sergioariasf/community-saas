#!/usr/bin/env node

/**
 * ARCHIVO: clean-all-documents.js
 * PROPÓSITO: Limpiar completamente todos los documentos de BD y Storage
 * ESTADO: production
 * DEPENDENCIAS: @supabase/supabase-js, .env.local
 * OUTPUTS: Base de datos y storage completamente limpio
 * ACTUALIZADO: 2025-09-15
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanAllDocuments() {
  console.log('🧹 LIMPIEZA COMPLETA DE DOCUMENTOS');
  console.log('================================');
  
  try {
    // PASO 1: Autenticación
    console.log('\n🔐 Autenticando...');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'sergioariasf@gmail.com',
      password: 'Elpato_46'
    });
    
    if (authError) {
      console.log('❌ Error de autenticación:', authError.message);
      return;
    }
    console.log('✅ Autenticado correctamente');
    
    // PASO 2: Contar documentos existentes
    console.log('\n📊 Contando documentos actuales...');
    const { data: documents, error: countError } = await supabase
      .from('documents')
      .select('id, filename, file_path');
    
    if (countError) {
      console.log('❌ Error contando documentos:', countError.message);
      return;
    }
    
    console.log(`📋 Documentos encontrados: ${documents.length}`);
    documents.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc.filename} (${doc.id.substring(0, 8)}...)`);
    });
    
    if (documents.length === 0) {
      console.log('\n🎉 No hay documentos que limpiar');
      return;
    }
    
    // PASO 3: Eliminar archivos del Storage
    console.log('\n🗑️  PASO 3: Eliminando archivos del Storage...');
    let storageDeleted = 0;
    
    for (const doc of documents) {
      try {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.file_path]);
        
        if (storageError) {
          console.log(`   ⚠️  Error eliminando ${doc.file_path}:`, storageError.message);
        } else {
          storageDeleted++;
          console.log(`   ✅ Eliminado del storage: ${doc.file_path}`);
        }
      } catch (error) {
        console.log(`   ❌ Error con ${doc.file_path}:`, error.message);
      }
    }
    
    console.log(`📊 Archivos eliminados del storage: ${storageDeleted}/${documents.length}`);
    
    // PASO 4: Contar registros en tablas relacionadas
    console.log('\n📊 Contando registros en tablas relacionadas...');
    
    const tables = [
      'document_chunks',
      'document_metadata', 
      'document_classifications',
      'documents'
    ];
    
    const counts = {};
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact' });
      
      counts[table] = error ? 0 : (count || 0);
      console.log(`   - ${table}: ${counts[table]} registros`);
    }
    
    // PASO 5: Eliminar registros en cascada (empezando por documents, el resto debería eliminarse automáticamente)
    console.log('\n🗑️  PASO 5: Eliminando todos los documentos (CASCADE)...');
    
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos excepto ID imposible
    
    if (deleteError) {
      console.log('❌ Error eliminando documentos:', deleteError.message);
      return;
    }
    
    console.log('✅ Documentos eliminados de la base de datos');
    
    // PASO 6: Verificar limpieza
    console.log('\n✅ PASO 6: Verificando limpieza...');
    
    // Esperar un poco para el CASCADE
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const countsAfter = {};
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact' });
      
      countsAfter[table] = error ? 0 : (count || 0);
      const status = countsAfter[table] === 0 ? '✅' : '❌';
      console.log(`   - ${table}: ${countsAfter[table]} registros ${status}`);
    }
    
    // PASO 7: Verificar storage limpio
    console.log('\n📦 Verificando archivos restantes en Storage...');
    const { data: storageFiles, error: listError } = await supabase.storage
      .from('documents')
      .list('', { limit: 100 });
    
    if (listError) {
      console.log('⚠️  Error listando storage:', listError.message);
    } else {
      const remainingFiles = storageFiles?.length || 0;
      console.log(`📁 Archivos restantes en storage: ${remainingFiles}`);
      
      if (remainingFiles > 0) {
        console.log('📋 Archivos restantes:');
        storageFiles.forEach((file, i) => {
          console.log(`   ${i + 1}. ${file.name}`);
        });
      }
    }
    
    // RESUMEN FINAL
    console.log('\n🎯 RESUMEN DE LIMPIEZA');
    console.log('======================');
    
    const allTablesClean = Object.values(countsAfter).every(count => count === 0);
    const storageClean = (storageFiles?.length || 0) === 0;
    
    if (allTablesClean) {
      console.log('✅ Base de datos: COMPLETAMENTE LIMPIA');
    } else {
      console.log('❌ Base de datos: Algunos registros permanecen');
    }
    
    if (storageClean) {
      console.log('✅ Storage: COMPLETAMENTE LIMPIO');
    } else {
      console.log('⚠️  Storage: Algunos archivos permanecen');
    }
    
    if (allTablesClean && storageClean) {
      console.log('\n🎉 ¡LIMPIEZA COMPLETA EXITOSA!');
      console.log('   ✅ Base de datos vacía');
      console.log('   ✅ Storage vacío');
      console.log('   🚀 Listo para pruebas desde cero');
    } else {
      console.log('\n⚠️  Limpieza parcial - algunos elementos permanecen');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  } finally {
    await supabase.auth.signOut();
    console.log('\n👋 Sesión cerrada');
  }
}

cleanAllDocuments();