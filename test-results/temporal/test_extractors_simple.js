#!/usr/bin/env node

/**
 * ARCHIVO: test_extractors_simple.js
 * PROPÓSITO: Test simplificado de extracción de texto para validar calidad OCR
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, fs
 * OUTPUTS: Análisis de calidad de extracción de PDFs reales
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Configuración de archivos de test con sus agentes correspondientes
const testFiles = {
  'comunicado': {
    file: 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf',
    agent: 'comunicado_extractor_v1',
    table: 'extracted_communications',
    expectedFields: ['fecha', 'comunidad', 'remitente', 'resumen', 'category']
  },
  'albaran': {
    file: 'datos/albaran.pdf',
    agent: 'albaran_extractor_v1', 
    table: 'extracted_delivery_notes',
    expectedFields: ['emisor_name', 'receptor_name', 'numero_albaran', 'fecha_emision']
  },
  'contrato': {
    file: 'datos/Contrato OLAQUA Piscinas.pdf',
    agent: 'contrato_extractor_v1',
    table: 'extracted_contracts', 
    expectedFields: ['titulo_contrato', 'parte_a', 'parte_b', 'objeto_contrato']
  },
  'presupuesto': {
    file: 'datos/presupuesto.pdf',
    agent: 'presupuesto_extractor_v1',
    table: 'extracted_budgets',
    expectedFields: ['numero_presupuesto', 'emisor_name', 'cliente_name', 'total']
  },
  'escritura': {
    file: 'datos/escritura_D102B.pdf',
    agent: 'escritura_extractor_v1',
    table: 'extracted_property_deeds',
    expectedFields: ['vendedor_nombre', 'comprador_nombre', 'direccion_inmueble', 'precio_venta']
  },
  'factura': {
    file: 'datos/factura.pdf',
    agent: 'factura_extractor_v2',
    table: 'extracted_invoices',
    expectedFields: ['provider_name', 'client_name', 'amount', 'invoice_date']
  },
  'acta': {
    file: 'datos/ACTA 18 NOVIEMBRE 2022.pdf',
    agent: 'acta_extractor_v2',
    table: 'extracted_minutes', 
    expectedFields: ['document_date', 'president_in', 'administrator', 'summary']
  }
};

/**
 * Extrae texto usando pdf-parse con detección de calidad
 */
async function extractWithPdfParse(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfParse = require('pdf-parse');
    
    console.log(`📖 Extrayendo texto de: ${path.basename(filePath)}`);
    console.log(`   Tamaño archivo: ${(buffer.length / 1024).toFixed(1)} KB`);
    
    const startTime = Date.now();
    const data = await pdfParse(buffer);
    const extractionTime = Date.now() - startTime;
    
    const extractedText = (data.text || '').trim();
    
    console.log(`✅ Extracción completada en ${extractionTime}ms`);
    console.log(`   Páginas: ${data.numpages}`);
    console.log(`   Caracteres extraídos: ${extractedText.length}`);
    
    // Análisis de calidad del texto extraído
    const quality = analyzeTextQuality(extractedText);
    
    console.log(`📊 Análisis de calidad:`);
    console.log(`   Calidad general: ${quality.score}%`);
    console.log(`   Palabras normales: ${quality.normalWords}%`);
    console.log(`   Estructura detectada: ${quality.hasStructure ? 'Sí' : 'No'}`);
    console.log(`   Posible OCR necesario: ${quality.needsOCR ? 'Sí' : 'No'}`);
    
    if (quality.needsOCR) {
      console.log(`⚠️ RECOMENDACIÓN: Este PDF probablemente necesite OCR`);
      console.log(`   Razones: ${quality.issues.join(', ')}`);
    }
    
    // Mostrar muestra del texto
    if (extractedText.length > 0) {
      console.log(`\n📄 MUESTRA DEL TEXTO EXTRAÍDO (primeros 300 chars):`);
      console.log('-'.repeat(50));
      console.log(extractedText.substring(0, 300) + (extractedText.length > 300 ? '...' : ''));
      console.log('-'.repeat(50));
    }
    
    return {
      success: extractedText.length > 0,
      text: extractedText,
      pages: data.numpages,
      size: buffer.length,
      quality: quality,
      extractionTime: extractionTime,
      method: 'pdf-parse'
    };
    
  } catch (error) {
    console.error(`❌ Error extrayendo ${path.basename(filePath)}:`, error.message);
    return {
      success: false,
      text: '',
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
  const strangeChars = text.match(/[^\w\s\n\r\t.,;:!?()[\]{}'"áéíóúñüÁÉÍÓÚÑÜ€$%@#&*+=/<>-]/g);
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
  
  // 5. Secuencias repetitivas (típico de OCR malo)
  const repetitivePatterns = text.match(/(.)\1{4,}/g);
  if (repetitivePatterns && repetitivePatterns.length > 0) {
    score -= 15;
    issues.push('Patrones repetitivos');
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

async function runTextExtractionTest() {
  console.log('🧪 TEST DE CALIDAD DE EXTRACCIÓN DE TEXTO');
  console.log('='.repeat(70));
  console.log('Analizando si tus PDFs necesitarán OCR o funcionarán con pdf-parse\n');
  
  const results = {};
  let totalFiles = 0;
  let successfulExtractions = 0;
  let ocrNeeded = 0;
  let totalScore = 0;
  let totalTime = 0;
  
  for (const [docType, filePath] of Object.entries(testFiles)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 ANALIZANDO: ${docType.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ Archivo no encontrado: ${filePath}`);
      results[docType] = { success: false, reason: 'file_not_found' };
      continue;
    }
    
    totalFiles++;
    const result = await extractWithPdfParse(fullPath);
    results[docType] = result;
    
    if (result.success) {
      successfulExtractions++;
      totalScore += result.quality.score;
      totalTime += result.extractionTime;
      
      if (result.quality.needsOCR) {
        ocrNeeded++;
      }
    }
    
    // Pausa entre archivos
    console.log('\nEsperando 2 segundos antes del siguiente archivo...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // RESUMEN FINAL
  console.log('\n\n📊 RESUMEN FINAL - ANÁLISIS DE CALIDAD PDF');
  console.log('='.repeat(70));
  
  console.log(`📁 ESTADÍSTICAS DE ARCHIVOS:`);
  console.log(`   Total archivos analizados: ${totalFiles}`);
  console.log(`   Extracciones exitosas: ${successfulExtractions}`);
  console.log(`   Archivos que necesitan OCR: ${ocrNeeded}`);
  console.log(`   Archivos que funcionan con pdf-parse: ${successfulExtractions - ocrNeeded}`);
  
  if (successfulExtractions > 0) {
    const avgScore = Math.round(totalScore / successfulExtractions);
    const avgTime = Math.round(totalTime / successfulExtractions);
    
    console.log(`\n📈 MÉTRICAS DE CALIDAD:`);
    console.log(`   Score promedio de calidad: ${avgScore}%`);
    console.log(`   Tiempo promedio extracción: ${avgTime}ms`);
    console.log(`   Porcentaje PDFs con OCR: ${Math.round((ocrNeeded / successfulExtractions) * 100)}%`);
  }
  
  console.log(`\n📋 DETALLE POR DOCUMENTO:`);
  for (const [docType, result] of Object.entries(results)) {
    if (result.success) {
      const status = result.quality.needsOCR ? '🔄 NECESITA OCR' : '✅ PDF-PARSE OK';
      console.log(`   ${status} ${docType}: ${result.quality.score}% calidad, ${result.extractionTime}ms`);
      if (result.quality.issues.length > 0) {
        console.log(`      Issues: ${result.quality.issues.join(', ')}`);
      }
    } else {
      console.log(`   ❌ ERROR ${docType}: ${result.reason || result.error}`);
    }
  }
  
  console.log(`\n🎯 CONCLUSIONES PARA TUS EXTRACTORS:`);
  
  if (ocrNeeded === 0) {
    console.log(`   ✅ EXCELENTE: Todos los PDFs tienen texto nativo`);
    console.log(`   📄 Los extractors funcionarán con máxima velocidad`);
    console.log(`   💰 Sin costos adicionales de OCR`);
  } else if (ocrNeeded < successfulExtractions / 2) {
    console.log(`   ✅ BUENO: Mayoría de PDFs con texto nativo`);
    console.log(`   ⚡ Rendimiento mayormente óptimo`);
    console.log(`   💰 Costos de OCR limitados`);
  } else {
    console.log(`   ⚠️ ATENCIÓN: Muchos PDFs necesitan OCR`);
    console.log(`   ⏱️ Tiempo de procesamiento aumentado`);
    console.log(`   💰 Costos significativos por Google Vision API`);
    console.log(`   📊 Posible variabilidad en precisión de extractors`);
  }
  
  if (ocrNeeded > 0) {
    console.log(`\n💡 RECOMENDACIONES:`);
    console.log(`   1. Configurar Google Vision API si no está activo`);
    console.log(`   2. Monitor costos de OCR en producción`);
    console.log(`   3. Considerar pre-procesamiento de PDFs escaneados`);
    console.log(`   4. Ajustar prompts de extractors para texto de menor calidad`);
  }
  
  console.log(`\n🚀 SIGUIENTE PASO:`);
  console.log(`   Si los resultados son buenos, proceder con test de extractors completo`);
}

// Ejecutar test
runTextExtractionTest().catch(console.error);