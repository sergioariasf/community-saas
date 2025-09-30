/**
 * ARCHIVO: test-individual-extractors.ts
 * PROPÓSITO: Test individual de cada extractor para identificar cuál falla en producción
 * ESTADO: development
 * DEPENDENCIAS: PdfParseExtractor, GoogleVisionExtractor, GeminiFlashExtractor
 * OUTPUTS: Resultado individual de cada estrategia de extracción
 * ACTUALIZADO: 2025-09-30
 */

import { PdfParseExtractor } from '../core/extraction/PdfParseExtractor';
import { GoogleVisionExtractor } from '../core/extraction/GoogleVisionExtractor';
import { GeminiFlashExtractor } from '../core/extraction/GeminiFlashExtractor';
import { ExtractionContext } from '../core/extraction/BaseTextExtractor';
import fs from 'fs';
import path from 'path';

async function testIndividualExtractors() {
  console.log('🔧 [INDIVIDUAL TEST] Testing each extractor separately...');
  
  const testFile = path.join(process.cwd(), 'datos/pdf/ACTA 18 NOVIEMBRE 2022.pdf');
  const buffer = fs.readFileSync(testFile);
  
  const context: ExtractionContext = {
    buffer,
    filename: 'ACTA 18 NOVIEMBRE 2022.pdf',
    documentId: 'test-individual-doc-id',
    minTextLength: 50
  };
  
  console.log(`📄 [INDIVIDUAL TEST] File: ${context.filename} (${buffer.length} bytes)`);
  
  // Test 1: PDF-Parse
  console.log('\n🚀 [TEST 1] PDF-Parse Extractor...');
  try {
    const pdfExtractor = new PdfParseExtractor();
    console.log('   - Can handle:', pdfExtractor.canHandle(context));
    console.log('   - Priority:', pdfExtractor.getPriority());
    
    const startTime = Date.now();
    const pdfResult = await pdfExtractor.extract(context);
    const duration = Date.now() - startTime;
    
    console.log('   - Success:', pdfResult.success);
    console.log('   - Method:', pdfResult.method);
    console.log('   - Text length:', pdfResult.textLength || 0);
    console.log('   - Duration:', duration, 'ms');
    
    if (!pdfResult.success) {
      console.log('   - Error:', pdfResult.error);
    }
    
  } catch (error) {
    console.error('❌ [TEST 1] PDF-Parse failed:', error);
  }
  
  // Test 2: Google Vision
  console.log('\n🚀 [TEST 2] Google Vision Extractor...');
  try {
    const visionExtractor = new GoogleVisionExtractor();
    console.log('   - Can handle:', visionExtractor.canHandle(context));
    console.log('   - Priority:', visionExtractor.getPriority());
    
    const startTime = Date.now();
    const visionResult = await visionExtractor.extract(context);
    const duration = Date.now() - startTime;
    
    console.log('   - Success:', visionResult.success);
    console.log('   - Method:', visionResult.method);
    console.log('   - Text length:', visionResult.textLength || 0);
    console.log('   - Duration:', duration, 'ms');
    
    if (!visionResult.success) {
      console.log('   - Error:', visionResult.error);
    }
    
  } catch (error) {
    console.error('❌ [TEST 2] Google Vision failed:', error);
  }
  
  // Test 3: Gemini Flash
  console.log('\n🚀 [TEST 3] Gemini Flash Extractor...');
  try {
    const geminiExtractor = new GeminiFlashExtractor();
    console.log('   - Can handle:', geminiExtractor.canHandle(context));
    console.log('   - Priority:', geminiExtractor.getPriority());
    
    const startTime = Date.now();
    const geminiResult = await geminiExtractor.extract(context);
    const duration = Date.now() - startTime;
    
    console.log('   - Success:', geminiResult.success);
    console.log('   - Method:', geminiResult.method);
    console.log('   - Text length:', geminiResult.textLength || 0);
    console.log('   - Duration:', duration, 'ms');
    
    if (!geminiResult.success) {
      console.log('   - Error:', geminiResult.error);
    }
    
  } catch (error) {
    console.error('❌ [TEST 3] Gemini Flash failed:', error);
  }
  
  console.log('\n✅ [INDIVIDUAL TEST] All extractor tests completed');
}

// Ejecutar tests
testIndividualExtractors().catch(console.error);