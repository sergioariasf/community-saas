/**
 * ARCHIVO: test-simple-extraction.js
 * PROPÓSITO: Test simple para generar archivos TXT con PDF-parse y validar estructura propuesta
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, archivos PDF en datos/pdf/
 * OUTPUTS: datos/txt/*.txt, datos/txt/extraction_summary.json
 * ACTUALIZADO: 2025-09-22
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');

async function testSimpleExtraction() {
  console.log('🧪 [SIMPLE EXTRACTION] =================================');
  console.log('🧪 [SIMPLE EXTRACTION] GENERANDO ESTRUCTURA DE ARCHIVOS TXT');
  console.log('🧪 [SIMPLE EXTRACTION] =================================\n');

  try {
    // Buscar archivos PDF en datos/pdf/
    const testFiles = await findPdfFiles();
    
    if (testFiles.length === 0) {
      console.log('⚠️ [SIMPLE EXTRACTION] No se encontraron archivos PDF en datos/pdf/');
      return;
    }

    console.log(`📁 [SIMPLE EXTRACTION] Encontrados ${testFiles.length} archivos PDF:`);
    testFiles.forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    });
    console.log('');

    // Estructura para el resumen
    const extractionSummary = {};
    const results = [];

    // Procesar cada archivo con PDF-parse para generar estructura
    for (const testFile of testFiles) {
      console.log(`\n🔍 [SIMPLE EXTRACTION] ===== PROCESANDO: ${testFile.name} =====`);
      
      const result = await processFileWithPdfParse(testFile, extractionSummary);
      results.push(result);
      
      // Generar archivos de salida
      await generateOutputFiles(testFile, result);
    }

    // Generar resumen final
    await generateExtractionSummary(extractionSummary);
    
    // Mostrar estadísticas finales
    displayFinalStats(results);

  } catch (error) {
    console.error('❌ [SIMPLE EXTRACTION] Error en test:', error);
  }
}

async function processFileWithPdfParse(testFile, summary) {
  const startTime = Date.now();
  let result = {
    filename: testFile.name,
    success: false,
    method: 'pdf-parse',
    text: '',
    textLength: 0,
    processingTime: 0,
    error: null
  };

  try {
    console.log(`📄 [SIMPLE EXTRACTION] Extrayendo texto con PDF-parse...`);
    
    // Usar PDF-parse
    const pdfParse = require('pdf-parse');
    const pdfResult = await pdfParse(testFile.buffer);
    
    result.success = true;
    result.text = pdfResult.text || '';
    result.textLength = result.text.length;
    result.processingTime = Date.now() - startTime;

    // Actualizar resumen
    const baseFilename = getBaseFilename(testFile.name);
    summary[baseFilename] = {
      method: result.method,
      success: result.success,
      length: result.textLength,
      processing_time: result.processingTime,
      pages: pdfResult.numpages || 0,
      error: null
    };

    console.log(`✅ [SIMPLE EXTRACTION] Éxito: ${result.textLength} caracteres extraídos (${result.processingTime}ms)`);
    console.log(`📖 [SIMPLE EXTRACTION] Páginas: ${pdfResult.numpages || 'desconocido'}`);
    console.log(`📄 [SIMPLE EXTRACTION] Preview: "${result.text.substring(0, 100)}..."`);

  } catch (error) {
    result.error = error.message;
    result.processingTime = Date.now() - startTime;
    
    const baseFilename = getBaseFilename(testFile.name);
    summary[baseFilename] = {
      method: result.method,
      success: false,
      length: 0,
      processing_time: result.processingTime,
      error: result.error
    };
    
    console.log(`❌ [SIMPLE EXTRACTION] Error: ${error.message}`);
  }

  return result;
}

async function tryPdfParse(context) {
  try {
    const pdfParse = require('pdf-parse');
    const pdfResult = await pdfParse(context.buffer);
    
    return {
      success: true,
      text: pdfResult.text || '',
      textLength: (pdfResult.text || '').length,
      method: 'pdf-parse',
      pages: pdfResult.numpages || 0,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      textLength: 0,
      method: 'pdf-parse',
      error: error.message
    };
  }
}

async function tryGoogleVision(context) {
  try {
    // Check if Google Vision is available
    const { extractWithGoogleVision } = await import('@/lib/pdf/textExtraction');
    const { isGoogleVisionAvailable } = await import('@/lib/pdf/googleVision');
    
    if (!isGoogleVisionAvailable()) {
      return {
        success: false,
        text: '',
        textLength: 0,
        method: 'google-vision-ocr',
        error: 'Google Vision not configured'
      };
    }

    const result = await extractWithGoogleVision(context.buffer);
    
    if (result.success && result.text) {
      return {
        success: true,
        text: result.text,
        textLength: result.text.length,
        method: 'google-vision-ocr',
        pages: result.metadata?.pages || 0,
        error: null
      };
    } else {
      return {
        success: false,
        text: '',
        textLength: 0,
        method: 'google-vision-ocr',
        error: result.metadata?.error || 'Google Vision OCR failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      text: '',
      textLength: 0,
      method: 'google-vision-ocr',
      error: error.message
    };
  }
}

async function tryGeminiFlash(context) {
  try {
    // Simular Gemini Flash (no implementado completamente)
    return {
      success: false,
      text: '',
      textLength: 0,
      method: 'gemini-flash-ocr-ia',
      error: 'Gemini Flash not implemented in test'
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      textLength: 0,
      method: 'gemini-flash-ocr-ia',
      error: error.message
    };
  }
}

async function generateOutputFiles(testFile, result) {
  const baseFilename = getBaseFilename(testFile.name);
  
  try {
    if (result.success && result.text && result.text.length > 50) {
      // Generar archivo TXT exitoso
      const txtPath = path.join(__dirname, '../../../../datos/txt/', `${baseFilename}.txt`);
      
      // Agregar metadata al inicio del archivo
      const txtContent = `[METADATA]
Original: ${testFile.name}
Method: ${result.method}
Length: ${result.textLength} characters
Generated: ${new Date().toISOString()}
Processing: ${result.processingTime}ms

[CONTENT]
${result.text}`;

      await fs.writeFile(txtPath, txtContent, 'utf8');
      console.log(`💾 [SIMPLE EXTRACTION] Generado: datos/txt/${baseFilename}.txt`);
    } else {
      // Generar archivo en failed/
      const failedPath = path.join(__dirname, '../../../../datos/failed/', `${baseFilename}_failed.txt`);
      const failedContent = `EXTRACCIÓN FALLIDA
Archivo: ${testFile.name}
Error: ${result.error || 'Texto insuficiente'}
Length: ${result.textLength} characters
Timestamp: ${new Date().toISOString()}
Method: ${result.method}
Processing: ${result.processingTime}ms
`;
      await fs.writeFile(failedPath, failedContent, 'utf8');
      console.log(`💾 [SIMPLE EXTRACTION] Generado: datos/failed/${baseFilename}_failed.txt`);
    }
  } catch (error) {
    console.log(`⚠️ [SIMPLE EXTRACTION] Error generando archivos: ${error.message}`);
  }
}

async function generateExtractionSummary(summary) {
  try {
    const summaryPath = path.join(__dirname, '../../../../datos/txt/extraction_summary.json');
    const summaryContent = {
      generated_at: new Date().toISOString(),
      tool: 'test-simple-extraction.js',
      total_files: Object.keys(summary).length,
      successful_extractions: Object.values(summary).filter(s => s.success).length,
      failed_extractions: Object.values(summary).filter(s => !s.success).length,
      methods_used: {},
      files: summary
    };

    // Contar métodos usados
    Object.values(summary).forEach(file => {
      if (file.success) {
        summaryContent.methods_used[file.method] = (summaryContent.methods_used[file.method] || 0) + 1;
      }
    });

    await fs.writeFile(summaryPath, JSON.stringify(summaryContent, null, 2), 'utf8');
    console.log(`\n💾 [SIMPLE EXTRACTION] Generado: datos/txt/extraction_summary.json`);
    
    // Mostrar resumen en consola
    console.log(`\n📊 [SIMPLE EXTRACTION] RESUMEN DE EXTRACCIÓN:`);
    console.log(`   - Total archivos: ${summaryContent.total_files}`);
    console.log(`   - Exitosos: ${summaryContent.successful_extractions}`);
    console.log(`   - Fallidos: ${summaryContent.failed_extractions}`);
    console.log(`   - Métodos utilizados:`);
    Object.entries(summaryContent.methods_used).forEach(([method, count]) => {
      console.log(`     * ${method}: ${count} archivos`);
    });

  } catch (error) {
    console.log(`⚠️ [SIMPLE EXTRACTION] Error generando resumen: ${error.message}`);
  }
}

function displayFinalStats(results) {
  console.log(`\n📊 [SIMPLE EXTRACTION] ===== ESTADÍSTICAS FINALES =====`);
  
  const totalFiles = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.processingTime, 0);
  const avgTime = totalTime / totalFiles;
  const totalChars = results.filter(r => r.success).reduce((sum, r) => sum + r.textLength, 0);

  console.log(`📈 [SIMPLE EXTRACTION] Procesamiento completado:`);
  console.log(`   - Total: ${totalFiles} archivos`);
  console.log(`   - Exitosos: ${successful} (${(successful/totalFiles*100).toFixed(1)}%)`);
  console.log(`   - Fallidos: ${failed} (${(failed/totalFiles*100).toFixed(1)}%)`);
  console.log(`   - Tiempo total: ${totalTime}ms`);
  console.log(`   - Tiempo promedio: ${avgTime.toFixed(2)}ms por archivo`);
  console.log(`   - Caracteres totales: ${totalChars.toLocaleString()}`);

  console.log(`\n📁 [SIMPLE EXTRACTION] Archivos generados:`);
  console.log(`   - datos/txt/*.txt - Textos extraídos exitosamente`);
  console.log(`   - datos/txt/extraction_summary.json - Resumen completo`);
  console.log(`   - datos/failed/*_failed.txt - Archivos que fallaron`);
  
  console.log(`\n🎯 [SIMPLE EXTRACTION] ESTRUCTURA LISTA PARA TESTS:`);
  console.log(`   - ✅ datos/pdf/ - PDFs originales`);
  console.log(`   - ✅ datos/txt/ - Textos extraídos + resumen`);
  console.log(`   - ✅ datos/failed/ - Casos fallidos`);
  console.log(`\n💡 [SIMPLE EXTRACTION] Ahora puedes ejecutar:`);
  console.log(`   - npm run test:docs:classification (leerá de datos/txt/)`);
  console.log(`   - npm run test:docs:metadata (leerá de datos/txt/)`);
}

async function findPdfFiles() {
  const pdfDir = path.join(__dirname, '../../../../datos/pdf');
  const files = [];
  
  try {
    const dirFiles = await fs.readdir(pdfDir);
    const pdfFiles = dirFiles.filter(file => 
      file.toLowerCase().endsWith('.pdf') && 
      !file.includes('Zone.Identifier') // Filtrar archivos del sistema Windows
    );
    
    for (const file of pdfFiles) {
      try {
        const filePath = path.join(pdfDir, file);
        const stats = await fs.stat(filePath);
        const buffer = await fs.readFile(filePath);
        
        files.push({
          name: file,
          path: filePath,
          size: stats.size,
          buffer: buffer
        });
      } catch (err) {
        console.log(`⚠️ [SIMPLE EXTRACTION] Error leyendo ${file}: ${err.message}`);
      }
    }
  } catch (err) {
    console.log(`⚠️ [SIMPLE EXTRACTION] Error accediendo a datos/pdf: ${err.message}`);
  }
  
  return files;
}

function getBaseFilename(filename) {
  return path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testSimpleExtraction().catch(console.error);
}

module.exports = { testSimpleExtraction };