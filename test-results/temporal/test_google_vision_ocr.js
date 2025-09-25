require('dotenv').config({path:'.env.local'});
const fs = require('fs');
const path = require('path');

// Import our Google Vision OCR function
async function testGoogleVisionOCR() {
  console.log('=== TEST GOOGLE VISION OCR AISLADO ===');
  console.log('');
  
  // Check credentials
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log('Credentials path:', credentials);
  console.log('Credentials exist:', fs.existsSync(credentials || ''));
  console.log('');
  
  // Load the PDF file
  const pdfPath = path.join(__dirname, 'datos', 'Contrato OLAQUA Piscinas.pdf');
  console.log('PDF path:', pdfPath);
  console.log('PDF exists:', fs.existsSync(pdfPath));
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF file not found. Available files in datos/:');
    const datosFiles = fs.readdirSync(path.join(__dirname, 'datos'));
    datosFiles.forEach(file => console.log('  -', file));
    return;
  }
  
  // Read PDF as buffer
  const pdfBuffer = fs.readFileSync(pdfPath);
  console.log('PDF size:', pdfBuffer.length, 'bytes');
  console.log('');
  
  try {
    // Import and test Google Vision function
    console.log('🔍 Importing Google Vision OCR function...');
    const { extractWithGoogleVision } = require('./src/lib/pdf/googleVision.ts');
    
    console.log('📄 Starting OCR extraction...');
    const startTime = Date.now();
    
    const result = await extractWithGoogleVision(pdfBuffer);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('');
    console.log('=== RESULTADOS ===');
    console.log('Success:', result.success);
    console.log('Method:', result.method);
    console.log('Duration:', duration, 'ms');
    console.log('Text length:', result.text.length);
    console.log('Pages processed:', result.metadata.pages);
    console.log('Confidence:', result.metadata.confidence);
    
    if (result.metadata.error) {
      console.log('❌ Error:', result.metadata.error);
    }
    
    console.log('');
    console.log('=== BÚSQUEDA DE COSTE 45600 ===');
    const has45600 = result.text.includes('45600') || result.text.includes('45.600');
    console.log('¿Contiene 45600?:', has45600);
    
    if (has45600) {
      console.log('✅ SUCCESS: Found cost 45600!');
      
      // Find lines with cost information
      const lines = result.text.split('\n');
      const costLines = lines.filter(line => 
        line.includes('45600') || 
        line.includes('45.600') ||
        line.toLowerCase().includes('total') ||
        line.toLowerCase().includes('importe')
      );
      
      console.log('');
      console.log('=== LÍNEAS CON INFORMACIÓN DE COSTE ===');
      costLines.forEach((line, index) => {
        console.log(`${index + 1}:`, line.trim());
      });
    } else {
      console.log('⚠️ Cost 45600 not found in extracted text');
    }
    
    // Show first 1000 characters
    console.log('');
    console.log('=== PRIMEROS 1000 CARACTERES ===');
    console.log(result.text.substring(0, 1000));
    console.log('...');
    
    // Show last 500 characters
    console.log('');
    console.log('=== ÚLTIMOS 500 CARACTERES ===');
    console.log('...');
    console.log(result.text.substring(Math.max(0, result.text.length - 500)));
    
    // Check for page indicators
    const pageMatches = result.text.match(/página \d+/gi) || [];
    console.log('');
    console.log('=== INDICADORES DE PÁGINAS ===');
    console.log('Page indicators found:', pageMatches.length);
    console.log('Indicators:', pageMatches);
    
    // Search for key terms
    const keyTerms = ['mantenimiento', 'piscina', 'olaqua', 'temporada', 'verano', 'presupuesto'];
    console.log('');
    console.log('=== BÚSQUEDA DE TÉRMINOS CLAVE ===');
    keyTerms.forEach(term => {
      const found = result.text.toLowerCase().includes(term.toLowerCase());
      console.log(`${term}: ${found}`);
    });
    
  } catch (error) {
    console.log('❌ Error during OCR test:', error.message);
    console.log('Stack:', error.stack);
  }
}

testGoogleVisionOCR().catch(console.error);