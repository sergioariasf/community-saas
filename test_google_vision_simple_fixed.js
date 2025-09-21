require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function testGoogleVisionFixed() {
  console.log('=== TEST GOOGLE VISION OCR FIXED ===');
  
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
  const pdfPath = './datos/Contrato OLAQUA Piscinas.pdf';
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
    
    const client = new ImageAnnotatorClient();
    console.log('✅ Google Vision client created');
    
    console.log('🚀 Processing PDF in progressive batches of 5 pages');
    
    // Process in batches of 5 pages until no more pages
    const PAGES_PER_BATCH = 5;
    const MAX_PAGES = 50; // Safety limit
    
    const allText = [];
    let totalPages = 0;
    let batchIndex = 0;
    let hasMorePages = true;
    
    while (hasMorePages && batchIndex * PAGES_PER_BATCH < MAX_PAGES) {
      const startPage = batchIndex * PAGES_PER_BATCH + 1;
      const endPage = (batchIndex + 1) * PAGES_PER_BATCH;
      
      console.log(`📄 Processing batch ${batchIndex + 1}: pages ${startPage}-${endPage}`);
      
      let batchResult;
      
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
              pages: Array.from({ length: PAGES_PER_BATCH }, (_, i) => startPage + i)
            },
          ],
        };
        
        [batchResult] = await client.batchAnnotateFiles(batchRequest);
        
        // Process batch response
        if (batchResult.responses && batchResult.responses.length > 0) {
          for (const fileResponse of batchResult.responses) {
            if (fileResponse.error) {
              console.log(`❌ Batch error: ${fileResponse.error.message}`);
              continue;
            }
            
            if (!fileResponse.responses || fileResponse.responses.length === 0) {
              console.log('⚠️ No page responses in batch');
              continue;
            }
            
            // Process each page in batch
            for (let pageIndex = 0; pageIndex < fileResponse.responses.length; pageIndex++) {
              const pageResponse = fileResponse.responses[pageIndex];
              const actualPageNum = startPage + pageIndex;
              
              if (pageResponse.error) {
                console.log(`❌ Page ${actualPageNum} error: ${pageResponse.error.message}`);
                continue;
              }
              
              if (!pageResponse.fullTextAnnotation) {
                console.log(`⚠️ No fullTextAnnotation on page ${actualPageNum}`);
                continue;
              }
              
              // Extract text from page
              let pageText = '';
              if (pageResponse.fullTextAnnotation.text) {
                pageText = pageResponse.fullTextAnnotation.text;
                console.log(`✅ Page ${actualPageNum}: Extracted ${pageText.length} characters`);
                
                // Search specifically for cost 45600
                if (pageText.includes('45600') || pageText.includes('45.600')) {
                  console.log(`🎯 FOUND COST 45600 on page ${actualPageNum}!`);
                }
              }
              
              if (pageText.trim().length > 0) {
                allText.push(`--- Página ${actualPageNum} ---\\n${pageText}`);
                totalPages++;
              }
            }
          }
        }
        
      } catch (batchError) {
        console.log(`❌ Error processing batch ${batchIndex + 1}: ${batchError.message}`);
        hasMorePages = false; // Stop on error
      }
      
      // If this batch produced no pages, probably no more
      let pagesInThisBatch = 0;
      if (batchResult && batchResult.responses && batchResult.responses.length > 0) {
        for (const fileResponse of batchResult.responses) {
          if (fileResponse.responses) {
            pagesInThisBatch = fileResponse.responses.length;
          }
        }
      }
      
      if (pagesInThisBatch === 0) {
        hasMorePages = false;
        console.log(`⏹️ No more pages found, stopping at batch ${batchIndex + 1}`);
      }
      
      batchIndex++;
    }
    
    console.log('');
    console.log('=== RESULTADOS FINALES ===');
    const fullText = allText.join('\\n\\n');
    console.log('Total pages processed:', totalPages);
    console.log('Total text length:', fullText.length);
    
    const has45600 = fullText.includes('45600') || fullText.includes('45.600');
    console.log('Contains cost 45600:', has45600);
    
    if (has45600) {
      console.log('✅ SUCCESS: Cost found!');
      
      const lines = fullText.split('\\n');
      const costLines = lines.filter(line => 
        line.includes('45600') || line.includes('45.600')
      );
      
      console.log('');
      console.log('=== LINES WITH COST ===');
      costLines.forEach((line, index) => {
        console.log(`${index + 1}: ${line.trim()}`);
      });
    } else {
      console.log('⚠️ Cost 45600 not found in extracted text');
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

testGoogleVisionFixed().catch(console.error);