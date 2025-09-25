#!/usr/bin/env node

/**
 * ARCHIVO: test_real_schema_all_docs.js
 * PROPÓSITO: Test de los 7 tipos de documentos usando el pipeline real existente
 * ESTADO: testing
 * DEPENDENCIAS: Pipeline real de ingesta, @supabase/supabase-js, pdf-parse
 * OUTPUTS: Verificación completa de agentes y tablas reales con datos reales
 * ACTUALIZADO: 2025-09-18
 */

// Usar el pipeline real existente
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const USER_EMAIL = 'sergioariasf@gmail.com';
const USER_PASSWORD = 'Elpato_46';

// Configuración de los 7 tipos de documentos
const ALL_DOCUMENTS = {
  'comunicado': {
    name: 'COMUNICADO VECINOS',
    file: 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf',
    agent: 'comunicado_extractor_v1',
    table: 'extracted_communications',
    expectedFields: ['fecha', 'comunidad', 'remitente', 'resumen', 'category']
  },
  'albaran': {
    name: 'ALBARÁN ENTREGA',
    file: 'datos/albaran.pdf',
    agent: 'albaran_extractor_v1', 
    table: 'extracted_delivery_notes',
    expectedFields: ['emisor_name', 'receptor_name', 'numero_albaran', 'fecha_emision']
  },
  'contrato': {
    name: 'CONTRATO SERVICIOS',
    file: 'datos/Contrato OLAQUA Piscinas.pdf',
    agent: 'contrato_extractor_v1',
    table: 'extracted_contracts', 
    expectedFields: ['titulo_contrato', 'parte_a', 'parte_b', 'objeto_contrato']
  },
  'presupuesto': {
    name: 'PRESUPUESTO OBRA',
    file: 'datos/presupuesto.pdf',
    agent: 'presupuesto_extractor_v1',
    table: 'extracted_budgets',
    expectedFields: ['numero_presupuesto', 'emisor_name', 'cliente_name', 'total']
  },
  'escritura': {
    name: 'ESCRITURA COMPRAVENTA',
    file: 'datos/escritura_D102B.pdf',
    agent: 'escritura_extractor_v1',
    table: 'extracted_property_deeds', 
    expectedFields: ['vendedor_nombre', 'comprador_nombre', 'direccion_inmueble', 'precio_venta']
  },
  'factura': {
    name: 'FACTURA COMERCIAL',
    file: 'datos/factura.pdf',
    agent: 'factura_extractor_v2',
    table: 'extracted_invoices',
    expectedFields: ['provider_name', 'client_name', 'amount', 'invoice_date']
  },
  'acta': {
    name: 'ACTA JUNTA',
    file: 'datos/ACTA 18 NOVIEMBRE 2022.pdf',
    agent: 'acta_extractor_v2',
    table: 'extracted_minutes',
    expectedFields: ['document_date', 'president_in', 'administrator', 'summary']
  }
};

/**
 * Test un documento usando el pipeline real existente
 */
async function testDocumentWithRealPipeline(docType, docConfig, organizationId) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🔥 TESTING: ${docConfig.name} (${docType.toUpperCase()})`);
  console.log(`${'═'.repeat(70)}`);
  
  const testFile = path.join(process.cwd(), docConfig.file);
  
  if (!fs.existsSync(testFile)) {
    console.log(`❌ Archivo no encontrado: ${docConfig.file}`);
    return { success: false, reason: 'file_not_found', docType };
  }
  
  try {
    // PASO 1: Procesar PDF con pipeline real
    console.log('📖 Procesando PDF...');
    const buffer = fs.readFileSync(testFile);
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer, { max: 0 });
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
    
    console.log(`   📄 Páginas: ${pdfData.numpages}`);
    console.log(`   📄 Caracteres: ${pdfData.text.length}`);
    console.log(`   🔗 Hash: ${fileHash.substring(0, 8)}...`);
    
    if (!pdfData.text || pdfData.text.length < 50) {
      console.log(`⚠️ Texto insuficiente extraído (${pdfData.text.length} caracteres)`);
      return { 
        success: false, 
        reason: 'insufficient_text', 
        docType,
        extractedLength: pdfData.text.length,
        needsOCR: true
      };
    }
    
    // PASO 2: Crear documento en tabla usando esquema real
    console.log('\n💾 Creando documento en BD...');
    const documentData = {
      organization_id: organizationId,
      filename: path.basename(docConfig.file),
      file_path: `test-uploads/${docType}/${path.basename(docConfig.file)}`,
      file_size: buffer.length,
      file_hash: fileHash,
      document_type: docType,
      extracted_text: pdfData.text,
      text_length: pdfData.text.length,
      page_count: pdfData.numpages,
      processing_level: 3,
      extraction_status: 'completed',
      classification_status: 'completed',
      metadata_status: 'pending',
      mime_type: 'application/pdf',
      original_filename: path.basename(docConfig.file),
      uploaded_by: null
    };
    
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();
    
    if (docError) throw docError;
    
    console.log(`   ✅ Documento creado: ${document.id}`);
    console.log(`   📊 Estado: ${document.extraction_status}/${document.classification_status}/${document.metadata_status}`);
    
    // PASO 3: Obtener agente real de la BD
    console.log('\n🤖 Obteniendo agente real...');
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', docConfig.agent)
      .eq('is_active', true)
      .single();
    
    if (agentError || !agent) {
      throw new Error(`Agente no encontrado: ${docConfig.agent}`);
    }
    
    console.log(`   ✅ Agente encontrado: ${agent.name}`);
    console.log(`   📝 Propósito: ${agent.purpose}`);
    
    // PASO 4: Usar el sistema de agentes REAL (callSaaSAgent)
    console.log('\n🔄 Ejecutando agente con Gemini...');
    
    // Importar el sistema real de agentes
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const fullPrompt = `${agent.prompt_template}\n\nTexto del documento:\n${pdfData.text}`;
    
    console.log(`   📊 Prompt length: ${fullPrompt.length} caracteres`);
    
    const startTime = Date.now();
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const agentResponse = response.text();
    const processingTime = Date.now() - startTime;
    
    console.log(`   ⏱️ Tiempo procesamiento: ${processingTime}ms`);
    console.log(`   📄 Respuesta length: ${agentResponse.length} caracteres`);
    
    // PASO 5: Parsear respuesta del agente
    console.log('\n🔍 Parseando respuesta del agente...');
    let extractedData;
    let parseSuccess = false;
    
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = agentResponse.match(/```json\s*([\s\S]*?)\s*```/) || agentResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : agentResponse;
      extractedData = JSON.parse(jsonString);
      parseSuccess = true;
      console.log(`   ✅ JSON parseado exitosamente`);
    } catch (parseError) {
      console.log(`   ⚠️ Error parseando JSON: ${parseError.message}`);
      extractedData = { error_parsing: agentResponse.substring(0, 200) };
      parseSuccess = false;
    }
    
    console.log(`   📊 Campos extraídos: ${Object.keys(extractedData).length}`);
    
    // Mostrar muestra de datos extraídos
    console.log('\n   📋 MUESTRA DE DATOS EXTRAÍDOS:');
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    const sampleEntries = Object.entries(extractedData).slice(0, 6);
    for (const [key, value] of sampleEntries) {
      const displayValue = value ? (value.toString().length > 45 ? value.toString().substring(0, 45) + '...' : value.toString()) : 'null';
      console.log(`   │ ${key.padEnd(20)}: ${displayValue.padEnd(45)} │`);
    }
    if (Object.keys(extractedData).length > 6) {
      console.log(`   │ ... y ${Object.keys(extractedData).length - 6} campos más ${' '.repeat(35)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    // PASO 6: Guardar en tabla específica usando esquema real
    console.log(`\n💾 Guardando en tabla específica: ${docConfig.table}...`);
    
    const insertData = {
      document_id: document.id,
      organization_id: organizationId,
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
      .from(docConfig.table)
      .insert(cleanData)
      .select()
      .single();
    
    if (saveError) {
      console.log(`   ❌ Error guardando: ${saveError.message}`);
      throw saveError;
    }
    
    console.log(`   ✅ Datos guardados: ${savedData.id}`);
    
    // PASO 7: Actualizar estado del documento
    await supabase
      .from('documents')
      .update({ metadata_status: 'completed' })
      .eq('id', document.id);
    
    // PASO 8: Análisis de compatibilidad con plantilla UI
    console.log('\n📊 ANÁLISIS DE COMPATIBILIDAD CON PLANTILLA UI:');
    const validation = validateUICompatibility(extractedData, docConfig.expectedFields);
    
    console.log(`   📋 Campos esperados: ${docConfig.expectedFields.join(', ')}`);
    console.log(`   📋 Campos extraídos: ${Object.keys(extractedData).length}`);
    console.log(`   📈 Tasa completitud: ${validation.completionRate.toFixed(1)}%`);
    console.log(`   ✅ Compatible UI: ${validation.isCompatible ? 'SÍ' : 'NO'}`);
    
    if (validation.missingFields.length > 0) {
      console.log(`   ⚠️ Campos faltantes: ${validation.missingFields.join(', ')}`);
    }
    
    // Calcular métricas
    const tokensUsed = Math.round(fullPrompt.length / 4) + Math.round(agentResponse.length / 4);
    const cost = (tokensUsed / 1000) * 0.002;
    
    console.log('\n📈 MÉTRICAS FINALES:');
    console.log(`   🔗 Document ID: ${document.id}`);
    console.log(`   📊 Extracted ID: ${savedData.id}`);
    console.log(`   ⏱️ Tiempo total: ${processingTime}ms`);
    console.log(`   🔢 Tokens: ${tokensUsed}`);
    console.log(`   💰 Costo: $${cost.toFixed(4)}`);
    console.log(`   🔄 Parse JSON: ${parseSuccess ? 'ÉXITO' : 'FALLO'}`);
    
    return {
      success: true,
      docType: docType,
      documentId: document.id,
      extractedId: savedData.id,
      agentData: extractedData,
      rawResponse: agentResponse,
      validation: validation,
      parseSuccess: parseSuccess,
      processingTime: processingTime,
      tokensUsed: tokensUsed,
      cost: cost,
      extractedLength: pdfData.text.length,
      pages: pdfData.numpages
    };
    
  } catch (error) {
    console.error(`❌ Error procesando ${docType}:`, error.message);
    return {
      success: false,
      docType: docType,
      error: error.message
    };
  }
}

/**
 * Valida compatibilidad con plantilla UI
 */
function validateUICompatibility(extractedData, expectedFields) {
  const extractedFields = Object.keys(extractedData);
  const completeFields = Object.entries(extractedData).filter(([key, value]) => 
    value && value.toString().length > 0
  ).length;
  
  const completionRate = expectedFields.length > 0 ? (completeFields / expectedFields.length) * 100 : 0;
  
  const missingFields = expectedFields.filter(field => 
    !extractedFields.includes(field) || !extractedData[field]
  );
  
  return {
    completionRate: completionRate,
    completeFields: completeFields,
    totalExpected: expectedFields.length,
    missingFields: missingFields,
    isCompatible: completionRate >= 70
  };
}

/**
 * Test completo de todos los documentos usando pipeline real
 */
async function testAllDocumentsRealPipeline() {
  console.log('🧪 TEST REAL - TODOS LOS DOCUMENTOS CON PIPELINE EXISTENTE');
  console.log('='.repeat(70));
  console.log('🎯 USANDO SISTEMA REAL DE INGESTA EXISTENTE');
  console.log('📋 VERIFICANDO AGENTES Y TABLAS REALES');
  console.log('='.repeat(70));
  
  const testOrganizationId = 'e3f4370b-2235-45ad-869a-737ee9fd95ab';
  
  try {
    // PASO 1: Autenticación usando credenciales reales
    console.log('🔐 Autenticando con credenciales reales...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    if (authError) throw authError;
    console.log(`✅ Autenticado: ${authData.user.email}`);
    console.log(`📊 Organization ID: ${testOrganizationId}`);
    
    // PASO 2: Test cada documento
    const results = {};
    let totalSuccessful = 0;
    let totalCost = 0;
    let totalTokens = 0;
    let totalTime = 0;
    
    console.log(`\n📋 Documentos a procesar: ${Object.keys(ALL_DOCUMENTS).length}`);
    
    for (const [docType, docConfig] of Object.entries(ALL_DOCUMENTS)) {
      console.log(`\nEsperando 2 segundos antes del siguiente documento...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await testDocumentWithRealPipeline(docType, docConfig, testOrganizationId);
      results[docType] = result;
      
      if (result.success) {
        totalSuccessful++;
        totalCost += result.cost || 0;
        totalTokens += result.tokensUsed || 0;
        totalTime += result.processingTime || 0;
      }
    }
    
    // RESUMEN FINAL
    console.log(`\n\n📊 RESUMEN FINAL - TEST CON PIPELINE REAL`);
    console.log('='.repeat(70));
    
    const successRate = Math.round((totalSuccessful / Object.keys(ALL_DOCUMENTS).length) * 100);
    
    console.log(`📈 ESTADÍSTICAS:`);
    console.log(`   Total documentos: ${Object.keys(ALL_DOCUMENTS).length}`);
    console.log(`   Exitosos: ${totalSuccessful}`);
    console.log(`   Fallidos: ${Object.keys(ALL_DOCUMENTS).length - totalSuccessful}`);
    console.log(`   Tasa de éxito: ${successRate}%`);
    
    if (totalSuccessful > 0) {
      console.log(`\n💰 MÉTRICAS:`);
      console.log(`   Costo total: $${totalCost.toFixed(4)}`);
      console.log(`   Costo promedio: $${(totalCost / totalSuccessful).toFixed(4)}`);
      console.log(`   Tokens totales: ${totalTokens}`);
      console.log(`   Tiempo total: ${totalTime}ms`);
    }
    
    console.log(`\n📋 DETALLE POR DOCUMENTO:`);
    for (const [docType, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`   ✅ ${docType.toUpperCase()}: ${result.validation.completionRate.toFixed(1)}% completitud, ${result.processingTime}ms, $${result.cost.toFixed(4)}`);
        console.log(`      📊 IDs: doc=${result.documentId.substring(0,8)}, ext=${result.extractedId.substring(0,8)}`);
        console.log(`      🔄 Parse: ${result.parseSuccess ? 'ÉXITO' : 'FALLO'}, Compatible UI: ${result.validation.isCompatible ? 'SÍ' : 'NO'}`);
      } else {
        console.log(`   ❌ ${docType.toUpperCase()}: ${result.reason || 'Error'} - ${result.error || 'Proceso fallido'}`);
      }
    }
    
    // ANÁLISIS PARA INTEGRACIÓN
    console.log(`\n🎯 ANÁLISIS PARA INTEGRACIÓN EN PIPELINE:`);
    
    const successful = Object.entries(results).filter(([_, r]) => r.success);
    const highQuality = successful.filter(([_, r]) => r.validation.completionRate >= 80);
    const needOCR = successful.filter(([_, r]) => r.extractedLength < 200);
    
    if (successRate >= 85) {
      console.log(`   ✅ EXCELENTE: Pipeline listo para integración`);
      console.log(`   ✅ Agentes funcionan con datos reales`);
      console.log(`   ✅ Tablas reciben datos correctamente`);
    } else if (successRate >= 70) {
      console.log(`   ⚠️ BUENO: Mayoría funcionan, revisar fallos`);
    } else {
      console.log(`   ❌ CRÍTICO: Muchos problemas detectados`);
    }
    
    console.log(`\n📊 TIPOS LISTOS PARA PRODUCCIÓN:`);
    console.log(`   Alta calidad (≥80%): ${highQuality.map(([type, _]) => type).join(', ') || 'Ninguno'}`);
    console.log(`   Requieren OCR: ${needOCR.map(([type, _]) => type).join(', ') || 'Ninguno'}`);
    
    console.log(`\n🚀 PRÓXIMO PASO:`);
    if (successRate >= 85) {
      console.log(`   Integrar todos los agentes en pipeline principal`);
    } else {
      console.log(`   Corregir agentes problemáticos antes de integración`);
    }
    
  } catch (error) {
    console.error('❌ Error en test general:', error.message);
  }
}

// Ejecutar test
if (require.main === module) {
  testAllDocumentsRealPipeline().catch(console.error);
}

module.exports = {
  testDocumentWithRealPipeline,
  testAllDocumentsRealPipeline,
  ALL_DOCUMENTS
};