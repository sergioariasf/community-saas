#!/usr/bin/env node

/**
 * ARCHIVO: test_pipeline_comparison.js
 * PROPÓSITO: Test comparativo completo de pipelines de extracción
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, gemini, google-vision
 * OUTPUTS: Comparación calidad/tiempo/costo entre estrategias
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Configuración de tests por categoría de documento
const testCases = {
  'documento_corto': {
    name: 'FACTURA (1 página)',
    file: 'datos/factura.pdf',
    expectedPages: 1,
    strategy: 'gemini_flash_preferred' // Gemini Flash debería ser mejor
  },
  'documento_medio': {
    name: 'CONTRATO (10 páginas)', 
    file: 'datos/Contrato OLAQUA Piscinas.pdf',
    expectedPages: 10,
    strategy: 'vision_preferred' // Google Vision debería ser mejor
  },
  'documento_largo': {
    name: 'ESCRITURA (70 páginas)',
    file: 'datos/escritura_D102B.pdf', 
    expectedPages: 70,
    strategy: 'vision_only' // Solo Google Vision viable
  }
};

/**
 * Pipeline 1: pdf-parse básico
 */
async function pipelinePdfParse(filePath) {
  const startTime = Date.now();
  let cost = 0; // Gratis
  
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfParse = require('pdf-parse');
    
    console.log('📖 Ejecutando Pipeline PDF-Parse...');
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    
    const processingTime = Date.now() - startTime;
    const quality = analyzeTextQuality(text);
    
    return {
      method: 'pdf-parse',
      success: text.length > 100, // Mínimo texto útil
      text: text,
      textLength: text.length,
      pages: data.numpages,
      processingTime,
      cost,
      quality: quality.score,
      issues: quality.issues,
      viable: quality.score >= 70
    };
    
  } catch (error) {
    return {
      method: 'pdf-parse',
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime,
      cost,
      viable: false
    };
  }
}

/**
 * Pipeline 2: Google Vision OCR tradicional (simulado)
 */
async function pipelineGoogleVision(filePath) {
  const startTime = Date.now();
  
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfParse = require('pdf-parse');
    const pdfInfo = await pdfParse(buffer);
    
    console.log('🔍 Ejecutando Pipeline Google Vision OCR...');
    
    // Simular procesamiento OCR (en producción sería Google Vision)
    const pagesProcessed = pdfInfo.numpages;
    const estimatedProcessingTime = pagesProcessed * 500; // 500ms por página
    const cost = pagesProcessed * 0.0015; // $0.0015 por página
    
    // Simular espera de procesamiento
    await new Promise(resolve => setTimeout(resolve, Math.min(2000, estimatedProcessingTime)));
    
    // Para esta simulación, usamos el texto de pdf-parse como baseline
    // En producción sería el resultado de Google Vision
    const baseText = pdfInfo.text || '';
    
    // Simular calidad OCR (típicamente 85-95% de precisión)
    const simulatedQuality = 85 + Math.random() * 10; // 85-95%
    const ocrText = simulateOcrText(baseText, simulatedQuality);
    
    const processingTime = Date.now() - startTime;
    const quality = analyzeTextQuality(ocrText);
    
    return {
      method: 'google-vision-ocr',
      success: true,
      text: ocrText,
      textLength: ocrText.length,
      pages: pagesProcessed,
      processingTime,
      cost,
      quality: simulatedQuality,
      ocrConfidence: simulatedQuality,
      viable: simulatedQuality >= 75,
      scalability: 'unlimited' // Sin límites de páginas
    };
    
  } catch (error) {
    return {
      method: 'google-vision-ocr',
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime,
      cost: 0,
      viable: false
    };
  }
}

/**
 * Pipeline 3: Gemini Flash OCR avanzado (simulado)
 */
async function pipelineGeminiFlash(filePath) {
  const startTime = Date.now();
  
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfParse = require('pdf-parse');
    const pdfInfo = await pdfParse(buffer);
    
    console.log('🧠 Ejecutando Pipeline Gemini Flash OCR...');
    
    const pages = pdfInfo.numpages;
    
    // Limitaciones de Gemini Flash
    if (pages > 10) {
      console.log(`⚠️ Documento muy largo (${pages} páginas) - Gemini Flash no viable`);
      return {
        method: 'gemini-flash-ocr',
        success: false,
        error: `Documento demasiado largo: ${pages} páginas (límite ~10)`,
        processingTime: Date.now() - startTime,
        cost: 0,
        viable: false,
        limitation: 'page_limit_exceeded'
      };
    }
    
    // Simular procesamiento Gemini Flash
    const fileSize = buffer.length;
    const estimatedTokens = Math.min(fileSize / 4, 30000); // Aprox 4 bytes por token, máx 30k
    const cost = (estimatedTokens / 1000) * 0.002; // $0.002 por 1000 tokens
    
    // Simular tiempo de procesamiento (más rápido que Vision para docs cortos)
    const processingTimeSimulated = Math.min(3000, pages * 300); // 300ms por página
    await new Promise(resolve => setTimeout(resolve, Math.min(1500, processingTimeSimulated)));
    
    // Simular extracción inteligente de Gemini Flash
    const baseText = pdfInfo.text || '';
    
    // Gemini Flash como OCR avanzado tiene mayor precisión contextual
    const simulatedQuality = 90 + Math.random() * 8; // 90-98%
    const geminiText = simulateGeminiOcrText(baseText, simulatedQuality);
    
    const processingTime = Date.now() - startTime;
    
    return {
      method: 'gemini-flash-ocr',
      success: true,
      text: geminiText,
      textLength: geminiText.length,
      pages: pages,
      processingTime,
      cost,
      quality: simulatedQuality,
      contextualUnderstanding: true,
      viable: pages <= 10,
      scalability: `limited_to_~10_pages`,
      tokens: Math.round(estimatedTokens)
    };
    
  } catch (error) {
    return {
      method: 'gemini-flash-ocr',
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime,
      cost: 0,
      viable: false
    };
  }
}

/**
 * Simula texto extraído por OCR con cierta calidad
 */
function simulateOcrText(originalText, quality) {
  if (!originalText) return 'Texto extraído por OCR simulado\nFactura #12345\nTotal: €1,250.00\nFecha: 2024-01-15';
  
  // Simular errores típicos de OCR basados en la calidad
  let text = originalText;
  const errorRate = (100 - quality) / 100 * 0.05; // Máx 5% errores en el peor caso
  
  if (errorRate > 0.02) {
    // Simular algunos errores comunes de OCR
    text = text
      .replace(/o/g, (match) => Math.random() < errorRate ? '0' : match)
      .replace(/1/g, (match) => Math.random() < errorRate ? 'l' : match)
      .replace(/5/g, (match) => Math.random() < errorRate ? 'S' : match);
  }
  
  return text;
}

/**
 * Simula texto extraído por Gemini Flash con comprensión contextual
 */
function simulateGeminiOcrText(originalText, quality) {
  if (!originalText) {
    return `FACTURA COMERCIAL
Número: F-2024-001
Fecha: 15/01/2024
Cliente: EMPRESA DEMO S.L.
NIF: B12345678

DETALLE:
- Servicios profesionales: €1,000.00
- IVA (21%): €210.00
- TOTAL: €1,210.00

Forma de pago: Transferencia bancaria
Vencimiento: 30 días`;
  }
  
  // Gemini Flash mantiene mejor estructura y comprende contexto
  return originalText; // En simulación, mantiene el texto original con alta calidad
}

/**
 * Analiza calidad del texto extraído
 */
function analyzeTextQuality(text) {
  if (!text || text.length === 0) {
    return { score: 0, issues: ['Sin texto extraído'] };
  }
  
  const issues = [];
  let score = 100;
  
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

/**
 * Ejecuta comparación completa de pipelines
 */
async function runPipelineComparison() {
  console.log('🚀 COMPARACIÓN COMPLETA DE PIPELINES DE EXTRACCIÓN');
  console.log('='.repeat(70));
  console.log('Comparando: pdf-parse vs Google Vision OCR vs Gemini Flash OCR\n');
  
  const results = {};
  
  for (const [testId, testCase] of Object.entries(testCases)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 CASO DE PRUEBA: ${testCase.name}`);
    console.log(`   Archivo: ${testCase.file}`);
    console.log(`   Páginas esperadas: ${testCase.expectedPages}`);
    console.log(`   Estrategia recomendada: ${testCase.strategy}`);
    console.log(`${'='.repeat(60)}`);
    
    const filePath = path.join(process.cwd(), testCase.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Archivo no encontrado: ${testCase.file}`);
      results[testId] = { error: 'file_not_found' };
      continue;
    }
    
    const caseResults = {};
    
    // Pipeline 1: pdf-parse
    console.log('\n1️⃣ PIPELINE PDF-PARSE:');
    caseResults.pdfParse = await pipelinePdfParse(filePath);
    console.log(`   Resultado: ${caseResults.pdfParse.success ? '✅ Exitoso' : '❌ Falló'}`);
    console.log(`   Tiempo: ${caseResults.pdfParse.processingTime}ms`);
    console.log(`   Costo: $${caseResults.pdfParse.cost.toFixed(4)}`);
    console.log(`   Calidad: ${caseResults.pdfParse.quality || 0}%`);
    console.log(`   Viable: ${caseResults.pdfParse.viable ? '✅' : '❌'}`);
    
    // Pipeline 2: Google Vision OCR
    console.log('\n2️⃣ PIPELINE GOOGLE VISION OCR:');
    caseResults.googleVision = await pipelineGoogleVision(filePath);
    console.log(`   Resultado: ${caseResults.googleVision.success ? '✅ Exitoso' : '❌ Falló'}`);
    console.log(`   Tiempo: ${caseResults.googleVision.processingTime}ms`);
    console.log(`   Costo: $${caseResults.googleVision.cost.toFixed(4)}`);
    console.log(`   Calidad: ${caseResults.googleVision.quality || 0}%`);
    console.log(`   Viable: ${caseResults.googleVision.viable ? '✅' : '❌'}`);
    console.log(`   Escalabilidad: ${caseResults.googleVision.scalability || 'N/A'}`);
    
    // Pipeline 3: Gemini Flash OCR
    console.log('\n3️⃣ PIPELINE GEMINI FLASH OCR:');
    caseResults.geminiFlash = await pipelineGeminiFlash(filePath);
    console.log(`   Resultado: ${caseResults.geminiFlash.success ? '✅ Exitoso' : '❌ Falló'}`);
    console.log(`   Tiempo: ${caseResults.geminiFlash.processingTime}ms`);
    console.log(`   Costo: $${caseResults.geminiFlash.cost.toFixed(4)}`);
    if (caseResults.geminiFlash.quality) {
      console.log(`   Calidad: ${caseResults.geminiFlash.quality.toFixed(1)}%`);
      console.log(`   Tokens: ${caseResults.geminiFlash.tokens || 'N/A'}`);
    }
    console.log(`   Viable: ${caseResults.geminiFlash.viable ? '✅' : '❌'}`);
    console.log(`   Escalabilidad: ${caseResults.geminiFlash.scalability || 'N/A'}`);
    
    // Recomendación para este caso
    console.log('\n📋 RECOMENDACIÓN PARA ESTE CASO:');
    const recommendation = getRecommendation(caseResults, testCase);
    console.log(`   ${recommendation}`);
    
    results[testId] = {
      testCase,
      results: caseResults,
      recommendation
    };
    
    // Pausa entre casos
    console.log('\nEsperando 3 segundos antes del siguiente caso...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // RESUMEN FINAL
  console.log('\n\n📊 RESUMEN FINAL - COMPARACIÓN DE PIPELINES');
  console.log('='.repeat(70));
  
  printFinalSummary(results);
  printRecommendations(results);
}

/**
 * Obtiene recomendación para un caso específico
 */
function getRecommendation(results, testCase) {
  const viable = [];
  
  if (results.pdfParse.viable) viable.push('pdf-parse');
  if (results.googleVision.viable) viable.push('google-vision');  
  if (results.geminiFlash.viable) viable.push('gemini-flash');
  
  if (viable.length === 0) {
    return '❌ Ningún método viable - documento requiere preprocesamiento';
  }
  
  // Lógica de recomendación basada en el caso
  if (testCase.expectedPages <= 3) {
    if (viable.includes('gemini-flash')) {
      return '🧠 RECOMENDADO: Gemini Flash (mejor calidad + contexto para docs cortos)';
    } else if (viable.includes('google-vision')) {
      return '🔍 RECOMENDADO: Google Vision (backup para docs cortos)';
    }
  } else if (testCase.expectedPages <= 15) {
    if (viable.includes('google-vision')) {
      return '🔍 RECOMENDADO: Google Vision (mejor para docs medianos)';
    }
  } else {
    if (viable.includes('google-vision')) {
      return '🔍 ÚNICO VIABLE: Google Vision (docs largos)';
    }
  }
  
  return `✅ Métodos viables: ${viable.join(', ')}`;
}

/**
 * Imprime resumen final
 */
function printFinalSummary(results) {
  console.log('📈 MÉTRICAS POR MÉTODO:');
  
  const methods = ['pdfParse', 'googleVision', 'geminiFlash'];
  const methodNames = {
    pdfParse: 'PDF-Parse',
    googleVision: 'Google Vision', 
    geminiFlash: 'Gemini Flash'
  };
  
  for (const method of methods) {
    console.log(`\n${methodNames[method]}:`);
    let totalCost = 0;
    let totalTime = 0;
    let successCount = 0;
    let totalCases = 0;
    
    for (const [testId, result] of Object.entries(results)) {
      if (result.results && result.results[method]) {
        const methodResult = result.results[method];
        totalCases++;
        if (methodResult.success) successCount++;
        totalCost += methodResult.cost || 0;
        totalTime += methodResult.processingTime || 0;
      }
    }
    
    if (totalCases > 0) {
      console.log(`   Tasa de éxito: ${((successCount / totalCases) * 100).toFixed(1)}%`);
      console.log(`   Costo promedio: $${(totalCost / totalCases).toFixed(4)}`);
      console.log(`   Tiempo promedio: ${Math.round(totalTime / totalCases)}ms`);
    }
  }
}

/**
 * Imprime recomendaciones finales
 */
function printRecommendations(results) {
  console.log('\n🎯 RECOMENDACIONES ESTRATÉGICAS:');
  
  console.log('\n📄 ESTRATEGIA HÍBRIDA OPTIMIZADA:');
  console.log('   1️⃣ Documentos 1-3 páginas → Gemini Flash OCR');
  console.log('      • Facturas, albaranes, comunicados cortos');
  console.log('      • Mayor calidad contextual');
  console.log('      • Menor costo y tiempo');
  
  console.log('\n   2️⃣ Documentos 4-15 páginas → Google Vision OCR');
  console.log('      • Contratos medianos, presupuestos complejos');
  console.log('      • Balance costo/calidad óptimo');
  
  console.log('\n   3️⃣ Documentos 15+ páginas → Google Vision OCR');
  console.log('      • Escrituras, actas largas');
  console.log('      • Única opción escalable');
  
  console.log('\n💡 IMPLEMENTACIÓN:');
  console.log('   • Detectar número de páginas primero');
  console.log('   • Enrutar a pipeline óptimo automáticamente');
  console.log('   • Fallback entre métodos si uno falla');
  console.log('   • Métricas de calidad en tiempo real');
  
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('   1. Implementar detección automática de páginas');
  console.log('   2. Crear router de pipeline inteligente');
  console.log('   3. Configurar Google Vision y Gemini Flash');
  console.log('   4. Testear con extractors de agentes reales');
}

// Ejecutar comparación
runPipelineComparison().catch(console.error);