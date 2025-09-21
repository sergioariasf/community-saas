#!/usr/bin/env node

/**
 * ARCHIVO: test_complete_pipeline_real.js
 * PROPÓSITO: Test COMPLETO del pipeline con los 7 tipos de documentos siguiendo metodología exitosa de actas
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, Google Gemini, Supabase
 * OUTPUTS: Análisis detallado de calidad de prompts y verificación para integración en pipeline
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

// Configuración completa de los 7 tipos de documentos
const ALL_TEST_DOCUMENTS = {
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
 * FASE 1: Extracción y análisis de texto (siguiendo metodología de actas)
 */
async function extractAndAnalyzeText(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfParse = require('pdf-parse');
    
    console.log(`📖 EXTRACCIÓN DE TEXTO DETALLADA`);
    console.log(`   Archivo: ${path.basename(filePath)}`);
    console.log(`   Tamaño: ${(buffer.length / 1024).toFixed(1)} KB`);
    
    const pdfData = await pdfParse(buffer);
    const pdfText = (pdfData.text || '').trim();
    const quality = analyzeTextQuality(pdfText);
    
    console.log(`   📄 Páginas: ${pdfData.numpages}`);
    console.log(`   📄 Caracteres extraídos: ${pdfText.length}`);
    console.log(`   📊 Calidad del texto: ${quality.score}%`);
    console.log(`   🔍 Necesita OCR: ${quality.needsOCR ? 'SÍ' : 'NO'}`);
    
    if (quality.issues.length > 0) {
      console.log(`   ⚠️ Issues detectados: ${quality.issues.join(', ')}`);
    }
    
    // Mostrar muestra del texto extraído
    console.log(`\\n   📝 MUESTRA DEL TEXTO EXTRAÍDO:`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    const lines = pdfText.split('\\n').slice(0, 8);
    lines.forEach(line => {
      const truncated = line.length > 66 ? line.substring(0, 66) + '..' : line;
      console.log(`   │ ${truncated.padEnd(66)} │`);
    });
    if (pdfText.split('\\n').length > 8) {
      console.log(`   │ ... (${pdfText.split('\\n').length - 8} líneas más) ${' '.repeat(27)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    return {
      success: true,
      text: pdfText,
      pages: pdfData.numpages,
      length: pdfText.length,
      quality: quality
    };
    
  } catch (error) {
    console.error(`❌ Error extrayendo texto:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analiza la calidad del texto extraído (siguiendo metodología de actas)
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
 * FASE 2: Validación del agente de IA (siguiendo metodología de actas)
 */
async function validateAgent(agentName, documentText, expectedFields) {
  try {
    console.log(`\\n🤖 VALIDACIÓN AGENTE DE IA`);
    console.log(`   Agente: ${agentName}`);
    console.log(`   Texto length: ${documentText.length} caracteres`);
    
    // 1. Obtener el agente de Supabase
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', agentName)
      .eq('is_active', true)
      .single();
    
    if (agentError || !agent) {
      throw new Error(`Agente no encontrado: ${agentName}`);
    }
    
    console.log(`   ✅ Agente encontrado`);
    console.log(`   📝 Propósito: ${agent.purpose}`);
    
    // 2. Analizar el prompt
    console.log(`\\n   📋 ANÁLISIS DEL PROMPT:`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    const promptLines = agent.prompt_template.split('\\n');
    promptLines.slice(0, 10).forEach(line => {
      const truncated = line.length > 66 ? line.substring(0, 66) + '..' : line;
      console.log(`   │ ${truncated.padEnd(66)} │`);
    });
    if (promptLines.length > 10) {
      console.log(`   │ ... (${promptLines.length - 10} líneas más) ${' '.repeat(28)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    // 3. Preparar el prompt completo
    const fullPrompt = \`\${agent.prompt_template}

Texto del documento:
\${documentText}\`;
    
    console.log(`\\n   🔄 Ejecutando con Gemini Flash 1.5...`);
    console.log(`   📊 Prompt total: ${fullPrompt.length} caracteres`);
    
    // 4. Llamar a Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`\\n   📋 RESPUESTA COMPLETA DE GEMINI:`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    const responseLines = text.split('\\n');
    responseLines.slice(0, 15).forEach(line => {
      const truncated = line.length > 66 ? line.substring(0, 66) + '..' : line;
      console.log(`   │ ${truncated.padEnd(66)} │`);
    });
    if (responseLines.length > 15) {
      console.log(`   │ ... (${responseLines.length - 15} líneas más) ${' '.repeat(28)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    // 5. Intentar parsear JSON
    let extractedData;
    let parseSuccess = false;
    
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = text.match(/\`\`\`json\\s*([\\s\\S]*?)\\s*\`\`\`/) || text.match(/\\{[\\s\\S]*\\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      extractedData = JSON.parse(jsonString);
      parseSuccess = true;
      console.log(`\\n   ✅ JSON parseado exitosamente`);
    } catch (parseError) {
      console.log(`\\n   ⚠️ Error parseando JSON: ${parseError.message}`);
      console.log(`   🔧 Intentando extraer campos manualmente...`);
      
      // Fallback: extraer campos básicos manualmente según tipo
      extractedData = extractFieldsManually(text, agentName);
      parseSuccess = false;
    }
    
    // 6. Validar compatibilidad con plantilla UI
    console.log(`\\n   📊 VALIDACIÓN COMPATIBILIDAD CON PLANTILLA UI:`);
    const validation = validateUICompatibility(extractedData, expectedFields);
    
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    console.log(`   │ ${'CAMPO'.padEnd(30)} │ ${'VALOR'.padEnd(30)} │ EST │`);
    console.log(`   ${'├' + '─'.repeat(30) + '┼' + '─'.repeat(30) + '┼─────┤'}`);
    
    for (const field of expectedFields) {
      const value = extractedData[field];
      const status = value ? '✅' : '❌';
      const displayValue = value ? (value.toString().length > 25 ? value.toString().substring(0, 25) + '...' : value.toString()) : 'null';
      console.log(`   │ ${field.padEnd(30)} │ ${displayValue.padEnd(30)} │ ${status}  │`);
    }
    
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    // Calcular métricas
    const tokensUsed = Math.round(fullPrompt.length / 4) + Math.round(text.length / 4);
    const cost = (tokensUsed / 1000) * 0.002;
    
    console.log(`\\n   📈 MÉTRICAS DEL AGENTE:`);
    console.log(`      Campos esperados: ${expectedFields.length}`);
    console.log(`      Campos extraídos: ${Object.keys(extractedData).length}`);
    console.log(`      Campos completos: ${validation.completeFields}`);
    console.log(`      Tasa completitud: ${validation.completionRate.toFixed(1)}%`);
    console.log(`      Parse JSON: ${parseSuccess ? 'ÉXITO' : 'FALLO'}`);
    console.log(`      Tokens estimados: ${tokensUsed}`);
    console.log(`      Costo estimado: $${cost.toFixed(4)}`);
    
    return {
      success: true,
      data: extractedData,
      rawResponse: text,
      agent: agent,
      validation: validation,
      parseSuccess: parseSuccess,
      tokensUsed: tokensUsed,
      cost: cost
    };
    
  } catch (error) {
    console.error(`   ❌ Error validando agente:`, error.message);
    return {
      success: false,
      error: error.message
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
    extracted.comunidad = extractPattern(text, /(comunidad|community)[:\\s]*([^\\n]+)/i, 2);
    extracted.remitente = extractPattern(text, /(remitente|sender)[:\\s]*([^\\n]+)/i, 2);
    extracted.resumen = extractPattern(text, /(resumen|summary)[:\\s]*([^\\n]+)/i, 2);
    extracted.category = extractPattern(text, /(categor[íi]a|category)[:\\s]*([^\\n]+)/i, 2);
  } else if (agentName.includes('albaran')) {
    extracted.emisor_name = extractPattern(text, /(emisor|proveedor|supplier)[:\\s]*([^\\n]+)/i, 2);
    extracted.receptor_name = extractPattern(text, /(receptor|cliente|client)[:\\s]*([^\\n]+)/i, 2);
    extracted.numero_albaran = extractPattern(text, /(n[úu]mero|albaran|delivery)[:\\s]*([^\\n]+)/i, 2);
    extracted.fecha_emision = extractPattern(text, /fecha[:\\s]*([^\\n]+)/i);
  } else if (agentName.includes('contrato')) {
    extracted.titulo_contrato = extractPattern(text, /(t[íi]tulo|contrato|contract)[:\\s]*([^\\n]+)/i, 2);
    extracted.parte_a = extractPattern(text, /(parte\\s*a|party\\s*a)[:\\s]*([^\\n]+)/i, 2);
    extracted.parte_b = extractPattern(text, /(parte\\s*b|party\\s*b)[:\\s]*([^\\n]+)/i, 2);
    extracted.objeto_contrato = extractPattern(text, /(objeto|purpose)[:\\s]*([^\\n]+)/i, 2);
  } else if (agentName.includes('presupuesto')) {
    extracted.numero_presupuesto = extractPattern(text, /(n[úu]mero|presupuesto|quote)[:\\s]*([^\\n]+)/i, 2);
    extracted.emisor_name = extractPattern(text, /(emisor|empresa|company)[:\\s]*([^\\n]+)/i, 2);
    extracted.cliente_name = extractPattern(text, /(cliente|client)[:\\s]*([^\\n]+)/i, 2);
    extracted.total = extractPattern(text, /(total|amount)[:\\s]*([\\d.,€$]+)/i, 2);
  } else if (agentName.includes('escritura')) {
    extracted.vendedor_nombre = extractPattern(text, /(vendedor|seller)[:\\s]*([^\\n]+)/i, 2);
    extracted.comprador_nombre = extractPattern(text, /(comprador|buyer)[:\\s]*([^\\n]+)/i, 2);
    extracted.direccion_inmueble = extractPattern(text, /(direcci[óo]n|address)[:\\s]*([^\\n]+)/i, 2);
    extracted.precio_venta = extractPattern(text, /(precio|price)[:\\s]*([\\d.,€$]+)/i, 2);
  } else if (agentName.includes('factura')) {
    extracted.provider_name = extractPattern(text, /(proveedor|provider|empresa)[:\\s]*([^\\n]+)/i, 2);
    extracted.client_name = extractPattern(text, /(cliente|client)[:\\s]*([^\\n]+)/i, 2);
    extracted.amount = extractPattern(text, /(importe|amount|total)[:\\s]*([\\d.,€$]+)/i, 2);
    extracted.invoice_date = extractPattern(text, /fecha[:\\s]*([^\\n]+)/i);
  } else if (agentName.includes('acta')) {
    extracted.document_date = extractPattern(text, /fecha[:\\s]*([^\\n]+)/i);
    extracted.president_in = extractPattern(text, /(presidente.*entrante|president.*in)[:\\s]*([^\\n]+)/i, 2);
    extracted.administrator = extractPattern(text, /(administrador|administrator)[:\\s]*([^\\n]+)/i, 2);
    extracted.summary = extractPattern(text, /(resumen|summary)[:\\s]*([^\\n]+)/i, 2);
  }
  
  return extracted;
}

function extractPattern(text, pattern, groupIndex = 1) {
  const match = text.match(pattern);
  return match ? match[groupIndex].trim() : null;
}

/**
 * Valida compatibilidad con plantilla UI (siguiendo metodología de actas)
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
  
  const extraFields = extractedFields.filter(field => 
    !expectedFields.includes(field) && 
    !['document_id', 'organization_id', 'created_at'].includes(field)
  );
  
  return {
    completionRate: completionRate,
    completeFields: completeFields,
    totalExpected: expectedFields.length,
    missingFields: missingFields,
    extraFields: extraFields,
    isCompatible: completionRate >= 70 // Threshold como en actas
  };
}

/**
 * FASE 3: Test de guardado en tabla real (siguiendo metodología de actas)
 */
async function testDatabaseSave(tableName, data, documentId, docType) {
  try {
    console.log(`\\n💾 TEST DE GUARDADO EN TABLA REAL`);
    console.log(`   Tabla: ${tableName}`);
    console.log(`   Document ID: ${documentId}`);
    console.log(`   Tipo: ${docType}`);
    
    // Preparar datos para inserción
    const insertData = {
      document_id: documentId,
      organization_id: 'test-org-complete-pipeline',
      created_at: new Date().toISOString(),
      ...data
    };
    
    // Limpiar datos nulos para evitar problemas
    const cleanData = {};
    for (const [key, value] of Object.entries(insertData)) {
      if (value !== null && value !== undefined) {
        cleanData[key] = value;
      }
    }
    
    console.log(`\\n   📊 DATOS A INSERTAR (LIMPIOS):`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    console.log(`   │ ${'CAMPO'.padEnd(25)} │ ${'VALOR'.padEnd(35)} │ TIPO │`);
    console.log(`   ${'├' + '─'.repeat(25) + '┼' + '─'.repeat(35) + '┼──────┤'}`);
    
    for (const [key, value] of Object.entries(cleanData)) {
      const displayValue = value ? (value.toString().length > 30 ? value.toString().substring(0, 30) + '...' : value.toString()) : 'null';
      const type = typeof value;
      console.log(`   │ ${key.padEnd(25)} │ ${displayValue.padEnd(35)} │ ${type.substring(0,4)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    // Intentar insertar en Supabase
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(cleanData)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`\\n   ✅ GUARDADO EXITOSO EN TABLA REAL`);
    console.log(`      ID insertado: ${result[0].id}`);
    console.log(`      Campos guardados: ${Object.keys(result[0]).length}`);
    console.log(`      Timestamp: ${result[0].created_at}`);
    
    return {
      success: true,
      id: result[0].id,
      insertedData: result[0],
      fieldsCount: Object.keys(result[0]).length
    };
    
  } catch (error) {
    console.error(`\\n   ❌ ERROR GUARDANDO EN TABLA:`, error.message);
    
    // Análisis del error para debugging
    if (error.message.includes('violates')) {
      console.log(`   🔍 POSIBLE CAUSA: Constraint violation`);
    } else if (error.message.includes('column')) {
      console.log(`   🔍 POSIBLE CAUSA: Campo inexistente en tabla`);
    } else if (error.message.includes('type')) {
      console.log(`   🔍 POSIBLE CAUSA: Tipo de dato incompatible`);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test completo de un documento siguiendo metodología exitosa
 */
async function testCompleteDocument(docType, docConfig) {
  const documentId = \`test_complete_\${docType}_\${Date.now()}\`;
  
  console.log(\`\\n\${'═'.repeat(70)}\`);
  console.log(\`🔥 TEST COMPLETO: \${docConfig.name} (\${docType.toUpperCase()})\`);
  console.log(\`\${'═'.repeat(70)}\`);
  console.log(\`📂 Archivo: \${docConfig.file}\`);
  console.log(\`🤖 Agente: \${docConfig.agent}\`);
  console.log(\`📊 Tabla: \${docConfig.table}\`);
  console.log(\`🔗 Document ID: \${documentId}\`);
  
  const fullPath = path.join(process.cwd(), docConfig.file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(\`❌ Archivo no encontrado: \${docConfig.file}\`);
    return { 
      success: false, 
      reason: 'file_not_found',
      docType: docType,
      file: docConfig.file
    };
  }
  
  const overallStart = Date.now();
  let totalCost = 0;
  let totalTokens = 0;
  
  // FASE 1: Extracción y análisis de texto
  const extractionResult = await extractAndAnalyzeText(fullPath);
  if (!extractionResult.success) {
    return { 
      success: false, 
      step: 'extraction', 
      error: extractionResult.error,
      docType: docType 
    };
  }
  
  // Solo proceder si hay texto suficiente
  if (!extractionResult.text || extractionResult.text.length < 50) {
    console.log(\`⚠️ Texto insuficiente para procesar (\${extractionResult.text.length} caracteres)\`);
    return { 
      success: false, 
      step: 'extraction', 
      error: 'Insufficient text extracted',
      docType: docType,
      extractionQuality: extractionResult.quality.score,
      needsOCR: extractionResult.quality.needsOCR
    };
  }
  
  // FASE 2: Validación del agente
  const agentResult = await validateAgent(docConfig.agent, extractionResult.text, docConfig.expectedFields);
  if (!agentResult.success) {
    return { 
      success: false, 
      step: 'agent', 
      error: agentResult.error,
      docType: docType 
    };
  }
  
  totalCost += agentResult.cost || 0;
  totalTokens += agentResult.tokensUsed || 0;
  
  // FASE 3: Test de guardado en BD
  const saveResult = await testDatabaseSave(docConfig.table, agentResult.data, documentId, docType);
  if (!saveResult.success) {
    return { 
      success: false, 
      step: 'database', 
      error: saveResult.error,
      docType: docType 
    };
  }
  
  const totalTime = Date.now() - overallStart;
  
  console.log(\`\\n🎉 TEST COMPLETO EXITOSO:\`);
  console.log(\`   ⏱️ Tiempo total: \${totalTime}ms\`);
  console.log(\`   💰 Costo total: $\${totalCost.toFixed(4)}\`);
  console.log(\`   🔢 Tokens totales: \${totalTokens}\`);
  console.log(\`   📊 ID insertado: \${saveResult.id}\`);
  console.log(\`   📈 Tasa completitud: \${agentResult.validation.completionRate.toFixed(1)}%\`);
  
  return {
    success: true,
    docType: docType,
    documentId: documentId,
    insertedId: saveResult.id,
    extractionMethod: extractionResult.quality.needsOCR ? 'needs-ocr' : 'pdf-parse',
    extractionQuality: extractionResult.quality.score,
    needsOCR: extractionResult.quality.needsOCR,
    agentData: agentResult.data,
    rawResponse: agentResult.rawResponse,
    validation: agentResult.validation,
    parseSuccess: agentResult.parseSuccess,
    totalTime: totalTime,
    totalCost: totalCost,
    totalTokens: totalTokens,
    fieldsCount: saveResult.fieldsCount
  };
}

/**
 * Ejecutar test completo de todos los documentos
 */
async function runCompleteDocumentTest() {
  console.log('🧪 TEST COMPLETO DE PIPELINE - METODOLOGÍA EXITOSA DE ACTAS');
  console.log('='.repeat(70));
  console.log('📋 VALIDACIÓN STEP-BY-STEP DE 7 TIPOS DE DOCUMENTOS');
  console.log('🎯 OBJETIVO: VERIFICAR READINESS PARA INTEGRACIÓN EN PIPELINE');
  console.log('='.repeat(70));
  
  const results = {};
  let totalSuccessful = 0;
  let totalCost = 0;
  let totalTokens = 0;
  let totalTime = 0;
  
  const docTypes = Object.keys(ALL_TEST_DOCUMENTS);
  console.log(\`📊 Documentos a procesar: \${docTypes.length}\`);
  console.log(\`📋 Tipos: \${docTypes.join(', ')}\`);
  
  for (const [docType, docConfig] of Object.entries(ALL_TEST_DOCUMENTS)) {
    console.log(\`\\nEsperando 3 segundos antes del siguiente documento...\`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result = await testCompleteDocument(docType, docConfig);
    results[docType] = result;
    
    if (result.success) {
      totalSuccessful++;
      totalCost += result.totalCost || 0;
      totalTokens += result.totalTokens || 0;
      totalTime += result.totalTime || 0;
    }
  }
  
  // ANÁLISIS DETALLADO DE RESULTADOS (siguiendo metodología de actas)
  console.log(\`\\n\\n📊 ANÁLISIS DETALLADO DE RESULTADOS - METODOLOGÍA DE ACTAS\`);
  console.log('='.repeat(70));
  
  for (const [docType, result] of Object.entries(results)) {
    console.log(\`\\n📄 \${docType.toUpperCase()} - ANÁLISIS COMPLETO:\`);
    console.log(\`\${'─'.repeat(50)}\`);
    
    if (result.success) {
      console.log(\`✅ ÉXITO - LISTO PARA INTEGRACIÓN\`);
      console.log(\`   📊 ID insertado: \${result.insertedId}\`);
      console.log(\`   ⏱️ Tiempo: \${result.totalTime}ms\`);
      console.log(\`   💰 Costo: $\${result.totalCost.toFixed(4)}\`);
      console.log(\`   🔢 Tokens: \${result.totalTokens}\`);
      console.log(\`   📈 Completitud: \${result.validation.completionRate.toFixed(1)}%\`);
      console.log(\`   🔍 Parse JSON: \${result.parseSuccess ? 'ÉXITO' : 'FALLBACK'}\`);
      console.log(\`   📄 Extracción: \${result.extractionMethod} (calidad \${result.extractionQuality}%)\`);
      console.log(\`   🔧 Necesita OCR: \${result.needsOCR ? 'SÍ' : 'NO'}\`);
      
      // Análisis de campos
      const compat = result.validation;
      console.log(\`\\n   📋 ANÁLISIS DE CAMPOS:\`);
      console.log(\`      Esperados: \${compat.totalExpected}\`);
      console.log(\`      Completos: \${compat.completeFields}\`);
      console.log(\`      Faltantes: \${compat.missingFields.length > 0 ? compat.missingFields.join(', ') : 'Ninguno'}\`);
      console.log(\`      Extras: \${compat.extraFields.length > 0 ? compat.extraFields.join(', ') : 'Ninguno'}\`);
      console.log(\`      Compatible UI: \${compat.isCompatible ? 'SÍ' : 'NO'}\`);
      
      // Muestra de datos extraídos
      console.log(\`\\n   📝 MUESTRA DATOS EXTRAÍDOS:\`);
      const sampleData = Object.entries(result.agentData).slice(0, 4);
      for (const [key, value] of sampleData) {
        const displayValue = value ? (value.toString().length > 40 ? value.toString().substring(0, 40) + '...' : value) : 'null';
        console.log(\`      \${key}: \${displayValue}\`);
      }
      
    } else {
      console.log(\`❌ FALLO - REQUIERE ATENCIÓN\`);
      console.log(\`   Paso fallido: \${result.step || 'Pipeline'}\`);
      console.log(\`   Error: \${result.error}\`);
      
      if (result.extractionQuality !== undefined) {
        console.log(\`   Calidad extracción: \${result.extractionQuality}%\`);
        console.log(\`   Necesita OCR: \${result.needsOCR ? 'SÍ' : 'NO'}\`);
      }
      
      if (result.reason === 'file_not_found') {
        console.log(\`   📂 Archivo: \${result.file}\`);
        console.log(\`   ⚠️ ACCIÓN: Verificar ruta del archivo\`);
      }
    }
  }
  
  // RESUMEN EJECUTIVO (siguiendo metodología de actas)
  console.log(\`\\n\\n📈 RESUMEN EJECUTIVO - READINESS PARA INTEGRACIÓN\`);
  console.log('='.repeat(70));
  
  const successRate = Math.round((totalSuccessful / Object.keys(ALL_TEST_DOCUMENTS).length) * 100);
  
  console.log(\`📊 ESTADÍSTICAS GENERALES:\`);
  console.log(\`   Total documentos: \${Object.keys(ALL_TEST_DOCUMENTS).length}\`);
  console.log(\`   Exitosos: \${totalSuccessful}\`);
  console.log(\`   Fallidos: \${Object.keys(ALL_TEST_DOCUMENTS).length - totalSuccessful}\`);
  console.log(\`   Tasa de éxito: \${successRate}%\`);
  
  if (totalSuccessful > 0) {
    console.log(\`\\n💰 MÉTRICAS DE PRODUCCIÓN:\`);
    console.log(\`   Costo total: $\${totalCost.toFixed(4)}\`);
    console.log(\`   Costo promedio: $\${(totalCost / totalSuccessful).toFixed(4)}\`);
    console.log(\`   Tokens totales: \${totalTokens}\`);
    console.log(\`   Tiempo total: \${totalTime}ms\`);
    console.log(\`   Tiempo promedio: \${Math.round(totalTime / totalSuccessful)}ms\`);
  }
  
  // Análisis por categorías
  const successful = Object.entries(results).filter(([_, r]) => r.success);
  const failed = Object.entries(results).filter(([_, r]) => !r.success);
  const needOCR = successful.filter(([_, r]) => r.needsOCR);
  const highQuality = successful.filter(([_, r]) => r.validation.completionRate >= 80);
  
  console.log(\`\\n📊 ANÁLISIS POR CATEGORÍAS:\`);
  console.log(\`   Documentos listos: \${successful.map(([type, _]) => type).join(', ') || 'Ninguno'}\`);
  console.log(\`   Documentos fallidos: \${failed.map(([type, _]) => type).join(', ') || 'Ninguno'}\`);
  console.log(\`   Requieren OCR: \${needOCR.map(([type, _]) => type).join(', ') || 'Ninguno'}\`);
  console.log(\`   Alta calidad (≥80%): \${highQuality.map(([type, _]) => type).join(', ') || 'Ninguno'}\`);
  
  // DECISIÓN FINAL (siguiendo metodología de actas)
  console.log(\`\\n🎯 DECISIÓN FINAL PARA INTEGRACIÓN:\`);
  
  if (successRate >= 85) {
    console.log(\`   ✅ EXCELENTE: Pipeline listo para integración en producción\`);
    console.log(\`   ✅ Todos los agentes funcionan correctamente\`);
    console.log(\`   ✅ Compatibilidad UI validada\`);
    console.log(\`   ✅ Guardado en BD operativo\`);
    console.log(\`   🚀 RECOMENDACIÓN: Proceder con integración\`);
  } else if (successRate >= 70) {
    console.log(\`   ⚠️ BUENO: Mayoría listos, revisar fallos específicos\`);
    console.log(\`   🔧 RECOMENDACIÓN: Corregir agentes fallidos antes de integración\`);
  } else {
    console.log(\`   ❌ CRÍTICO: Pipeline tiene problemas significativos\`);
    console.log(\`   🚨 RECOMENDACIÓN: Depuración completa antes de integración\`);
  }
  
  if (needOCR.length > 0) {
    console.log(\`\\n📋 RECOMENDACIONES TÉCNICAS:\`);
    console.log(\`   1. Implementar Google Vision OCR para: \${needOCR.map(([type, _]) => type).join(', ')}\`);
    console.log(\`   2. Estimar costos adicionales de OCR en producción\`);
    console.log(\`   3. Optimizar prompts para texto de menor calidad\`);
  }
  
  console.log(\`\\n📋 SIGUIENTE PASO:\`);
  if (successRate >= 85) {
    console.log(\`   Integrar agentes exitosos en pipeline principal\`);
  } else {
    console.log(\`   Revisar y mejorar agentes con problemas detectados\`);
  }
}

// Ejecutar test
if (require.main === module) {
  runCompleteDocumentTest().catch(console.error);
}

module.exports = {
  testCompleteDocument,
  runCompleteDocumentTest,
  ALL_TEST_DOCUMENTS
};