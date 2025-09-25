/**
 * ARCHIVO: test-single-file.ts
 * PROPÓSITO: Test de extracción de metadata para UN SOLO archivo específico
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

// Importar directamente el sistema de agentes (sin factory que tiene dependencias BD)
import { callSaaSAgent } from '@/lib/gemini/saasAgents';

interface ClassificationFile {
  name: string;
  baseFilename: string;
  classification: {
    document_type: string;
    confidence: number;
  };
}

async function testSingleFile() {
  console.log('🧪 [SINGLE FILE] =================================');
  console.log('🧪 [SINGLE FILE] TEST ARCHIVO ESPECÍFICO');
  console.log('🧪 [SINGLE FILE] =================================\n');

  // CONFIGURA AQUÍ EL ARCHIVO QUE QUIERES PROBAR
  const TARGET_FILE = process.argv[2] || 'GIMNASIO_2023-1-230230'; // Valor por defecto

  console.log(`🎯 [SINGLE FILE] Archivo objetivo: ${TARGET_FILE}\n`);

  try {
    // Buscar archivos de clasificación
    const classificationDir = path.join(__dirname, '../../../../datos/classification');
    const classificationFiles = await fs.readdir(classificationDir);
    
    const classifications: ClassificationFile[] = [];
    
    for (const file of classificationFiles) {
      if (file.endsWith('_classification.json')) {
        const content = await fs.readFile(path.join(classificationDir, file), 'utf-8');
        const data = JSON.parse(content);
        const baseFilename = file.replace('_classification.json', '');
        
        classifications.push({
          name: file,
          baseFilename,
          classification: data
        });
      }
    }

    console.log(`📁 [SINGLE FILE] Encontrados ${classifications.length} archivos clasificados`);

    // Buscar el archivo específico
    const targetClassification = classifications.find(c => 
      c.baseFilename === TARGET_FILE || 
      c.baseFilename.includes(TARGET_FILE)
    );

    if (!targetClassification) {
      console.error(`❌ [SINGLE FILE] No se encontró el archivo: ${TARGET_FILE}`);
      console.log('📋 [SINGLE FILE] Archivos disponibles:');
      classifications.forEach(c => console.log(`   - ${c.baseFilename}`));
      return;
    }

    console.log(`✅ [SINGLE FILE] Encontrado: ${targetClassification.baseFilename}`);
    console.log(`📄 [SINGLE FILE] Tipo: ${targetClassification.classification.document_type}`);

    // Leer el archivo TXT correspondiente
    const txtFile = path.join(__dirname, '../../../../datos/txt', `${targetClassification.baseFilename}.txt`);
    const extractedText = await fs.readFile(txtFile, 'utf-8');
    
    console.log(`📝 [SINGLE FILE] Texto: ${extractedText.length} caracteres`);

    // Usar DocumentExtractorFactory para obtener el extractor correcto
    const documentType = targetClassification.classification.document_type;
    const extractor = DocumentExtractorFactory.createExtractor(documentType);
    
    if (!extractor) {
      console.log(`❌ [SINGLE FILE] Error: Unsupported document type: ${documentType}`);
      return;
    }

    console.log(`✅ [SINGLE FILE] Usando extractor: ${extractor.constructor.name}`);

    // Procesar metadata
    console.log(`🚀 [SINGLE FILE] Llamando agente para ${documentType}...`);
    const startTime = Date.now();
    
    const result = await extractor.processMetadata('fake-doc-id', extractedText);
    
    const processingTime = Date.now() - startTime;
    
    if (result.success) {
      const fieldCount = result.data ? Object.keys(result.data).length : 0;
      console.log(`✅ [SINGLE FILE] Éxito: ${fieldCount} campos extraídos (${processingTime}ms)`);
      
      // Guardar resultado
      const outputDir = path.join(__dirname, '../../../../datos/extractions');
      await fs.mkdir(outputDir, { recursive: true });
      
      const outputFile = path.join(outputDir, `${targetClassification.baseFilename}_single_test.json`);
      await fs.writeFile(outputFile, JSON.stringify({
        filename: `${targetClassification.baseFilename}.pdf`,
        document_type: documentType,
        success: true,
        extracted_data: result.data,
        processing_time: processingTime,
        error: null,
        extractor_used: extractor.constructor.name,
        generated_at: new Date().toISOString(),
        tool: 'test-single-file.ts'
      }, null, 2));
      
      console.log(`💾 [SINGLE FILE] Guardado: ${outputFile}`);
      
      // Mostrar vista previa de los datos extraídos
      console.log('\n📊 [SINGLE FILE] Vista previa de datos extraídos:');
      if (result.data) {
        const keys = Object.keys(result.data);
        keys.slice(0, 10).forEach(key => {
          const value = result.data[key];
          const displayValue = typeof value === 'string' 
            ? (value.length > 50 ? value.substring(0, 50) + '...' : value)
            : JSON.stringify(value);
          console.log(`   ${key}: ${displayValue}`);
        });
        if (keys.length > 10) {
          console.log(`   ... y ${keys.length - 10} campos más`);
        }
      }
      
    } else {
      console.log(`❌ [SINGLE FILE] Error: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ [SINGLE FILE] Error general:', error);
  }

  console.log('\n🎯 [SINGLE FILE] ¡Test completado!');
}

testSingleFile().catch(console.error);