require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function testGoogleVisionMinimal() {
  console.log('=== TESTING GOOGLE VISION MINIMAL ===');
  
  // Load PDF
  const pdfPath = './datos/Contrato OLAQUA Piscinas.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF not found');
    return;
  }
  
  const buffer = fs.readFileSync(pdfPath);
  console.log('📄 PDF buffer size:', buffer.length);
  
  try {
    // Test Google Vision directly without pdf-parse
    const { ImageAnnotatorClient } = require('@google-cloud/vision');
    const client = new ImageAnnotatorClient();
    
    console.log('✅ Google Vision client created');
    
    // Simple test - process first few pages only
    const request = {
      requests: [
        {
          inputConfig: {
            content: buffer.toString('base64'),
            mimeType: 'application/pdf',
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
            },
          ],
          pages: [1, 2, 3, 4, 5] // First 5 pages
        },
      ],
    };
    
    console.log('🚀 Calling batchAnnotateFiles...');
    const [result] = await client.batchAnnotateFiles(request);
    
    console.log('📊 Result structure:');
    console.log('- responses length:', result.responses?.length || 0);
    
    if (result.responses && result.responses.length > 0) {
      const fileResponse = result.responses[0];
      console.log('- fileResponse.responses length:', fileResponse.responses?.length || 0);
      
      if (fileResponse.responses) {
        for (let i = 0; i < fileResponse.responses.length; i++) {
          const pageResponse = fileResponse.responses[i];
          const text = pageResponse.fullTextAnnotation?.text || '';
          console.log(`- Page ${i + 1}: ${text.length} characters`);
          
          if (text.includes('45600') || text.includes('45.600')) {
            console.log(`🎯 FOUND COST 45600 on page ${i + 1}!`);
          }
        }
      }
    }
    
    console.log('✅ Google Vision test completed');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testGoogleVisionMinimal().catch(console.error);