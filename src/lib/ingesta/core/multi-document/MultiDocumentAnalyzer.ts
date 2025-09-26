/**
 * ARCHIVO: MultiDocumentAnalyzer.ts
 * PROPÓSITO: Analizador híbrido para detectar y separar multi-documentos usando pipeline existente + Gemini Flash
 * ESTADO: development
 * DEPENDENCIAS: TextExtractionFactory, GoogleGenerativeAI, schemaBasedConfig
 * OUTPUTS: Análisis de tipos + archivos TXT separados + log + títulos sugeridos
 * ACTUALIZADO: 2025-09-25
 */

import { getSupportedDocumentTypes } from '../schemaBasedConfig';
import { TextExtractionFactory } from '../extraction/TextExtractionFactory';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

export interface DetectedDocument {
  type: string;
  startLine: number;
  endLine: number;
  confidence: number;
  isSupportedByPipeline: boolean;
  suggestedTitle: string;
  description?: string;
  keywords?: string[];
  textFragment?: string;
  startMarker?: string;
  endMarker?: string;
}

export interface AnalysisResult {
  isMultiDocument: boolean;
  confidence: number;
  detectedDocuments: DetectedDocument[];
  totalLines: number;
  extractedText: string;
  analysisDetails: string;
  supportedDocuments: number;
  unsupportedDocuments: number;
  textLength: number;
  textTruncated: boolean;
  maxSupportedLength: number;
}

export interface SeparationResult {
  outputFiles: string[];
  outputPath: string;
  logFile: string;
  summary: string;
  textFiles: Array<{
    filename: string;
    type: string;
    title: string;
    lines: string;
  }>;
  errors?: string[];
}

export class MultiDocumentAnalyzer {
  private textExtractor: TextExtractionFactory;
  private supportedTypes: string[];
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.textExtractor = new TextExtractionFactory();
    this.supportedTypes = getSupportedDocumentTypes();
    
    // Initialize Gemini for text analysis only
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    this.gemini = new GoogleGenerativeAI(apiKey);
    
    console.log(`🔧 [MULTI-DOC ANALYZER] Initialized with supported types:`, this.supportedTypes);
  }

  /**
   * Normaliza tipos detectados por Gemini para mapearlos con los soportados
   */
  private normalizeDocumentType(detectedType: string): string {
    const normalized = detectedType.toLowerCase().trim();

    // Mapeo de tipos comunes que Gemini puede devolver vs nuestros tipos
    const typeMapping: { [key: string]: string } = {
      // Tipos con tildes → sin tildes
      'albarán': 'albaran',
      'factura': 'factura',
      'contrato': 'contrato', 
      'comunicado': 'comunicado',
      'acta': 'acta',
      'escritura': 'escritura',
      'presupuesto': 'presupuesto',

      // Variaciones comunes
      'albaran': 'albaran',
      'delivery note': 'albaran',
      'nota de entrega': 'albaran',
      'invoice': 'factura',
      'bill': 'factura',
      'contract': 'contrato',
      'agreement': 'contrato',
      'minutes': 'acta',
      'meeting minutes': 'acta',
      'deed': 'escritura',
      'property deed': 'escritura',
      'escritura de compraventa': 'escritura',
      'budget': 'presupuesto',
      'estimate': 'presupuesto',
      'quote': 'presupuesto',
      'communication': 'comunicado',
      'notice': 'comunicado',
      'notification': 'comunicado',

      // Tipos específicos que no tenemos plantilla (mantener nombre original)
      'medical report': 'parte médico',
      'fine': 'multa',
      'traffic fine': 'multa de circulación'
    };

    const mappedType = typeMapping[normalized];
    
    if (mappedType) {
      return mappedType;
    }

    // Si no hay mapeo específico, devolver normalizado
    return normalized;
  }

  /**
   * Analiza un PDF para detectar si contiene múltiples documentos
   * ENFOQUE HÍBRIDO: TextExtractor (pipeline) + Gemini Flash (solo texto)
   */
  async analyzeDocument(buffer: Buffer, filename: string): Promise<AnalysisResult> {
    console.log(`🔍 [MULTI-DOC ANALYZER] Starting hybrid analysis of ${filename}...`);

    try {
      // 1. PASO 1: Extraer texto usando pipeline existente (PDF-parse/Google Vision)
      console.log('📄 [MULTI-DOC ANALYZER] Step 1: Extracting text with existing pipeline...');
      
      const extractionContext = {
        buffer,
        filename,
        documentId: 'multi-doc-analysis',
        minTextLength: 50
      };

      const extractionResult = await this.textExtractor.extractText(extractionContext);

      if (!extractionResult.success || !extractionResult.text) {
        throw new Error(`No se pudo extraer texto: ${extractionResult.error || 'Unknown error'}`);
      }

      console.log(`✅ [MULTI-DOC ANALYZER] Text extracted: ${extractionResult.text.length} characters using ${extractionResult.method}`);

      // 2. PASO 2: Dividir texto en líneas para análisis
      const textLines = extractionResult.text.split('\n');
      const totalLines = textLines.length;

      console.log(`📊 [MULTI-DOC ANALYZER] Text divided into ${totalLines} lines`);

      // 3. PASO 3: Analizar estructura con Gemini Flash (solo texto, barato)
      console.log('🤖 [MULTI-DOC ANALYZER] Step 2: Analyzing text structure with Gemini Flash...');
      
      const analysisResult = await this.performTextAnalysis(extractionResult.text, textLines);

      // 4. PASO 4: Procesar resultados y asignar fragmentos de texto con marcadores precisos
      const detectedDocuments = analysisResult.detectedDocuments.map(doc => {
        let textFragment = '';
        
        // Si tenemos marcadores, usarlos para corte preciso
        if (doc.startMarker && doc.endMarker) {
          const fullText = extractionResult.text;
          const startIndex = fullText.indexOf(doc.startMarker);
          const endIndex = fullText.indexOf(doc.endMarker, startIndex);
          
          console.log(`🔍 [MULTI-DOC ANALYZER] Searching markers for ${doc.type}:`);
          console.log(`   StartMarker: "${doc.startMarker}"`);
          console.log(`   EndMarker: "${doc.endMarker}"`);
          console.log(`   StartIndex: ${startIndex}, EndIndex: ${endIndex}`);
          
          if (startIndex !== -1 && endIndex !== -1) {
            // Empezar DESPUÉS del marcador de inicio
            const actualStart = startIndex + doc.startMarker.length;
            // Terminar ANTES del marcador de fin (no incluir el marcador de fin)
            const actualEnd = endIndex;
            
            textFragment = fullText.substring(actualStart, actualEnd);
            console.log(`🎯 [MULTI-DOC ANALYZER] Using precise markers for ${doc.type}: "${doc.startMarker.substring(0,30)}..." to "${doc.endMarker.substring(0,30)}..."`);
            console.log(`🎯 [MULTI-DOC ANALYZER] Cut from position ${actualStart} to ${actualEnd} (${actualEnd - actualStart} chars)`);
          } else {
            // Fallback a corte por líneas si no se encuentran los marcadores
            const startLine = Math.max(0, doc.startLine - 1);
            const endLine = Math.min(textLines.length - 1, doc.endLine - 1);
            textFragment = textLines.slice(startLine, endLine + 1).join('\n');
            console.log(`⚠️ [MULTI-DOC ANALYZER] Markers not found, using line-based cutting for ${doc.type}`);
          }
        } else {
          // Fallback tradicional por líneas
          const startLine = Math.max(0, doc.startLine - 1);
          const endLine = Math.min(textLines.length - 1, doc.endLine - 1);
          textFragment = textLines.slice(startLine, endLine + 1).join('\n');
        }

        // Normalizar tipo detectado SOLO para verificar soporte, mantener original si no es soportado
        const normalizedType = this.normalizeDocumentType(doc.type);
        const isSupported = this.supportedTypes.includes(normalizedType);
        
        // Si es soportado, usar el tipo normalizado. Si no, mantener el original
        const finalType = isSupported ? normalizedType : doc.type;

        console.log(`🔍 [MULTI-DOC ANALYZER] Type mapping: "${doc.type}" → "${normalizedType}" → ${isSupported ? 'SUPPORTED' : 'NOT SUPPORTED'} → final: "${finalType}"`);

        return {
          ...doc,
          type: finalType, // Use normalized only if supported, otherwise keep original
          isSupportedByPipeline: isSupported,
          textFragment
        };
      });

      const supportedCount = detectedDocuments.filter(d => d.isSupportedByPipeline).length;
      const unsupportedCount = detectedDocuments.length - supportedCount;

      const result: AnalysisResult = {
        isMultiDocument: analysisResult.isMultiDocument,
        confidence: analysisResult.confidence,
        detectedDocuments,
        totalLines,
        extractedText: extractionResult.text,
        analysisDetails: analysisResult.analysisDetails,
        supportedDocuments: supportedCount,
        unsupportedDocuments: unsupportedCount,
        textLength: extractionResult.text.length,
        textTruncated: extractionResult.text.length > 750000,
        maxSupportedLength: 750000
      };

      console.log('📊 [MULTI-DOC ANALYZER] Hybrid analysis completed:', {
        isMultiDocument: result.isMultiDocument,
        documentsFound: result.detectedDocuments.length,
        supportedTypes: supportedCount,
        unsupportedTypes: unsupportedCount,
        extractionMethod: extractionResult.method
      });

      return result;

    } catch (error) {
      console.error('💥 [MULTI-DOC ANALYZER] Analysis failed:', error);
      throw new Error(`Error durante el análisis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Realiza el análisis específico de multi-documentos usando Gemini Flash (solo texto)
   */
  private async performTextAnalysis(text: string, textLines: string[]): Promise<{
    isMultiDocument: boolean;
    confidence: number;
    detectedDocuments: DetectedDocument[];
    analysisDetails: string;
  }> {
    // Prompt especializado para detección de multi-documentos EN TEXTO
    const totalLines = textLines.length;
    
    // Verificar límites del modelo Gemini 1.5 Flash
    const GEMINI_FLASH_MAX_CHARS = 750000; // ~1M tokens aproximadamente
    const textLength = text.length;
    
    if (textLength > GEMINI_FLASH_MAX_CHARS) {
      console.warn(`⚠️ [MULTI-DOC ANALYZER] Text too long: ${textLength} chars (max ${GEMINI_FLASH_MAX_CHARS})`);
      console.warn('⚠️ [MULTI-DOC ANALYZER] Text will be truncated - some documents may not be detected');
    }
    
    // Determinar cuánto texto enviar al modelo
    const textToAnalyze = textLength > GEMINI_FLASH_MAX_CHARS 
      ? text.substring(0, GEMINI_FLASH_MAX_CHARS) 
      : text;
      
    console.log(`📊 [MULTI-DOC ANALYZER] Analyzing ${textToAnalyze.length}/${textLength} characters with Gemini Flash`);
    const prompt = `
ANALYZE THIS EXTRACTED TEXT TO DETECT MULTIPLE DOCUMENTS:

You are analyzing text extracted from a PDF that may contain multiple different types of documents (invoices, contracts, delivery notes, minutes, communications, etc.).

TEXT TO ANALYZE (${totalLines} lines, ${textToAnalyze.length} chars):
${textToAnalyze}${textLength > GEMINI_FLASH_MAX_CHARS ? '\n... [TEXT TRUNCATED DUE TO MODEL LIMITS]' : ''}

SUPPORTED DOCUMENT TYPES: ${this.supportedTypes.join(', ')}

INSTRUCTIONS:
1. MANDATORY: Always use "--- Página X ---" markers as PRIMARY boundary markers when they exist
2. For each document detected:
   - If document starts after "--- Página X ---", use "--- Página X ---" as startMarker
   - If document ends before "--- Página Y ---", use "--- Página Y ---" as endMarker
   - NEVER mix page markers with content markers in the same document
3. Document boundary priority:
   - PRIMARY: Page markers ("--- Página X ---")
   - SECONDARY: Only use content markers if no page markers are available
4. Content identification (for type detection only, NOT for boundaries):
   - FACTURAS: "FACTURA N°", invoice numbers, billing details
   - ALBARANES: "ALBARÁN", delivery information, item quantities
   - MULTAS: "EXPEDIENTE SANCIONADOR", fine details, penalties
   - PARTES MÉDICOS: "PARTE MÉDICO", patient information, medical codes
   - CONTRATOS: contract language, legal terms
5. CRITICAL RULE: If you detect a document between pages X and Y, use:
   - startMarker: "--- Página X ---"
   - endMarker: "--- Página Y ---"

RESPOND WITH VALID JSON ONLY:
{
  "isMultiDocument": boolean,
  "confidence": number (0-1),
  "detectedDocuments": [
    {
      "type": "document_type (lowercase)",
      "startLine": number (1-${totalLines}),
      "endLine": number (1-${totalLines}),
      "confidence": number (0-1),
      "suggestedTitle": "Descriptive title for this document",
      "description": "brief description of content found",
      "keywords": ["key", "words", "found"],
      "startMarker": "EXACT text string that marks the START of this document (15+ chars) - REQUIRED",
      "endMarker": "EXACT text string that marks the END of this document (15+ chars) - REQUIRED"
    }
  ],
  "analysisDetails": "explanation of analysis and boundaries found"
}

IMPORTANT:
- If unsure about document type, use "unknown" 
- Line numbers should be realistic (1 to ${totalLines})
- If single document, still include it in detectedDocuments array
- Be conservative with confidence scores
- Focus on clear content boundaries in the text
- Suggest meaningful, descriptive titles based on content
- Look for document-specific patterns (invoice numbers, contract clauses, etc.)

EXAMPLES OF CORRECT DETECTION:
- If you see "MULTA" or "INFRACCIÓN" followed later by "ALBARÁN", these are TWO separate documents
- PRIORITY: If you see "--- Página X ---" markers and content type changes (e.g., multa content ends at "--- Página 9 ---" and albarán content starts), use these markers as precise boundaries
- A medical certificate ("parte médico") has patient info and medical codes
- An albarán has delivery address, item quantities, and company letterhead
- A factura has invoice numbers, IVA calculations, and billing details

CRITICAL EXAMPLES:
- Document on pages 7-8: startMarker="--- Página 7 ---", endMarker="--- Página 8 ---"
- Document on pages 12-14: startMarker="--- Página 12 ---", endMarker="--- Página 14 ---"
- Document spanning one page: startMarker="--- Página 5 ---", endMarker="--- Página 6 ---"
- NEVER use content as startMarker when page markers exist
- Example WRONG: startMarker="Albarán Fecha: 01.10.2020", endMarker="--- Página 8 ---"
- Example CORRECT: startMarker="--- Página 7 ---", endMarker="--- Página 8 ---"
- ALWAYS provide both startMarker and endMarker - they are REQUIRED fields

DO NOT mix different document types in one detection - separate them clearly!
`;

    console.log('🤖 [MULTI-DOC ANALYZER] Sending text analysis prompt to Gemini Flash...');

    try {
      // Use Gemini Flash directly for text analysis (much cheaper than OCR)
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      console.log('📥 [MULTI-DOC ANALYZER] Raw Gemini response:', response.substring(0, 500));

      // Parse JSON response
      const parsed = this.parseGeminiResponse(response);
      
      console.log('✅ [MULTI-DOC ANALYZER] Parsed text analysis result:', {
        isMultiDocument: parsed.isMultiDocument,
        documentsFound: parsed.detectedDocuments.length,
        confidence: parsed.confidence
      });

      return parsed;

    } catch (error) {
      console.error('💥 [MULTI-DOC ANALYZER] Gemini text analysis failed:', error);
      throw new Error(`Error en análisis de texto con Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse and validate Gemini's JSON response
   */
  private parseGeminiResponse(response: string): {
    isMultiDocument: boolean;
    confidence: number;
    detectedDocuments: DetectedDocument[];
    analysisDetails: string;
  } {
    try {
      // Clean the response to extract JSON
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanResponse);

      // Validate required fields
      if (typeof parsed.isMultiDocument !== 'boolean') {
        throw new Error('Invalid isMultiDocument field');
      }

      if (!Array.isArray(parsed.detectedDocuments)) {
        throw new Error('Invalid detectedDocuments field');
      }

      // Ensure confidence is between 0 and 1
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

      // Validate each detected document
      parsed.detectedDocuments = parsed.detectedDocuments.map((doc: any) => ({
        type: (doc.type || 'unknown').toLowerCase(),
        startLine: Math.max(1, doc.startLine || 1),
        endLine: Math.max(doc.startLine || 1, doc.endLine || 1),
        confidence: Math.max(0, Math.min(1, doc.confidence || 0.5)),
        suggestedTitle: doc.suggestedTitle || `${doc.type} Document`,
        description: doc.description || '',
        keywords: Array.isArray(doc.keywords) ? doc.keywords : [],
        startMarker: doc.startMarker || null,
        endMarker: doc.endMarker || null,
        isSupportedByPipeline: false // Will be set later
      }));

      return {
        isMultiDocument: parsed.isMultiDocument,
        confidence: parsed.confidence,
        detectedDocuments: parsed.detectedDocuments,
        analysisDetails: parsed.analysisDetails || 'Análisis completado'
      };

    } catch (error) {
      console.error('💥 [MULTI-DOC ANALYZER] JSON parsing failed:', error);
      console.error('Raw response:', response.substring(0, 1000));
      
      // Return fallback result
      return {
        isMultiDocument: false,
        confidence: 0.1,
        detectedDocuments: [{
          type: 'unknown',
          startLine: 1,
          endLine: 1,
          confidence: 0.1,
          suggestedTitle: 'Unknown Document',
          description: 'Error parsing analysis result',
          keywords: [],
          isSupportedByPipeline: false
        }],
        analysisDetails: `Error parsing Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Calculate separation points based on detected documents
   */
  private calculateSeparationPoints(documents: DetectedDocument[]): number[] {
    if (documents.length <= 1) return [];

    const points: number[] = [];
    for (let i = 1; i < documents.length; i++) {
      points.push(documents[i].startPage);
    }

    return points.sort((a, b) => a - b);
  }

  /**
   * Separate multi-document text into individual TXT files with suggested titles
   */
  async separateDocuments(
    originalText: string,
    originalFilename: string,
    detectedDocuments: DetectedDocument[],
    outputPath: string
  ): Promise<SeparationResult> {
    console.log(`✂️ [MULTI-DOC ANALYZER] Starting text separation...`);
    console.log(`📁 [MULTI-DOC ANALYZER] Output path: ${outputPath}`);

    const outputFiles: string[] = [];
    const textFiles: SeparationResult['textFiles'] = [];
    const errors: string[] = [];

    try {
      // Create output directory
      await fs.mkdir(outputPath, { recursive: true });
      
      // 🐛 DEBUG: Create debug directory and save full text
      const debugPath = path.resolve(process.cwd(), 'test-results', 'separacion');
      await fs.mkdir(debugPath, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const debugPrefix = `${timestamp}_${originalFilename.replace('.pdf', '')}`;
      
      const textLines = originalText.split('\n');
      
      // Save full extracted text for analysis
      const fullTextPath = path.join(debugPath, `${debugPrefix}_00_TEXTO_COMPLETO.txt`);
      await fs.writeFile(fullTextPath, `
=== TEXTO COMPLETO EXTRAÍDO ===
Archivo: ${originalFilename}
Timestamp: ${new Date().toISOString()}
Total caracteres: ${originalText.length}
Total líneas: ${textLines.length}
Documentos detectados: ${detectedDocuments.length}
======================================

${originalText}
`, 'utf-8');
      
      console.log(`🐛 [DEBUG] Saved full text: ${fullTextPath}`);
      
      console.log(`📊 [MULTI-DOC ANALYZER] Processing ${detectedDocuments.length} documents from ${textLines.length} lines`);

      // Process each detected document
      for (let i = 0; i < detectedDocuments.length; i++) {
        const doc = detectedDocuments[i];
        
        try {
          console.log(`📄 [MULTI-DOC ANALYZER] Processing document ${i + 1}: ${doc.type} (lines ${doc.startLine}-${doc.endLine})`);
          console.log(`📝 [MULTI-DOC ANALYZER] Title: "${doc.suggestedTitle}"`);

          // Extract text fragment for this document
          const startLine = Math.max(0, doc.startLine - 1); // Convert to 0-based
          const endLine = Math.min(textLines.length - 1, doc.endLine - 1); // Convert to 0-based
          
          const documentText = textLines.slice(startLine, endLine + 1).join('\n');

          // Generate safe filename from suggested title
          const safeTitle = doc.suggestedTitle
            .replace(/[^a-zA-Z0-9\s\-\_]/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with dashes
            .substring(0, 50); // Limit length

          const baseFilename = path.parse(originalFilename).name;
          const outputFilename = `${i + 1}_${doc.type}_${safeTitle}.txt`;
          const outputFilePath = path.join(outputPath, outputFilename);

          // Create document header
          const header = `
=== DOCUMENTO SEPARADO ===
Archivo original: ${originalFilename}
Tipo detectado: ${doc.type}
Título sugerido: ${doc.suggestedTitle}
Líneas: ${doc.startLine}-${doc.endLine}
Confianza: ${Math.round(doc.confidence * 100)}%
Soportado por pipeline: ${doc.isSupportedByPipeline ? 'SÍ' : 'NO'}
Descripción: ${doc.description}
Palabras clave: ${doc.keywords.join(', ')}
Fecha separación: ${new Date().toISOString()}
=========================

${documentText}
`;

          // Save text document
          await fs.writeFile(outputFilePath, header, 'utf-8');

          // 🐛 DEBUG: Also save to debug folder with enhanced analysis info
          const debugDocPath = path.join(debugPath, `${debugPrefix}_${String(i + 1).padStart(2, '0')}_${doc.type.toUpperCase()}_${safeTitle}.txt`);
          const debugContent = `
=== DOCUMENTO SEPARADO (DEBUG) ===
Número: ${i + 1}/${detectedDocuments.length}
Tipo: ${doc.type}
Título: ${doc.suggestedTitle}
Líneas originales: ${doc.startLine}-${doc.endLine} (total: ${doc.endLine - doc.startLine + 1} líneas)
Confianza: ${Math.round(doc.confidence * 100)}%
Soportado: ${doc.isSupportedByPipeline ? 'SÍ' : 'NO'}
Marcador inicio: ${doc.startMarker || 'No detectado'}
Marcador final: ${doc.endMarker || 'No detectado'}
Caracteres: ${documentText.length}
Descripción: ${doc.description}
Keywords: ${doc.keywords?.join(', ')}
=====================================

${documentText}
`;
          await fs.writeFile(debugDocPath, debugContent, 'utf-8');

          outputFiles.push(outputFilePath);
          textFiles.push({
            filename: outputFilename,
            type: doc.type,
            title: doc.suggestedTitle,
            lines: `${doc.startLine}-${doc.endLine}`
          });

          console.log(`✅ [MULTI-DOC ANALYZER] Saved: ${outputFilename}`);
          console.log(`🐛 [DEBUG] Saved debug: ${path.basename(debugDocPath)}`);

        } catch (docError) {
          const errorMsg = `Error processing document ${i + 1} (${doc.type}): ${docError instanceof Error ? docError.message : 'Unknown error'}`;
          console.error(`❌ [MULTI-DOC ANALYZER] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      // Create analysis log (reuse existing timestamp from debug)
      const logFilename = `analysis-log-${timestamp}.json`;
      const logPath = path.join(outputPath, logFilename);

      const logData = {
        originalFile: originalFilename,
        analysisDate: new Date().toISOString(),
        totalLinesProcessed: textLines.length,
        documentsFound: detectedDocuments.length,
        supportedDocuments: detectedDocuments.filter(d => d.isSupportedByPipeline).length,
        unsupportedDocuments: detectedDocuments.filter(d => !d.isSupportedByPipeline).length,
        detectedDocuments: detectedDocuments.map(doc => ({
          type: doc.type,
          title: doc.suggestedTitle,
          lines: `${doc.startLine}-${doc.endLine}`,
          confidence: doc.confidence,
          supported: doc.isSupportedByPipeline,
          keywords: doc.keywords,
          startMarker: doc.startMarker || 'No detectado',
          endMarker: doc.endMarker || 'No detectado'
        })),
        outputFiles: textFiles,
        errors: errors.length > 0 ? errors : undefined
      };

      await fs.writeFile(logPath, JSON.stringify(logData, null, 2), 'utf-8');
      
      // 🐛 DEBUG: Save enhanced debug summary
      const debugSummaryPath = path.join(debugPath, `${debugPrefix}_99_RESUMEN_DEBUG.json`);
      const debugLogData = {
        ...logData,
        debugInfo: {
          debugPrefix,
          debugPath,
          totalCharacters: originalText.length,
          filesGenerated: outputFiles.length,
          timestamp: new Date().toISOString()
        },
        detectedDocumentsEnhanced: detectedDocuments.map(doc => ({
          ...logData.detectedDocuments.find(d => d.type === doc.type && d.title === doc.suggestedTitle),
          startMarker: doc.startMarker || 'No detectado',
          endMarker: doc.endMarker || 'No detectado',
          textLength: doc.textFragment?.length || 0
        }))
      };
      
      await fs.writeFile(debugSummaryPath, JSON.stringify(debugLogData, null, 2), 'utf-8');
      
      console.log(`📋 [MULTI-DOC ANALYZER] Analysis log saved: ${logFilename}`);
      console.log(`🐛 [DEBUG] Enhanced summary: ${path.basename(debugSummaryPath)}`);
      console.log(`🐛 [DEBUG] All debug files in: test-results/separacion/`);

      const summary = `Separated ${outputFiles.length} text documents from original file. ${errors.length > 0 ? `${errors.length} errors occurred.` : 'All documents processed successfully.'}`;

      console.log(`🏁 [MULTI-DOC ANALYZER] Text separation completed: ${outputFiles.length} files + log created`);

      return {
        outputFiles,
        outputPath,
        logFile: logPath,
        summary,
        textFiles,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      const errorMsg = `Error during text separation: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`💥 [MULTI-DOC ANALYZER] ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }
}