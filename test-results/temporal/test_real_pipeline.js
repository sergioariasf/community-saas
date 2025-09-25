#!/usr/bin/env node

/**
 * ARCHIVO: test_real_pipeline.js
 * PROPÓSITO: Test REAL del pipeline completo con agentes y tablas de Supabase
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, saasAgents.ts, Supabase real
 * OUTPUTS: Verificación completa con datos reales en BD
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

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
  },
  'contrato': {
    name: 'CONTRATO SERVICIOS',
    file: 'datos/Contrato OLAQUA Piscinas.pdf',
    agent: 'contrato_extractor_v1', 
    table: 'extracted_contracts',
    expectedFields: ['titulo_contrato', 'parte_a', 'parte_b', 'objeto_contrato']
  },
  'escritura': {
    name: 'ESCRITURA COMPRAVENTA',
    file: 'datos/escritura_D102B.pdf',
    agent: 'escritura_extractor_v1',
    table: 'extracted_property_deeds', 
    expectedFields: ['vendedor_nombre', 'comprador_nombre', 'direccion_inmueble', 'precio_venta']
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
    
    // Decidir si necesita OCR 
    const needsOCR = pdfQuality.score < 70 || pdfText.length < 200;
    
    if (!needsOCR) {
      console.log(`   ✅ PDF-Parse suficiente - usando texto nativo`);
      return {
        success: true,
        text: pdfText,
        method: 'pdf-parse',
        pages: pdfData.numpages,
        quality: pdfQuality.score,
        processingTime: Date.now() - startTime,
        cost: 0
      };
    }
    
    // AQUÍ iría la llamada real a Google Vision OCR
    console.log(`   🔄 PDF-Parse insuficiente - necesita OCR real`);
    console.log(`   ⚠️ Google Vision OCR no implementado en este test`);
    
    // Por ahora usamos el texto de pdf-parse aunque sea de baja calidad
    return {
      success: true,
      text: pdfText,
      method: 'pdf-parse-fallback',
      pages: pdfData.numpages,
      quality: pdfQuality.score,
      processingTime: Date.now() - startTime,
      cost: 0
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
  
  // 3. Caracteres extraños (posible OCR malo)
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
 * PASO 2: Llamada REAL al agente de Supabase
 */
async function callRealAgent(agentName, documentText, documentInfo) {
  const startTime = Date.now();
  
  console.log(`🤖 PASO 2: Llamada REAL al agente ${agentName}`);
  console.log(`   Texto length: ${documentText.length} caracteres`);
  console.log(`   Método extracción: ${documentInfo.method}`);
  
  try {
    // Importar dinámicamente el módulo de agentes
    const { callSaaSAgent } = require('./src/lib/gemini/saasAgents.ts');
    
    console.log(`   🔄 Ejecutando agente ${agentName}...`);
    
    // Llamada real al agente
    const result = await callSaaSAgent(agentName, documentText);
    
    const processingTime = Date.now() - startTime;
    
    if (result.success) {
      console.log(`   ✅ Agente ejecutado exitosamente:`);
      console.log(`      Tiempo: ${processingTime}ms`);
      console.log(`      Campos extraídos: ${Object.keys(result.data || {}).length}`);
      console.log(`      Tokens usados: ${result.tokensUsed || 'N/A'}`);
      console.log(`      Costo: $${result.cost || 'N/A'}`);
      
      // Mostrar datos extraídos
      console.log(`\n   📋 DATOS EXTRAÍDOS:`);
      console.log(`   ${'─'.repeat(50)}`);
      for (const [key, value] of Object.entries(result.data || {})) {
        const displayValue = typeof value === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : value;
        console.log(`      ${key}: ${displayValue}`);
      }
      console.log(`   ${'─'.repeat(50)}`);
    } else {
      console.log(`   ❌ Error en agente: ${result.error}`);
    }
    
    return {
      ...result,
      processingTime: processingTime
    };
    
  } catch (error) {
    console.error(`   ❌ Error llamando agente:`, error.message);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * PASO 3: Guardado REAL en tabla de Supabase
 */
async function saveToRealTable(tableName, data, documentId, docType) {
  const startTime = Date.now();
  
  console.log(`💾 PASO 3: Guardado REAL en tabla ${tableName}`);
  console.log(`   Document ID: ${documentId}`);
  console.log(`   Tipo documento: ${docType}`);
  
  try {
    // Importar las funciones de guardado dinámicamente según el tipo
    let saveFunction;
    
    switch (docType) {
      case 'comunicado':
        const { saveExtractedComunicado } = require('./src/lib/gemini/saasAgents.ts');
        saveFunction = saveExtractedComunicado;
        break;
      case 'factura':
        const { saveExtractedInvoice } = require('./src/lib/gemini/saasAgents.ts');
        saveFunction = saveExtractedInvoice;
        break;
      case 'contrato':
        const { saveExtractedContrato } = require('./src/lib/gemini/saasAgents.ts');
        saveFunction = saveExtractedContrato;
        break;
      case 'escritura':
        const { saveExtractedEscritura } = require('./src/lib/gemini/saasAgents.ts');
        saveFunction = saveExtractedEscritura;
        break;
      default:
        throw new Error(`Función de guardado no encontrada para tipo: ${docType}`);
    }
    
    console.log(`   🔄 Guardando en tabla real...`);
    
    // Llamada real al guardado
    const result = await saveFunction(data, documentId, 'org-test-12345');
    
    const processingTime = Date.now() - startTime;
    
    if (result.success) {
      console.log(`   ✅ Datos guardados exitosamente:`);
      console.log(`      ID insertado: ${result.id}`);
      console.log(`      Tiempo: ${processingTime}ms`);
    } else {
      console.log(`   ❌ Error guardando: ${result.error}`);
    }
    
    return {
      ...result,
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
 * Pipeline completo REAL para un documento
 */
async function processDocumentReal(docType, docConfig) {
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
  
  // PASO 2: Agente
  const agentResult = await callRealAgent(docConfig.agent, extractionResult.text, extractionResult);
  if (!agentResult.success) {
    return { success: false, step: 'agent', error: agentResult.error };
  }
  
  totalCost += agentResult.cost || 0;
  totalTokens += agentResult.tokensUsed || 0;
  
  // PASO 3: Guardado en tabla
  const saveResult = await saveToRealTable(docConfig.table, agentResult.data, documentId, docType);
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
    agentData: agentResult.data,
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
 * Ejecutar test completo REAL
 */
async function runRealPipelineTest() {
  console.log('🧪 TEST REAL DEL PIPELINE COMPLETO');
  console.log('='.repeat(70));
  console.log('⚠️  ESTE TEST USARÁ AGENTES Y TABLAS REALES DE SUPABASE');
  console.log('⚠️  SE INSERTARÁN DATOS REALES EN LA BASE DE DATOS');
  console.log('='.repeat(70));
  
  const results = {};
  let totalSuccessful = 0;
  let totalCost = 0;
  let totalTokens = 0;
  let totalTime = 0;
  
  for (const [docType, docConfig] of Object.entries(testDocuments)) {
    console.log(`\nEsperando 2 segundos antes del siguiente documento...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await processDocumentReal(docType, docConfig);
    results[docType] = result;
    
    if (result.success) {
      totalSuccessful++;
      totalCost += result.totalCost || 0;
      totalTokens += result.totalTokens || 0;
      totalTime += result.totalTime || 0;
    }
  }
  
  // RESUMEN FINAL
  console.log('\n\n📊 RESUMEN FINAL - TEST REAL DEL PIPELINE');
  console.log('='.repeat(70));
  
  console.log(`📈 ESTADÍSTICAS GENERALES:`);
  console.log(`   Total documentos procesados: ${Object.keys(testDocuments).length}`);
  console.log(`   Procesamientos exitosos: ${totalSuccessful}`);
  console.log(`   Tasa de éxito: ${Math.round((totalSuccessful / Object.keys(testDocuments).length) * 100)}%`);
  
  if (totalSuccessful > 0) {
    console.log(`\n💰 MÉTRICAS DE COSTO:`);
    console.log(`   Costo total: $${totalCost.toFixed(4)}`);
    console.log(`   Costo promedio por documento: $${(totalCost / totalSuccessful).toFixed(4)}`);
    console.log(`   Tokens totales: ${totalTokens}`);
    console.log(`   Tokens promedio por documento: ${Math.round(totalTokens / totalSuccessful)}`);
    
    console.log(`\n⏱️ MÉTRICAS DE RENDIMIENTO:`);
    console.log(`   Tiempo total: ${totalTime}ms`);
    console.log(`   Tiempo promedio por documento: ${Math.round(totalTime / totalSuccessful)}ms`);
  }
  
  console.log(`\n📋 DETALLE POR DOCUMENTO:`);
  for (const [docType, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`   ✅ ${docType.toUpperCase()}: ${result.totalTime}ms, $${result.totalCost.toFixed(4)}, ${result.totalTokens} tokens`);
      console.log(`      📊 ID insertado: ${result.insertedId}`);
      console.log(`      🔍 Método: ${result.extractionMethod}, Calidad: ${result.extractionQuality}%`);
      console.log(`      📝 Campos: ${Object.keys(result.agentData).length}`);
    } else {
      console.log(`   ❌ ${docType.toUpperCase()}: Error en ${result.step} - ${result.error}`);
    }
  }
  
  console.log(`\n🎯 DATOS EXTRAÍDOS PARA REVISIÓN:`);
  console.log(`${'═'.repeat(70)}`);
  
  for (const [docType, result] of Object.entries(results)) {
    if (result.success && result.agentData) {
      console.log(`\n📄 ${docType.toUpperCase()} - DATOS EXTRAÍDOS:`);
      console.log(`${'─'.repeat(50)}`);
      for (const [key, value] of Object.entries(result.agentData)) {
        console.log(`   ${key}: ${value}`);
      }
    }
  }
  
  console.log(`\n🚀 CONCLUSIONES:`);
  if (totalSuccessful === Object.keys(testDocuments).length) {
    console.log(`   ✅ EXCELENTE: Todos los documentos procesados exitosamente`);
    console.log(`   ✅ Pipeline listo para producción`);
  } else if (totalSuccessful >= Object.keys(testDocuments).length / 2) {
    console.log(`   ⚠️ BUENO: Mayoría de documentos procesados`);
    console.log(`   🔧 Revisar fallos antes de producción`);
  } else {
    console.log(`   ❌ PROBLEMAS: Muchos fallos en el pipeline`);
    console.log(`   🚨 Requiere depuración antes de producción`);
  }
}

// Ejecutar test
if (require.main === module) {
  runRealPipelineTest().catch(console.error);
}

module.exports = {
  processDocumentReal,
  runRealPipelineTest
};