#!/usr/bin/env node

/**
 * ARCHIVO: test_corrected_flow.js
 * PROPÓSITO: Test con correcciones aplicadas - usar .first() y tipos corregidos
 * ESTADO: testing
 * DEPENDENCIAS: Pipeline real, constraint corregido
 * OUTPUTS: Test exitoso para crear páginas UI
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_EMAIL = 'sergioariasf@gmail.com';
const USER_PASSWORD = 'Elpato_46';

// Test con comunicado que sabemos que funciona
async function testComunicadoComplete() {
  console.log('🧪 TEST COMUNICADO COMPLETO - POST CORRECCIONES');
  console.log('='.repeat(55));
  
  const testOrganizationId = 'e3f4370b-2235-45ad-869a-737ee9fd95ab';
  const testFile = path.join(process.cwd(), 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf');
  
  try {
    // 1. Autenticación
    console.log('🔐 Autenticando...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    if (authError) throw authError;
    console.log(`✅ Autenticado: ${authData.user.email}`);
    
    // 2. Verificar archivo
    if (!fs.existsSync(testFile)) {
      throw new Error(`Archivo no encontrado: ${testFile}`);
    }
    
    console.log('\\n📖 Procesando PDF...');
    const buffer = fs.readFileSync(testFile);
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    const fileHash = crypto.createHash('md5').update(buffer + Date.now().toString()).digest('hex');
    
    console.log(`   📄 Páginas: ${pdfData.numpages}`);
    console.log(`   📄 Caracteres: ${pdfData.text.length}`);
    
    // 3. Crear documento en BD (con constraint corregido)
    console.log('\\n💾 Creando documento...');
    const documentData = {
      organization_id: testOrganizationId,
      filename: 'test-comunicado.pdf',
      file_path: 'test-uploads/comunicado/test-comunicado.pdf',
      file_size: buffer.length,
      file_hash: fileHash,
      document_type: 'comunicado', // Ahora debería funcionar
      extracted_text: pdfData.text,
      text_length: pdfData.text.length,
      page_count: pdfData.numpages,
      processing_level: 3,
      extraction_status: 'completed',
      classification_status: 'completed',
      metadata_status: 'pending'
    };
    
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();
    
    if (docError) throw docError;
    
    console.log(`   ✅ Documento creado: ${document.id}`);
    
    // 4. Obtener agente (usando .first() para manejar duplicados)
    console.log('\\n🤖 Obteniendo agente...');
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', 'comunicado_extractor_v1')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (agentError || !agent) {
      throw new Error(`Agente no encontrado: ${agentError?.message}`);
    }
    
    console.log(`   ✅ Agente: ${agent.name}`);
    console.log(`   📝 Propósito: ${agent.purpose}`);
    
    // 5. Ejecutar agente
    console.log('\\n🔄 Ejecutando agente...');
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const fullPrompt = `${agent.prompt_template}\\n\\nTexto del documento:\\n${pdfData.text}`;
    console.log(`   📊 Prompt: ${fullPrompt.length} caracteres`);
    
    const startTime = Date.now();
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const agentResponse = response.text();
    const processingTime = Date.now() - startTime;
    
    console.log(`   ⏱️ Tiempo: ${processingTime}ms`);
    console.log(`   📄 Respuesta: ${agentResponse.length} caracteres`);
    
    // 6. Parsear respuesta
    console.log('\\n🔍 Parseando respuesta...');
    let extractedData;
    let parseSuccess = false;
    
    try {
      // Estrategia 1: JSON con backticks
      const jsonWithBackticks = agentResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonWithBackticks) {
        extractedData = JSON.parse(jsonWithBackticks[1]);
        parseSuccess = true;
        console.log(`   ✅ JSON parseado exitosamente (con backticks)`);
      } else {
        // Estrategia 2: JSON sin backticks
        const jsonWithoutBackticks = agentResponse.match(/\{[\s\S]*\}/);
        if (jsonWithoutBackticks) {
          extractedData = JSON.parse(jsonWithoutBackticks[0]);
          parseSuccess = true;
          console.log(`   ✅ JSON parseado exitosamente (sin backticks)`);
        } else {
          throw new Error('No se encontró JSON válido en la respuesta');
        }
      }
    } catch (parseError) {
      console.log(`   ⚠️ Error parseando: ${parseError.message}`);
      // En caso de error, extraer campos básicos manualmente
      extractedData = {
        fecha: extractPattern(agentResponse, /fecha[\"':\\s]*([^\\n,}]+)/i),
        comunidad: extractPattern(agentResponse, /comunidad[\"':\\s]*([^\\n,}]+)/i),
        remitente: extractPattern(agentResponse, /remitente[\"':\\s]*([^\\n,}]+)/i),
        resumen: extractPattern(agentResponse, /resumen[\"':\\s]*([^\\n,}]+)/i),
        category: extractPattern(agentResponse, /category[\"':\\s]*([^\\n,}]+)/i)
      };
      parseSuccess = false;
      console.log(`   🔧 Usando extracción manual de campos básicos`);
    }
    
    function extractPattern(text, pattern) {
      const match = text.match(pattern);
      return match ? match[1].replace(/[\"',]/g, '').trim() : null;
    }
    
    console.log(`   📊 Campos extraídos: ${Object.keys(extractedData).length}`);
    
    // Mostrar datos extraídos
    console.log('\\n   📋 DATOS EXTRAÍDOS:');
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    for (const [key, value] of Object.entries(extractedData).slice(0, 8)) {
      const displayValue = value ? (value.toString().length > 45 ? value.toString().substring(0, 45) + '...' : value.toString()) : 'null';
      console.log(`   │ ${key.padEnd(20)}: ${displayValue.padEnd(45)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    // 7. Guardar en tabla
    console.log('\\n💾 Guardando en extracted_communications...');
    const insertData = {
      document_id: document.id,
      organization_id: testOrganizationId,
      created_at: new Date().toISOString(),
      ...extractedData
    };
    
    // Limpiar campos nulos
    const cleanData = {};
    for (const [key, value] of Object.entries(insertData)) {
      if (value !== null && value !== undefined) {
        cleanData[key] = value;
      }
    }
    
    const { data: savedData, error: saveError } = await supabase
      .from('extracted_communications')
      .insert(cleanData)
      .select()
      .single();
    
    if (saveError) {
      console.log(`   ❌ Error guardando: ${saveError.message}`);
      throw saveError;
    }
    
    console.log(`   ✅ Guardado exitoso: ${savedData.id}`);
    
    // 8. Actualizar documento
    await supabase
      .from('documents')
      .update({ metadata_status: 'completed' })
      .eq('id', document.id);
    
    // RESUMEN FINAL
    console.log('\\n🎉 TEST COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(55));
    console.log(`📊 Document ID: ${document.id}`);
    console.log(`📊 Extracted ID: ${savedData.id}`);
    console.log(`⏱️ Tiempo total: ${processingTime}ms`);
    console.log(`🔄 Parse JSON: ${parseSuccess ? 'ÉXITO' : 'FALLO'}`);
    console.log(`📈 Campos: ${Object.keys(extractedData).length}`);
    
    console.log('\\n🚀 SIGUIENTE PASO:');
    console.log(`   Crear página UI: /documents/test-comunicado`);
    console.log(`   Con Document ID: ${document.id}`);
    
    return {
      success: true,
      documentId: document.id,
      extractedId: savedData.id,
      extractedData: extractedData
    };
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar test
if (require.main === module) {
  testComunicadoComplete().catch(console.error);
}

module.exports = { testComunicadoComplete };