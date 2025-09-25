require('dotenv').config({path:'.env.local'});

async function runTest() {
  try {
    // Import using dynamic import to handle TypeScript
    const { testGoogleVisionWithFile } = await import('./src/lib/pdf/googleVision.ts');
    
    // Test with the Contrato OLAQUA Piscinas.pdf file
    const filePath = './datos/Contrato OLAQUA Piscinas.pdf';
    
    await testGoogleVisionWithFile(filePath);
    
  } catch (error) {
    console.log('❌ Error importing or running test:', error.message);
    console.log('Stack:', error.stack);
  }
}

runTest();