/**
 * Test simple del clasificador de documentos
 */

import { testDocumentClassification } from './src/lib/ingesta/modules/classification/documentClassifier';

// Probar con API key configurada
process.env.GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

console.log('🔑 API Key configurada:', process.env.GEMINI_API_KEY ? 'Sí' : 'No');

testDocumentClassification()
  .then(() => {
    console.log('✅ Test completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test falló:', error);
    process.exit(1);
  });