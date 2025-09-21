import { ImageAnnotatorClient } from '@google-cloud/vision';
import { TextExtractionResult } from './textExtraction';

/**
 * Google Vision OCR para PDFs escaneados usando procesamiento página por página
 * Implementación basada en el proyecto RAG que funciona correctamente
 * 
 * Configuración requerida:
 * 1. Credentials de Google Cloud en GOOGLE_APPLICATION_CREDENTIALS
 * 2. API de Vision habilitada en Google Cloud Console
 * 
 * Método: Convierte PDF a páginas PNG y procesa cada una con document_text_detection
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
 * Extrae texto de una página usando Google Vision OCR
 */
async function extractTextFromPage(client: ImageAnnotatorClient, pageImageBuffer: Buffer): Promise<string> {
  try {
    // Crear objeto imagen para Vision API
    const image = {
      content: pageImageBuffer.toString('base64')
    };

    // Configurar contexto con idioma español
    const imageContext = {
      languageHints: ['es', 'es-ES'] // Español de España
    };

    // Extraer texto con detección de documento completa
    const [response] = await client.documentTextDetection({
      image: image,
      imageContext: imageContext
    });

    if (response.error) {
      console.log(`[Google Vision OCR] Error: ${response.error.message}`);
      return '';
    }

    // Verificar si hay texto detectado
    if (!response.textAnnotations || response.textAnnotations.length === 0) {
      return '';
    }

    // Obtener el texto completo
    const extractedText = response.textAnnotations[0].description || '';
    return extractedText.trim();

  } catch (error) {
    console.log(`[Google Vision OCR] Error extracting text: ${error}`);
    return '';
  }
}

/**
 * Convierte una página del PDF a imagen PNG
 */
async function convertPdfPageToImage(buffer: Buffer, pageNum: number): Promise<Buffer | null> {
  try {
    // Usar pdf2pic para convertir página a imagen
    const pdf2pic = await import('pdf2pic');
    
    const convert = pdf2pic.fromBuffer(buffer, {
      density: 300,           // DPI alta para mejor OCR
      saveFilename: "page",
      savePath: "/tmp",
      format: "png",
      width: 2100,           // Ancho para buena resolución
      height: 2970           // Alto A4 proporcional
    });

    const result = await convert(pageNum, { responseType: "buffer" });
    
    if (result && result.buffer) {
      return result.buffer;
    }
    
    return null;
    
  } catch (error) {
    console.log(`[Google Vision OCR] Error converting page ${pageNum} to image: ${error}`);
    return null;
  }
}

/**
 * Extrae texto usando Google Vision OCR procesando página por página
 * Implementación funcional basada en el proyecto RAG
 */
async function extractWithGoogleVision(buffer: Buffer): Promise<TextExtractionResult> {
  try {
    console.log(`[Google Vision OCR] Starting page-by-page PDF OCR extraction for ${buffer.length} byte file`);
    
    const client = getVisionClient();
    
    // Obtener número total de páginas usando pdf-parse
    const pdf = await import('pdf-parse');
    const pdfData = await pdf.default(buffer);
    
    console.log(`[Google Vision OCR] PDF has ${pdfData.numpages} pages`);
    
    const allText: string[] = [];
    let totalPages = 0;
    const confidenceScores: number[] = [];
    
    // Procesar cada página individualmente
    for (let pageNum = 1; pageNum <= pdfData.numpages; pageNum++) {
      try {
        console.log(`[Google Vision OCR] Processing page ${pageNum}/${pdfData.numpages}`);
        
        // Convertir página a imagen
        const pageImageBuffer = await convertPdfPageToImage(buffer, pageNum);
        
        if (!pageImageBuffer) {
          console.log(`[Google Vision OCR] Failed to convert page ${pageNum} to image`);
          continue;
        }
        
        // Extraer texto de la imagen de la página
        const pageText = await extractTextFromPage(client, pageImageBuffer);
        
        if (pageText && pageText.trim().length > 0) {
          allText.push(`--- Página ${pageNum} ---\n${pageText}`);
          console.log(`[Google Vision OCR] Page ${pageNum}: Extracted ${pageText.length} characters`);
          
          // Buscar específicamente el coste de 45600
          if (pageText.includes('45600') || pageText.includes('45.600')) {
            console.log(`[Google Vision OCR] ✅ FOUND COST 45600 on page ${pageNum}!`);
          }
        } else {
          console.log(`[Google Vision OCR] Page ${pageNum}: No text extracted`);
        }
        
        totalPages++;
        
      } catch (pageError) {
        console.log(`[Google Vision OCR] Error processing page ${pageNum}: ${pageError}`);
        continue;
      }
    }
    
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
    
    // Calcular confianza basada en páginas procesadas exitosamente
    const averageConfidence = allText.length / pdfData.numpages;
    
    console.log(`[Google Vision OCR] Extraction completed: ${fullText.length} characters from ${totalPages} pages`);
    console.log(`[Google Vision OCR] Success rate: ${(averageConfidence * 100).toFixed(1)}%`);
    
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

// Exportar funciones
export { extractWithGoogleVision, isGoogleVisionAvailable, getGoogleVisionStatus };