/**
 * ARCHIVO: test-text-extraction-real.ts
 * PROPÓSITO: Test REAL usando TextExtractionFactory completo con tsx
 * ESTADO: testing
 * DEPENDENCIAS: TextExtractionFactory, tsx, archivos PDF en datos/pdf/
 * OUTPUTS: datos/txt/*.txt, datos/txt/extraction_summary.json, datos/failed/*.txt
 * ACTUALIZADO: 2025-09-22
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
dotenv.config({ path: '.env.local' });

// Obtener __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar el factory real
import { TextExtractionFactory } from '../core/extraction/TextExtractionFactory';
import type { ExtractionContext, ExtractionResult } from '../core/extraction/BaseTextExtractor';

interface TestFile {
  name: string;
  path: string;
  size: number;
  buffer: Buffer;
}

interface ExtractionSummary {
  [key: string]: {
    method: string;
    success: boolean;
    length: number;
    processing_time: number;
    pages: number;
    error: string | null;
  };
}

async function testRealTextExtraction() {
  console.log('🧪 [REAL EXTRACTION] =================================');
  console.log('🧪 [REAL EXTRACTION] TEST CON TextExtractionFactory REAL');
  console.log('🧪 [REAL EXTRACTION] =================================\n');

  try {
    // Buscar archivos PDF en datos/pdf/
    const testFiles = await findPdfFiles();
    
    if (testFiles.length === 0) {
      console.log('⚠️ [REAL EXTRACTION] No se encontraron archivos PDF en datos/pdf/');
      console.log('💡 [REAL EXTRACTION] Coloca archivos PDF en: datos/pdf/');
      return;
    }

    console.log(`📁 [REAL EXTRACTION] Encontrados ${testFiles.length} archivos PDF:`);
    testFiles.forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    });
    console.log('');

    // Crear factory real
    const factory = new TextExtractionFactory();
    
    // Estructura para el resumen
    const extractionSummary: ExtractionSummary = {};
    const results: any[] = [];

    // Procesar cada archivo con la cadena real
    for (const testFile of testFiles) {
      console.log(`\n🔍 [REAL EXTRACTION] ===== PROCESANDO: ${testFile.name} =====`);
      
      const result = await processFileWithRealFactory(factory, testFile, extractionSummary);
      results.push(result);
      
      // Generar archivos de salida
      await generateOutputFiles(testFile, result);
    }

    // Generar resumen final
    await generateExtractionSummary(extractionSummary);
    
    // Mostrar estadísticas finales
    displayFinalStats(results);

  } catch (error) {
    console.error('❌ [REAL EXTRACTION] Error en test:', error);
  }
}

async function processFileWithRealFactory(
  factory: TextExtractionFactory, 
  testFile: TestFile, 
  summary: ExtractionSummary
): Promise<any> {
  const startTime = Date.now();
  let result = {
    filename: testFile.name,
    success: false,
    method: 'unknown',
    text: '',
    textLength: 0,
    processingTime: 0,
    error: null,
    pages: 0
  };

  try {
    console.log(`📄 [REAL EXTRACTION] Usando TextExtractionFactory real del pipeline...`);
    
    // Crear contexto igual que el pipeline real
    const context: ExtractionContext = {
      buffer: testFile.buffer,
      filename: testFile.name,
      documentId: `test-${Date.now()}`,
      minTextLength: 50
    };

    // Usar la cadena de extracción real: PDF-parse → Google Vision → Gemini Flash
    console.log(`🔧 [REAL EXTRACTION] Iniciando cadena: PDF-parse → Google Vision → Gemini Flash...`);
    const extractionResult: ExtractionResult = await factory.extractText(context);
    
    result.success = extractionResult.success || false;
    result.method = extractionResult.method || 'unknown';
    result.text = extractionResult.text || '';
    result.textLength = extractionResult.textLength || 0;
    result.error = extractionResult.error || null;
    result.pages = extractionResult.pages || 0;
    result.processingTime = Date.now() - startTime;

    // Actualizar resumen
    const baseFilename = getBaseFilename(testFile.name);
    summary[baseFilename] = {
      method: result.method,
      success: result.success,
      length: result.textLength,
      processing_time: result.processingTime,
      pages: result.pages,
      error: result.error
    };

    if (result.success && result.textLength >= 50) {
      console.log(`✅ [REAL EXTRACTION] Éxito con ${result.method}: ${result.textLength} caracteres (${result.processingTime}ms)`);
      console.log(`📖 [REAL EXTRACTION] Páginas: ${result.pages}`);
      console.log(`📄 [REAL EXTRACTION] Preview: "${result.text.substring(0, 100)}..."`);
    } else {
      console.log(`❌ [REAL EXTRACTION] Falló o texto insuficiente: ${result.textLength} chars (método: ${result.method})`);
    }

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.processingTime = Date.now() - startTime;
    
    const baseFilename = getBaseFilename(testFile.name);
    summary[baseFilename] = {
      method: 'error',
      success: false,
      length: 0,
      processing_time: result.processingTime,
      pages: 0,
      error: result.error
    };
    
    console.log(`❌ [REAL EXTRACTION] Error: ${result.error}`);
  }

  return result;
}

async function generateOutputFiles(testFile: TestFile, result: any) {
  const baseFilename = getBaseFilename(testFile.name);
  
  try {
    if (result.success && result.text && result.text.length >= 50) {
      // Generar archivo TXT exitoso
      const txtPath = path.join(__dirname, '../../../../datos/txt/', `${baseFilename}.txt`);
      
      // Agregar metadata al inicio del archivo
      const txtContent = `[METADATA]
Original: ${testFile.name}
Method: ${result.method}
Length: ${result.textLength} characters
Pages: ${result.pages}
Generated: ${new Date().toISOString()}
Processing: ${result.processingTime}ms

[CONTENT]
${result.text}`;

      await fs.writeFile(txtPath, txtContent, 'utf8');
      console.log(`💾 [REAL EXTRACTION] Generado: datos/txt/${baseFilename}.txt`);
    } else {
      // Generar archivo en failed/
      const failedPath = path.join(__dirname, '../../../../datos/failed/', `${baseFilename}_failed.txt`);
      const failedContent = `EXTRACCIÓN FALLIDA
Archivo: ${testFile.name}
Error: ${result.error || 'Texto insuficiente'}
Length: ${result.textLength} characters
Method: ${result.method}
Pages: ${result.pages}
Timestamp: ${new Date().toISOString()}
Processing: ${result.processingTime}ms
`;
      await fs.writeFile(failedPath, failedContent, 'utf8');
      console.log(`💾 [REAL EXTRACTION] Generado: datos/failed/${baseFilename}_failed.txt`);
    }
  } catch (error) {
    console.log(`⚠️ [REAL EXTRACTION] Error generando archivos: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateExtractionSummary(summary: ExtractionSummary) {
  try {
    const summaryPath = path.join(__dirname, '../../../../datos/txt/extraction_summary_real.json');
    const summaryContent = {
      generated_at: new Date().toISOString(),
      tool: 'test-text-extraction-real.ts',
      total_files: Object.keys(summary).length,
      successful_extractions: Object.values(summary).filter(s => s.success).length,
      failed_extractions: Object.values(summary).filter(s => !s.success).length,
      methods_used: {} as Record<string, number>,
      files: summary
    };

    // Contar métodos usados
    Object.values(summary).forEach(file => {
      if (file.success) {
        summaryContent.methods_used[file.method] = (summaryContent.methods_used[file.method] || 0) + 1;
      }
    });

    await fs.writeFile(summaryPath, JSON.stringify(summaryContent, null, 2), 'utf8');
    console.log(`\n💾 [REAL EXTRACTION] Generado: datos/txt/extraction_summary_real.json`);
    
    // Mostrar resumen en consola
    console.log(`\n📊 [REAL EXTRACTION] RESUMEN DE EXTRACCIÓN REAL:`);
    console.log(`   - Total archivos: ${summaryContent.total_files}`);
    console.log(`   - Exitosos: ${summaryContent.successful_extractions}`);
    console.log(`   - Fallidos: ${summaryContent.failed_extractions}`);
    console.log(`   - Métodos utilizados:`);
    Object.entries(summaryContent.methods_used).forEach(([method, count]) => {
      console.log(`     * ${method}: ${count} archivos`);
    });

  } catch (error) {
    console.log(`⚠️ [REAL EXTRACTION] Error generando resumen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function displayFinalStats(results: any[]) {
  console.log(`\n📊 [REAL EXTRACTION] ===== ESTADÍSTICAS FINALES =====`);
  
  const totalFiles = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.processingTime, 0);
  const avgTime = totalTime / totalFiles;
  const totalChars = results.filter(r => r.success).reduce((sum, r) => sum + r.textLength, 0);

  console.log(`📈 [REAL EXTRACTION] Procesamiento completado:`);
  console.log(`   - Total: ${totalFiles} archivos`);
  console.log(`   - Exitosos: ${successful} (${(successful/totalFiles*100).toFixed(1)}%)`);
  console.log(`   - Fallidos: ${failed} (${(failed/totalFiles*100).toFixed(1)}%)`);
  console.log(`   - Tiempo total: ${totalTime}ms`);
  console.log(`   - Tiempo promedio: ${avgTime.toFixed(2)}ms por archivo`);
  console.log(`   - Caracteres totales: ${totalChars.toLocaleString()}`);

  console.log(`\n📁 [REAL EXTRACTION] Archivos generados:`);
  console.log(`   - datos/txt/*.txt - Textos extraídos exitosamente`);
  console.log(`   - datos/txt/extraction_summary_real.json - Resumen completo`);
  console.log(`   - datos/failed/*_failed.txt - Archivos que fallaron`);
  
  console.log(`\n🎯 [REAL EXTRACTION] CADENA REAL COMPLETA:`);
  console.log(`   - ✅ PDF-parse (estrategia 1)`);
  console.log(`   - ✅ Google Vision OCR (estrategia 2)`);
  console.log(`   - ✅ Gemini Flash TODO-EN-UNO (estrategia 3)`);
  console.log(`\n💡 [REAL EXTRACTION] Tests realistas que reflejan producción`);
}

async function findPdfFiles(): Promise<TestFile[]> {
  const pdfDir = path.join(__dirname, '../../../../datos/pdf');
  const files: TestFile[] = [];
  
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
        console.log(`⚠️ [REAL EXTRACTION] Error leyendo ${file}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  } catch (err) {
    console.log(`⚠️ [REAL EXTRACTION] Error accediendo a datos/pdf: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
  
  return files;
}

function getBaseFilename(filename: string): string {
  return path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Ejecutar test si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testRealTextExtraction().catch(console.error);
}

export { testRealTextExtraction };