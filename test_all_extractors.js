#!/usr/bin/env node

/**
 * ARCHIVO: test_all_extractors.js
 * PROPÓSITO: Test general para todos los agentes extractores especializados
 * ESTADO: testing
 * DEPENDENCIAS: saasAgents.ts, tabla agents, documentos reales
 * OUTPUTS: Verificación de todos los sistemas de extracción
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Importar sistema de agentes y extracción de texto
const { callSaaSAgent } = require('./src/lib/gemini/saasAgents.ts');
const { extractTextFromPDF } = require('./src/lib/pdf/textExtraction.ts');

// Configuración de tests por tipo de documento usando PDFs reales
const testConfig = {
  'comunicado_extractor_v1': {
    name: 'COMUNICADOS VECINOS',
    testFile: 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf',
    expectedFields: [
      { campo: 'fecha', tipo: 'string' },
      { campo: 'comunidad', tipo: 'string' },
      { campo: 'remitente', tipo: 'string' },
      { campo: 'resumen', tipo: 'string' },
      { campo: 'category', tipo: 'string' },
      { campo: 'urgencia', tipo: 'string' },
      { campo: 'requiere_respuesta', tipo: 'boolean' },
      { campo: 'accion_requerida', tipo: 'array' },
      { campo: 'contacto_info', tipo: 'object' }
    ]
  },
  'albaran_extractor_v1': {
    name: 'ALBARANES',
    testFile: 'datos/albaran.pdf',
    expectedFields: [
      { campo: 'emisor_name', tipo: 'string' },
      { campo: 'receptor_name', tipo: 'string' },
      { campo: 'numero_albaran', tipo: 'string' },
      { campo: 'fecha_emision', tipo: 'string' },
      { campo: 'mercancia', tipo: 'array' },
      { campo: 'cantidad_total', tipo: 'number' },
      { campo: 'estado_entrega', tipo: 'string' },
      { campo: 'firma_receptor', tipo: 'boolean' }
    ]
  },
  'contrato_extractor_v1': {
    name: 'CONTRATOS',
    testFile: 'datos/Contrato OLAQUA Piscinas.pdf',
    expectedFields: [
      { campo: 'titulo_contrato', tipo: 'string' },
      { campo: 'parte_a', tipo: 'string' },
      { campo: 'parte_b', tipo: 'string' },
      { campo: 'objeto_contrato', tipo: 'string' },
      { campo: 'importe_total', tipo: 'number' },
      { campo: 'fecha_inicio', tipo: 'string' },
      { campo: 'fecha_fin', tipo: 'string' },
      { campo: 'alcance_servicios', tipo: 'array' },
      { campo: 'confidencialidad', tipo: 'boolean' }
    ]
  },
  'presupuesto_extractor_v1': {
    name: 'PRESUPUESTOS',
    testFile: 'datos/presupuesto.pdf',
    expectedFields: [
      { campo: 'numero_presupuesto', tipo: 'string' },
      { campo: 'emisor_name', tipo: 'string' },
      { campo: 'cliente_name', tipo: 'string' },
      { campo: 'fecha_emision', tipo: 'string' },
      { campo: 'subtotal', tipo: 'number' },
      { campo: 'total', tipo: 'number' },
      { campo: 'descripcion_servicios', tipo: 'array' },
      { campo: 'pago_inicial_requerido', tipo: 'boolean' }
    ]
  },
  'escritura_extractor_v1': {
    name: 'ESCRITURAS COMPRAVENTA',
    testFile: 'datos/escritura_D102B.pdf',
    expectedFields: [
      { campo: 'vendedor_nombre', tipo: 'string' },
      { campo: 'comprador_nombre', tipo: 'string' },
      { campo: 'direccion_inmueble', tipo: 'string' },
      { campo: 'precio_venta', tipo: 'number' },
      { campo: 'fecha_escritura', tipo: 'string' },
      { campo: 'notario_nombre', tipo: 'string' },
      { campo: 'superficie_m2', tipo: 'number' },
      { campo: 'libre_cargas', tipo: 'boolean' }
    ]
  },
  'factura_extractor_v2': {
    name: 'FACTURAS (V2)',
    testFile: 'datos/factura.pdf',
    expectedFields: [
      { campo: 'provider_name', tipo: 'string' },
      { campo: 'client_name', tipo: 'string' },
      { campo: 'amount', tipo: 'number' },
      { campo: 'invoice_date', tipo: 'string' },
      { campo: 'invoice_number', tipo: 'string' },
      { campo: 'subtotal', tipo: 'number' },
      { campo: 'tax_amount', tipo: 'number' },
      { campo: 'products', tipo: 'array' }
    ]
  },
  'acta_extractor_v2': {
    name: 'ACTAS (V2)',
    testFile: 'datos/ACTA 18 NOVIEMBRE 2022.pdf',
    expectedFields: [
      { campo: 'document_date', tipo: 'string' },
      { campo: 'president_in', tipo: 'string' },
      { campo: 'administrator', tipo: 'string' },
      { campo: 'summary', tipo: 'string' },
      { campo: 'decisions', tipo: 'string' },
      { campo: 'orden_del_dia', tipo: 'array' },
      { campo: 'topic-presupuesto', tipo: 'boolean' },
      { campo: 'estructura_detectada', tipo: 'object' }
    ]
  }
};

async function testExtractor(agentName, config) {
  console.log(`\n🧪 TEST ${config.name} - ${agentName}`);
  console.log('='.repeat(60));

  const testFile = path.join(process.cwd(), config.testFile);
  
  try {
    // PASO 1: Verificar si existe el archivo de test
    if (!fs.existsSync(testFile)) {
      console.log(`⚠️ Archivo de test no encontrado: ${testFile}`);
      console.log(`   Por favor, coloca el archivo PDF correspondiente en la ubicación correcta.`);
      return { success: false, reason: 'no_test_file' };
    }

    // PASO 2: Extraer texto usando la estrategia híbrida (igual que en producción)
    console.log('📖 Extrayendo texto usando estrategia híbrida (pdf-parse + OCR fallback)...');
    let documentText = '';
    let extractionMethod = 'unknown';
    let extractionMetadata = {};
    
    if (testFile.endsWith('.pdf')) {
      const buffer = fs.readFileSync(testFile);
      const extractionResult = await extractTextFromPDF(buffer);
      
      documentText = extractionResult.text;
      extractionMethod = extractionResult.method;
      extractionMetadata = extractionResult.metadata;
      
      console.log(`✅ Extracción ${extractionResult.success ? 'exitosa' : 'fallida'}:`);
      console.log(`   Método: ${extractionResult.method}`);
      console.log(`   Páginas: ${extractionResult.metadata.pages || 'N/A'}`);
      console.log(`   Caracteres: ${documentText.length}`);
      console.log(`   Confianza OCR: ${extractionResult.metadata.confidence ? Math.round(extractionResult.metadata.confidence * 100) + '%' : 'N/A'}`);
      
      if (!extractionResult.success) {
        return { success: false, reason: 'extraction_failed', method: extractionMethod };
      }
    } else {
      // Para archivos de texto (fallback)
      documentText = fs.readFileSync(testFile, 'utf8');
      extractionMethod = 'text-file';
      console.log(`✅ Archivo de texto: ${documentText.length} caracteres`);
    }
    
    if (!documentText || documentText.length < 50) {
      console.log(`⚠️ Texto extraído muy corto (${documentText.length} chars) con método: ${extractionMethod}`);
      if (extractionMethod === 'pdf-parse') {
        console.log(`   💡 Este PDF posiblemente necesite OCR (texto escaneado)`);
      }
      return { success: false, reason: 'empty_document', method: extractionMethod };
    }

    // PASO 3: Llamar al agente
    console.log(`\n🤖 Llamando agente ${agentName}...`);
    const startTime = Date.now();
    
    const resultado = await callSaaSAgent(agentName, {
      document_text: documentText
    });
    
    const tiempoTotal = Date.now() - startTime;
    
    console.log(`⏱️ Tiempo: ${tiempoTotal}ms`);
    console.log(`✅ Éxito: ${resultado.success}`);

    if (!resultado.success) {
      console.error('❌ Error:', resultado.error);
      return { success: false, reason: 'agent_error', error: resultado.error };
    }

    // PASO 4: Mostrar datos extraídos
    console.log('\n📋 DATOS EXTRAÍDOS POR EL AGENTE:');
    console.log('-'.repeat(50));
    console.log(JSON.stringify(resultado.data, null, 2));

    // PASO 5: Verificar campos esperados
    const data = resultado.data;
    let camposCorrectos = 0;
    console.log('\n🎯 VERIFICACIÓN DE CAMPOS:');
    
    config.expectedFields.forEach(({ campo, tipo }) => {
      const valor = data[campo];
      const tipoActual = Array.isArray(valor) ? 'array' : typeof valor;
      const correcto = tipoActual === tipo && valor !== null && valor !== undefined;
      
      if (correcto) {
        camposCorrectos++;
        let valorMostrar = '';
        if (Array.isArray(valor)) {
          valorMostrar = `[${valor.length} items]`;
        } else if (typeof valor === 'object') {
          valorMostrar = '[object]';
        } else {
          valorMostrar = String(valor).substring(0, 40);
        }
        console.log(`✅ ${campo}: ${tipoActual} - ${valorMostrar}`);
      } else {
        console.log(`❌ ${campo}: esperado ${tipo}, actual ${tipoActual} - ${valor}`);
      }
    });

    // PASO 6: Resultado final
    const porcentajeExito = (camposCorrectos / config.expectedFields.length * 100).toFixed(1);
    console.log(`\n📊 RESULTADO ${agentName}:`);
    console.log(`   Extracción texto: ${extractionMethod}`);
    console.log(`   Caracteres procesados: ${documentText.length}`);
    console.log(`   Páginas: ${extractionMetadata.pages || 'N/A'}`);
    if (extractionMetadata.confidence) {
      console.log(`   Confianza OCR: ${Math.round(extractionMetadata.confidence * 100)}%`);
    }
    console.log(`   Campos correctos: ${camposCorrectos}/${config.expectedFields.length}`);
    console.log(`   Score extractor: ${porcentajeExito}%`);
    console.log(`   Tiempo procesamiento: ${tiempoTotal}ms`);

    // Diagnóstico de calidad OCR
    if (extractionMethod.includes('ocr') && extractionMetadata.confidence) {
      if (extractionMetadata.confidence < 0.7) {
        console.log(`⚠️ ADVERTENCIA: Confianza OCR baja (${Math.round(extractionMetadata.confidence * 100)}%)`);
        console.log(`   Esto podría afectar la calidad de extracción del agente.`);
      }
    }

    if (parseFloat(porcentajeExito) >= 70) {
      console.log(`✅ BUEN RESULTADO: El agente funciona correctamente`);
      return { 
        success: true, 
        score: parseFloat(porcentajeExito), 
        time: tiempoTotal,
        extractionMethod,
        ocrQuality: extractionMetadata.confidence || null
      };
    } else {
      console.log(`⚠️ Requiere ajustes en el prompt del agente`);
      return { 
        success: true, 
        score: parseFloat(porcentajeExito), 
        time: tiempoTotal, 
        needsImprovement: true,
        extractionMethod,
        ocrQuality: extractionMetadata.confidence || null
      };
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    return { success: false, reason: 'test_error', error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 INICIANDO TESTS DE TODOS LOS EXTRACTORES');
  console.log('='.repeat(70));
  
  const results = {};
  const agents = Object.keys(testConfig);
  
  for (const agentName of agents) {
    const config = testConfig[agentName];
    results[agentName] = await testExtractor(agentName, config);
    
    // Pausa entre tests para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // RESUMEN FINAL
  console.log('\n\n📊 RESUMEN FINAL DE TODOS LOS TESTS');
  console.log('='.repeat(70));
  
  let totalAgents = 0;
  let workingAgents = 0;
  let pendingFiles = 0;
  let avgScore = 0;
  let totalTime = 0;
  let pdfParseCount = 0;
  let ocrCount = 0;
  let ocrQualityTotal = 0;
  let ocrQualityCount = 0;
  
  for (const [agentName, result] of Object.entries(results)) {
    const config = testConfig[agentName];
    totalAgents++;
    
    if (result.reason === 'no_test_file' || result.reason === 'example_content') {
      pendingFiles++;
      console.log(`⏳ ${config.name}: Necesita archivo de test`);
    } else if (result.success && result.score) {
      workingAgents++;
      avgScore += result.score;
      totalTime += result.time;
      
      // Contabilizar métodos de extracción
      if (result.extractionMethod && result.extractionMethod.includes('pdf-parse')) {
        pdfParseCount++;
      } else if (result.extractionMethod && result.extractionMethod.includes('ocr')) {
        ocrCount++;
        if (result.ocrQuality) {
          ocrQualityTotal += result.ocrQuality;
          ocrQualityCount++;
        }
      }
      
      const status = result.needsImprovement ? '⚠️ MEJORABLE' : '✅ FUNCIONANDO';
      const extractionInfo = result.extractionMethod ? ` (${result.extractionMethod})` : '';
      const ocrInfo = result.ocrQuality ? ` OCR:${Math.round(result.ocrQuality * 100)}%` : '';
      console.log(`${status} ${config.name}: ${result.score}% en ${result.time}ms${extractionInfo}${ocrInfo}`);
    } else {
      console.log(`❌ ${config.name}: Error - ${result.error || result.reason}`);
    }
  }
  
  if (workingAgents > 0) {
    avgScore = avgScore / workingAgents;
    const avgOcrQuality = ocrQualityCount > 0 ? (ocrQualityTotal / ocrQualityCount) : 0;
    
    console.log(`\n🎯 ESTADÍSTICAS GENERALES:`);
    console.log(`   Total agentes: ${totalAgents}`);
    console.log(`   Funcionando: ${workingAgents}`);
    console.log(`   Pendientes: ${pendingFiles}`);
    console.log(`   Score promedio: ${avgScore.toFixed(1)}%`);
    console.log(`   Tiempo promedio: ${Math.round(totalTime / workingAgents)}ms`);
    
    console.log(`\n📄 ANÁLISIS DE EXTRACCIÓN PDF:`);
    console.log(`   PDF-Parse exitoso: ${pdfParseCount} documentos`);
    console.log(`   OCR requerido: ${ocrCount} documentos`);
    if (ocrCount > 0) {
      console.log(`   Calidad OCR promedio: ${Math.round(avgOcrQuality * 100)}%`);
      
      if (avgOcrQuality < 0.7) {
        console.log(`   ⚠️ ADVERTENCIA: Calidad OCR baja detectada`);
        console.log(`     - Considera mejorar la calidad de los PDFs fuente`);
        console.log(`     - Los extractors podrían tener menor precisión`);
      } else if (avgOcrQuality > 0.9) {
        console.log(`   ✅ Excelente calidad OCR - Extractors deberían funcionar bien`);
      } else {
        console.log(`   ✅ Calidad OCR aceptable - Monitoring recomendado`);
      }
    }
    
    console.log(`\n📈 CONCLUSIONES:`);
    if (pdfParseCount > ocrCount) {
      console.log(`   ✅ La mayoría de PDFs tienen texto nativo (pdf-parse)`);
      console.log(`   📄 Rendimiento óptimo esperado`);
    } else {
      console.log(`   ⚠️ Muchos PDFs requieren OCR (documentos escaneados)`);
      console.log(`   ⏱️ Tiempo de procesamiento mayor`);
      console.log(`   💰 Mayor costo por Google Vision API`);
    }
  }
  
  console.log(`\n📝 SIGUIENTES PASOS:`);
  if (pendingFiles > 0) {
    console.log(`   1. Añade documentos reales en la carpeta 'datos/'`);
    console.log(`   2. Ejecuta de nuevo este script`);
  }
  if (workingAgents > 0) {
    console.log(`   3. Si los scores son buenos (>85%), integrar en el pipeline`);
    console.log(`   4. Si necesitan mejoras, ajustar los prompts en la tabla 'agents'`);
  }
}

// Ejecutar todos los tests
runAllTests().catch(console.error);