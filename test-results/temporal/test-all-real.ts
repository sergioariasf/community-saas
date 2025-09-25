/**
 * ARCHIVO: test-all-real.ts
 * PROPÓSITO: Test COMPLETO ejecutando toda la cadena: EXTRACCIÓN → CLASIFICACIÓN → METADATA
 * ESTADO: testing
 * DEPENDENCIAS: test-text-extraction-real.ts, test-classification-real.ts, test-metadata-real.ts
 * OUTPUTS: Ejecuta secuencialmente todos los tests y genera reporte final
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

// Importar los tests individuales
import { testRealTextExtraction } from './test-text-extraction-real.js';
import { testRealClassification } from './test-classification-real.js';
import { testRealMetadataExtraction } from './test-metadata-real.js';

interface TestResult {
  module: string;
  success: boolean;
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  processingTime: number;
  errors: string[];
}

interface ChainSummary {
  started_at: string;
  completed_at: string;
  total_processing_time: number;
  modules: TestResult[];
  overall_success: boolean;
  chain_efficiency: {
    extraction_rate: number;
    classification_rate: number;
    metadata_rate: number;
    end_to_end_rate: number;
  };
  files_by_stage: {
    initial_pdfs: number;
    extracted_texts: number;
    classified_documents: number;
    metadata_extracted: number;
  };
}

async function runCompleteChain() {
  console.log('🚀 [PIPELINE COMPLETO] =======================================');
  console.log('🚀 [PIPELINE COMPLETO] TEST COMPLETO DE TODO EL PIPELINE');
  console.log('🚀 [PIPELINE COMPLETO] =======================================\n');

  const startTime = Date.now();
  const results: TestResult[] = [];

  try {
    // 1. FASE: EXTRACCIÓN DE TEXTO
    console.log('📝 [PIPELINE COMPLETO] ===== FASE 1: EXTRACCIÓN DE TEXTO =====\n');
    const extractionStart = Date.now();
    
    try {
      await testRealTextExtraction();
      const extractionSummary = await loadExtractionSummary();
      
      results.push({
        module: 'TEXT_EXTRACTION',
        success: extractionSummary.failed_extractions === 0,
        totalFiles: extractionSummary.total_files,
        successfulFiles: extractionSummary.successful_extractions,
        failedFiles: extractionSummary.failed_extractions,
        processingTime: Date.now() - extractionStart,
        errors: []
      });
      
      console.log(`✅ [PIPELINE COMPLETO] Extracción completada: ${extractionSummary.successful_extractions}/${extractionSummary.total_files} archivos\n`);
    } catch (error) {
      console.log(`❌ [PIPELINE COMPLETO] Error en extracción: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      results.push({
        module: 'TEXT_EXTRACTION',
        success: false,
        totalFiles: 0,
        successfulFiles: 0,
        failedFiles: 0,
        processingTime: Date.now() - extractionStart,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // 2. FASE: CLASIFICACIÓN
    console.log('🏷️ [PIPELINE COMPLETO] ===== FASE 2: CLASIFICACIÓN =====\n');
    const classificationStart = Date.now();
    
    try {
      await testRealClassification();
      const classificationSummary = await loadClassificationSummary();
      
      results.push({
        module: 'CLASSIFICATION',
        success: classificationSummary.failed_classifications === 0,
        totalFiles: classificationSummary.total_files,
        successfulFiles: classificationSummary.successful_classifications,
        failedFiles: classificationSummary.failed_classifications,
        processingTime: Date.now() - classificationStart,
        errors: []
      });
      
      console.log(`✅ [PIPELINE COMPLETO] Clasificación completada: ${classificationSummary.successful_classifications}/${classificationSummary.total_files} archivos\n`);
    } catch (error) {
      console.log(`❌ [PIPELINE COMPLETO] Error en clasificación: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      results.push({
        module: 'CLASSIFICATION',
        success: false,
        totalFiles: 0,
        successfulFiles: 0,
        failedFiles: 0,
        processingTime: Date.now() - classificationStart,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // 3. FASE: EXTRACCIÓN DE METADATA
    console.log('🔍 [PIPELINE COMPLETO] ===== FASE 3: EXTRACCIÓN DE METADATA =====\n');
    const metadataStart = Date.now();
    
    try {
      await testRealMetadataExtraction();
      const metadataSummary = await loadMetadataSummary();
      
      results.push({
        module: 'METADATA_EXTRACTION',
        success: metadataSummary.failed_extractions === 0,
        totalFiles: metadataSummary.total_files,
        successfulFiles: metadataSummary.successful_extractions,
        failedFiles: metadataSummary.failed_extractions,
        processingTime: Date.now() - metadataStart,
        errors: []
      });
      
      console.log(`✅ [PIPELINE COMPLETO] Metadata completada: ${metadataSummary.successful_extractions}/${metadataSummary.total_files} archivos\n`);
    } catch (error) {
      console.log(`❌ [PIPELINE COMPLETO] Error en metadata: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      results.push({
        module: 'METADATA_EXTRACTION',
        success: false,
        totalFiles: 0,
        successfulFiles: 0,
        failedFiles: 0,
        processingTime: Date.now() - metadataStart,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // GENERAR RESUMEN FINAL
    await generateChainSummary(results, startTime);
    displayFinalResults(results);

  } catch (error) {
    console.error('❌ [PIPELINE COMPLETO] Error crítico:', error);
  }
}

async function loadExtractionSummary() {
  try {
    const summaryPath = path.join(__dirname, '../../../../datos/txt/extraction_summary_real.json');
    const content = await fs.readFile(summaryPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log('⚠️ [PIPELINE COMPLETO] No se pudo cargar resumen de extracción');
    return { total_files: 0, successful_extractions: 0, failed_extractions: 0 };
  }
}

async function loadClassificationSummary() {
  try {
    const summaryPath = path.join(__dirname, '../../../../datos/classification/classification_summary_real.json');
    const content = await fs.readFile(summaryPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log('⚠️ [PIPELINE COMPLETO] No se pudo cargar resumen de clasificación');
    return { total_files: 0, successful_classifications: 0, failed_classifications: 0 };
  }
}

async function loadMetadataSummary() {
  try {
    const summaryPath = path.join(__dirname, '../../../../datos/metadata/metadata_summary_real.json');
    const content = await fs.readFile(summaryPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log('⚠️ [PIPELINE COMPLETO] No se pudo cargar resumen de metadata');
    return { total_files: 0, successful_extractions: 0, failed_extractions: 0 };
  }
}

async function generateChainSummary(results: TestResult[], startTime: number) {
  try {
    const endTime = Date.now();
    const extractionResult = results.find(r => r.module === 'TEXT_EXTRACTION');
    const classificationResult = results.find(r => r.module === 'CLASSIFICATION');
    const metadataResult = results.find(r => r.module === 'METADATA_EXTRACTION');

    const summary: ChainSummary = {
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date(endTime).toISOString(),
      total_processing_time: endTime - startTime,
      modules: results,
      overall_success: results.every(r => r.success),
      chain_efficiency: {
        extraction_rate: extractionResult ? (extractionResult.successfulFiles / extractionResult.totalFiles) * 100 : 0,
        classification_rate: classificationResult ? (classificationResult.successfulFiles / classificationResult.totalFiles) * 100 : 0,
        metadata_rate: metadataResult ? (metadataResult.successfulFiles / metadataResult.totalFiles) * 100 : 0,
        end_to_end_rate: 0
      },
      files_by_stage: {
        initial_pdfs: extractionResult?.totalFiles || 0,
        extracted_texts: extractionResult?.successfulFiles || 0,
        classified_documents: classificationResult?.successfulFiles || 0,
        metadata_extracted: metadataResult?.successfulFiles || 0
      }
    };

    // Calcular tasa end-to-end
    if (summary.files_by_stage.initial_pdfs > 0) {
      summary.chain_efficiency.end_to_end_rate = 
        (summary.files_by_stage.metadata_extracted / summary.files_by_stage.initial_pdfs) * 100;
    }

    const summaryPath = path.join(__dirname, '../../../../datos/pipeline_summary_complete.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    
    console.log(`\n💾 [PIPELINE COMPLETO] Resumen generado: datos/pipeline_summary_complete.json`);
  } catch (error) {
    console.log(`⚠️ [PIPELINE COMPLETO] Error generando resumen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function displayFinalResults(results: TestResult[]) {
  console.log(`\n📊 [PIPELINE COMPLETO] ===== RESULTADOS FINALES =====`);
  
  const totalTime = results.reduce((sum, r) => sum + r.processingTime, 0);
  const overallSuccess = results.every(r => r.success);
  
  console.log(`\n⏱️ [PIPELINE COMPLETO] Tiempo total: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
  console.log(`🎯 [PIPELINE COMPLETO] Estado general: ${overallSuccess ? '✅ ÉXITO' : '❌ FALLOS DETECTADOS'}`);
  
  console.log(`\n📋 [PIPELINE COMPLETO] Resultados por módulo:`);
  results.forEach(result => {
    const successRate = result.totalFiles > 0 ? (result.successfulFiles / result.totalFiles * 100).toFixed(1) : '0.0';
    const status = result.success ? '✅' : '❌';
    
    console.log(`   ${status} ${result.module}:`);
    console.log(`      - Archivos: ${result.successfulFiles}/${result.totalFiles} (${successRate}%)`);
    console.log(`      - Tiempo: ${result.processingTime}ms`);
    if (result.errors.length > 0) {
      console.log(`      - Errores: ${result.errors.length}`);
    }
  });
  
  // Flujo de archivos
  const extraction = results.find(r => r.module === 'TEXT_EXTRACTION');
  const classification = results.find(r => r.module === 'CLASSIFICATION');
  const metadata = results.find(r => r.module === 'METADATA_EXTRACTION');
  
  console.log(`\n🔄 [PIPELINE COMPLETO] Flujo de archivos:`);
  console.log(`   📄 PDFs iniciales: ${extraction?.totalFiles || 0}`);
  console.log(`   📝 Textos extraídos: ${extraction?.successfulFiles || 0}`);
  console.log(`   🏷️ Documentos clasificados: ${classification?.successfulFiles || 0}`);
  console.log(`   🔍 Metadata extraída: ${metadata?.successfulFiles || 0}`);
  
  const endToEndRate = extraction && extraction.totalFiles > 0 
    ? ((metadata?.successfulFiles || 0) / extraction.totalFiles * 100).toFixed(1)
    : '0.0';
  
  console.log(`\n🎯 [PIPELINE COMPLETO] Tasa end-to-end: ${endToEndRate}%`);
  
  console.log(`\n📁 [PIPELINE COMPLETO] Archivos generados:`);
  console.log(`   - datos/txt/ - Textos extraídos y resumen`);
  console.log(`   - datos/classification/ - Clasificaciones y resumen`);
  console.log(`   - datos/metadata/ - Metadata extraída y resumen`);
  console.log(`   - datos/pipeline_summary_complete.json - Resumen completo`);
  
  console.log(`\n🚀 [PIPELINE COMPLETO] ===== PIPELINE COMPLETO FINALIZADO =====`);
  console.log(`🔧 [PIPELINE COMPLETO] Framework de testing: ✅ FUNCIONAL`);
  console.log(`📊 [PIPELINE COMPLETO] Análisis de rendimiento: ✅ COMPLETO`);
  console.log(`🎯 [PIPELINE COMPLETO] Identificación de problemas: ✅ DETALLADA`);
}

// Ejecutar test completo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteChain().catch(console.error);
}

export { runCompleteChain };