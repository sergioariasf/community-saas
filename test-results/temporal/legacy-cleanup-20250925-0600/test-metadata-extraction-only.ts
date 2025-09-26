/**
 * ARCHIVO: test-metadata-extraction-only.ts
 * PROPÓSITO: Test SOLO de extracción de metadata, sin guardado en BD
 * ESTADO: testing
 * DEPENDENCIAS: DocumentExtractorFactory, tsx, archivos TXT+classification
 * OUTPUTS: datos/metadata/*.json con datos extraídos (SIN guardado en BD)
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
  baseFilename: string;
  classification: {
    document_type: string;
    confidence: number;
  };
  original_file: string;
}

interface TxtFile {
  baseFilename: string;
  text: string;
  metadata: {
    original: string;
    length: number;
  };
}

interface ExtractionResult {
  filename: string;
  document_type: string;
  success: boolean;
  extracted_data: any;
  processing_time: number;
  error: string | null;
  extractor_used: string;
}

async function testExtractionOnly() {
  console.log('🧪 [EXTRACTION ONLY] =================================');
  console.log('🧪 [EXTRACTION ONLY] TEST SOLO EXTRACCIÓN DE METADATA');
  console.log('🧪 [EXTRACTION ONLY] =================================\n');

  try {
    const classifiedFiles = await findClassifiedFiles();
    
    if (classifiedFiles.length === 0) {
      console.log('⚠️ [EXTRACTION ONLY] No se encontraron archivos clasificados');
      return;
    }

    console.log(`📁 [EXTRACTION ONLY] Encontrados ${classifiedFiles.length} archivos clasificados\n`);

    const txtFiles = await loadCorrespondingTexts(classifiedFiles);
    const results: ExtractionResult[] = [];

    // Procesar uno de cada tipo disponible
    const testFiles = getOneOfEachType(classifiedFiles);

    for (const classifiedFile of testFiles) {
      console.log(`\n🔍 [EXTRACTION ONLY] ===== EXTRAYENDO: ${classifiedFile.baseFilename} =====`);
      
      const txtFile = txtFiles.find(t => t.baseFilename === classifiedFile.baseFilename);
      if (!txtFile) {
        console.log(`⚠️ [EXTRACTION ONLY] No se encontró texto para ${classifiedFile.baseFilename}`);
        continue;
      }

      const result = await extractDataOnly(classifiedFile, txtFile);
      results.push(result);
      
      // Guardar resultado en archivo JSON
      await saveExtractionResult(result);
    }

    // Mostrar resumen
    displayResults(results);

  } catch (error) {
    console.error('❌ [EXTRACTION ONLY] Error en test:', error);
  }
}

async function extractDataOnly(classifiedFile: ClassificationFile, txtFile: TxtFile): Promise<ExtractionResult> {
  const startTime = Date.now();
  
  try {
    console.log(`📄 [EXTRACTION ONLY] Tipo: ${classifiedFile.classification.document_type}`);
    console.log(`📝 [EXTRACTION ONLY] Texto: ${txtFile.text.length} caracteres`);
    
    // Verificar si el tipo es soportado
    const extractor = DocumentExtractorFactory.getExtractor(classifiedFile.classification.document_type);
    
    if (!extractor) {
      throw new Error(`Unsupported document type: ${classifiedFile.classification.document_type}`);
    }

    console.log(`✅ [EXTRACTION ONLY] Usando extractor: ${extractor.constructor.name}`);
    
    // SOLO LLAMAR AL AGENTE - SIN GUARDADO usando la utilidad compartida
    const { callAgentForTest } = await import('@/lib/ingesta/utils/agentRetryLogic');
    
    // Obtener el nombre del agente del extractor
    const agentName = (extractor as any).config?.agentName;
    if (!agentName) {
      throw new Error('No agent name found in extractor config');
    }

    console.log(`🚀 [EXTRACTION ONLY] Llamando agente: ${agentName}...`);
    
    // Usar la utilidad compartida de retry (mismo código que producción)
    const agentResult = await callAgentForTest(
      agentName,
      txtFile.text,
      '[EXTRACTION ONLY]'
    );

    if (agentResult.success && agentResult.data) {
      console.log(`✅ [EXTRACTION ONLY] Éxito: ${Object.keys(agentResult.data).length} campos extraídos (${agentResult.processingTime}ms)`);
      
      return {
        filename: classifiedFile.original_file,
        document_type: classifiedFile.classification.document_type,
        success: true,
        extracted_data: agentResult.data,
        processing_time: agentResult.processingTime,
        error: null,
        extractor_used: extractor.constructor.name
      };
    } else {
      throw new Error(agentResult.error || 'Agent failed without error message');
    }

  } catch (error) {
    console.log(`❌ [EXTRACTION ONLY] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      filename: classifiedFile.original_file,
      document_type: classifiedFile.classification.document_type,
      success: false,
      extracted_data: null,
      processing_time: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      extractor_used: 'error'
    };
  }
}

async function saveExtractionResult(result: ExtractionResult) {
  try {
    const metadataDir = path.join(__dirname, '../../../../datos/extractions');
    await fs.mkdir(metadataDir, { recursive: true });

    const filename = result.filename.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(metadataDir, `${filename}_extraction.json`);
    
    const content = {
      ...result,
      generated_at: new Date().toISOString(),
      tool: 'test-metadata-extraction-only.ts'
    };

    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`💾 [EXTRACTION ONLY] Guardado: datos/extractions/${filename}_extraction.json`);
    
  } catch (error) {
    console.log(`⚠️ [EXTRACTION ONLY] Error guardando resultado: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function displayResults(results: ExtractionResult[]) {
  console.log(`\n📊 [EXTRACTION ONLY] ===== RESULTADOS =====`);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`📈 [EXTRACTION ONLY] Procesamiento completado:`);
  console.log(`   - Total: ${results.length} archivos`);
  console.log(`   - Exitosos: ${successful.length} (${(successful.length/results.length*100).toFixed(1)}%)`);
  console.log(`   - Fallidos: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log(`\n✅ [EXTRACTION ONLY] Archivos exitosos:`);
    successful.forEach(result => {
      const fieldsCount = result.extracted_data ? Object.keys(result.extracted_data).length : 0;
      console.log(`   - ${result.document_type}: ${fieldsCount} campos (${result.processing_time}ms)`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ [EXTRACTION ONLY] Archivos fallidos:`);
    failed.forEach(result => {
      console.log(`   - ${result.document_type}: ${result.error}`);
    });
  }
  
  console.log(`\n📁 [EXTRACTION ONLY] Resultados guardados en: datos/extractions/`);
  console.log(`🎯 [EXTRACTION ONLY] ¡Test completado! Solo extracción de datos.`);
}

// Funciones auxiliares (reutilizadas del test anterior)
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
          baseFilename,
          classification: data.classification,
          original_file: data.original_file
        });
      } catch (err) {
        console.log(`⚠️ Error leyendo ${file}`);
      }
    }
  } catch (err) {
    console.log(`⚠️ Error accediendo a datos/classification`);
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
      
      const metadataMatch = content.match(/\[METADATA\]\n(.*?)\n\[CONTENT\]\n(.*)/s);
      if (metadataMatch) {
        const metadataSection = metadataMatch[1];
        const textContent = metadataMatch[2];
        
        const originalMatch = metadataSection.match(/Original: (.+)/);
        const lengthMatch = metadataSection.match(/Length: (\d+) characters/);
        
        txtFiles.push({
          baseFilename: classifiedFile.baseFilename,
          text: textContent.trim(),
          metadata: {
            original: originalMatch ? originalMatch[1] : classifiedFile.original_file,
            length: lengthMatch ? parseInt(lengthMatch[1]) : textContent.length
          }
        });
      }
    } catch (err) {
      console.log(`⚠️ Error cargando texto para ${classifiedFile.baseFilename}`);
    }
  }
  
  return txtFiles;
}

function getOneOfEachType(files: ClassificationFile[]): ClassificationFile[] {
  const typesSeen = new Set<string>();
  const selectedFiles: ClassificationFile[] = [];
  
  for (const file of files) {
    const docType = file.classification.document_type;
    if (!typesSeen.has(docType)) {
      typesSeen.add(docType);
      selectedFiles.push(file);
      console.log(`📋 [EXTRACTION ONLY] Seleccionado para ${docType}: ${file.baseFilename}`);
    }
  }
  
  return selectedFiles;
}

// Ejecutar test si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testExtractionOnly().catch(console.error);
}

export { testExtractionOnly };