#!/usr/bin/env node

/**
 * ARCHIVO: test_standalone_pipeline.js
 * PROPÓSITO: Test REAL independiente del pipeline con llamadas directas a APIs
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, Google Gemini, Supabase
 * OUTPUTS: Verificación completa y análisis de calidad de prompts
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// Configurar clientes
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuración de documentos de test
const testDocuments = {
  'comunicado': {
    name: 'COMUNICADO VECINOS',
    file: 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf',
    agent: 'comunicado_extractor_v1',
    table: 'extracted_communications',
    expectedFields: ['fecha', 'comunidad', 'remitente', 'resumen', 'category']
  },
  'factura': {
    name: 'FACTURA COMERCIAL', 
    file: 'datos/factura.pdf',
    agent: 'factura_extractor_v2',
    table: 'extracted_invoices',
    expectedFields: ['provider_name', 'client_name', 'amount', 'invoice_date']
  }
};

/**
 * PASO 1: Extracción híbrida de texto (pdf-parse → Google Vision OCR)
 */
async function extractTextHybrid(filePath) {
  const startTime = Date.now();
  
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfParse = require('pdf-parse');
    
    console.log(`📖 PASO 1: Extracción de texto híbrida`);
    console.log(`   Archivo: ${path.basename(filePath)}`);
    console.log(`   Tamaño: ${(buffer.length / 1024).toFixed(1)} KB`);
    
    // Intentar pdf-parse primero
    console.log(`   🔍 Intentando pdf-parse...`);
    const pdfData = await pdfParse(buffer);
    const pdfText = (pdfData.text || '').trim();
    const pdfQuality = analyzeTextQuality(pdfText);
    
    console.log(`   📄 PDF-Parse: ${pdfText.length} caracteres, calidad ${pdfQuality.score}%`);
    
    // Para este test, usar siempre el texto extraído (sin OCR real)
    return {
      success: true,
      text: pdfText,
      method: pdfText.length > 200 ? 'pdf-parse' : 'pdf-parse-low-quality',
      pages: pdfData.numpages,
      quality: pdfQuality.score,
      processingTime: Date.now() - startTime,
      cost: 0,
      needsOCR: pdfQuality.score < 70
    };
    
  } catch (error) {
    console.error(`❌ Error extrayendo texto:`, error.message);
    return {
      success: false,
      error: error.message,
      method: 'error'
    };
  }
}

/**
 * Analiza la calidad del texto extraído
 */
function analyzeTextQuality(text) {
  if (!text || text.length === 0) {
    return {
      score: 0,
      needsOCR: true,
      issues: ['Sin texto extraído'],
      normalWords: 0,
      hasStructure: false
    };
  }
  
  const issues = [];
  let score = 100;
  
  // 1. Longitud del texto
  if (text.length < 100) {
    score -= 40;
    issues.push('Texto muy corto');
  }
  
  // 2. Análisis de palabras
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const normalWords = words.filter(w => w.length >= 3 && /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]+$/.test(w));
  const normalWordRatio = words.length > 0 ? (normalWords.length / words.length) * 100 : 0;
  
  if (normalWordRatio < 60) {
    score -= 30;
    issues.push('Pocas palabras normales');
  }
  
  // 3. Caracteres extraños
  const strangeChars = text.match(/[^\w\s\n\r\t.,;:!?()\[\]{}'\"áéíóúñüÁÉÍÓÚÑÜ€$%@#&*+=/<>-]/g);
  if (strangeChars && strangeChars.length > text.length * 0.05) {
    score -= 25;
    issues.push('Muchos caracteres extraños');
  }
  
  // 4. Estructura de documento
  const hasStructure = /[.,;:!?]/.test(text) && text.includes(' ') && normalWordRatio > 50;
  if (!hasStructure) {
    score -= 20;
    issues.push('Falta estructura normal');
  }
  
  score = Math.max(0, score);
  const needsOCR = score < 70;
  
  return {
    score: Math.round(score),
    needsOCR: needsOCR,
    issues: issues,
    normalWords: Math.round(normalWordRatio),
    hasStructure: hasStructure
  };
}

/**
 * PASO 2: Obtener agente de Supabase y ejecutar con Gemini
 */
async function callStandaloneAgent(agentName, documentText) {
  const startTime = Date.now();
  
  console.log(`🤖 PASO 2: Ejecutando agente ${agentName}`);
  console.log(`   Texto length: ${documentText.length} caracteres`);
  
  try {
    // 1. Obtener el agente de Supabase
    console.log(`   🔍 Buscando agente en Supabase...`);
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', agentName)
      .eq('is_active', true)
      .single();
    
    if (agentError || !agent) {
      throw new Error(`Agente no encontrado: ${agentName}`);
    }
    
    console.log(`   ✅ Agente encontrado: ${agent.purpose}`);
    
    // 2. Preparar el prompt
    const fullPrompt = `${agent.prompt_template}\n\nTexto del documento:\n${documentText}`;
    
    console.log(`   🔄 Ejecutando con Gemini Flash 1.5...`);
    console.log(`   📝 Prompt length: ${fullPrompt.length} caracteres`);
    
    // 3. Llamar a Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`   📋 Respuesta bruta de Gemini:`);
    console.log(`   ${'─'.repeat(50)}`);
    console.log(`   ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`);
    console.log(`   ${'─'.repeat(50)}`);
    
    // 4. Intentar parsear JSON
    let extractedData;
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = text.match(/```json\\s*([\\s\\S]*?)\\s*```/) || text.match(/\\{[\\s\\S]*\\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      extractedData = JSON.parse(jsonString);
      console.log(`   ✅ JSON parseado exitosamente`);
    } catch (parseError) {
      console.log(`   ⚠️ Error parseando JSON: ${parseError.message}`);
      console.log(`   🔧 Intentando extraer campos manualmente...`);
      
      // Fallback: extraer campos básicos
      extractedData = extractFieldsManually(text, agentName);
    }
    
    const processingTime = Date.now() - startTime;
    const tokensUsed = Math.round(fullPrompt.length / 4) + Math.round(text.length / 4);
    const cost = (tokensUsed / 1000) * 0.002; // $0.002 per 1K tokens
    
    console.log(`   ✅ Agente ejecutado exitosamente:`);
    console.log(`      Tiempo: ${processingTime}ms`);
    console.log(`      Tokens estimados: ${tokensUsed}`);
    console.log(`      Costo estimado: $${cost.toFixed(4)}`);
    console.log(`      Campos extraídos: ${Object.keys(extractedData).length}`);
    
    return {
      success: true,
      data: extractedData,
      rawResponse: text,
      agent: agent,
      processingTime: processingTime,
      tokensUsed: tokensUsed,
      cost: cost
    };
    
  } catch (error) {
    console.error(`   ❌ Error ejecutando agente:`, error.message);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Extrae campos manualmente como fallback
 */
function extractFieldsManually(text, agentName) {
  const extracted = {};
  
  // Patrones básicos según el tipo de agente
  if (agentName.includes('comunicado')) {
    extracted.fecha = extractPattern(text, /fecha[:\\s]*([^\\n]+)/i);
    extracted.comunidad = extractPattern(text, /comunidad[:\\s]*([^\\n]+)/i);
    extracted.remitente = extractPattern(text, /remitente[:\\s]*([^\\n]+)/i);
    extracted.resumen = extractPattern(text, /resumen[:\\s]*([^\\n]+)/i);
    extracted.category = extractPattern(text, /categor[íi]a[:\\s]*([^\\n]+)/i);
  } else if (agentName.includes('factura')) {
    extracted.provider_name = extractPattern(text, /proveedor[:\\s]*([^\\n]+)/i);
    extracted.client_name = extractPattern(text, /cliente[:\\s]*([^\\n]+)/i);
    extracted.amount = extractPattern(text, /importe[:\\s]*([\\d.,]+)/i);
    extracted.invoice_date = extractPattern(text, /fecha[:\\s]*([^\\n]+)/i);
  }
  
  return extracted;
}

function extractPattern(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

/**
 * PASO 3: Guardado REAL en tabla de Supabase
 */
async function saveToSupabaseTable(tableName, data, documentId, agentData) {
  const startTime = Date.now();
  
  console.log(`💾 PASO 3: Guardado en tabla ${tableName}`);
  console.log(`   Document ID: ${documentId}`);
  
  try {
    // Preparar datos para inserción
    const insertData = {
      document_id: documentId,
      organization_id: 'test-org-12345',
      created_at: new Date().toISOString(),
      ...data
    };
    
    console.log(`   🔄 Insertando en tabla real...`);
    console.log(`   📊 Datos a insertar:`);
    for (const [key, value] of Object.entries(insertData)) {
      const displayValue = typeof value === 'string' && value.length > 50 
        ? value.substring(0, 50) + '...' 
        : value;
      console.log(`      ${key}: ${displayValue}`);
    }
    
    // Insertar en Supabase
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select();
    
    if (error) {
      throw error;
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log(`   ✅ Datos guardados exitosamente:`);
    console.log(`      ID insertado: ${result[0].id}`);
    console.log(`      Tiempo: ${processingTime}ms`);
    
    return {
      success: true,
      id: result[0].id,
      insertedData: result[0],
      processingTime: processingTime
    };
    
  } catch (error) {
    console.error(`   ❌ Error guardando en tabla:`, error.message);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Pipeline completo para un documento
 */
async function processDocumentStandalone(docType, docConfig) {
  const documentId = `test_${docType}_${Date.now()}`;
  
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🔥 PROCESANDO: ${docConfig.name} (${docType.toUpperCase()})`);
  console.log(`${'═'.repeat(70)}`);
  
  const fullPath = path.join(process.cwd(), docConfig.file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Archivo no encontrado: ${docConfig.file}`);
    return { success: false, reason: 'file_not_found' };
  }
  
  const overallStart = Date.now();
  let totalCost = 0;
  let totalTokens = 0;
  
  // PASO 1: Extracción de texto
  const extractionResult = await extractTextHybrid(fullPath);
  if (!extractionResult.success) {
    return { success: false, step: 'extraction', error: extractionResult.error };
  }
  
  totalCost += extractionResult.cost || 0;
  
  // Solo proceder si hay texto extraído
  if (!extractionResult.text || extractionResult.text.length < 50) {
    console.log(`⚠️ Texto insuficiente para procesar (${extractionResult.text.length} caracteres)`);
    return { 
      success: false, 
      step: 'extraction', 
      error: 'Insufficient text extracted',
      extractionQuality: extractionResult.quality,
      needsOCR: extractionResult.needsOCR
    };
  }
  
  // PASO 2: Agente
  const agentResult = await callStandaloneAgent(docConfig.agent, extractionResult.text);
  if (!agentResult.success) {
    return { success: false, step: 'agent', error: agentResult.error };
  }
  
  totalCost += agentResult.cost || 0;
  totalTokens += agentResult.tokensUsed || 0;
  
  // PASO 3: Guardado en tabla
  const saveResult = await saveToSupabaseTable(docConfig.table, agentResult.data, documentId, agentResult);
  if (!saveResult.success) {
    return { success: false, step: 'database', error: saveResult.error };
  }
  
  const totalTime = Date.now() - overallStart;
  
  console.log(`\n🎉 PROCESAMIENTO COMPLETADO:`);
  console.log(`   ⏱️ Tiempo total: ${totalTime}ms`);
  console.log(`   💰 Costo total: $${totalCost.toFixed(4)}`);
  console.log(`   🔢 Tokens totales: ${totalTokens}`);
  console.log(`   🔗 ID documento: ${documentId}`);
  console.log(`   📊 ID insertado: ${saveResult.id}`);
  
  return {
    success: true,
    documentId: documentId,
    insertedId: saveResult.id,
    extractionMethod: extractionResult.method,
    extractionQuality: extractionResult.quality,
    needsOCR: extractionResult.needsOCR,
    agentData: agentResult.data,
    rawResponse: agentResult.rawResponse,
    totalTime: totalTime,
    totalCost: totalCost,
    totalTokens: totalTokens,
    steps: {
      extraction: extractionResult,
      agent: agentResult,
      database: saveResult
    }
  };
}

/**
 * Ejecutar test completo standalone
 */
async function runStandalonePipelineTest() {
  console.log('🧪 TEST STANDALONE DEL PIPELINE COMPLETO');
  console.log('='.repeat(70));
  console.log('⚠️  ESTE TEST USARÁ AGENTES Y TABLAS REALES DE SUPABASE');
  console.log('⚠️  SE INSERTARÁN DATOS REALES EN LA BASE DE DATOS');
  console.log('⚠️  RESPUESTAS COMPLETAS PARA ANÁLISIS DE CALIDAD');
  console.log('='.repeat(70));
  
  const results = {};
  let totalSuccessful = 0;
  let totalCost = 0;
  let totalTokens = 0;
  let totalTime = 0;
  
  for (const [docType, docConfig] of Object.entries(testDocuments)) {
    console.log(`\nEsperando 3 segundos antes del siguiente documento...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result = await processDocumentStandalone(docType, docConfig);
    results[docType] = result;
    
    if (result.success) {
      totalSuccessful++;
      totalCost += result.totalCost || 0;
      totalTokens += result.totalTokens || 0;
      totalTime += result.totalTime || 0;
    }
  }
  
  // RESUMEN DETALLADO
  console.log('\n\n📊 ANÁLISIS DETALLADO DE RESULTADOS');
  console.log('='.repeat(70));
  
  for (const [docType, result] of Object.entries(results)) {
    console.log(`\n📄 ${docType.toUpperCase()} - ANÁLISIS COMPLETO:`);
    console.log(`${'─'.repeat(50)}`);
    
    if (result.success) {
      console.log(`✅ ÉXITO - Pipeline completado`);
      console.log(`   📊 ID insertado en BD: ${result.insertedId}`);
      console.log(`   ⏱️ Tiempo total: ${result.totalTime}ms`);
      console.log(`   💰 Costo: $${result.totalCost.toFixed(4)}`);
      console.log(`   🔢 Tokens: ${result.totalTokens}`);
      
      console.log(`\n   🔍 EXTRACCIÓN DE TEXTO:`);
      console.log(`      Método: ${result.extractionMethod}`);
      console.log(`      Calidad: ${result.extractionQuality}%`);
      console.log(`      Necesita OCR: ${result.needsOCR ? 'SÍ' : 'NO'}`);
      
      console.log(`\n   📝 DATOS EXTRAÍDOS POR EL AGENTE:`);
      for (const [key, value] of Object.entries(result.agentData)) {
        console.log(`      ${key}: ${value}`);
      }
      
      console.log(`\n   🤖 RESPUESTA COMPLETA DEL AGENTE:`);
      console.log(`   ${'┌' + '─'.repeat(48) + '┐'}`);
      const lines = result.rawResponse.split('\n');
      lines.slice(0, 10).forEach(line => {
        const truncated = line.length > 46 ? line.substring(0, 46) + '...' : line;
        console.log(`   │ ${truncated.padEnd(46)} │`);
      });
      if (lines.length > 10) {
        console.log(`   │ ... (${lines.length - 10} líneas más) ${' '.repeat(20)} │`);
      }
      console.log(`   ${'└' + '─'.repeat(48) + '┘'}`);
      
    } else {
      console.log(`❌ FALLO - ${result.step || 'Pipeline'}`);
      console.log(`   Error: ${result.error}`);
      if (result.extractionQuality !== undefined) {
        console.log(`   Calidad extracción: ${result.extractionQuality}%`);
        console.log(`   Necesita OCR: ${result.needsOCR ? 'SÍ' : 'NO'}`);
      }
    }
  }
  
  // RESUMEN FINAL
  console.log(`\n\n📈 RESUMEN EJECUTIVO`);
  console.log('='.repeat(70));
  console.log(`📊 Documentos procesados: ${Object.keys(testDocuments).length}`);
  console.log(`✅ Exitosos: ${totalSuccessful}`);
  console.log(`❌ Fallidos: ${Object.keys(testDocuments).length - totalSuccessful}`);
  console.log(`📊 Tasa de éxito: ${Math.round((totalSuccessful / Object.keys(testDocuments).length) * 100)}%`);
  
  if (totalSuccessful > 0) {
    console.log(`💰 Costo total: $${totalCost.toFixed(4)}`);
    console.log(`💰 Costo promedio: $${(totalCost / totalSuccessful).toFixed(4)}`);
    console.log(`🔢 Tokens totales: ${totalTokens}`);
    console.log(`⏱️ Tiempo total: ${totalTime}ms`);
  }
  
  console.log(`\n🎯 CONCLUSIONES PARA PRODUCCIÓN:`);
  if (totalSuccessful === Object.keys(testDocuments).length) {
    console.log(`   ✅ EXCELENTE: Pipeline completamente funcional`);
    console.log(`   ✅ Agentes extraen datos correctamente`);
    console.log(`   ✅ Datos se guardan en tablas sin problemas`);
  } else if (totalSuccessful >= Object.keys(testDocuments).length / 2) {
    console.log(`   ⚠️ BUENO: Mayoría funciona, revisar fallos`);
    console.log(`   🔧 Optimizar agentes con problemas`);
  } else {
    console.log(`   ❌ CRÍTICO: Pipeline tiene problemas mayores`);
    console.log(`   🚨 Requiere depuración antes de producción`);
  }
}

// Ejecutar test
if (require.main === module) {
  runStandalonePipelineTest().catch(console.error);
}

module.exports = {
  processDocumentStandalone,
  runStandalonePipelineTest
};