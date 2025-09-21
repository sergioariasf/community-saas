import { ImageAnnotatorClient } from '@google-cloud/vision';
import { TextExtractionResult } from './textExtraction';

/**
 * Google Vision OCR para PDFs escaneados usando múltiples llamadas a batchAnnotateFiles
 * Evita la limitación de 5 páginas procesando en batches
 * 
 * Configuración requerida:
 * 1. Credentials de Google Cloud en GOOGLE_APPLICATION_CREDENTIALS
 * 2. API de Vision habilitada en Google Cloud Console
 */

let visionClient: ImageAnnotatorClient | null = null;

/**
 * Inicializa el cliente de Google Vision
 */
function getVisionClient(): ImageAnnotatorClient {
  if (!visionClient) {
    // Verificar si hay credentials configuradas
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credentials) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required for OCR');
    }
    
    visionClient = new ImageAnnotatorClient();
  }
  return visionClient;
}

/**
 * Extrae texto de la estructura jerárquica de Google Vision
 * Navega: pages → blocks → paragraphs → words → symbols
 */
function extractTextFromPageStructure(fullTextAnnotation: any): string {
  const textParts: string[] = [];
  
  if (!fullTextAnnotation.pages) {
    return '';
  }
  
  for (const page of fullTextAnnotation.pages) {
    if (!page.blocks) continue;
    
    for (const block of page.blocks) {
      if (!block.paragraphs) continue;
      
      for (const paragraph of block.paragraphs) {
        if (!paragraph.words) continue;
        
        const paragraphWords: string[] = [];
        
        for (const word of paragraph.words) {
          if (!word.symbols) continue;
          
          const wordText = word.symbols.map((symbol: any) => symbol.text).join('');
          paragraphWords.push(wordText);
        }
        
        if (paragraphWords.length > 0) {
          textParts.push(paragraphWords.join(' '));
        }
      }
    }
  }
  
  return textParts.join('\n');
}

/**
 * Extrae texto usando Google Vision OCR procesando PDF con múltiples llamadas
 * Evita la limitación de 5 páginas de batchAnnotateFiles usando múltiples batches
 */
async function extractWithGoogleVision(buffer: Buffer): Promise<TextExtractionResult> {
  try {
    console.log(`[Google Vision OCR] Starting multi-batch PDF OCR extraction for ${buffer.length} byte file`);
    
    const client = getVisionClient();
    
    console.log(`[Google Vision OCR] Processing PDF in progressive batches of 5 pages`);
    
    // Procesar en grupos de 5 páginas hasta que no haya más páginas
    const PAGES_PER_BATCH = 5;
    const MAX_PAGES = 50; // Límite de seguridad
    
    const allText: string[] = [];
    let totalPages = 0;
    const confidenceScores: number[] = [];
    
    // Procesar cada batch de páginas hasta que no haya más
    let batchIndex = 0;
    let hasMorePages = true;
    
    while (hasMorePages && batchIndex * PAGES_PER_BATCH < MAX_PAGES) {
      const startPage = batchIndex * PAGES_PER_BATCH + 1;
      const endPage = (batchIndex + 1) * PAGES_PER_BATCH;
      
      console.log(`[Google Vision OCR] Processing batch ${batchIndex + 1}: pages ${startPage}-${endPage}`);
      
      let batchResult;
      
      try {
        // Configurar solicitud para páginas específicas de este batch
        const batchRequest = {
          requests: [
            {
              inputConfig: {
                content: buffer.toString('base64'),
                mimeType: 'application/pdf',
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION' as const,
                },
              ],
              pages: Array.from({ length: PAGES_PER_BATCH }, (_, i) => startPage + i)
            },
          ],
        };
        
        // Llamada a batchAnnotateFiles para este batch
        [batchResult] = await client.batchAnnotateFiles(batchRequest as any);
        
        // Procesar respuesta del batch
        if (batchResult.responses && batchResult.responses.length > 0) {
          for (const fileResponse of batchResult.responses) {
            if (fileResponse.error) {
              console.log(`[Google Vision OCR] Batch error: ${fileResponse.error.message}`);
              continue;
            }
            
            if (!fileResponse.responses || fileResponse.responses.length === 0) {
              console.log('[Google Vision OCR] No page responses in batch');
              continue;
            }
            
            // Procesar cada página del batch
            for (let pageIndex = 0; pageIndex < fileResponse.responses.length; pageIndex++) {
              const pageResponse = fileResponse.responses[pageIndex];
              const actualPageNum = startPage + pageIndex;
              
              if (pageResponse.error) {
                console.log(`[Google Vision OCR] Page ${actualPageNum} error: ${pageResponse.error.message}`);
                continue;
              }
              
              if (!pageResponse.fullTextAnnotation) {
                console.log(`[Google Vision OCR] No fullTextAnnotation on page ${actualPageNum}`);
                continue;
              }
              
              // Extraer texto de la página
              let pageText = '';
              if (pageResponse.fullTextAnnotation.text) {
                pageText = pageResponse.fullTextAnnotation.text;
                console.log(`[Google Vision OCR] Page ${actualPageNum}: Extracted ${pageText.length} characters`);
                
                // Buscar específicamente el coste de 45600
                if (pageText.includes('45600') || pageText.includes('45.600')) {
                  console.log(`[Google Vision OCR] ✅ FOUND COST 45600 on page ${actualPageNum}!`);
                }
              } else {
                // Método alternativo: extraer de estructura
                pageText = extractTextFromPageStructure(pageResponse.fullTextAnnotation);
                console.log(`[Google Vision OCR] Page ${actualPageNum}: Extracted ${pageText.length} chars (structure method)`);
              }
              
              if (pageText.trim().length > 0) {
                allText.push(`--- Página ${actualPageNum} ---\n${pageText}`);
              }
              
              // Contar páginas y recopilar confianza
              if (pageResponse.fullTextAnnotation.pages) {
                totalPages += pageResponse.fullTextAnnotation.pages.length;
                
                pageResponse.fullTextAnnotation.pages.forEach(page => {
                  if (page.confidence) {
                    confidenceScores.push(page.confidence);
                  }
                });
              } else {
                totalPages += 1;
              }
            }
          }
        }
        
      } catch (batchError) {
        console.log(`[Google Vision OCR] Error processing batch ${batchIndex + 1}: ${batchError}`);
        hasMorePages = false; // Stop on error
      }
      
      // Si este batch no produjo páginas, probablemente no hay más
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
        console.log(`[Google Vision OCR] No more pages found, stopping at batch ${batchIndex + 1}`);
      }
      
      batchIndex++;
    }
    
    // Verificar resultados
    if (allText.length === 0) {
      console.log('[Google Vision OCR] No text could be extracted from any page');
      return {
        text: '',
        success: false,
        method: 'ocr',
        metadata: {
          pages: totalPages,
          size: buffer.length,
          confidence: 0,
        }
      };
    }
    
    const fullText = allText.join('\n\n');
    
    // Calcular confianza promedio
    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length 
      : 0;
    
    console.log(`[Google Vision OCR] Extraction completed: ${fullText.length} characters from ${totalPages} pages`);
    console.log(`[Google Vision OCR] Average confidence: ${averageConfidence.toFixed(2)}`);
    
    // Verificar si encontramos el coste
    const foundCost = fullText.includes('45600') || fullText.includes('45.600');
    if (foundCost) {
      console.log(`[Google Vision OCR] ✅ SUCCESS: Found cost 45600 in extracted text!`);
    } else {
      console.log(`[Google Vision OCR] ⚠️ Cost 45600 not found in extracted text`);
    }
    
    return {
      text: fullText.trim(),
      success: fullText.length > 0,
      method: 'ocr',
      metadata: {
        pages: totalPages,
        size: buffer.length,
        confidence: Math.round(averageConfidence * 100) / 100,
      }
    };
    
  } catch (error) {
    console.error('[Google Vision OCR] Error:', error);
    
    let errorMessage = 'Google Vision OCR error';
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        errorMessage = 'Google Cloud credentials not configured';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Google Vision API quota exceeded';
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'Google Vision API not enabled or insufficient permissions';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      text: '',
      success: false,
      method: 'error',
      metadata: {
        pages: 0,
        size: buffer.length,
        confidence: 0,
        error: errorMessage
      }
    };
  }
}

/**
 * Verifica si Google Vision está configurado correctamente
 */
function isGoogleVisionAvailable() {
  try {
    return !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  } catch {
    return false;
  }
}

/**
 * Obtiene información sobre la configuración de Google Vision
 */
function getGoogleVisionStatus() {
  const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!hasCredentials) {
    return {
      available: false,
      configured: false,
      message: 'Google Cloud credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS environment variable.',
    };
  }

  try {
    getVisionClient();
    return {
      available: true,
      configured: true,
      message: 'Google Vision OCR is ready to use.',
    };
  } catch (error) {
    return {
      available: false,
      configured: false,
      message: `Google Vision configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Función de test para probar Google Vision OCR de forma aislada
 */
async function testGoogleVisionWithFile(filePath: string): Promise<void> {
  const fs = require('fs');
  const path = require('path');
  
  console.log('=== TEST GOOGLE VISION OCR AISLADO ===');
  console.log('');
  
  // Check credentials
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log('Credentials path:', credentials);
  console.log('Credentials exist:', credentials ? fs.existsSync(credentials) : false);
  console.log('');
  
  // Load the PDF file
  console.log('PDF path:', filePath);
  console.log('PDF exists:', fs.existsSync(filePath));
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ PDF file not found');
    return;
  }
  
  // Read PDF as buffer
  const pdfBuffer = fs.readFileSync(filePath);
  console.log('PDF size:', pdfBuffer.length, 'bytes');
  console.log('');
  
  try {
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
    
    // Show last 500 characters if text is long enough
    if (result.text.length > 1000) {
      console.log('');
      console.log('=== ÚLTIMOS 500 CARACTERES ===');
      console.log('...');
      console.log(result.text.substring(Math.max(0, result.text.length - 500)));
    }
    
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
    console.log('❌ Error during OCR test:', error);
    if (error instanceof Error) {
      console.log('Message:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Exportar como un objeto para evitar conflictos con Server Actions
export { extractWithGoogleVision, isGoogleVisionAvailable, getGoogleVisionStatus, testGoogleVisionWithFile };