#!/usr/bin/env node

/**
 * ARCHIVO: reprocess-document.js
 * PROPÓSITO: Reprocesar documento específico usando el pipeline progresivo para debuggear errores
 * ESTADO: development
 * DEPENDENCIAS: @supabase/supabase-js, ProgressivePipeline, .env.local
 * OUTPUTS: Reprocesamiento completo de documento con logs detallados
 * ACTUALIZADO: 2025-09-15
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function reprocessDocument() {
  console.log('🔄 Reprocesando documento acta_prueba_v2.pdf...\n');
  
  // 1. Autenticarse
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
  
  // 2. Buscar el documento
  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('filename', 'acta_prueba_v2.pdf')
    .single();
  
  if (error || !doc) {
    console.log('❌ Documento no encontrado:', error?.message);
    return;
  }
  
  console.log('📄 Documento encontrado:', doc.id);
  console.log('├─ Filename:', doc.filename);
  console.log('├─ Processing Level:', doc.processing_level);
  console.log('├─ Current Status:', doc.extraction_status);
  console.log('└─ Organization ID:', doc.organization_id);
  
  // 3. Resetear estados para reprocesar
  console.log('\n🔄 Reseteando estados del documento...');
  const { error: resetError } = await supabase
    .from('documents')
    .update({
      extraction_status: 'pending',
      classification_status: null,
      metadata_status: null,
      chunking_status: null,
      extracted_text: null,
      text_length: null,
      chunks_count: null
    })
    .eq('id', doc.id);
  
  if (resetError) {
    console.log('❌ Error reseteando:', resetError.message);
    return;
  }
  console.log('✅ Estados reseteados');
  
  // 4. Importar y usar el ProgressivePipeline
  console.log('\n🚀 Ejecutando pipeline progresivo...');
  
  try {
    // Importar dinámicamente (para manejar ES modules en Node.js)
    const { ProgressivePipeline } = await import('../core/progressivePipeline.js');
    
    const pipeline = new ProgressivePipeline();
    console.log('✅ Pipeline inicializado');
    
    // Ejecutar procesamiento hasta nivel 4
    console.log(`🎯 Procesando hasta nivel ${doc.processing_level}...`);
    const result = await pipeline.processDocument(doc.id, doc.processing_level, doc.organization_id);
    
    console.log('\n📊 RESULTADO DEL PIPELINE:');
    console.log('├─ Éxito:', result.success);
    console.log('├─ Error:', result.error || 'Ninguno');
    console.log('├─ Pasos completados:', result.completed_steps.length);
    console.log('├─ Pasos fallidos:', result.failed_steps.length);
    console.log('├─ Tiempo total:', result.total_processing_time_ms, 'ms');
    console.log('├─ Tokens usados:', result.total_tokens_used);
    console.log('└─ Costo estimado:', result.estimated_total_cost_usd, 'USD');
    
    console.log('\n📋 PASOS COMPLETADOS:');
    result.completed_steps.forEach((step, i) => {
      console.log(`${i + 1}. ${step.step} - ${step.processing_time_ms}ms`);
    });
    
    if (result.failed_steps.length > 0) {
      console.log('\n❌ PASOS FALLIDOS:');
      result.failed_steps.forEach((step, i) => {
        console.log(`${i + 1}. ${step.step} - Error: ${step.error}`);
      });
    }
    
  } catch (importError) {
    console.log('❌ Error importando pipeline:', importError.message);
    console.log('Detalles:', importError);
  }
}

reprocessDocument()
  .then(() => {
    console.log('\n✅ Reprocesamiento completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error en reprocesamiento:', error);
    process.exit(1);
  });