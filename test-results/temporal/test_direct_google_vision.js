require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function testDirectGoogleVision() {
  console.log('=== TESTING GOOGLE VISION DIRECTLY ===');
  
  // Load PDF
  const pdfPath = './datos/Contrato OLAQUA Piscinas.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF not found');
    return;
  }
  
  const buffer = fs.readFileSync(pdfPath);
  console.log('📄 PDF buffer size:', buffer.length);
  
  try {
    // Import the function directly
    const { extractWithGoogleVision } = require('./src/lib/pdf/googleVision.ts');
    
    console.log('🚀 Starting Google Vision OCR...');
    const result = await extractWithGoogleVision(buffer);
    
    console.log('✅ Result:', {
      success: result.success,
      method: result.method,
      textLength: result.text?.length || 0,
      pages: result.metadata?.pages || 0,
      error: result.metadata?.error
    });
    
    if (result.text && (result.text.includes('45600') || result.text.includes('45.600'))) {
      console.log('🎯 FOUND COST 45600!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testDirectGoogleVision().catch(console.error);