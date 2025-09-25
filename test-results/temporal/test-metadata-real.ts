/**
 * ARCHIVO: test-metadata-real.ts
 * PROPÓSITO: Test REAL usando extractores de metadata completos con tsx
 * ESTADO: testing
 * DEPENDENCIAS: DocumentExtractorFactory, tsx, archivos TXT+classification en datos/
 * OUTPUTS: datos/metadata/*.json, metadata_summary.json
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

// Importar el factory real de extractores
import { DocumentExtractorFactory } from '../core/strategies/DocumentExtractorFactory';

interface ClassificationFile {
  name: string;
  path: string;
  baseFilename: string;
  classification: {
    document_type: string;
    confidence: number;
    method: string;
    reasoning: string;
  };
  original_file: string;
  extraction_method: string;
  text_info: {
    length: number;
    pages: number;
  };
}

interface TxtFile {
  baseFilename: string;
  text: string;
  metadata: {
    original: string;
    method: string;
    length: number;
    pages: number;
  };
}

interface MetadataResult {
  filename: string;
  baseFilename: string;
  documentType: string;
  success: boolean;
  extractedData: any;
  processingTime: number;
  error: string | null;
  textLength: number;
  extractorUsed: string;
}

interface MetadataSummary {
  [key: string]: {
    document_type: string;
    success: boolean;
    processing_time: number;
    text_length: number;
    extractor_used: string;
    data_fields: string[];
    error: string | null;
  };
}

async function testRealMetadataExtraction() {
  console.log('🧪 [REAL METADATA] =================================');
  console.log('🧪 [REAL METADATA] TEST CON EXTRACTORES REALES');
  console.log('🧪 [REAL METADATA] =================================\n');

  try {
    // Buscar archivos de clasificación y sus correspondientes TXT
    const classifiedFiles = await findClassifiedFiles();
    
    if (classifiedFiles.length === 0) {
      console.log('⚠️ [REAL METADATA] No se encontraron archivos clasificados');
      console.log('💡 [REAL METADATA] Ejecuta primero: npm run test:docs:classification');
      return;
    }

    console.log(`📁 [REAL METADATA] Encontrados ${classifiedFiles.length} archivos clasificados:`);
    classifiedFiles.forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file.baseFilename} → ${file.classification.document_type} (${(file.classification.confidence * 100).toFixed(1)}%)`);
    });
    console.log('');

    // Cargar textos correspondientes
    const txtFiles = await loadCorrespondingTexts(classifiedFiles);
    
    // El factory usa métodos estáticos
    
    // Estructura para el resumen
    const metadataSummary: MetadataSummary = {};
    const results: MetadataResult[] = [];

    // Procesar cada archivo con su extractor específico
    for (const classifiedFile of classifiedFiles) {
      console.log(`\n🔍 [REAL METADATA] ===== EXTRAYENDO METADATA: ${classifiedFile.baseFilename} =====`);
      
      const txtFile = txtFiles.find(t => t.baseFilename === classifiedFile.baseFilename);
      if (!txtFile) {
        console.log(`⚠️ [REAL METADATA] No se encontró texto para ${classifiedFile.baseFilename}`);
        continue;
      }

      const result = await processFileWithRealExtractor(classifiedFile, txtFile, metadataSummary);
      results.push(result);
      
      // Generar archivos de salida
      await generateMetadataFiles(classifiedFile, result);
    }

    // Generar resumen final
    await generateMetadataSummary(metadataSummary);
    
    // Mostrar estadísticas finales
    displayMetadataStats(results);

  } catch (error) {
    console.error('❌ [REAL METADATA] Error en test:', error);
  }
}

async function processFileWithRealExtractor(
  classifiedFile: ClassificationFile,
  txtFile: TxtFile,
  summary: MetadataSummary
): Promise<MetadataResult> {
  const startTime = Date.now();
  let result: MetadataResult = {
    filename: classifiedFile.name,
    baseFilename: classifiedFile.baseFilename,
    documentType: classifiedFile.classification.document_type,
    success: false,
    extractedData: null,
    processingTime: 0,
    error: null,
    textLength: txtFile.text.length,
    extractorUsed: 'unknown'
  };

  try {
    console.log(`📄 [REAL METADATA] Tipo: ${classifiedFile.classification.document_type}`);
    console.log(`📝 [REAL METADATA] Texto: ${txtFile.text.length} caracteres`);
    console.log(`🔧 [REAL METADATA] Obteniendo extractor real del factory...`);
    
    // Obtener el extractor específico para el tipo de documento usando método estático
    const extractor = DocumentExtractorFactory.getExtractor(classifiedFile.classification.document_type);
    
    if (!extractor) {
      throw new Error(`Unsupported document type: ${classifiedFile.classification.document_type}`);
    }

    result.extractorUsed = extractor.constructor.name;
    console.log(`✅ [REAL METADATA] Usando extractor: ${result.extractorUsed}`);

    // Usar el método correcto con parámetros reales
    // processMetadata(documentId: string, extractedText: string): Promise<DocumentMetadata>
    const documentId = `test_${classifiedFile.baseFilename}_${Date.now()}`;
    
    console.log(`🚀 [REAL METADATA] Ejecutando extracción de metadata con documentId: ${documentId}...`);
    
    // Ejecutar extracción con el extractor real usando método correcto
    const extractionResult = await extractor.processMetadata(documentId, txtFile.text);
    
    result.success = extractionResult.success || false;
    result.extractedData = extractionResult.data || null;
    result.error = extractionResult.error || null;
    result.processingTime = Date.now() - startTime;

    // Actualizar resumen
    summary[classifiedFile.baseFilename] = {
      document_type: result.documentType,
      success: result.success,
      processing_time: result.processingTime,
      text_length: result.textLength,
      extractor_used: result.extractorUsed,
      data_fields: result.extractedData ? Object.keys(result.extractedData) : [],
      error: result.error
    };

    if (result.success) {
      const dataFields = Object.keys(result.extractedData || {});
      console.log(`✅ [REAL METADATA] Éxito: ${dataFields.length} campos extraídos (${result.processingTime}ms)`);
      console.log(`📊 [REAL METADATA] Campos: ${dataFields.slice(0, 5).join(', ')}${dataFields.length > 5 ? '...' : ''}`);
    } else {
      console.log(`❌ [REAL METADATA] Falló: ${result.error}`);
    }

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.processingTime = Date.now() - startTime;
    
    summary[classifiedFile.baseFilename] = {
      document_type: result.documentType,
      success: false,
      processing_time: result.processingTime,
      text_length: result.textLength,
      extractor_used: 'error',
      data_fields: [],
      error: result.error
    };
    
    console.log(`❌ [REAL METADATA] Error: ${result.error}`);
  }

  return result;
}

async function generateMetadataFiles(classifiedFile: ClassificationFile, result: MetadataResult) {
  try {
    // Crear directorio de metadata si no existe
    const metadataDir = path.join(__dirname, '../../../../datos/metadata');
    await fs.mkdir(metadataDir, { recursive: true });

    if (result.success) {
      // Generar archivo JSON con metadata extraída
      const metadataPath = path.join(metadataDir, `${classifiedFile.baseFilename}_metadata.json`);
      
      const metadataContent = {
        original_file: classifiedFile.original_file,
        base_filename: classifiedFile.baseFilename,
        document_type: result.documentType,
        classification: classifiedFile.classification,
        extraction: {
          success: result.success,
          extractor_used: result.extractorUsed,
          processing_time: result.processingTime,
          data_fields_count: Object.keys(result.extractedData || {}).length
        },
        extracted_data: result.extractedData,
        text_info: {
          length: result.textLength,
          pages: classifiedFile.text_info.pages
        },
        generated_at: new Date().toISOString(),
        tool: 'test-metadata-real.ts'
      };

      await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2), 'utf8');
      console.log(`💾 [REAL METADATA] Generado: datos/metadata/${classifiedFile.baseFilename}_metadata.json`);
    } else {
      // Generar archivo de error
      const errorPath = path.join(metadataDir, `${classifiedFile.baseFilename}_metadata_error.json`);
      const errorContent = {
        original_file: classifiedFile.original_file,
        base_filename: classifiedFile.baseFilename,
        document_type: result.documentType,
        error: result.error,
        extractor_used: result.extractorUsed,
        processing_time: result.processingTime,
        text_length: result.textLength,
        generated_at: new Date().toISOString(),
        tool: 'test-metadata-real.ts'
      };

      await fs.writeFile(errorPath, JSON.stringify(errorContent, null, 2), 'utf8');
      console.log(`💾 [REAL METADATA] Generado: datos/metadata/${classifiedFile.baseFilename}_metadata_error.json`);
    }
  } catch (error) {
    console.log(`⚠️ [REAL METADATA] Error generando archivos: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateMetadataSummary(summary: MetadataSummary) {
  try {
    const summaryPath = path.join(__dirname, '../../../../datos/metadata/metadata_summary_real.json');
    const summaryContent = {
      generated_at: new Date().toISOString(),
      tool: 'test-metadata-real.ts',
      total_files: Object.keys(summary).length,
      successful_extractions: Object.values(summary).filter(s => s.success).length,
      failed_extractions: Object.values(summary).filter(s => !s.success).length,
      document_types: {} as Record<string, number>,
      extractors_used: {} as Record<string, number>,
      average_fields_per_document: 0,
      files: summary
    };

    // Contar tipos de documentos y extractores
    Object.values(summary).forEach(file => {
      summaryContent.document_types[file.document_type] = (summaryContent.document_types[file.document_type] || 0) + 1;
      if (file.success) {
        summaryContent.extractors_used[file.extractor_used] = (summaryContent.extractors_used[file.extractor_used] || 0) + 1;
      }
    });

    // Calcular promedio de campos
    const successfulFiles = Object.values(summary).filter(s => s.success);
    if (successfulFiles.length > 0) {
      summaryContent.average_fields_per_document = successfulFiles.reduce((sum, s) => sum + s.data_fields.length, 0) / successfulFiles.length;
    }

    await fs.writeFile(summaryPath, JSON.stringify(summaryContent, null, 2), 'utf8');
    console.log(`\n💾 [REAL METADATA] Generado: datos/metadata/metadata_summary_real.json`);
    
    // Mostrar resumen en consola
    console.log(`\n📊 [REAL METADATA] RESUMEN DE EXTRACCIÓN DE METADATA:`);
    console.log(`   - Total archivos: ${summaryContent.total_files}`);
    console.log(`   - Exitosos: ${summaryContent.successful_extractions}`);
    console.log(`   - Fallidos: ${summaryContent.failed_extractions}`);
    console.log(`   - Promedio campos/doc: ${summaryContent.average_fields_per_document.toFixed(1)}`);
    console.log(`   - Tipos procesados:`);
    Object.entries(summaryContent.document_types).forEach(([type, count]) => {
      console.log(`     * ${type}: ${count} archivos`);
    });
    console.log(`   - Extractores utilizados:`);
    Object.entries(summaryContent.extractors_used).forEach(([extractor, count]) => {
      console.log(`     * ${extractor}: ${count} archivos`);
    });

  } catch (error) {
    console.log(`⚠️ [REAL METADATA] Error generando resumen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function displayMetadataStats(results: MetadataResult[]) {
  console.log(`\n📊 [REAL METADATA] ===== ESTADÍSTICAS FINALES =====`);
  
  const totalFiles = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.processingTime, 0);
  const avgTime = totalTime / totalFiles;

  // Contar campos extraídos
  const totalFields = results.filter(r => r.success).reduce((sum, r) => {
    return sum + (r.extractedData ? Object.keys(r.extractedData).length : 0);
  }, 0);

  console.log(`📈 [REAL METADATA] Procesamiento completado:`);
  console.log(`   - Total: ${totalFiles} archivos`);
  console.log(`   - Exitosos: ${successful} (${(successful/totalFiles*100).toFixed(1)}%)`);
  console.log(`   - Fallidos: ${failed} (${(failed/totalFiles*100).toFixed(1)}%)`);
  console.log(`   - Tiempo total: ${totalTime}ms`);
  console.log(`   - Tiempo promedio: ${avgTime.toFixed(2)}ms por archivo`);
  console.log(`   - Campos totales extraídos: ${totalFields}`);
  console.log(`   - Promedio campos/doc: ${successful > 0 ? (totalFields/successful).toFixed(1) : 0}`);

  console.log(`\n📁 [REAL METADATA] Archivos generados:`);
  console.log(`   - datos/metadata/*_metadata.json - Metadata extraída`);
  console.log(`   - datos/metadata/metadata_summary_real.json - Resumen completo`);
  
  console.log(`\n🎯 [REAL METADATA] EXTRACTORES REALES COMPLETOS:`);
  console.log(`   - ✅ DocumentExtractorFactory del pipeline`);
  console.log(`   - ✅ ActaExtractor, FacturaExtractor, ContratoExtractor, etc.`);
  console.log(`   - ✅ Agentes IA reales (Gemini)`);
  console.log(`   - ✅ Lógica de guardado en BD`);
  console.log(`\n💡 [REAL METADATA] Resultados = producción exacta`);
  console.log(`\n🔗 [REAL METADATA] Siguiente: npm run test:docs:all`);
}

async function findClassifiedFiles(): Promise<ClassificationFile[]> {
  const classificationDir = path.join(__dirname, '../../../../datos/classification');
  const files: ClassificationFile[] = [];
  
  try {
    const dirFiles = await fs.readdir(classificationDir);
    const classificationFiles = dirFiles.filter(file => 
      file.endsWith('_classification.json') &&
      !file.includes('_error.json') &&
      file !== 'classification_summary_real.json'
    );
    
    for (const file of classificationFiles) {
      try {
        const filePath = path.join(classificationDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        const baseFilename = file.replace('_classification.json', '');
        
        files.push({
          name: file,
          path: filePath,
          baseFilename,
          classification: data.classification,
          original_file: data.original_file,
          extraction_method: data.extraction_method || 'unknown',
          text_info: data.text_info || { length: 0, pages: 0 }
        });
      } catch (err) {
        console.log(`⚠️ [REAL METADATA] Error leyendo ${file}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  } catch (err) {
    console.log(`⚠️ [REAL METADATA] Error accediendo a datos/classification: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
  
  return files;
}

async function loadCorrespondingTexts(classifiedFiles: ClassificationFile[]): Promise<TxtFile[]> {
  const txtDir = path.join(__dirname, '../../../../datos/txt');
  const txtFiles: TxtFile[] = [];
  
  for (const classifiedFile of classifiedFiles) {
    try {
      const txtPath = path.join(txtDir, `${classifiedFile.baseFilename}.txt`);
      const content = await fs.readFile(txtPath, 'utf8');
      
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
        
        txtFiles.push({
          baseFilename: classifiedFile.baseFilename,
          text: textContent.trim(),
          metadata: {
            original: originalMatch ? originalMatch[1] : classifiedFile.original_file,
            method: methodMatch ? methodMatch[1] : 'unknown',
            length: lengthMatch ? parseInt(lengthMatch[1]) : textContent.length,
            pages: pagesMatch ? parseInt(pagesMatch[1]) : 0
          }
        });
      }
    } catch (err) {
      console.log(`⚠️ [REAL METADATA] Error cargando texto para ${classifiedFile.baseFilename}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  return txtFiles;
}

// Ejecutar test si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testRealMetadataExtraction().catch(console.error);
}

export { testRealMetadataExtraction };