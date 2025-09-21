const fs = require('fs');
const pdf = require('pdf-parse');

async function testPdfParse() {
  console.log('=== TESTING PDF-PARSE WITH BUFFER ===');
  
  const pdfPath = './datos/Contrato OLAQUA Piscinas.pdf';
  console.log('PDF exists:', fs.existsSync(pdfPath));
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF file not found');
    return;
  }
  
  const buffer = fs.readFileSync(pdfPath);
  console.log('Buffer size:', buffer.length);
  console.log('Buffer type:', typeof buffer);
  console.log('Is Buffer:', Buffer.isBuffer(buffer));
  
  try {
    console.log('📄 Testing pdf-parse with buffer...');
    const result = await pdf(buffer);
    console.log('✅ Success!');
    console.log('Pages:', result.numpages);
    console.log('Text length:', result.text.length);
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testPdfParse().catch(console.error);