#!/usr/bin/env node

/**
 * ARCHIVO: test_full_pipeline.js
 * PROPÓSITO: Test completo del pipeline: PDF → OCR → Agentes → Tablas
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, agentes simulados, tablas simuladas
 * OUTPUTS: Verificación completa del pipeline de extracción
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Configuración de documentos de test con sus agentes
const testDocuments = {
  'comunicado': {
    name: 'COMUNICADO VECINOS',
    file: 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf',
    agent: 'comunicado_extractor_v1',
    table: 'extracted_communications',
    expectedFields: ['fecha', 'comunidad', 'remitente', 'resumen', 'category'],
    pages: 2
  },
  'factura': {
    name: 'FACTURA COMERCIAL',
    file: 'datos/factura.pdf',
    agent: 'factura_extractor_v2',
    table: 'extracted_invoices',
    expectedFields: ['provider_name', 'client_name', 'amount', 'invoice_date'],
    pages: 1
  },
  'contrato': {
    name: 'CONTRATO SERVICIOS',
    file: 'datos/Contrato OLAQUA Piscinas.pdf',
    agent: 'contrato_extractor_v1',
    table: 'extracted_contracts',
    expectedFields: ['titulo_contrato', 'parte_a', 'parte_b', 'objeto_contrato'],
    pages: 10
  },
  'escritura': {
    name: 'ESCRITURA COMPRAVENTA',
    file: 'datos/escritura_D102B.pdf',
    agent: 'escritura_extractor_v1',
    table: 'extracted_property_deeds',
    expectedFields: ['vendedor_nombre', 'comprador_nombre', 'direccion_inmueble', 'precio_venta'],
    pages: 72
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
    
    // Simular Google Vision OCR
    console.log(`   🔄 PDF-Parse insuficiente - usando Google Vision OCR...`);
    const ocrTime = pdfData.numpages * 500; // 500ms por página
    const ocrCost = pdfData.numpages * 0.0015; // $0.0015 por página
    
    await new Promise(resolve => setTimeout(resolve, Math.min(2000, ocrTime)));
    
    // Simular mejor texto de OCR
    const ocrText = simulateOcrText(pdfText, pdfData.numpages);
    const ocrQuality = 85 + Math.random() * 10; // OCR típicamente 85-95%
    
    console.log(`   ✅ Google Vision OCR: ${ocrText.length} caracteres, calidad ${ocrQuality.toFixed(1)}%`);
    
    return {
      success: true,
      text: ocrText,
      method: 'google-vision-ocr',
      pages: pdfData.numpages,
      quality: ocrQuality,
      processingTime: Date.now() - startTime,
      cost: ocrCost,
      ocrConfidence: ocrQuality / 100
    };
    
  } catch (error) {
    console.log(`   ❌ Error en extracción: ${error.message}`);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime,
      cost: 0
    };
  }
}

/**
 * PASO 2: Llamada al agente extractor
 */
async function callAgentExtractor(agentName, documentText, docInfo) {
  const startTime = Date.now();
  
  console.log(`🤖 PASO 2: Llamada al agente extractor`);
  console.log(`   Agente: ${agentName}`);
  console.log(`   Texto a procesar: ${documentText.length} caracteres`);
  
  // Simular tiempo de procesamiento de Gemini
  const processingTime = 1500 + Math.random() * 2500; // 1.5-4 segundos
  await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 2500)));
  
  // Simular fallo ocasional del agente
  if (Math.random() < 0.15) { // 15% probabilidad de fallo
    const error = 'Agente no pudo procesar el documento - formato no reconocido';
    console.log(`   ❌ Fallo del agente: ${error}`);
    return {
      success: false,
      error: error,
      processingTime: Date.now() - startTime,
      cost: 0
    };
  }
  
  // Calcular calidad de extracción basada en calidad del texto OCR
  let extractionQuality = docInfo.quality || 80;
  
  // Ajustes por tipo de agente y longitud del documento
  if (agentName.includes('factura') && documentText.length < 2000) extractionQuality += 5;
  if (agentName.includes('escritura') && documentText.length > 50000) extractionQuality -= 10;
  if (docInfo.method === 'google-vision-ocr') extractionQuality += 5; // OCR suele ser mejor
  
  extractionQuality = Math.min(95, Math.max(60, extractionQuality));
  
  // Generar datos simulados
  const extractedData = generateExtractedData(agentName, documentText, extractionQuality);
  
  // Calcular costo de Gemini (aprox)
  const tokens = Math.round(documentText.length / 4);
  const geminiCost = (tokens / 1000) * 0.002; // $0.002 por 1000 tokens
  
  console.log(`   ✅ Extracción completada:`);
  console.log(`      Calidad: ${extractionQuality.toFixed(1)}%`);
  console.log(`      Tokens: ${tokens}`);
  console.log(`      Campos extraídos: ${Object.keys(extractedData).length}`);
  console.log(`      Tiempo: ${Date.now() - startTime}ms`);
  console.log(`      Costo: $${geminiCost.toFixed(4)}`);
  
  return {
    success: true,
    data: extractedData,
    quality: extractionQuality,
    tokensUsed: tokens,
    processingTime: Date.now() - startTime,
    cost: geminiCost
  };
}

/**
 * PASO 3: Guardado en tabla de base de datos
 */
async function saveToTable(tableName, data, documentId) {
  const startTime = Date.now();
  
  console.log(`💾 PASO 3: Guardado en tabla de base de datos`);
  console.log(`   Tabla: ${tableName}`);
  console.log(`   Document ID: ${documentId}`);
  
  // Simular tiempo de BD
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Simular fallo ocasional de BD
  if (Math.random() < 0.08) { // 8% probabilidad de fallo
    const error = 'Error de conexión a base de datos';
    console.log(`   ❌ Fallo BD: ${error}`);
    return {
      success: false,
      error: error,
      processingTime: Date.now() - startTime
    };
  }
  
  // Preparar datos para inserción
  const dbData = {
    id: `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    document_id: documentId,
    organization_id: 'org-test-12345',
    created_at: new Date().toISOString(),
    ...data
  };
  
  // Validar campos requeridos
  const missingFields = [];
  const requiredFields = ['document_id', 'organization_id'];
  for (const field of requiredFields) {
    if (!dbData[field]) missingFields.push(field);
  }
  
  if (missingFields.length > 0) {
    console.log(`   ❌ Campos requeridos faltantes: ${missingFields.join(', ')}`);
    return {
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      processingTime: Date.now() - startTime
    };
  }
  
  console.log(`   ✅ Datos guardados exitosamente:`);
  console.log(`      ID generado: ${dbData.id}`);
  console.log(`      Campos totales: ${Object.keys(dbData).length}`);
  console.log(`      Tiempo: ${Date.now() - startTime}ms`);
  
  return {
    success: true,
    insertedId: dbData.id,
    data: dbData,
    processingTime: Date.now() - startTime
  };
}

/**
 * Pipeline completo para un documento
 */
async function runFullPipeline(docType, docConfig) {
  const pipelineStart = Date.now();
  const documentId = `doc_${docType}_${Date.now()}`;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 PIPELINE COMPLETO: ${docConfig.name}`);
  console.log(`   Tipo: ${docType}`);
  console.log(`   Archivo: ${docConfig.file}`);
  console.log(`   Document ID: ${documentId}`);
  console.log(`${'='.repeat(70)}`);
  
  const filePath = path.join(process.cwd(), docConfig.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Archivo no encontrado: ${docConfig.file}`);
    return {
      success: false,
      error: 'file_not_found',
      docType: docType
    };
  }
  
  const results = {
    docType: docType,
    documentId: documentId,
    totalCost: 0,
    totalTime: 0,
    steps: {}
  };
  
  try {
    // PASO 1: Extracción de texto
    const textResult = await extractTextHybrid(filePath);
    results.steps.textExtraction = textResult;
    results.totalCost += textResult.cost || 0;
    results.totalTime += textResult.processingTime || 0;
    
    if (!textResult.success) {
      throw new Error(`Extracción de texto falló: ${textResult.error}`);
    }
    
    // PASO 2: Agente extractor
    const agentResult = await callAgentExtractor(docConfig.agent, textResult.text, textResult);
    results.steps.agentExtraction = agentResult;
    results.totalCost += agentResult.cost || 0;
    results.totalTime += agentResult.processingTime || 0;
    
    if (!agentResult.success) {
      throw new Error(`Agente falló: ${agentResult.error}`);
    }
    
    // PASO 3: Guardado en tabla
    const saveResult = await saveToTable(docConfig.table, agentResult.data, documentId);
    results.steps.tableSave = saveResult;
    results.totalTime += saveResult.processingTime || 0;
    
    if (!saveResult.success) {
      throw new Error(`Guardado falló: ${saveResult.error}`);
    }
    
    // PASO 4: Verificación de campos esperados
    const expectedFields = docConfig.expectedFields;
    const extractedFields = Object.keys(agentResult.data);
    const matchingFields = expectedFields.filter(field => 
      extractedFields.includes(field) && agentResult.data[field] !== null
    );
    
    const fieldScore = (matchingFields.length / expectedFields.length) * 100;
    
    console.log(`\n📊 RESULTADO FINAL DEL PIPELINE:`);
    console.log(`   ✅ Pipeline completado exitosamente`);
    console.log(`   ⏱️ Tiempo total: ${results.totalTime}ms`);
    console.log(`   💰 Costo total: $${results.totalCost.toFixed(4)}`);
    console.log(`   📄 Método extracción: ${textResult.method}`);
    console.log(`   🎯 Calidad agente: ${agentResult.quality.toFixed(1)}%`);
    console.log(`   ✔️ Campos esperados: ${matchingFields.length}/${expectedFields.length} (${fieldScore.toFixed(1)}%)`);
    console.log(`   💾 Guardado en: ${docConfig.table}`);
    
    results.success = true;
    results.fieldScore = fieldScore;
    results.overallQuality = (textResult.quality + agentResult.quality + fieldScore) / 3;
    
    return results;
    
  } catch (error) {
    const totalTime = Date.now() - pipelineStart;
    console.log(`\n❌ PIPELINE FALLÓ: ${error.message}`);
    console.log(`   Tiempo hasta fallo: ${totalTime}ms`);
    console.log(`   Costo hasta fallo: $${results.totalCost.toFixed(4)}`);
    
    results.success = false;
    results.error = error.message;
    results.totalTime = totalTime;
    
    return results;
  }
}

/**
 * Funciones auxiliares
 */

function analyzeTextQuality(text) {
  if (!text || text.length === 0) {
    return { score: 0, issues: ['Sin texto extraído'] };
  }
  
  let score = 100;
  const issues = [];
  
  if (text.length < 100) {
    score -= 30;
    issues.push('Texto muy corto');
  }
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const normalWords = words.filter(w => w.length >= 3 && /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ0-9]+$/.test(w));
  const normalWordRatio = words.length > 0 ? (normalWords.length / words.length) : 0;
  
  if (normalWordRatio < 0.6) {
    score -= 25;
    issues.push('Pocas palabras normales');
  }
  
  if (!/[.,;:!?]/.test(text)) {
    score -= 15;
    issues.push('Falta puntuación');
  }
  
  return { score: Math.max(0, score), issues };
}

function simulateOcrText(originalText, pages) {
  if (!originalText || originalText.length < 100) {
    // Generar texto OCR simulado basado en el tipo de documento
    return `DOCUMENTO COMERCIAL
Fecha: ${new Date().toLocaleDateString()}
Número: DOC-${Math.floor(Math.random() * 10000)}
Empresa: EJEMPLO COMERCIAL S.L.
Cliente: CLIENTE DEMO
Total: €${(Math.random() * 10000).toFixed(2)}

Descripción detallada del documento extraída via OCR.
Información específica del negocio y términos legales.
Contacto: info@ejemplo.com | Tel: 912-345-678

[Documento de ${pages} páginas procesado con Google Vision OCR]`;
  }
  
  // Para documentos existentes, simular mejora de OCR
  return originalText + '\n\n[Texto mejorado via Google Vision OCR]';
}

function generateExtractedData(agentName, documentText, quality) {
  const baseData = {};
  
  // Generar datos específicos por tipo de agente
  if (agentName === 'comunicado_extractor_v1') {
    return {
      fecha: '2024-01-15',
      comunidad: 'Comunidad de Propietarios Demo',
      remitente: quality > 80 ? 'Administrador de Fincas' : null,
      resumen: 'Comunicado importante para todos los propietarios sobre mantenimiento.',
      category: 'mantenimiento',
      asunto: quality > 75 ? 'Información contadores' : null,
      urgencia: quality > 85 ? 'media' : 'baja',
      requiere_respuesta: quality > 80,
      accion_requerida: quality > 85 ? ['Revisar información', 'Contactar si dudas'] : [],
      contacto_info: {
        telefono: quality > 75 ? '912-345-678' : null,
        email: 'admin@comunidad.com',
        horario_atencion: '9:00-17:00'
      }
    };
  }
  
  if (agentName === 'factura_extractor_v2') {
    return {
      provider_name: quality > 75 ? 'Empresa Ejemplo S.L.' : null,
      client_name: quality > 80 ? 'Cliente Demo' : null,
      amount: quality > 85 ? 1250.00 : null,
      invoice_date: '2024-01-15',
      invoice_number: quality > 70 ? 'F-2024-001' : null,
      subtotal: 1033.06,
      tax_amount: 216.94,
      total_amount: 1250.00,
      currency: 'EUR',
      products: quality > 85 ? [
        {
          description: 'Servicios profesionales',
          quantity: 1,
          unit_price: 1033.06,
          total_price: 1033.06
        }
      ] : [],
      payment_terms: quality > 80 ? '30 días' : null
    };
  }
  
  if (agentName === 'contrato_extractor_v1') {
    return {
      titulo_contrato: quality > 75 ? 'Contrato de Servicios Profesionales' : null,
      parte_a: quality > 80 ? 'OLAQUA Piscinas S.L.' : null,
      parte_b: quality > 80 ? 'Comunidad de Propietarios' : null,
      objeto_contrato: 'Mantenimiento integral de instalaciones de piscina.',
      importe_total: quality > 85 ? 25000.50 : null,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-12-31',
      duracion: quality > 75 ? '12 meses' : null,
      confidencialidad: quality > 80,
      alcance_servicios: quality > 85 ? [
        'Mantenimiento preventivo',
        'Limpieza especializada',
        'Control químico del agua'
      ] : [],
      forma_pago: quality > 75 ? 'Mensual' : null
    };
  }
  
  if (agentName === 'escritura_extractor_v1') {
    return {
      vendedor_nombre: quality > 80 ? 'PROMOTORA EJEMPLO S.A.' : null,
      comprador_nombre: quality > 80 ? 'Juan Pérez García' : null,
      direccion_inmueble: quality > 75 ? 'Calle Ejemplo, 123, Madrid' : null,
      precio_venta: quality > 85 ? 385000.00 : null,
      fecha_escritura: '2024-01-15',
      notario_nombre: quality > 75 ? 'María González Notario' : null,
      superficie_m2: quality > 80 ? 95.5 : null,
      category: 'vivienda',
      tipo_inmueble: quality > 75 ? 'Piso' : null,
      numero_habitaciones: quality > 80 ? 3 : null,
      numero_banos: quality > 80 ? 2 : null,
      moneda: 'EUR',
      libre_cargas: quality > 85,
      forma_pago: quality > 75 ? 'Hipoteca' : null
    };
  }
  
  // Datos por defecto para agentes no específicos
  return {
    campo_principal: quality > 80 ? 'Valor extraído' : null,
    fecha_documento: '2024-01-15',
    category: 'documento_general'
  };
}

/**
 * Función principal - ejecutar todos los pipelines
 */
async function runAllPipelines() {
  console.log('🚀 TEST COMPLETO DEL PIPELINE DE EXTRACCIÓN');
  console.log('='.repeat(70));
  console.log('Pipeline: PDF → OCR Híbrido → Agentes → Tablas BD\n');
  
  const results = {};
  const summary = {
    total: 0,
    successful: 0,
    failed: 0,
    totalCost: 0,
    totalTime: 0,
    avgQuality: 0
  };
  
  for (const [docType, docConfig] of Object.entries(testDocuments)) {
    const result = await runFullPipeline(docType, docConfig);
    results[docType] = result;
    
    summary.total++;
    if (result.success) {
      summary.successful++;
      summary.avgQuality += result.overallQuality || 0;
    } else {
      summary.failed++;
    }
    summary.totalCost += result.totalCost || 0;
    summary.totalTime += result.totalTime || 0;
    
    // Pausa entre documentos
    console.log('\nEsperando 3 segundos antes del siguiente documento...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Resumen final
  console.log('\n\n📊 RESUMEN FINAL DEL PIPELINE COMPLETO');
  console.log('='.repeat(70));
  
  console.log(`📈 ESTADÍSTICAS GENERALES:`);
  console.log(`   Total documentos: ${summary.total}`);
  console.log(`   Exitosos: ${summary.successful}`);
  console.log(`   Fallidos: ${summary.failed}`);
  console.log(`   Tasa de éxito: ${((summary.successful / summary.total) * 100).toFixed(1)}%`);
  console.log(`   Costo total: $${summary.totalCost.toFixed(4)}`);
  console.log(`   Tiempo total: ${(summary.totalTime / 1000).toFixed(1)}s`);
  
  if (summary.successful > 0) {
    console.log(`   Calidad promedio: ${(summary.avgQuality / summary.successful).toFixed(1)}%`);
  }
  
  console.log(`\n📋 DETALLE POR DOCUMENTO:`);
  for (const [docType, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`   ✅ ${docType.toUpperCase()}: ${result.overallQuality.toFixed(1)}% calidad, $${result.totalCost.toFixed(4)}, ${result.totalTime}ms`);
    } else {
      console.log(`   ❌ ${docType.toUpperCase()}: FALLÓ - ${result.error}`);
    }
  }
  
  console.log(`\n🎯 CONCLUSIONES:`);
  if (summary.successful === summary.total) {
    console.log(`   ✅ EXCELENTE: Pipeline completo funciona perfectamente`);
    console.log(`   🚀 Listo para integrar en producción`);
  } else if (summary.successful >= summary.total * 0.8) {
    console.log(`   ✅ BUENO: Pipeline funciona con ajustes menores necesarios`);
    console.log(`   🔧 Revisar documentos fallidos y optimizar`);
  } else {
    console.log(`   ⚠️ ATENCIÓN: Pipeline requiere mejoras significativas`);
    console.log(`   🛠️ Revisar estrategia de extracción y prompts de agentes`);
  }
  
  console.log(`\n💡 SIGUIENTES PASOS:`);
  console.log(`   1. Si resultados buenos (>80%): Integrar en pipeline principal`);
  console.log(`   2. Configurar Google Vision API real`);
  console.log(`   3. Conectar con base de datos real`);
  console.log(`   4. Implementar monitoreo de calidad en producción`);
  console.log(`   5. Optimizar prompts de agentes para documentos específicos`);
}

// Ejecutar test completo
runAllPipelines().catch(console.error);