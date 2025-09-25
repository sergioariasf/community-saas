/**
 * ARCHIVO: test-classification-real.ts
 * PROPÓSITO: Test REAL usando DocumentClassifier completo con tsx
 * ESTADO: testing
 * DEPENDENCIAS: DocumentClassifier, tsx, archivos TXT en datos/txt/
 * OUTPUTS: datos/classification/*.json, classification_summary.json
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

// Importar el clasificador real
import { DocumentClassifier } from '../core/strategies/DocumentClassifier';

interface TxtFile {
  name: string;
  path: string;
  baseFilename: string;
  text: string;
  metadata: {
    original: string;
    method: string;
    length: number;
    pages: number;
    generated: string;
    processing: string;
  };
}

interface ClassificationResult {
  filename: string;
  baseFilename: string;
  success: boolean;
  documentType: string;
  confidence: number;
  method: string;
  reasoning: string;
  processingTime: number;
  error: string | null;
  textLength: number;
}

interface ClassificationSummary {
  [key: string]: {
    document_type: string;
    confidence: number;
    method: string;
    success: boolean;
    processing_time: number;
    text_length: number;
    error: string | null;
  };
}

async function testRealClassification() {
  console.log('🧪 [REAL CLASSIFICATION] =================================');
  console.log('🧪 [REAL CLASSIFICATION] TEST CON DocumentClassifier REAL');
  console.log('🧪 [REAL CLASSIFICATION] =================================\n');

  try {
    // Buscar archivos TXT extraídos en datos/txt/
    const txtFiles = await findExtractedTxtFiles();
    
    if (txtFiles.length === 0) {
      console.log('⚠️ [REAL CLASSIFICATION] No se encontraron archivos TXT en datos/txt/');
      console.log('💡 [REAL CLASSIFICATION] Ejecuta primero: npm run test:docs:extraction');
      return;
    }

    console.log(`📁 [REAL CLASSIFICATION] Encontrados ${txtFiles.length} archivos TXT extraídos:`);
    txtFiles.forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file.baseFilename} (${file.text.length} chars, método: ${file.metadata.method})`);
    });
    console.log('');

    // Crear clasificador real
    const classifier = new DocumentClassifier();
    
    // Estructura para el resumen
    const classificationSummary: ClassificationSummary = {};
    const results: ClassificationResult[] = [];

    // Procesar cada archivo con el clasificador real
    for (const txtFile of txtFiles) {
      console.log(`\n🔍 [REAL CLASSIFICATION] ===== CLASIFICANDO: ${txtFile.baseFilename} =====`);
      
      const result = await processFileWithRealClassifier(classifier, txtFile, classificationSummary);
      results.push(result);
      
      // Generar archivos de salida
      await generateClassificationFiles(txtFile, result);
    }

    // Generar resumen final
    await generateClassificationSummary(classificationSummary);
    
    // Mostrar estadísticas finales
    displayClassificationStats(results);

  } catch (error) {
    console.error('❌ [REAL CLASSIFICATION] Error en test:', error);
  }
}

async function processFileWithRealClassifier(
  classifier: DocumentClassifier,
  txtFile: TxtFile,
  summary: ClassificationSummary
): Promise<ClassificationResult> {
  const startTime = Date.now();
  let result: ClassificationResult = {
    filename: txtFile.name,
    baseFilename: txtFile.baseFilename,
    success: false,
    documentType: 'unknown',
    confidence: 0,
    method: 'unknown',
    reasoning: '',
    processingTime: 0,
    error: null,
    textLength: txtFile.text.length
  };

  try {
    console.log(`📄 [REAL CLASSIFICATION] Usando DocumentClassifier real del pipeline...`);
    console.log(`📝 [REAL CLASSIFICATION] Texto disponible: ${txtFile.text.length} caracteres`);
    
    // Usar el clasificador real con el mismo contexto que el pipeline
    console.log(`🔧 [REAL CLASSIFICATION] Llamando a classifyDocument con IA habilitada...`);
    const classificationResult = await classifier.classifyDocument({
      filename: txtFile.metadata.original,
      extractedText: txtFile.text,
      useAI: true // Habilitar IA como en el pipeline real
    });
    
    result.success = true;
    result.documentType = classificationResult.documentType || 'unknown';
    result.confidence = classificationResult.confidence || 0;
    result.method = classificationResult.method || 'unknown';
    result.reasoning = classificationResult.reasoning || '';
    result.processingTime = Date.now() - startTime;

    // Actualizar resumen
    summary[txtFile.baseFilename] = {
      document_type: result.documentType,
      confidence: result.confidence,
      method: result.method,
      success: result.success,
      processing_time: result.processingTime,
      text_length: result.textLength,
      error: null
    };

    console.log(`✅ [REAL CLASSIFICATION] Éxito: ${result.documentType} (confianza: ${(result.confidence * 100).toFixed(1)}%)`);
    console.log(`🔧 [REAL CLASSIFICATION] Método: ${result.method} (${result.processingTime}ms)`);
    console.log(`💭 [REAL CLASSIFICATION] Razonamiento: ${result.reasoning.substring(0, 100)}...`);

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.processingTime = Date.now() - startTime;
    
    summary[txtFile.baseFilename] = {
      document_type: 'error',
      confidence: 0,
      method: 'error',
      success: false,
      processing_time: result.processingTime,
      text_length: result.textLength,
      error: result.error
    };
    
    console.log(`❌ [REAL CLASSIFICATION] Error: ${result.error}`);
  }

  return result;
}

async function generateClassificationFiles(txtFile: TxtFile, result: ClassificationResult) {
  try {
    // Crear directorio de clasificación si no existe
    const classificationDir = path.join(__dirname, '../../../../datos/classification');
    await fs.mkdir(classificationDir, { recursive: true });

    if (result.success) {
      // Generar archivo JSON con resultado de clasificación
      const classificationPath = path.join(classificationDir, `${txtFile.baseFilename}_classification.json`);
      
      const classificationContent = {
        original_file: txtFile.metadata.original,
        base_filename: txtFile.baseFilename,
        extraction_method: txtFile.metadata.method,
        classification: {
          document_type: result.documentType,
          confidence: result.confidence,
          method: result.method,
          reasoning: result.reasoning,
          processing_time: result.processingTime
        },
        text_info: {
          length: result.textLength,
          pages: txtFile.metadata.pages
        },
        generated_at: new Date().toISOString(),
        tool: 'test-classification-real.ts'
      };

      await fs.writeFile(classificationPath, JSON.stringify(classificationContent, null, 2), 'utf8');
      console.log(`💾 [REAL CLASSIFICATION] Generado: datos/classification/${txtFile.baseFilename}_classification.json`);
    } else {
      // Generar archivo de error
      const errorPath = path.join(classificationDir, `${txtFile.baseFilename}_classification_error.json`);
      const errorContent = {
        original_file: txtFile.metadata.original,
        base_filename: txtFile.baseFilename,
        error: result.error,
        processing_time: result.processingTime,
        text_length: result.textLength,
        generated_at: new Date().toISOString(),
        tool: 'test-classification-real.ts'
      };

      await fs.writeFile(errorPath, JSON.stringify(errorContent, null, 2), 'utf8');
      console.log(`💾 [REAL CLASSIFICATION] Generado: datos/classification/${txtFile.baseFilename}_classification_error.json`);
    }
  } catch (error) {
    console.log(`⚠️ [REAL CLASSIFICATION] Error generando archivos: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateClassificationSummary(summary: ClassificationSummary) {
  try {
    const summaryPath = path.join(__dirname, '../../../../datos/classification/classification_summary_real.json');
    const summaryContent = {
      generated_at: new Date().toISOString(),
      tool: 'test-classification-real.ts',
      total_files: Object.keys(summary).length,
      successful_classifications: Object.values(summary).filter(s => s.success).length,
      failed_classifications: Object.values(summary).filter(s => !s.success).length,
      document_types: {} as Record<string, number>,
      methods_used: {} as Record<string, number>,
      average_confidence: 0,
      files: summary
    };

    // Contar tipos de documentos y métodos
    Object.values(summary).forEach(file => {
      if (file.success) {
        summaryContent.document_types[file.document_type] = (summaryContent.document_types[file.document_type] || 0) + 1;
        summaryContent.methods_used[file.method] = (summaryContent.methods_used[file.method] || 0) + 1;
      }
    });

    // Calcular confianza promedio
    const successfulFiles = Object.values(summary).filter(s => s.success);
    if (successfulFiles.length > 0) {
      summaryContent.average_confidence = successfulFiles.reduce((sum, s) => sum + s.confidence, 0) / successfulFiles.length;
    }

    await fs.writeFile(summaryPath, JSON.stringify(summaryContent, null, 2), 'utf8');
    console.log(`\n💾 [REAL CLASSIFICATION] Generado: datos/classification/classification_summary_real.json`);
    
    // Mostrar resumen en consola
    console.log(`\n📊 [REAL CLASSIFICATION] RESUMEN DE CLASIFICACIÓN REAL:`);
    console.log(`   - Total archivos: ${summaryContent.total_files}`);
    console.log(`   - Exitosos: ${summaryContent.successful_classifications}`);
    console.log(`   - Fallidos: ${summaryContent.failed_classifications}`);
    console.log(`   - Confianza promedio: ${(summaryContent.average_confidence * 100).toFixed(1)}%`);
    console.log(`   - Tipos detectados:`);
    Object.entries(summaryContent.document_types).forEach(([type, count]) => {
      console.log(`     * ${type}: ${count} archivos`);
    });
    console.log(`   - Métodos utilizados:`);
    Object.entries(summaryContent.methods_used).forEach(([method, count]) => {
      console.log(`     * ${method}: ${count} archivos`);
    });

  } catch (error) {
    console.log(`⚠️ [REAL CLASSIFICATION] Error generando resumen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function displayClassificationStats(results: ClassificationResult[]) {
  console.log(`\n📊 [REAL CLASSIFICATION] ===== ESTADÍSTICAS FINALES =====`);
  
  const totalFiles = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.processingTime, 0);
  const avgTime = totalTime / totalFiles;
  const avgConfidence = successful > 0 ? results.filter(r => r.success).reduce((sum, r) => sum + r.confidence, 0) / successful : 0;

  console.log(`📈 [REAL CLASSIFICATION] Procesamiento completado:`);
  console.log(`   - Total: ${totalFiles} archivos`);
  console.log(`   - Exitosos: ${successful} (${(successful/totalFiles*100).toFixed(1)}%)`);
  console.log(`   - Fallidos: ${failed} (${(failed/totalFiles*100).toFixed(1)}%)`);
  console.log(`   - Tiempo total: ${totalTime}ms`);
  console.log(`   - Tiempo promedio: ${avgTime.toFixed(2)}ms por archivo`);
  console.log(`   - Confianza promedio: ${(avgConfidence * 100).toFixed(1)}%`);

  console.log(`\n📁 [REAL CLASSIFICATION] Archivos generados:`);
  console.log(`   - datos/classification/*_classification.json - Resultados detallados`);
  console.log(`   - datos/classification/classification_summary_real.json - Resumen completo`);
  
  console.log(`\n🎯 [REAL CLASSIFICATION] CLASIFICADOR REAL COMPLETO:`);
  console.log(`   - ✅ DocumentClassifier del pipeline`);
  console.log(`   - ✅ Reconocimiento por filename`);
  console.log(`   - ✅ Análisis IA de texto extraído`);
  console.log(`   - ✅ Lógica de fallback`);
  console.log(`\n💡 [REAL CLASSIFICATION] Resultados = producción exacta`);
  console.log(`\n🔗 [REAL CLASSIFICATION] Siguiente: npm run test:docs:metadata`);
}

async function findExtractedTxtFiles(): Promise<TxtFile[]> {
  const txtDir = path.join(__dirname, '../../../../datos/txt');
  const files: TxtFile[] = [];
  
  try {
    const dirFiles = await fs.readdir(txtDir);
    const txtFiles = dirFiles.filter(file => 
      file.toLowerCase().endsWith('.txt') && 
      file !== 'extraction_summary.json' &&
      file !== 'extraction_summary_real.json'
    );
    
    for (const file of txtFiles) {
      try {
        const filePath = path.join(txtDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Parsear metadata del archivo TXT
        const metadataMatch = content.match(/\[METADATA\]\n(.*?)\n\[CONTENT\]\n(.*)/s);
        if (metadataMatch) {
          const metadataSection = metadataMatch[1];
          const textContent = metadataMatch[2];
          
          // Extraer campos de metadata
          const originalMatch = metadataSection.match(/Original: (.+)/);
          const methodMatch = metadataSection.match(/Method: (.+)/);
          const lengthMatch = metadataSection.match(/Length: (\d+) characters/);
          const pagesMatch = metadataSection.match(/Pages: (\d+)/);
          const generatedMatch = metadataSection.match(/Generated: (.+)/);
          const processingMatch = metadataSection.match(/Processing: (.+)/);
          
          const baseFilename = path.basename(file, path.extname(file));
          
          files.push({
            name: file,
            path: filePath,
            baseFilename,
            text: textContent.trim(),
            metadata: {
              original: originalMatch ? originalMatch[1] : file,
              method: methodMatch ? methodMatch[1] : 'unknown',
              length: lengthMatch ? parseInt(lengthMatch[1]) : textContent.length,
              pages: pagesMatch ? parseInt(pagesMatch[1]) : 0,
              generated: generatedMatch ? generatedMatch[1] : '',
              processing: processingMatch ? processingMatch[1] : ''
            }
          });
        }
      } catch (err) {
        console.log(`⚠️ [REAL CLASSIFICATION] Error leyendo ${file}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  } catch (err) {
    console.log(`⚠️ [REAL CLASSIFICATION] Error accediendo a datos/txt: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
  
  return files;
}

// Ejecutar test si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testRealClassification().catch(console.error);
}

export { testRealClassification };