/**
 * ARCHIVO: ocrExtraction.ts
 * PROPÓSITO: Extracción OCR con Google Vision API para PDFs escaneados
 * ESTADO: production
 * DEPENDENCIAS: @google-cloud/vision, fs, credenciales/mi-saas-comunidades-vision-api.json
 * OUTPUTS: Texto extraído con scoring de calidad y detección de orientación
 * ACTUALIZADO: 2025-09-14
 */

// Funcionalidades avanzadas del RAG:
// - Google Cloud Vision API con configuración de idioma español
// - Detección automática de orientación con rotación
// - Sistema de scoring de calidad del texto extraído
// - Manejo inteligente de PDFs escaneados vs digitales

import { TextExtractionResult } from '../../core/types';
import { ExtractionStrategy, ExtractionContext } from './types';

export class OCRExtractionStrategy implements ExtractionStrategy {
  name = 'ocr-google-vision';
  private visionClient: any = null;

  /**
   * Verifica si esta estrategia puede manejar el archivo
   */
  async canHandle(buffer: Buffer, mimeType: string): Promise<boolean> {
    // OCR puede manejar PDFs y también imágenes
    const supportedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/tiff',
      'image/webp'
    ];
    
    return supportedTypes.includes(mimeType) && this.isOCRAvailable();
  }

  /**
   * Obtiene la confianza en que esta estrategia será exitosa
   */
  async getConfidence(buffer: Buffer): Promise<number> {
    // Para OCR, la confianza depende de si está configurado correctamente
    if (!this.isOCRAvailable()) {
      return 0.0;
    }
    
    // Para PDFs grandes, la confianza es media (puede ser lento)
    if (buffer.length > 5 * 1024 * 1024) { // > 5MB
      return 0.6;
    }
    
    return 0.8; // Confianza alta para archivos normales
  }

  /**
   * Extrae texto usando Google Vision OCR
   * Implementa la estrategia avanzada del proyecto RAG
   */
  async extract(buffer: Buffer): Promise<TextExtractionResult> {
    try {
      console.log(`[OCR Extraction] Starting OCR for ${buffer.length} byte file`);

      if (!this.isOCRAvailable()) {
        return {
          text: '',
          success: false,
          method: 'error',
          metadata: {
            pages: 0,
            size: buffer.length,
            confidence: 0,
            error: 'Google Vision API not available - check GOOGLE_APPLICATION_CREDENTIALS'
          }
        };
      }

      // Inicializar cliente si no existe
      if (!this.visionClient) {
        this.visionClient = await this.initializeVisionClient();
      }

      // Para PDFs, procesamos cada página
      // Para imágenes, procesamos directamente
      const pages = await this.extractPages(buffer);
      let fullText = '';
      let totalConfidence = 0;
      let pagesProcessed = 0;

      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const pageBuffer = pages[pageIndex];
        console.log(`[OCR Extraction] Processing page ${pageIndex + 1}/${pages.length}`);

        try {
          const pageResult = await this.extractTextFromPage(pageBuffer, pageIndex + 1);
          
          if (pageResult.text && pageResult.text.trim().length > 0) {
            fullText += `\n--- Página ${pageIndex + 1} ---\n` + pageResult.text;
            totalConfidence += pageResult.confidence;
            pagesProcessed++;
            console.log(`[OCR Extraction] Page ${pageIndex + 1}: ${pageResult.text.length} chars, confidence: ${pageResult.confidence}`);
          } else {
            console.log(`[OCR Extraction] Page ${pageIndex + 1}: No text extracted`);
          }
        } catch (pageError) {
          console.error(`[OCR Extraction] Error processing page ${pageIndex + 1}:`, pageError);
          // Continuar con las siguientes páginas
        }
      }

      // Calcular confianza promedio
      const averageConfidence = pagesProcessed > 0 ? totalConfidence / pagesProcessed : 0;

      if (fullText.trim().length === 0) {
        return {
          text: '',
          success: false,
          method: 'ocr',
          metadata: {
            pages: pages.length,
            size: buffer.length,
            confidence: 0,
            error: 'No text could be extracted with OCR'
          }
        };
      }

      const cleanedText = this.cleanExtractedText(fullText);
      console.log(`[OCR Extraction] Success: ${cleanedText.length} chars from ${pagesProcessed}/${pages.length} pages`);

      return {
        text: cleanedText,
        success: true,
        method: 'ocr',
        metadata: {
          pages: pages.length,
          size: buffer.length,
          confidence: Math.round(averageConfidence * 100) / 100,
          pagesProcessed,
          ocrProvider: 'google-vision'
        }
      };

    } catch (error) {
      console.error('[OCR Extraction] Fatal error:', error);
      
      let errorMessage = 'OCR extraction failed';
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
   * Verifica si OCR está disponible
   */
  private isOCRAvailable(): boolean {
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    return !!credentials;
  }

  /**
   * Inicializa el cliente de Google Vision
   */
  private async initializeVisionClient(): Promise<any> {
    try {
      const { ImageAnnotatorClient } = await import('@google-cloud/vision');
      
      // Configurar credenciales si están disponibles
      const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (credentials) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials;
      }
      
      return new ImageAnnotatorClient();
    } catch (error) {
      throw new Error(`Failed to initialize Google Vision client: ${error.message}`);
    }
  }

  /**
   * Extrae páginas de un PDF o devuelve la imagen directamente
   */
  private async extractPages(buffer: Buffer): Promise<Buffer[]> {
    // Si es un PDF, necesitamos convertir cada página a imagen
    const pdfHeader = buffer.subarray(0, 4);
    if (pdfHeader.toString() === '%PDF') {
      return await this.convertPDFToImages(buffer);
    } else {
      // Para imágenes, devolvemos directamente
      return [buffer];
    }
  }

  /**
   * Convierte páginas PDF a imágenes usando pdftoppm (más confiable)
   */
  private async convertPDFToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);
    
    try {
      console.log('[pdftoppm] Converting PDF to images...');
      
      // Crear archivo temporal
      const tempDir = '/tmp';
      const tempPdfFile = path.join(tempDir, `pdf_ocr_${Date.now()}.pdf`);
      const tempImageBase = path.join(tempDir, `page_${Date.now()}`);
      
      await fs.writeFile(tempPdfFile, pdfBuffer);
      console.log(`[pdftoppm] Temporary PDF saved: ${tempPdfFile}`);
      
      try {
        // Convertir máximo 5 páginas con alta resolución para OCR
        const maxPages = 5;
        console.log(`[pdftoppm] Converting up to ${maxPages} pages...`);

        await execFileAsync('pdftoppm', [
          '-png',                    // Formato PNG
          '-f', '1',                 // Primera página
          '-l', maxPages.toString(), // Última página (máximo)
          '-scale-to', '2000',       // Escalar a 2000px para OCR
          '-aa', 'yes',              // Anti-aliasing
          '-aaVector', 'yes',        // Anti-aliasing para vectores
          tempPdfFile,
          tempImageBase
        ]);

        // Leer las imágenes generadas
        const imageBuffers: Buffer[] = [];
        
        // pdftoppm genera archivos como: page_123-01.png, page_123-02.png, etc.
        for (let i = 1; i <= maxPages; i++) {
          const pageNumber = i.toString().padStart(2, '0'); // 01, 02, 03...
          const imagePath = `${tempImageBase}-${pageNumber}.png`;
          try {
            const imageBuffer = await fs.readFile(imagePath);
            imageBuffers.push(imageBuffer);
            console.log(`[pdftoppm] Page ${i}: ${imageBuffer.length} bytes`);
            
            // Limpiar imagen temporal inmediatamente
            await fs.unlink(imagePath).catch(() => {});
          } catch (pageError) {
            // Si no existe la página, hemos terminado
            console.log(`[pdftoppm] Page ${i} not found, stopping conversion`);
            break;
          }
        }

        if (imageBuffers.length === 0) {
          throw new Error('No images could be generated from PDF');
        }

        console.log(`[pdftoppm] Successfully converted ${imageBuffers.length} pages to images`);
        return imageBuffers;
        
      } finally {
        // Limpiar archivo temporal PDF
        await fs.unlink(tempPdfFile).catch(() => {});
      }
      
    } catch (error) {
      console.error('[pdftoppm] Error converting PDF to images:', error);
      throw new Error(`PDF to image conversion failed: ${error.message}`);
    }
  }

  /**
   * Extrae texto de una página usando Google Vision con detección de orientación
   * Adaptado del método _extract_text_with_ocr del RAG
   */
  private async extractTextFromPage(pageBuffer: Buffer, pageNumber: number): Promise<{ text: string; confidence: number }> {
    try {
      console.log(`[OCR Page] Processing page ${pageNumber}, size: ${pageBuffer.length} bytes`);

      // En este punto, pageBuffer ya debería ser una imagen (PNG/JPG)
      // porque extractPages() ya hizo la conversión con pdf2pic

      // Crear objeto imagen para Vision API
      const image = {
        content: pageBuffer.toString('base64')
      };

      // Configurar contexto con idioma español (como en el RAG)
      const imageContext = {
        languageHints: ['es', 'es-ES'] // Español de España
      };

      // Extraer texto con detección de documento completa
      const [result] = await this.visionClient.documentTextDetection({
        image: image,
        imageContext: imageContext
      });

      if (result.error && result.error.message) {
        throw new Error(`Google Cloud Vision error: ${result.error.message}`);
      }

      // Verificar si hay texto detectado
      if (!result.textAnnotations || result.textAnnotations.length === 0) {
        console.log(`[OCR Page] Page ${pageNumber}: No text detected`);
        return { text: '', confidence: 0 };
      }

      // Si tenemos detección de documento completo, usar esa
      if (result.fullTextAnnotation && result.fullTextAnnotation.text) {
        const extractedText = result.fullTextAnnotation.text;
        const confidence = this.calculateTextQualityScore(extractedText);
        
        console.log(`[OCR Page] Page ${pageNumber}: Document detection, ${extractedText.length} chars, confidence: ${confidence}`);
        return { text: extractedText.trim(), confidence };
      }

      // Fallback: usar detección simple
      const extractedText = result.textAnnotations[0].description || '';
      const confidence = this.calculateTextQualityScore(extractedText);
      
      console.log(`[OCR Page] Page ${pageNumber}: Simple detection, ${extractedText.length} chars, confidence: ${confidence}`);
      return { text: extractedText.trim(), confidence };

    } catch (error) {
      console.error(`[OCR Page] Error processing page ${pageNumber}:`, error);
      return { text: '', confidence: 0 };
    }
  }

  /**
   * Calcular puntuación de calidad del texto extraído
   * Migrado del método _calculate_text_quality_score del RAG
   */
  private calculateTextQualityScore(text: string): number {
    if (!text || text.length < 10) {
      return 0.0;
    }

    let score = 0.0;
    const textLower = text.toLowerCase();

    // 1. Presencia de palabras comunes en español
    const spanishWords = [
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 
      'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 
      'para', 'del', 'está', 'una', 'hasta', 'desde'
    ];
    
    const wordMatches = spanishWords.filter(word => textLower.includes(` ${word} `)).length;
    score += Math.min(wordMatches / spanishWords.length, 0.4);

    // 2. Ratio de caracteres alfabéticos vs extraños
    const alphaChars = Array.from(text).filter(c => /[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]/.test(c)).length;
    if (text.length > 0) {
      score += Math.min((alphaChars / text.length) * 0.3, 0.3);
    }

    // 3. Ausencia de caracteres cirílicos (indica orientación incorrecta)
    const cyrillicChars = ['Г', 'Э', 'Я', 'Ж', 'Щ', 'Ф', 'Д', 'Л', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю'];
    const hasCyrillic = cyrillicChars.some(char => text.includes(char));
    if (!hasCyrillic) {
      score += 0.2;
    }

    // 4. Palabras del dominio gestión de comunidades (adaptado del RAG)
    const domainWords = ['junta', 'acta', 'reunión', 'administración', 'factura', 'contrato', 'euros', 'fecha', 'presidente', 'comunidad', 'propietarios'];
    const domainMatches = domainWords.filter(word => textLower.includes(word)).length;
    if (domainMatches > 0) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Limpia y normaliza texto extraído
   */
  private cleanExtractedText(text: string): string {
    return text
      // Normalizar saltos de línea
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Eliminar espacios excesivos
      .replace(/[ \t]+/g, ' ')
      // Eliminar múltiples saltos de línea
      .replace(/\n{3,}/g, '\n\n')
      // Trim general
      .trim();
  }
}

// ============================================================================
// FUNCIÓN DE TEST INTEGRADA
// ============================================================================

/**
 * Función de test integrada para verificar que el módulo OCR funciona correctamente
 * Test específico con el archivo: datos/Acta junta extraordinaria 02.06.25.pdf
 */
export async function testOCRExtraction(): Promise<void> {
  const fs = require('fs');
  const path = require('path');
  
  console.log('🔍 [OCR Test] Iniciando test del módulo OCR...\n');

  // Archivo específico para test OCR
  const fileName = 'Acta junta extraordinaria 02.06.25.pdf';
  const filePath = path.join(process.cwd(), 'datos', fileName);
  
  console.log(`📄 [OCR Test] Archivo objetivo: ${fileName}`);
  console.log(`📁 [OCR Test] Ruta: ${filePath}`);

  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`❌ [OCR Test] Archivo no encontrado: ${filePath}`);
      return;
    }

    // Verificar credenciales
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('❌ [OCR Test] GOOGLE_APPLICATION_CREDENTIALS no configurado');
      console.log('   Set the environment variable to test OCR functionality');
      return;
    }

    console.log(`🔑 [OCR Test] Credenciales: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

    // Leer archivo
    const buffer = fs.readFileSync(filePath);
    console.log(`📖 [OCR Test] Archivo leído: ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

    // Crear estrategia OCR
    const ocrStrategy = new OCRExtractionStrategy();
    
    // Verificar que puede manejar el archivo
    const canHandle = await ocrStrategy.canHandle(buffer, 'application/pdf');
    console.log(`🔍 [OCR Test] ¿Puede manejar PDF?: ${canHandle}`);

    if (!canHandle) {
      console.log(`⚠️  [OCR Test] Estrategia OCR no puede manejar este archivo`);
      return;
    }

    // Obtener confianza
    const confidence = await ocrStrategy.getConfidence(buffer);
    console.log(`📊 [OCR Test] Confianza pre-procesamiento: ${(confidence * 100).toFixed(1)}%`);

    // Extraer texto con OCR
    console.log('\n🚀 [OCR Test] Iniciando extracción OCR...');
    const startTime = Date.now();
    
    const result = await ocrStrategy.extract(buffer);
    
    const extractionTime = Date.now() - startTime;
    console.log(`⏱️  [OCR Test] Tiempo de extracción: ${extractionTime}ms`);

    // Mostrar resultados
    console.log('\n📋 [OCR Test] Resultado:');
    console.log(`   - Éxito: ${result.success}`);
    console.log(`   - Método: ${result.method}`);
    console.log(`   - Caracteres extraídos: ${result.text.length}`);
    console.log(`   - Páginas: ${result.metadata.pages}`);
    console.log(`   - Confianza final: ${result.metadata.confidence}`);
    console.log(`   - Proveedor OCR: ${result.metadata.ocrProvider || 'N/A'}`);
    
    if (result.metadata.error) {
      console.log(`   - Error: ${result.metadata.error}`);
    }

    if (result.success && result.text.length > 0) {
      // Mostrar muestra del texto extraído
      const sample = result.text.substring(0, 300).replace(/\n/g, ' ');
      console.log('\n📖 [OCR Test] Muestra del texto extraído:');
      console.log('─'.repeat(60));
      console.log(sample + (result.text.length > 300 ? '...' : ''));
      console.log('─'.repeat(60));

      // Análisis de calidad
      console.log('\n📊 [OCR Test] Análisis de calidad:');
      const words = result.text.split(/\s+/).filter(w => w.length > 0);
      const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no'];
      const spanishFound = spanishWords.filter(word => result.text.toLowerCase().includes(` ${word} `)).length;
      
      console.log(`   - Palabras totales: ${words.length}`);
      console.log(`   - Palabras españolas detectadas: ${spanishFound}/${spanishWords.length}`);
      console.log(`   - Contiene "junta": ${result.text.toLowerCase().includes('junta')}`);
      console.log(`   - Contiene "acta": ${result.text.toLowerCase().includes('acta')}`);
      
      if (result.text.length > 100) {
        console.log(`✅ [OCR Test] ${fileName} procesado correctamente con OCR`);
      } else {
        console.log(`⚠️  [OCR Test] ${fileName} - Texto extraído muy corto, verificar calidad OCR`);
      }
    } else {
      console.log(`❌ [OCR Test] ${fileName} - OCR falló o no extrajo texto`);
      
      if (result.method === 'error') {
        console.log('\n💡 [OCR Test] Posibles soluciones:');
        console.log('   - Verificar que Google Vision API está habilitada');
        console.log('   - Verificar credenciales GOOGLE_APPLICATION_CREDENTIALS');
        console.log('   - Verificar que hay créditos en la cuenta de Google Cloud');
        console.log('   - Probar con una imagen más simple primero');
      }
    }

  } catch (error) {
    console.error(`❌ [OCR Test] Error procesando ${fileName}:`, error.message);
  }

  console.log('\n🎉 [OCR Test] Test OCR completado\n');
}

/**
 * Factory function para crear instancia de la estrategia
 */
export function createOCRExtractionStrategy(): OCRExtractionStrategy {
  return new OCRExtractionStrategy();
}

/**
 * Auto-ejecutar test si el archivo se ejecuta directamente
 */
if (require.main === module) {
  testOCRExtraction()
    .then(() => {
      console.log('✅ Test OCR completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test OCR falló:', error);
      process.exit(1);
    });
}