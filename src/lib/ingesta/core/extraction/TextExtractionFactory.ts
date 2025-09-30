/**
 * ARCHIVO: TextExtractionFactory.ts
 * PROPÓSITO: Factory para crear y orquestar extractores de texto
 * ESTADO: development
 * DEPENDENCIAS: BaseTextExtractor, extractores específicos
 * OUTPUTS: Selección automática de estrategia de extracción óptima
 * ACTUALIZADO: 2025-09-21
 */

import { BaseTextExtractor, ExtractionResult, ExtractionContext } from './BaseTextExtractor';
import { PdfParseExtractor } from './PdfParseExtractor';
import { GoogleVisionExtractor } from './GoogleVisionExtractor';
import { GeminiFlashExtractor, GeminiAllInOneResult } from './GeminiFlashExtractor';

export class TextExtractionFactory {
  private extractors: BaseTextExtractor[];
  
  constructor() {
    console.log('🔧 [FACTORY CONSTRUCTOR] Starting TextExtractionFactory initialization...');
    
    // Registrar extractores ordenados por prioridad
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    console.log(`🔧 [FACTORY CONSTRUCTOR] Environment: NODE_ENV=${process.env.NODE_ENV}, VERCEL=${process.env.VERCEL}, isProduction=${isProduction}`);
    
    try {
      console.log('🔧 [FACTORY CONSTRUCTOR] Creating PdfParseExtractor...');
      const pdfExtractor = new PdfParseExtractor();
      console.log(`🔧 [FACTORY CONSTRUCTOR] PdfParseExtractor created: ${pdfExtractor.getExtractorName()}`);
      
      console.log('🔧 [FACTORY CONSTRUCTOR] Creating GoogleVisionExtractor...');
      const visionExtractor = new GoogleVisionExtractor();
      console.log(`🔧 [FACTORY CONSTRUCTOR] GoogleVisionExtractor created: ${visionExtractor.getExtractorName()}`);
      
      this.extractors = [pdfExtractor, visionExtractor];
      console.log(`🔧 [FACTORY CONSTRUCTOR] Base extractors array length: ${this.extractors.length}`);
      
      // Solo incluir GeminiFlashExtractor en desarrollo debido a problemas de contexto Next.js
      if (!isProduction) {
        console.log('🔧 [FACTORY CONSTRUCTOR] Creating GeminiFlashExtractor (development only)...');
        const geminiExtractor = new GeminiFlashExtractor();
        console.log(`🔧 [FACTORY CONSTRUCTOR] GeminiFlashExtractor created: ${geminiExtractor.getExtractorName()}`);
        this.extractors.push(geminiExtractor);
      } else {
        console.log('🔧 [FACTORY CONSTRUCTOR] Skipping GeminiFlashExtractor in production');
      }
      
      console.log(`🔧 [FACTORY CONSTRUCTOR] Total extractors before sorting: ${this.extractors.length}`);
      console.log(`🔧 [FACTORY CONSTRUCTOR] Extractor names: ${this.extractors.map(e => e.getExtractorName()).join(', ')}`);
      
      // Ordenar por prioridad
      this.extractors.sort((a, b) => a.getPriority() - b.getPriority());
      
      console.log(`🔧 [FACTORY CONSTRUCTOR] Final extractors after sorting: ${this.extractors.map(e => e.getExtractorName()).join(', ')}`);
      
    } catch (error) {
      console.error('❌ [FACTORY CONSTRUCTOR] Error during initialization:', error);
      this.extractors = [];
    }
  }

  /**
   * Ejecuta la cadena de estrategias según tu flujo definido
   */
  async extractText(context: ExtractionContext): Promise<ExtractionResult> {
    console.log('🔧 [TEXT EXTRACTION] Starting extraction strategy chain...');
    console.log(`📄 [TEXT EXTRACTION] File: ${context.filename} (${context.buffer.length} bytes)`);
    console.log(`🔧 [TEXT EXTRACTION] Environment: NODE_ENV=${process.env.NODE_ENV}, VERCEL=${process.env.VERCEL}`);
    console.log(`🔧 [TEXT EXTRACTION] Available extractors: ${this.getAvailableExtractors().join(', ')}`);
    
    let lastResult: ExtractionResult | null = null;
    
    // ESTRATEGIA 1: PDF-parse (siempre primer intento)
    const pdfExtractor = this.getExtractor('pdf-parse');
    if (pdfExtractor) {
      console.log('📄 [TEXT EXTRACTION] Strategy 1: PDF-parse extraction...');
      try {
        const pdfResult = await pdfExtractor.extract(context);
        lastResult = pdfResult;
        console.log(`📄 [TEXT EXTRACTION] PDF-parse result: success=${pdfResult.success}, length=${pdfResult.textLength || 0}`);
        
        // Verificar si cumple con el mínimo de texto
        if (this.isResultSufficient(pdfResult, context.minTextLength || 50)) {
          console.log('✅ [TEXT EXTRACTION] PDF-parse successful - sufficient text extracted');
          return pdfResult;
        }
      } catch (error) {
        console.error('❌ [TEXT EXTRACTION] PDF-parse failed with error:', error);
        lastResult = {
          success: false,
          method: 'pdf-parse-error',
          error: error instanceof Error ? error.message : 'Unknown error',
          textLength: 0
        };
      }
    } else {
      console.log('❌ [TEXT EXTRACTION] PDF-parse extractor not found!');
    }
    
    console.log('⚠️ [TEXT EXTRACTION] PDF-parse insufficient - trying OCR strategies...');
    
    // ESTRATEGIA 2: Google Vision OCR
    const visionExtractor = this.getExtractor('google-vision-ocr');
    if (visionExtractor && visionExtractor.canHandle(context)) {
      console.log('👁️ [TEXT EXTRACTION] Strategy 2: Google Vision OCR...');
      try {
        const visionResult = await visionExtractor.extract(context);
        lastResult = visionResult;
        console.log(`👁️ [TEXT EXTRACTION] Google Vision result: success=${visionResult.success}, length=${visionResult.textLength || 0}`);
        
        if (this.isResultSufficient(visionResult, context.minTextLength || 50)) {
          console.log('✅ [TEXT EXTRACTION] Google Vision OCR successful');
          return visionResult;
        }
      } catch (error) {
        console.error('❌ [TEXT EXTRACTION] Google Vision failed with error:', error);
        lastResult = {
          success: false,
          method: 'google-vision-error',
          error: error instanceof Error ? error.message : 'Unknown error',
          textLength: 0
        };
      }
    } else if (visionExtractor) {
      console.log('⚠️ [TEXT EXTRACTION] Google Vision extractor found but cannot handle this context');
    } else {
      console.log('❌ [TEXT EXTRACTION] Google Vision extractor not found!');
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
    
    // ESTRATEGIA 3: Gemini Flash OCR IA (TODO-EN-UNO) - Solo en desarrollo
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    if (!isProduction) {
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
    } else {
      console.log('⚠️ [TEXT EXTRACTION] Skipping Gemini Flash in production environment');
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
      'pdf-parse': 'pdf-parse',
      'google-vision-ocr': 'google-vision-ocr', 
      'gemini-flash-ocr-ia': 'gemini-flash-ocr-ia'
    };
    
    const targetExtractorName = nameMap[extractorName];
    if (!targetExtractorName) {
      console.log(`🔍 [TEXT EXTRACTION] Unknown extractor name: ${extractorName}`);
      return null;
    }
    
    const extractor = this.extractors.find(e => e.getExtractorName() === targetExtractorName);
    if (!extractor) {
      console.log(`❌ [TEXT EXTRACTION] Extractor not found: ${targetExtractorName}`);
    } else {
      console.log(`✅ [TEXT EXTRACTION] Found extractor: ${targetExtractorName}`);
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
    return this.extractors.map(e => e.getExtractorName());
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