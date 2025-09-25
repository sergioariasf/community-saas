require('dotenv').config({path:'.env.local'});
const fs = require('fs');
const path = require('path');

async function testGoogleVisionDirectly() {
  console.log('=== TEST GOOGLE VISION OCR DIRECTO ===');
  
  // Check credentials
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log('Credentials path:', credentials);
  console.log('Credentials exist:', fs.existsSync(credentials || ''));
  console.log('');
  
  if (!credentials || !fs.existsSync(credentials)) {
    console.log('❌ Google Cloud credentials not found');
    return;
  }
  
  // Load PDF
  const pdfPath = path.join(__dirname, 'datos', 'Contrato OLAQUA Piscinas.pdf');
  console.log('PDF path:', pdfPath);
  console.log('PDF exists:', fs.existsSync(pdfPath));
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(pdfPath);
  console.log('PDF size:', pdfBuffer.length, 'bytes');
  console.log('');
  
  try {
    // Import Google Vision client directly
    const { ImageAnnotatorClient } = require('@google-cloud/vision');
    const pdf = require('pdf-parse');
    
    const client = new ImageAnnotatorClient();
    console.log('✅ Google Vision client created');
    
    // Get PDF page count
    const pdfData = await pdf(pdfBuffer);
    console.log('PDF pages:', pdfData.numpages);
    console.log('');
    
    // Test with multiple batches (our new approach)
    const PAGES_PER_BATCH = 5;
    const numberOfBatches = Math.ceil(pdfData.numpages / PAGES_PER_BATCH);
    
    console.log(`🔍 Testing with ${numberOfBatches} batches of ${PAGES_PER_BATCH} pages each`);
    
    const allText = [];
    let totalPages = 0;
    
    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const startPage = batchIndex * PAGES_PER_BATCH + 1;
      const endPage = Math.min((batchIndex + 1) * PAGES_PER_BATCH, pdfData.numpages);
      
      console.log(`Processing batch ${batchIndex + 1}/${numberOfBatches}: pages ${startPage}-${endPage}`);
      
      try {
        const batchRequest = {
          requests: [
            {
              inputConfig: {
                content: pdfBuffer.toString('base64'),
                mimeType: 'application/pdf',
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                },
              ],
              pages: Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
            },
          ],
        };
        
        const [batchResult] = await client.batchAnnotateFiles(batchRequest);
        
        if (batchResult.responses && batchResult.responses.length > 0) {
          for (const fileResponse of batchResult.responses) {
            if (fileResponse.error) {
              console.log(`❌ Batch error: ${fileResponse.error.message}`);
              continue;
            }
            
            if (fileResponse.responses && fileResponse.responses.length > 0) {
              for (let pageIndex = 0; pageIndex < fileResponse.responses.length; pageIndex++) {
                const pageResponse = fileResponse.responses[pageIndex];
                const actualPageNum = startPage + pageIndex;
                
                if (pageResponse.error) {
                  console.log(`❌ Page ${actualPageNum} error: ${pageResponse.error.message}`);
                  continue;
                }
                
                if (pageResponse.fullTextAnnotation && pageResponse.fullTextAnnotation.text) {
                  const pageText = pageResponse.fullTextAnnotation.text;
                  console.log(`✅ Page ${actualPageNum}: ${pageText.length} characters`);
                  
                  if (pageText.includes('45600') || pageText.includes('45.600')) {
                    console.log(`🎯 FOUND COST 45600 on page ${actualPageNum}!`);
                  }
                  
                  allText.push(`--- Página ${actualPageNum} ---\n${pageText}`);
                  totalPages++;
                } else {
                  console.log(`⚠️ Page ${actualPageNum}: No text extracted`);
                }
              }
            }
          }
        }
        
      } catch (batchError) {
        console.log(`❌ Error processing batch ${batchIndex + 1}: ${batchError.message}`);
      }
    }
    
    console.log('');
    console.log('=== RESULTADOS FINALES ===');
    const fullText = allText.join('\n\n');
    console.log('Total pages processed:', totalPages);
    console.log('Total text length:', fullText.length);
    
    const has45600 = fullText.includes('45600') || fullText.includes('45.600');
    console.log('Contains cost 45600:', has45600);
    
    if (has45600) {
      console.log('✅ SUCCESS: Cost found!');
      
      const lines = fullText.split('\n');
      const costLines = lines.filter(line => 
        line.includes('45600') || line.includes('45.600')
      );
      
      console.log('');
      console.log('=== LINES WITH COST ===');
      costLines.forEach((line, index) => {
        console.log(`${index + 1}: ${line.trim()}`);
      });
    }
    
    // Show sample text
    console.log('');
    console.log('=== FIRST 500 CHARACTERS ===');
    console.log(fullText.substring(0, 500));
    
    if (fullText.length > 500) {
      console.log('');
      console.log('=== LAST 500 CHARACTERS ===');
      console.log(fullText.substring(fullText.length - 500));
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testGoogleVisionDirectly().catch(console.error);