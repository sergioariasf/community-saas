/**
 * ARCHIVO: DocumentClassifier.ts
 * PROPÓSITO: Clasificador inteligente de documentos usando texto extraído y agentes IA
 * ESTADO: development
 * DEPENDENCIAS: saasAgents, createSupabaseClient
 * OUTPUTS: Tipo de documento clasificado con alta precisión
 * ACTUALIZADO: 2025-09-21
 */

export interface ClassificationResult {
  documentType: string;
  confidence: number;
  method: 'filename' | 'text-analysis' | 'ai-agent' | 'ocr-integrated';
  reasoning?: string;
  fallbackUsed?: boolean;
}

export class DocumentClassifier {
  
  /**
   * Estrategia principal de clasificación usando múltiples métodos
   */
  async classifyDocument(options: {
    filename: string;
    extractedText?: string;
    useAI?: boolean;
  }): Promise<ClassificationResult> {
    
    console.log('🏷️ [DEBUG] Starting intelligent document classification...');
    console.log('📁 [DEBUG] Filename:', options.filename);
    console.log('📝 [DEBUG] Has extracted text:', !!options.extractedText);
    console.log('🤖 [DEBUG] AI enabled:', options.useAI !== false);

    // Estrategia 1: Clasificación por filename (rápida, para casos obvios)
    const filenameResult = this.classifyByFilename(options.filename);
    if (filenameResult.confidence >= 0.9) {
      console.log('✅ [DEBUG] High confidence filename match - using filename classification');
      return filenameResult;
    }

    // Estrategia 2: Análisis de texto (si está disponible)
    if (options.extractedText && options.extractedText.length > 100) {
      console.log('🔍 [DEBUG] Attempting text-based classification...');
      const textResult = await this.classifyByTextAnalysis(options.extractedText, options.filename);
      if (textResult.confidence >= 0.8) {
        console.log('✅ [DEBUG] High confidence text analysis - using text classification');
        return textResult;
      }
    }

    // Estrategia 3: Agente IA (más preciso pero más lento)
    if (options.useAI !== false) {
      console.log('🤖 [DEBUG] Attempting AI agent classification...');
      const aiResult = await this.classifyWithAIAgent(options.extractedText || '', options.filename);
      if (aiResult.confidence >= 0.7) {
        console.log('✅ [DEBUG] AI agent classification successful');
        return aiResult;
      }
    }

    // Fallback: Mejor resultado disponible
    console.log('⚠️ [DEBUG] Using best available classification result');
    const bestResult = [filenameResult, textResult, aiResult]
      .filter(r => r)
      .sort((a, b) => (b?.confidence || 0) - (a?.confidence || 0))[0];

    return {
      ...bestResult,
      fallbackUsed: true
    } as ClassificationResult;
  }

  /**
   * Clasificación rápida basada en nombre de archivo
   */
  private classifyByFilename(filename: string): ClassificationResult {
    const nameLower = filename.toLowerCase();
    
    const patterns = [
      { pattern: /\bacta\b|^acta/i, type: 'acta', confidence: 0.95 },
      { pattern: /\bfactura\b|^factura/i, type: 'factura', confidence: 0.95 },
      { pattern: /\bcontrato\b|^contrato/i, type: 'contrato', confidence: 0.95 },
      { pattern: /\bcomunicado\b|^comunicado/i, type: 'comunicado', confidence: 0.95 },
      { pattern: /\bpresupuesto\b|^presupuesto/i, type: 'presupuesto', confidence: 0.9 },
      { pattern: /\balbaran\b|^albaran/i, type: 'albaran', confidence: 0.9 },
      { pattern: /\bescritura\b|^escritura/i, type: 'escritura', confidence: 0.9 }
    ];

    for (const { pattern, type, confidence } of patterns) {
      if (pattern.test(nameLower)) {
        console.log(`🎯 [DEBUG] Filename pattern matched: ${type} (confidence: ${confidence})`);
        return {
          documentType: type,
          confidence,
          method: 'filename',
          reasoning: `Filename contains pattern for ${type}`
        };
      }
    }

    // Default fallback
    return {
      documentType: 'acta', // Default más común
      confidence: 0.3,
      method: 'filename',
      reasoning: 'No specific filename pattern matched, using default'
    };
  }

  /**
   * Análisis de texto para clasificación
   */
  private async classifyByTextAnalysis(text: string, filename: string): Promise<ClassificationResult> {
    const textLower = text.toLowerCase();
    
    // Palabras clave específicas por tipo de documento
    const keywords = {
      acta: {
        strong: ['junta', 'reunión', 'presidente', 'secretario', 'propietarios', 'acuerdos', 'orden del día'],
        medium: ['asamblea', 'convocatoria', 'administrador', 'comunidad'],
        weight: 1.0
      },
      factura: {
        strong: ['factura', 'importe', 'iva', 'subtotal', 'proveedor', 'cliente'],
        medium: ['precio', 'cantidad', 'concepto', 'total'],
        weight: 1.0
      },
      contrato: {
        strong: ['contrato', 'partes', 'cláusulas', 'servicios', 'contratante'],
        medium: ['obligaciones', 'condiciones', 'duración', 'precio'],
        weight: 1.0
      },
      comunicado: {
        strong: ['comunicado', 'información', 'aviso', 'notificación'],
        medium: ['atentamente', 'administración', 'vecinos', 'propietarios'],
        weight: 1.0
      }
    };

    let bestMatch = { type: 'acta', score: 0 };

    for (const [docType, { strong, medium }] of Object.entries(keywords)) {
      let score = 0;
      
      // Palabras fuertes (peso 3)
      for (const keyword of strong) {
        const matches = (textLower.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * 3;
      }
      
      // Palabras medias (peso 1)
      for (const keyword of medium) {
        const matches = (textLower.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * 1;
      }

      if (score > bestMatch.score) {
        bestMatch = { type: docType, score };
      }
    }

    // Calcular confianza basada en score
    const confidence = Math.min(0.95, bestMatch.score * 0.1);
    
    console.log(`📊 [DEBUG] Text analysis result: ${bestMatch.type} (score: ${bestMatch.score}, confidence: ${confidence})`);

    return {
      documentType: bestMatch.type,
      confidence,
      method: 'text-analysis',
      reasoning: `Text analysis found ${bestMatch.score} keyword matches for ${bestMatch.type}`
    };
  }

  /**
   * Clasificación usando agente IA (implementación real)
   */
  private async classifyWithAIAgent(text: string, filename: string): Promise<ClassificationResult> {
    try {
      console.log('🤖 [DEBUG] Starting AI agent classification...');
      
      // Buscar agente clasificador en BD
      const classifier = await this.getClassifierAgent();
      if (!classifier) {
        console.log('❌ [DEBUG] No document_classifier agent found');
        return {
          documentType: 'acta',
          confidence: 0.3,
          method: 'ai-agent',
          reasoning: 'AI classifier agent not available'
        };
      }

      console.log(`✅ [DEBUG] Found classifier agent: ${classifier.name}`);

      // Llamar al agente real con el texto
      const { callSaaSAgent } = await import('@/lib/gemini/saasAgents');
      
      const agentInput = {
        filename: filename,
        text_preview: text.substring(0, 2000), // Primeros 2000 chars para clasificar
        full_text_length: text.length
      };

      console.log('📤 [DEBUG] Calling AI classifier agent...');
      const startTime = Date.now();
      const result = await callSaaSAgent(classifier.name, agentInput);
      const processingTime = Date.now() - startTime;

      console.log(`⏱️ [DEBUG] AI classification completed in ${processingTime}ms`);
      console.log('📊 [DEBUG] AI result:', {
        success: result.success,
        hasData: !!result.data,
        error: result.error
      });

      if (result.success && result.data && result.data.document_type) {
        const confidence = result.data.confidence || 0.8;
        const reasoning = result.data.reasoning || 'AI agent classification';

        return {
          documentType: result.data.document_type,
          confidence: Math.min(0.95, confidence),
          method: 'ai-agent',
          reasoning: reasoning
        };
      } else {
        console.log('❌ [DEBUG] AI agent classification failed');
        return {
          documentType: 'acta',
          confidence: 0.4,
          method: 'ai-agent',
          reasoning: 'AI agent call failed or returned invalid data'
        };
      }

    } catch (error) {
      console.error('❌ [DEBUG] AI classification error:', error);
      return {
        documentType: 'acta',
        confidence: 0.3,
        method: 'ai-agent',
        reasoning: `AI classification error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Buscar agente clasificador en la BD
   */
  private async getClassifierAgent() {
    try {
      const { createSupabaseClient } = await import('@/supabase-clients/server');
      const supabase = await createSupabaseClient();
      
      const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .ilike('name', '%classifier%')
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.log(`⚠️ [DEBUG] Error finding classifier agent:`, error.message);
        return null;
      }
      
      return agent;
      
    } catch (error) {
      console.error(`❌ [DEBUG] Error getting classifier agent:`, error);
      return null;
    }
  }
}