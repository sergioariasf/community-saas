/**
 * ARCHIVO: test-full-pipeline-single.ts
 * PROPÓSITO: Test PIPELINE COMPLETO para UN SOLO archivo PDF específico
 * ESTADO: testing
 * DEPENDENCIAS: progressivePipelineSimple, fs, path
 * OUTPUTS: Procesamiento completo: PDF → OCR → Clasificación → Metadata → BD
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

// Importar el pipeline completo
import { processDocumentSimple } from '../core/progressivePipelineSimple';

async function testSingleFilePipeline() {
  console.log('🧪 [FULL PIPELINE] =================================');
  console.log('🧪 [FULL PIPELINE] TEST PIPELINE COMPLETO - ARCHIVO ÚNICO');
  console.log('🧪 [FULL PIPELINE] =================================\n');

  // CONFIGURA AQUÍ EL ARCHIVO QUE QUIERES PROBAR
  const TARGET_FILE = process.argv[2];
  
  if (!TARGET_FILE) {
    console.error('❌ [FULL PIPELINE] Error: Debes especificar un nombre de archivo');
    console.log('📋 [FULL PIPELINE] Uso: npm run test:docs:pipeline-single <nombre_archivo>');
    console.log('📋 [FULL PIPELINE] Ejemplo: npm run test:docs:pipeline-single GIMNASIO_2023-1-230230');
    return;
  }

  console.log(`🎯 [FULL PIPELINE] Archivo objetivo: ${TARGET_FILE}\n`);

  try {
    // Buscar el archivo PDF
    const pdfDir = path.join(__dirname, '../../../../datos/pdf');
    const pdfFiles = await fs.readdir(pdfDir);
    
    console.log(`📁 [FULL PIPELINE] Encontrados ${pdfFiles.length} archivos PDF`);

    // Buscar el archivo específico (permitir coincidencias parciales)
    const targetPdf = pdfFiles.find(file => 
      file.toLowerCase().includes(TARGET_FILE.toLowerCase()) || 
      TARGET_FILE.toLowerCase().includes(file.toLowerCase().replace('.pdf', ''))
    );

    if (!targetPdf) {
      console.error(`❌ [FULL PIPELINE] No se encontró el archivo PDF: ${TARGET_FILE}`);
      console.log('📋 [FULL PIPELINE] Archivos PDF disponibles:');
      pdfFiles.forEach(file => console.log(`   - ${file.replace('.pdf', '')}`));
      return;
    }

    console.log(`✅ [FULL PIPELINE] Encontrado PDF: ${targetPdf}`);

    // Ruta completa del archivo
    const pdfPath = path.join(pdfDir, targetPdf);
    
    // Verificar que el archivo existe
    const stats = await fs.stat(pdfPath);
    console.log(`📄 [FULL PIPELINE] Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);

    // Simular datos de documento como si viniera de upload
    const mockDocument = {
      id: 'test-' + Date.now(),
      organization_id: 'test-org',
      community_id: 'test-community',
      filename: targetPdf,
      file_path: pdfPath,
      file_size: stats.size,
      mime_type: 'application/pdf',
      original_filename: targetPdf,
      uploaded_by: 'test-user'
    };

    console.log(`🚀 [FULL PIPELINE] Iniciando pipeline completo para: ${targetPdf}`);
    console.log('🔄 [FULL PIPELINE] Fases: PDF → OCR → Clasificación → Metadata → BD\n');

    const startTime = Date.now();

    // Ejecutar el pipeline completo
    const result = await processDocumentSimple(mockDocument);

    const totalTime = Date.now() - startTime;

    if (result.success) {
      console.log('\n✅ [FULL PIPELINE] ¡PIPELINE COMPLETADO CON ÉXITO!');
      console.log(`⏱️  [FULL PIPELINE] Tiempo total: ${totalTime}ms`);
      console.log(`📊 [FULL PIPELINE] Resultados:`);
      console.log(`   - Extracción: ${result.extractionSuccess ? '✅' : '❌'}`);
      console.log(`   - Clasificación: ${result.classificationSuccess ? '✅' : '❌'}`);
      console.log(`   - Metadata: ${result.metadataSuccess ? '✅' : '❌'}`);
      console.log(`   - Chunking: ${result.chunkingSuccess ? '✅' : '❌'}`);
      
      if (result.documentType) {
        console.log(`   - Tipo detectado: ${result.documentType}`);
      }
      
      if (result.metadataFieldsCount) {
        console.log(`   - Campos extraídos: ${result.metadataFieldsCount}`);
      }

      // Mostrar información de dónde encontrar los resultados
      console.log('\n📁 [FULL PIPELINE] Archivos generados:');
      console.log(`   - OCR: datos/txt/${targetPdf.replace('.pdf', '.txt')}`);
      console.log(`   - Clasificación: datos/classification/${targetPdf.replace('.pdf', '_classification.json')}`);
      console.log(`   - Metadata: Guardado en base de datos`);
      console.log(`   - Chunks: Guardado en base de datos`);

    } else {
      console.log('\n❌ [FULL PIPELINE] PIPELINE FALLÓ');
      console.log(`⏱️  [FULL PIPELINE] Tiempo hasta fallo: ${totalTime}ms`);
      console.log(`📊 [FULL PIPELINE] Estado de fases:`);
      console.log(`   - Extracción: ${result.extractionSuccess ? '✅' : '❌'}`);
      console.log(`   - Clasificación: ${result.classificationSuccess ? '✅' : '❌'}`);
      console.log(`   - Metadata: ${result.metadataSuccess ? '✅' : '❌'}`);
      console.log(`   - Chunking: ${result.chunkingSuccess ? '✅' : '❌'}`);
      
      if (result.error) {
        console.log(`❌ [FULL PIPELINE] Error: ${result.error}`);
      }
    }

  } catch (error) {
    console.error('❌ [FULL PIPELINE] Error general:', error);
  }

  console.log('\n🎯 [FULL PIPELINE] ¡Test completado!');
}

testSingleFilePipeline().catch(console.error);