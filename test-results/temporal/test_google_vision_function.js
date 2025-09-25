require('dotenv').config({ path: '.env.local' });

async function testGoogleVisionFunction() {
  console.log('=== TESTING GOOGLE VISION INTERNAL FUNCTION ===');
  
  try {
    // Import the test function from googleVision.ts
    const { testGoogleVisionWithFile } = require('./src/lib/pdf/googleVision.ts');
    
    const pdfPath = './datos/Contrato OLAQUA Piscinas.pdf';
    console.log('📄 Testing with:', pdfPath);
    console.log('');
    
    await testGoogleVisionWithFile(pdfPath);
    
  } catch (error) {
    console.log('❌ Error importing or running test:', error.message);
    console.log('Stack:', error.stack);
  }
}

testGoogleVisionFunction().catch(console.error);