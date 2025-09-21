#!/usr/bin/env node

/**
 * ARCHIVO: check-document-status.js
 * PROPÓSITO: Verificar estado completo del pipeline progresivo para un documento específico
 * ESTADO: production
 * DEPENDENCIAS: @supabase/supabase-js, .env.local
 * OUTPUTS: Estado detallado de los 4 niveles del pipeline (extracción, clasificación, metadata, chunking)
 * ACTUALIZADO: 2025-09-15
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDocument() {
  console.log('🔍 Verificando documentos en la base de datos...\n');
  
  // 0. Primero autenticarse
  console.log('🔐 Autenticando...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'sergioariasf@gmail.com',
    password: 'Elpato_46'
  });
  
  if (authError) {
    console.log('❌ Error de autenticación:', authError.message);
    return;
  }
  console.log('✅ Autenticado:', authData.user.email);
  
  // 1. Listar todos los documentos recientes
  const { data: allDocs, error: listError } = await supabase
    .from('documents')
    .select('id, filename, processing_level, extraction_status, classification_status, metadata_status, chunking_status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (listError) {
    console.log('❌ Error listando documentos:', listError.message);
    return;
  }
  
  console.log(`\n📋 DOCUMENTOS RECIENTES (${allDocs.length} encontrados):`);
  if (allDocs.length === 0) {
    console.log('   └─ No hay documentos en la base de datos');
    return;
  }
  
  allDocs.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.filename} (${doc.id.substring(0, 8)}...)`);
    console.log(`   └─ Level ${doc.processing_level}/4 | Extract: ${doc.extraction_status} | Class: ${doc.classification_status} | Meta: ${doc.metadata_status} | Chunk: ${doc.chunking_status}`);
  });
  
  // 2. Buscar documentos que contengan "acta_prueba"
  const { data: docs, error } = await supabase
    .from('documents')
    .select('*')
    .ilike('filename', '%acta_prueba%')
    .order('created_at', { ascending: false });
  
  if (error || !docs || docs.length === 0) {
    console.log('\n❌ No se encontraron documentos con "acta_prueba":', error?.message);
    return;
  }
  
  console.log(`\n🔍 Encontrados ${docs.length} documentos con "acta_prueba":`);
  
  // Analizar el más reciente
  const doc = docs[0];
  console.log(`\n📄 ANALIZANDO: ${doc.filename}`);
  
  console.log('📄 DOCUMENTO PRINCIPAL:');
  console.log('├─ ID:', doc.id);
  console.log('├─ Filename:', doc.filename);
  console.log('├─ Processing Level:', doc.processing_level, '/4');
  console.log('├─ Extraction Status:', doc.extraction_status);
  console.log('├─ Classification Status:', doc.classification_status);
  console.log('├─ Metadata Status:', doc.metadata_status);
  console.log('├─ Chunking Status:', doc.chunking_status);
  console.log('├─ Chunks Count:', doc.chunks_count || 0);
  console.log('├─ Text Length:', doc.text_length || 0, 'chars');
  console.log('├─ Document Type:', doc.document_type);
  console.log('└─ Legacy Status:', doc.legacy_status);
  
  // 2. Verificar clasificación
  const { data: classification, count: classCount } = await supabase
    .from('document_classifications')
    .select('*', { count: 'exact' })
    .eq('document_id', doc.id);
  
  console.log('\n🏷️ CLASIFICACIÓN:');
  console.log('├─ Registros:', classCount || 0);
  if (classification && classification[0]) {
    console.log('├─ Tipo:', classification[0].document_type);
    console.log('├─ Confianza:', classification[0].confidence);
    console.log('└─ Método:', classification[0].classification_method);
  }
  
  // 3. Verificar metadata
  const { data: metadata, count: metaCount } = await supabase
    .from('document_metadata')
    .select('*', { count: 'exact' })
    .eq('document_id', doc.id);
  
  console.log('\n📋 METADATA:');
  console.log('├─ Registros:', metaCount || 0);
  if (metadata && metadata[0]) {
    console.log('├─ Confianza:', metadata[0].confidence);
    console.log('├─ Método:', metadata[0].extraction_method);
    console.log('└─ Fecha Doc:', metadata[0].document_date);
  }
  
  // 4. Verificar chunks
  const { data: chunks, count: chunkCount } = await supabase
    .from('document_chunks')
    .select('*', { count: 'exact' })
    .eq('document_id', doc.id);
  
  console.log('\n🔧 CHUNKS:');
  console.log('├─ Total Chunks:', chunkCount || 0);
  if (chunks && chunks.length > 0) {
    console.log('├─ Primer chunk:', chunks[0].content?.substring(0, 50) + '...');
    console.log('└─ Último chunk:', chunks[chunks.length-1].content?.substring(0, 50) + '...');
  }
  
  // 5. RESUMEN FINAL
  console.log('\n🎯 RESUMEN DEL PIPELINE:');
  const nivel1 = doc.extraction_status === 'completed' ? '✅' : '❌';
  const nivel2 = doc.classification_status === 'completed' ? '✅' : '❌';
  const nivel3 = doc.metadata_status === 'completed' ? '✅' : '❌';
  const nivel4 = doc.chunking_status === 'completed' ? '✅' : '❌';
  
  console.log('├─ Nivel 1 (Extracción):', nivel1, doc.extraction_status);
  console.log('├─ Nivel 2 (Clasificación):', nivel2, doc.classification_status);
  console.log('├─ Nivel 3 (Metadata):', nivel3, doc.metadata_status);
  console.log('└─ Nivel 4 (Chunking):', nivel4, doc.chunking_status);
  
  const allCompleted = [doc.extraction_status, doc.classification_status, doc.metadata_status, doc.chunking_status]
    .every(status => status === 'completed');
  
  if (allCompleted) {
    console.log('\n🎉 ¡PIPELINE NIVEL 4 COMPLETAMENTE PROCESADO!');
  } else {
    console.log('\n⚠️ Pipeline incompleto - algunos niveles pendientes');
  }
}

checkDocument().catch(console.error);