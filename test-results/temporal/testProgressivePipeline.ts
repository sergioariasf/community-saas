/**
 * ARCHIVO: testProgressivePipeline.ts
 * PROPÓSITO: Test integrado completo del pipeline progresivo de 4 niveles
 * ESTADO: production
 * DEPENDENCIAS: progressivePipeline.ts, documentsStore.ts, archivos PDF de prueba
 * OUTPUTS: Test exhaustivo con métricas de tiempo, tokens y calidad
 * ACTUALIZADO: 2025-09-14
 */

// ===============================================================================
// TEST PROGRESSIVE PIPELINE - Función de Test Integrada
// ===============================================================================
// 
// Test completo del pipeline progresivo con documento real
// Siguiendo la práctica de tests integrados en el mismo módulo

import ProgressivePipeline from './progressivePipeline';
import { DocumentsStore } from '../storage/documentsStore';
import type { CreateDocumentInput, ProcessingLevel } from '../storage/types';

// ===============================================================================
// TEST CONFIGURATION
// ===============================================================================

const TEST_CONFIG = {
  // Documento de test (debe existir en el filesystem)
  test_file: '/home/sergi/proyectos/community-saas/datos/ACTA 19 MAYO 2022.pdf',
  test_filename: 'ACTA 19 MAYO 2022.pdf',
  
  // Configuración de test
  organization_id: 'test-org-uuid', // TODO: Usar organization_id real de tu DB
  community_id: 'test-community-uuid', // TODO: Usar community_id real si aplica
  
  // Niveles a testear
  test_levels: [1, 2, 3, 4] as ProcessingLevel[],
  
  // Configuración pipeline para test
  pipeline_config: {
    extraction: {
      methods: ['pdf-parse', 'ocr'],
      fallback_enabled: true,
      max_retries: 1
    },
    classification: {
      confidence_threshold: 0.5, // Más permisivo para tests
      enabled_types: ['acta', 'contrato', 'factura', 'comunicado'],
      fallback_to_filename: true
    },
    metadata: {
      enabled_contracts: ['acta'],
      validation_level: 'warn' as const,
      confidence_threshold: 0.4 // Más permisivo para tests
    },
    chunking: {
      method: 'semantic' as const,
      chunk_size: 500, // Chunks más pequeños para test
      overlap: 100,
      quality_threshold: 0.3,
      generate_embeddings: false // Sin embeddings en test por simplicidad
    }
  }
};

// ===============================================================================
// TEST UTILITIES
// ===============================================================================

interface TestResult {
  test_name: string;
  success: boolean;
  duration_ms: number;
  details: Record<string, any>;
  error?: string;
}

interface PipelineTestSuite {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  total_duration_ms: number;
  results: TestResult[];
  summary: {
    extraction_success: boolean;
    classification_success: boolean;
    metadata_success: boolean;
    chunking_success: boolean;
    pipeline_coherence: boolean;
  };
}

// ===============================================================================
// MAIN TEST FUNCTION
// ===============================================================================

export async function testProgressivePipeline(
  organizationId?: string,
  customConfig?: any
): Promise<PipelineTestSuite> {
  const startTime = Date.now();
  const results: TestResult[] = [];
  
  console.log('🧪 Starting Progressive Pipeline Test Suite');
  console.log('=====================================');
  
  const effectiveOrgId = organizationId || TEST_CONFIG.organization_id;
  const config = { ...TEST_CONFIG.pipeline_config, ...customConfig };
  
  // Initialize pipeline
  const pipeline = new ProgressivePipeline(config);
  
  // Test 1: Create Test Document
  const createDocResult = await runTest(
    'Create Test Document',
    () => createTestDocument(effectiveOrgId)
  );
  results.push(createDocResult);
  
  if (!createDocResult.success) {
    return buildTestSuite(results, startTime);
  }
  
  const documentId = createDocResult.details.document_id;
  
  // Test 2-5: Progressive levels
  for (const level of TEST_CONFIG.test_levels) {
    const levelResult = await runTest(
      `Process Level ${level}`,
      () => testProcessingLevel(pipeline, documentId, level)
    );
    results.push(levelResult);
  }
  
  // Test 6: Pipeline Status
  const statusResult = await runTest(
    'Verify Pipeline Status',
    () => verifyPipelineStatus(documentId)
  );
  results.push(statusResult);
  
  // Test 7: Data Coherence  
  const coherenceResult = await runTest(
    'Verify Data Coherence',
    () => verifyDataCoherence(documentId)
  );
  results.push(coherenceResult);
  
  // Test 8: Resume Processing
  const resumeResult = await runTest(
    'Test Resume Processing',
    () => testResumeProcessing(pipeline, effectiveOrgId)
  );
  results.push(resumeResult);
  
  // Cleanup
  await runTest(
    'Cleanup Test Data',
    () => cleanupTestData(documentId)
  );
  
  return buildTestSuite(results, startTime);
}

// ===============================================================================
// INDIVIDUAL TEST FUNCTIONS
// ===============================================================================

async function createTestDocument(organizationId: string): Promise<any> {
  // Check if test file exists
  const fs = require('fs');
  if (!fs.existsSync(TEST_CONFIG.test_file)) {
    throw new Error(`Test file not found: ${TEST_CONFIG.test_file}`);
  }
  
  const stats = fs.statSync(TEST_CONFIG.test_file);
  
  const documentInput: CreateDocumentInput = {
    organization_id: organizationId,
    community_id: TEST_CONFIG.community_id,
    filename: TEST_CONFIG.test_filename,
    file_path: TEST_CONFIG.test_file,
    file_size: stats.size,
    file_hash: `test-hash-${Date.now()}`,
    processing_level: 4, // Max level for comprehensive test
    mime_type: 'application/pdf',
    original_filename: TEST_CONFIG.test_filename
  };
  
  const result = await DocumentsStore.createDocument(documentInput);
  
  if (!result.success) {
    throw new Error(`Failed to create document: ${result.error}`);
  }
  
  return {
    document_id: result.document.id,
    file_size: stats.size,
    processing_level: result.document.processing_level
  };
}

async function testProcessingLevel(
  pipeline: ProgressivePipeline,
  documentId: string,
  level: ProcessingLevel
): Promise<any> {
  
  // Update document processing level
  const { error: updateError } = await supabase
    .from('documents')
    .update({ processing_level: level })
    .eq('id', documentId);
    
  if (updateError) {
    throw new Error(`Failed to update processing level: ${updateError.message}`);
  }
  
  // Execute pipeline
  const pipelineResult = await pipeline.processDocument(documentId, level);
  
  if (!pipelineResult.success) {
    throw new Error(`Pipeline failed: ${pipelineResult.error}`);
  }
  
  // Verify expected steps were completed
  const expectedSteps = getExpectedStepsForLevel(level);
  const completedSteps = pipelineResult.completed_steps.map(s => s.step);
  
  for (const expectedStep of expectedSteps) {
    if (!completedSteps.includes(expectedStep)) {
      throw new Error(`Expected step '${expectedStep}' was not completed for level ${level}`);
    }
  }
  
  return {
    level: level,
    completed_steps: completedSteps,
    failed_steps: pipelineResult.failed_steps.map(s => s.step),
    total_processing_time_ms: pipelineResult.total_processing_time_ms,
    total_tokens_used: pipelineResult.total_tokens_used,
    estimated_cost_usd: pipelineResult.estimated_total_cost_usd
  };
}

async function verifyPipelineStatus(documentId: string): Promise<any> {
  const status = await DocumentsStore.getPipelineStatus(documentId);
  
  if (!status) {
    throw new Error('Failed to get pipeline status');
  }
  
  // Verify all steps are completed for level 4
  const expectedSteps = ['extraction', 'classification', 'metadata', 'chunking'];
  const missingSteps = expectedSteps.filter(step => !status.completed_steps.includes(step));
  
  if (missingSteps.length > 0) {
    throw new Error(`Missing completed steps: ${missingSteps.join(', ')}`);
  }
  
  return {
    overall_status: status.overall_status,
    completed_steps: status.completed_steps,
    processing_level: status.current_level,
    total_time_ms: status.total_processing_time_ms,
    total_tokens: status.total_tokens_used
  };
}

async function verifyDataCoherence(documentId: string): Promise<any> {
  // Get document with all relations
  const documentWithRelations = await DocumentsStore.getDocumentWithRelations(documentId);
  
  if (!documentWithRelations) {
    throw new Error('Failed to get document with relations');
  }
  
  const coherenceChecks = {
    has_extracted_text: !!documentWithRelations.extracted_text,
    has_classification: !!documentWithRelations.classification,
    has_metadata: !!documentWithRelations.metadata,
    has_chunks: (documentWithRelations.chunks_summary?.total_chunks || 0) > 0,
    text_length_positive: (documentWithRelations.text_length || 0) > 0,
    classification_confidence_reasonable: (documentWithRelations.classification?.confidence || 0) > 0.1,
    metadata_confidence_reasonable: (documentWithRelations.metadata?.confidence || 0) > 0.1
  };
  
  const failedChecks = Object.entries(coherenceChecks)
    .filter(([_, passed]) => !passed)
    .map(([check, _]) => check);
  
  if (failedChecks.length > 0) {
    throw new Error(`Data coherence failed: ${failedChecks.join(', ')}`);
  }
  
  return {
    coherence_checks: coherenceChecks,
    document_type: documentWithRelations.classification?.document_type,
    text_length: documentWithRelations.text_length,
    total_chunks: documentWithRelations.chunks_summary?.total_chunks,
    chunks_with_embeddings: documentWithRelations.chunks_summary?.chunks_with_embeddings
  };
}

async function testResumeProcessing(
  pipeline: ProgressivePipeline,
  organizationId: string
): Promise<any> {
  
  // Create another test document but don't process it
  const incompleteDoc = await createTestDocument(organizationId);
  
  // Resume processing for organization
  const resumeResults = await pipeline.resumeProcessing(organizationId, 2); // Only level 2
  
  // Should find and process the incomplete document
  const processedDoc = resumeResults.find(r => r.document_id === incompleteDoc.document_id);
  
  if (!processedDoc) {
    throw new Error('Resume processing did not find incomplete document');
  }
  
  // Cleanup incomplete doc
  await cleanupTestData(incompleteDoc.document_id);
  
  return {
    documents_processed: resumeResults.length,
    incomplete_doc_processed: !!processedDoc,
    resume_success: processedDoc?.success
  };
}

async function cleanupTestData(documentId: string): Promise<any> {
  // Delete document and all related data (cascades should handle relations)
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);
    
  if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
    console.warn(`Cleanup warning: ${error.message}`);
  }
  
  return { cleanup_completed: true };
}

// ===============================================================================
// TEST UTILITIES
// ===============================================================================

async function runTest(testName: string, testFunction: () => Promise<any>): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`🧪 Running test: ${testName}`);
  
  try {
    const details = await testFunction();
    const duration = Date.now() - startTime;
    
    console.log(`  ✅ PASSED in ${duration}ms`);
    
    return {
      test_name: testName,
      success: true,
      duration_ms: duration,
      details: details || {}
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.log(`  ❌ FAILED in ${duration}ms: ${error.message}`);
    
    return {
      test_name: testName,
      success: false,
      duration_ms: duration,
      details: {},
      error: error.message
    };
  }
}

function buildTestSuite(results: TestResult[], startTime: number): PipelineTestSuite {
  const totalDuration = Date.now() - startTime;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.length - passedTests;
  
  // Analyze specific functionality success
  const getTestResult = (testName: string) => 
    results.find(r => r.test_name.includes(testName))?.success || false;
  
  console.log('\n🏁 Test Suite Complete');
  console.log('=====================');
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Duration: ${totalDuration}ms`);
  
  return {
    total_tests: results.length,
    passed_tests: passedTests,
    failed_tests: failedTests,
    total_duration_ms: totalDuration,
    results,
    summary: {
      extraction_success: getTestResult('Level 1') || getTestResult('Level 2'),
      classification_success: getTestResult('Level 2') || getTestResult('Level 3'),
      metadata_success: getTestResult('Level 3') || getTestResult('Level 4'),
      chunking_success: getTestResult('Level 4'),
      pipeline_coherence: getTestResult('Data Coherence')
    }
  };
}

function getExpectedStepsForLevel(level: ProcessingLevel): string[] {
  switch (level) {
    case 1: return ['extraction'];
    case 2: return ['extraction', 'classification'];
    case 3: return ['extraction', 'classification', 'metadata'];
    case 4: return ['extraction', 'classification', 'metadata', 'chunking'];
    default: return ['extraction'];
  }
}

// ===============================================================================
// EXPORTS
// ===============================================================================

export default testProgressivePipeline;

export type {
  TestResult,
  PipelineTestSuite
};

// Helper export for individual module testing
export {
  createTestDocument,
  testProcessingLevel,
  verifyDataCoherence
};

// Import supabase for cleanup operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);