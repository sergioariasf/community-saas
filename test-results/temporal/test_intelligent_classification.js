/**
 * ARCHIVO: test_intelligent_classification.js
 * PROPÓSITO: Probar el sistema de clasificación inteligente
 * ESTADO: development
 * DEPENDENCIAS: DocumentClassifier, dotenv
 * OUTPUTS: Test de clasificación con diferentes tipos de documentos
 * ACTUALIZADO: 2025-09-21
 */

require('dotenv').config({ path: '.env.local' });

// Import the classifier
const { DocumentClassifier } = require('./src/lib/ingesta/core/strategies/DocumentClassifier.js');

async function testClassification() {
  console.log('🧪 [TEST] Testing Intelligent Document Classification System\n');
  
  const classifier = new DocumentClassifier();
  
  // Test cases with different confidence scenarios
  const testCases = [
    {
      name: 'Clear filename - Factura',
      filename: 'factura-empresa-123.pdf',
      extractedText: 'Esta es una factura por servicios prestados. Importe total: 1250€. IVA: 21%',
      useAI: true
    },
    {
      name: 'Clear filename - Acta',
      filename: 'acta-junta-propietarios-enero.pdf',
      extractedText: 'Se convoca la junta de propietarios para el día 15 de enero. Orden del día: presupuestos, administrador.',
      useAI: true
    },
    {
      name: 'Ambiguous filename - Need text analysis',
      filename: 'documento-importante.pdf',
      extractedText: 'Estimados propietarios, les comunicamos que el próximo lunes se realizarán trabajos de mantenimiento en el edificio.',
      useAI: true
    },
    {
      name: 'Complex case - Need AI',
      filename: 'doc_scan_001.pdf',
      extractedText: 'Las dos partes acuerdan los siguientes términos y condiciones del presente contrato de servicios. Duración: 12 meses.',
      useAI: true
    },
    {
      name: 'No text - Only filename',
      filename: 'comunicado-administracion.pdf',
      extractedText: '',
      useAI: false
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📋 [TEST] ${testCase.name}`);
    console.log(`   📁 Filename: ${testCase.filename}`);
    console.log(`   📝 Text length: ${testCase.extractedText.length} chars`);
    console.log(`   🤖 AI enabled: ${testCase.useAI}`);
    
    try {
      const startTime = Date.now();
      
      const result = await classifier.classifyDocument({
        filename: testCase.filename,
        extractedText: testCase.extractedText,
        useAI: testCase.useAI
      });
      
      const processingTime = Date.now() - startTime;
      
      console.log(`   ✅ Result: ${result.documentType} (confidence: ${result.confidence}, method: ${result.method})`);
      if (result.reasoning) {
        console.log(`   💭 Reasoning: ${result.reasoning}`);
      }
      if (result.fallbackUsed) {
        console.log(`   ⚠️  Fallback used`);
      }
      console.log(`   ⏱️  Processing time: ${processingTime}ms`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

// Run the test
testClassification().catch(console.error);