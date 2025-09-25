/**
 * ARCHIVO: TextExtractionFactory.ts
 * PROPÓSITO: Factory para crear y orquestar extractores de texto
 * ESTADO: development
 * DEPENDENCIAS: BaseTextExtractor, extractores específicos
 * OUTPUTS: Selección automática de estrategia de extracción óptima
 * ACTUALIZADO: 2025-09-21
 */

import { BaseTextExtractor, ExtractionResult, ExtractionContext } from './BaseTextExtractor.ts';
import { PdfParseExtractor } from './PdfParseExtractor.ts';
import { GoogleVisionExtractor } from './GoogleVisionExtractor.ts';
import { GeminiFlashExtractor, GeminiAllInOneResult } from './GeminiFlashExtractor.ts';

export class TextExtractionFactory {
  private extractors: BaseTextExtractor[];
  
  constructor() {
    // Registrar extractores ordenados por prioridad
    this.extractors = [
      new PdfParseExtractor(),      // Prioridad 1: Rápido y gratis
      new GoogleVisionExtractor(),  // Prioridad 2: OCR preciso
      new GeminiFlashExtractor()    // Prioridad 3: TODO-EN-UNO para casos complejos
    ];
    
    // Ordenar por prioridad
    this.extractors.sort((a, b) => a.getPriority() - b.getPriority());
  }

  /**
   * Ejecuta la cadena de estrategias según tu flujo definido
   */
  async extractText(context: ExtractionContext): Promise<ExtractionResult> {
    console.log('🔧 [TEXT EXTRACTION] Starting extraction strategy chain...');
    console.log(`📄 [TEXT EXTRACTION] File: ${context.filename} (${context.buffer.length} bytes)`);
    
    let lastResult: ExtractionResult | null = null;
    
    // ESTRATEGIA 1: PDF-parse (siempre primer intento)
    const pdfExtractor = this.getExtractor('pdf-parse');
    if (pdfExtractor) {
      console.log('📄 [TEXT EXTRACTION] Strategy 1: PDF-parse extraction...');
      const pdfResult = await pdfExtractor.extract(context);
      lastResult = pdfResult;
      
      // Verificar si cumple con el mínimo de texto
      if (this.isResultSufficient(pdfResult, context.minTextLength || 50)) {
        console.log('✅ [TEXT EXTRACTION] PDF-parse successful - sufficient text extracted');
        return pdfResult;
      }
    }
    
    console.log('⚠️ [TEXT EXTRACTION] PDF-parse insufficient - trying OCR strategies...');
    
    // ESTRATEGIA 2: Google Vision OCR
    const visionExtractor = this.getExtractor('google-vision-ocr');
    if (visionExtractor && visionExtractor.canHandle(context)) {
      console.log('👁️ [TEXT EXTRACTION] Strategy 2: Google Vision OCR...');
      const visionResult = await visionExtractor.extract(context);
      lastResult = visionResult;
      
      if (this.isResultSufficient(visionResult, context.minTextLength || 50)) {
        console.log('✅ [TEXT EXTRACTION] Google Vision OCR successful');
        return visionResult;
      }
    }
    
    console.log('⚠️ [TEXT EXTRACTION] Google Vision insufficient - trying Gemini Flash...');
    
    // VALIDACIÓN: Páginas ≤ 5 para Gemini Flash
    if (!this.validatePageLimit(context)) {
      console.log('❌ [TEXT EXTRACTION] Document too large for Gemini Flash - failing to manual review');
      return {
        success: false,
        method: 'manual-review-required',
        error: 'Document exceeds page limit for Gemini Flash OCR IA (max 5 pages)',
        textLength: 0
      };
    }
    
    // ESTRATEGIA 3: Gemini Flash OCR IA (TODO-EN-UNO)
    const geminiExtractor = this.getExtractor('gemini-flash-ocr-ia') as GeminiFlashExtractor;
    if (geminiExtractor) {
      console.log('🤖 [TEXT EXTRACTION] Strategy 3: Gemini Flash OCR IA (TODO-EN-UNO)...');
      const geminiResult = await geminiExtractor.extract(context) as GeminiAllInOneResult;
      
      if (geminiResult.success && geminiResult.allInOneComplete) {
        console.log('✅ [TEXT EXTRACTION] Gemini Flash TODO-EN-UNO successful - pipeline completed');
        return geminiResult;
      }
      
      lastResult = geminiResult;
    }
    
    // FALLBACK: Mejor resultado disponible
    console.log('⚠️ [TEXT EXTRACTION] All strategies failed - using best available result');
    return lastResult || {
      success: false,
      method: 'all-strategies-failed',
      error: 'All text extraction strategies failed',
      textLength: 0
    };
  }

  /**
   * Obtiene un extractor específico por nombre
   */
  private getExtractor(extractorName: string): BaseTextExtractor | null {
    const nameMap: { [key: string]: string } = {
      'pdf-parse': 'PdfParseExtractor',
      'google-vision-ocr': 'GoogleVisionExtractor', 
      'gemini-flash-ocr-ia': 'GeminiFlashExtractor'
    };
    
    const targetClassName = nameMap[extractorName];
    if (!targetClassName) {
      console.log(`🔍 [TEXT EXTRACTION] Unknown extractor name: ${extractorName}`);
      return null;
    }
    
    const extractor = this.extractors.find(e => e.constructor.name === targetClassName);
    if (!extractor) {
      console.log(`❌ [TEXT EXTRACTION] Extractor not found: ${targetClassName}`);
    } else {
      console.log(`✅ [TEXT EXTRACTION] Found extractor: ${targetClassName}`);
    }
    
    return extractor || null;
  }

  /**
   * Verifica si el resultado es suficientemente bueno
   */
  private isResultSufficient(result: ExtractionResult, minTextLength: number): boolean {
    return result.success && 
           result.text !== undefined && 
           result.text.length >= minTextLength;
  }

  /**
   * Valida límite de páginas para Gemini Flash
   */
  private validatePageLimit(context: ExtractionContext, maxPages: number = 5): boolean {
    // Estimación: 1MB ≈ 1 página PDF
    const estimatedPages = Math.ceil(context.buffer.length / (1024 * 1024));
    const limit = context.maxPages || maxPages;
    
    console.log(`📊 [TEXT EXTRACTION] Page validation: ${estimatedPages} estimated pages (limit: ${limit})`);
    return estimatedPages <= limit;
  }

  /**
   * Lista extractores disponibles
   */
  getAvailableExtractors(): string[] {
    return this.extractors.map(e => e.constructor.name);
  }

  /**
   * Verifica estado de extractores
   */
  async getExtractorsStatus(context: ExtractionContext): Promise<{ [key: string]: boolean }> {
    const status: { [key: string]: boolean } = {};
    
    for (const extractor of this.extractors) {
      try {
        status[extractor.constructor.name] = extractor.canHandle(context);
      } catch (error) {
        status[extractor.constructor.name] = false;
      }
    }
    
    return status;
  }
}