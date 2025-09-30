/**
 * ARCHIVO: test-extraction-factory-debug.ts
 * PROPÓSITO: Debug del TextExtractionFactory - verificar orden de estrategias
 * ESTADO: development
 * DEPENDENCIAS: TextExtractionFactory, PDF test file
 * OUTPUTS: Log detallado del orden de ejecución de extractores
 * ACTUALIZADO: 2025-09-30
 */

import { TextExtractionFactory } from '../core/extraction/TextExtractionFactory';
import { ExtractionContext } from '../core/extraction/BaseTextExtractor';
import fs from 'fs';
import path from 'path';

async function debugExtractionFactory() {
  console.log('🔧 [FACTORY DEBUG] Starting TextExtractionFactory debug...');
  
  // Usar el archivo de test que sabemos que funciona
  const testFile = path.join(process.cwd(), 'datos/pdf/ACTA 18 NOVIEMBRE 2022.pdf');
  
  if (!fs.existsSync(testFile)) {
    console.error('❌ Test file not found:', testFile);
    return;
  }
  
  const buffer = fs.readFileSync(testFile);
  console.log(`📄 [FACTORY DEBUG] Loaded test file: ${buffer.length} bytes`);
  
  // Crear contexto de extracción
  const context: ExtractionContext = {
    buffer,
    filename: 'ACTA 18 NOVIEMBRE 2022.pdf',
    documentId: 'debug-test-doc-id',
    minTextLength: 50
  };
  
  // Crear factory
  const factory = new TextExtractionFactory();
  
  // Verificar extractores disponibles
  console.log('🔍 [FACTORY DEBUG] Available extractors:', factory.getAvailableExtractors());
  
  // Verificar estado de extractores
  const status = await factory.getExtractorsStatus(context);
  console.log('📊 [FACTORY DEBUG] Extractors status:', status);
  
  // Ejecutar extracción con logs detallados
  console.log('🚀 [FACTORY DEBUG] Starting extraction...');
  const startTime = Date.now();
  
  try {
    const result = await factory.extractText(context);
    const duration = Date.now() - startTime;
    
    console.log('✅ [FACTORY DEBUG] Extraction completed in', duration, 'ms');
    console.log('📋 [FACTORY DEBUG] Result summary:');
    console.log('   - Success:', result.success);
    console.log('   - Method:', result.method);
    console.log('   - Text length:', result.textLength || 0);
    
    if (!result.success) {
      console.log('   - Error:', result.error);
    }
    
    if (result.success && result.text) {
      console.log('   - First 100 chars:', result.text.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error('❌ [FACTORY DEBUG] Factory failed:', error);
  }
}

// Ejecutar debug
debugExtractionFactory().catch(console.error);