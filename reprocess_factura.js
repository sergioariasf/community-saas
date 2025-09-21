require('dotenv').config({path:'.env.local'});
const { SimplePipeline } = require('./src/lib/ingesta/core/progressivePipelineSimple.ts');

async function reprocessFactura() {
  console.log('=== REPROCESSING FAILED FACTURA ===\n');
  
  const docId = '646b0990-90b4-4853-967c-fac67cd4df46';
  
  console.log('🚀 Starting SimplePipeline for document:', docId);
  
  try {
    const pipeline = new SimplePipeline();
    const result = await pipeline.processDocument(docId, 4); // Full processing
    
    console.log('✅ Pipeline completed successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error.message);
    console.error('Error details:', error);
  }
}

reprocessFactura().catch(console.error);