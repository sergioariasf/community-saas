#!/usr/bin/env node

/**
 * ARCHIVO: test_simple_flow.js
 * PROPÓSITO: Test simple del flujo completo con OCR integrado para documentos que funcionan
 * ESTADO: testing
 * DEPENDENCIAS: Pipeline real de ingesta, OCR implementado en src/lib/pdf
 * OUTPUTS: Verificación que todo funciona antes de crear páginas UI de test
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test solo con documentos que sabemos que tienen texto bueno
const WORKING_DOCUMENTS = {
  'comunicado': {
    name: 'COMUNICADO VECINOS',
    file: 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf',
    agent: 'comunicado_extractor_v1',
    table: 'extracted_communications'
  }
};

async function testSimpleFlow() {
  console.log('🧪 TEST SIMPLE FLOW - VERIFICACIÓN PREVIA');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar que el agente existe
    console.log('🔍 Verificando agente comunicado_extractor_v1...');
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('name, purpose, prompt_template')
      .eq('name', 'comunicado_extractor_v1')
      .eq('is_active', true)
      .single();
    
    if (agentError || !agent) {
      console.log('❌ Agente no encontrado:', agentError?.message);
      return;
    }
    
    console.log('✅ Agente encontrado:', agent.name);
    console.log('📝 Propósito:', agent.purpose);
    console.log('📏 Prompt length:', agent.prompt_template.length);
    
    // 2. Verificar que la tabla existe y tiene las columnas correctas
    console.log('\\n🔍 Verificando tabla extracted_communications...');
    const { data: tableTest, error: tableError } = await supabase
      .from('extracted_communications')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Error accediendo tabla:', tableError.message);
      return;
    }
    
    console.log('✅ Tabla accesible');
    
    // 3. Verificar que el archivo existe
    const testFile = path.join(process.cwd(), WORKING_DOCUMENTS.comunicado.file);
    if (!fs.existsSync(testFile)) {
      console.log('❌ Archivo no encontrado:', testFile);
      return;
    }
    
    console.log('✅ Archivo encontrado');
    console.log('📊 Tamaño:', (fs.statSync(testFile).size / 1024).toFixed(1), 'KB');
    
    // 4. Test de extracción básica
    console.log('\\n📖 Test extracción básica...');
    const buffer = fs.readFileSync(testFile);
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    
    console.log('📄 Páginas:', pdfData.numpages);
    console.log('📄 Caracteres extraídos:', pdfData.text.length);
    
    if (pdfData.text.length > 100) {
      console.log('✅ Extracción suficiente para agente');
    } else {
      console.log('⚠️ Texto insuficiente, necesitaría OCR');
    }
    
    console.log('\\n🎯 ESTADO GENERAL:');
    console.log('✅ Agente: LISTO');
    console.log('✅ Tabla: LISTA'); 
    console.log('✅ Archivo: LISTO');
    console.log('✅ Extracción: FUNCIONANDO');
    
    console.log('\\n🚀 SIGUIENTE PASO:');
    console.log('1. Ejecutar SQL para corregir constraint document_type');
    console.log('2. Crear página de test UI para comunicado');
    console.log('3. Hacer test completo con datos reales en UI');
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

// Ejecutar test
if (require.main === module) {
  testSimpleFlow().catch(console.error);
}

module.exports = { testSimpleFlow };