/**
 * ARCHIVO: actaMetadataExtractor.ts
 * PROPÓSITO: Extracción inteligente de metadatos de actas con Gemini AI
 * ESTADO: production
 * DEPENDENCIAS: @google/generative-ai, contracts/actaContract.ts, types.ts
 * OUTPUTS: Metadatos estructurados (fecha, asistentes, acuerdos, keywords)
 * ACTUALIZADO: 2025-09-14
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  BaseMetadataExtractor, 
  GeminiExtractionConfig, 
  GeminiAnalysisResult,
  ExtractorUtils
} from './types';
import { 
  MetadataExtractionResult, 
  MetadataExtractionConfig,
  MetadataDateUtils 
} from '../contracts/types';
import { 
  ActaMetadataStructure, 
  ActaMetadataContract, 
  TopicKeywords,
  TipoReunion 
} from '../contracts/actaContract';

export class ActaMetadataExtractor extends BaseMetadataExtractor<ActaMetadataStructure> {
  private gemini: GoogleGenerativeAI | null = null;
  private model: any = null;
  private contract: ActaMetadataContract;

  constructor() {
    super('ActaMetadataExtractor', ['acta']);
    this.contract = new ActaMetadataContract();
    this.initializeGemini();
  }

  private initializeGemini(): void {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        console.warn('[ActaMetadataExtractor] No GEMINI_API_KEY found');
        return;
      }

      this.gemini = new GoogleGenerativeAI(apiKey);
      this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      console.log('[ActaMetadataExtractor] Gemini client initialized successfully');
    } catch (error) {
      console.warn('[ActaMetadataExtractor] Failed to initialize Gemini client:', error);
    }
  }

  /**
   * Configuración por defecto optimizada para extracción de ACTAS
   */
  getDefaultConfig(): MetadataExtractionConfig {
    return {
      method: 'gemini',
      gemini_config: {
        temperature: 0.1,        // Baja temperatura para respuestas consistentes
        max_output_tokens: 2000  // Suficiente para metadatos estructurados
      },
      fallback_enabled: true,
      validation_enabled: true
    };
  }

  /**
   * Método principal de extracción de metadatos
   */
  async extractMetadata(
    text: string,
    filename: string,
    config?: Partial<MetadataExtractionConfig>
  ): Promise<MetadataExtractionResult<ActaMetadataStructure>> {
    const startTime = Date.now();
    const fullConfig = { ...this.getDefaultConfig(), ...config };
    
    console.log(`🤖 [ActaMetadataExtractor] Iniciando extracción de metadatos`);
    console.log(`   📄 Archivo: ${filename}`);
    console.log(`   📏 Texto: ${text.length.toLocaleString()} caracteres`);

    try {
      // Preprocesar texto
      const cleanText = this.preprocessText(text, 8000); // Límite para metadatos overview
      console.log(`   🧹 Texto procesado: ${cleanText.length} caracteres`);

      let extractionResult: ActaMetadataStructure;
      let method: 'gemini' | 'fallback' = 'fallback';
      let confidence = 0.5;
      let tokensUsed = 0;

      // Intentar extracción con Gemini
      if (this.model && fullConfig.method === 'gemini') {
        try {
          const geminiResult = await this.extractWithGemini(cleanText, filename, fullConfig);
          if (geminiResult.success) {
            extractionResult = geminiResult.parsed_data;
            method = 'gemini';
            confidence = geminiResult.confidence;
            tokensUsed = geminiResult.tokens_used;
            console.log(`   ✅ Extracción con Gemini exitosa: ${confidence * 100}% confianza`);
          } else {
            throw new Error(`Gemini failed: ${geminiResult.errors.join(', ')}`);
          }
        } catch (geminiError) {
          console.warn(`   ⚠️ Error con Gemini: ${geminiError.message}`);
          if (!fullConfig.fallback_enabled) {
            throw geminiError;
          }
          // Continuar con fallback
        }
      }

      // Fallback si Gemini falló o no está disponible
      if (!extractionResult!) {
        console.log(`   🔄 Usando extracción fallback`);
        extractionResult = this.extractWithFallback(cleanText, filename);
        method = 'fallback';
        confidence = 0.3;
      }

      // Validar resultado con el contrato
      if (fullConfig.validation_enabled) {
        const validation = this.contract.validateStructure(extractionResult);
        if (!validation.is_valid) {
          console.warn(`   ⚠️ Validación falló: ${validation.errors.join(', ')}`);
          // Corregir errores básicos automáticamente
          extractionResult = this.fixCommonValidationErrors(extractionResult);
        }
      }

      const processingTime = Date.now() - startTime;
      this.updateStats(true, processingTime, tokensUsed, confidence);

      console.log(`   ⏱️ Tiempo total: ${processingTime}ms`);
      console.log(`   📊 Método: ${method}, Confianza: ${(confidence * 100).toFixed(1)}%`);

      return {
        success: true,
        metadata: extractionResult,
        method,
        confidence,
        processing_time: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateStats(false, processingTime);
      
      console.error(`   ❌ Error en extracción: ${error.message}`);
      
      // Devolver estructura vacía en caso de error total
      const emptyMetadata = this.contract.createEmpty();
      emptyMetadata.document_name = filename;
      emptyMetadata.extraction_status = 'error';

      return {
        success: false,
        metadata: emptyMetadata,
        method: 'fallback',
        confidence: 0,
        processing_time: processingTime,
        errors: [error.message]
      };
    }
  }

  /**
   * Extracción con Gemini usando prompt optimizado
   * Migrado desde proyecto RAG acta_processor.py
   */
  private async extractWithGemini(
    text: string, 
    filename: string, 
    config: MetadataExtractionConfig
  ): Promise<GeminiAnalysisResult> {
    
    const startTime = Date.now();
    
    // Crear muestra optimizada para análisis de metadatos
    const textSample = this.extractTextSample(text, 6000);
    const estimatedTokens = ExtractorUtils.estimateTokens(textSample);
    
    console.log(`   🎯 Enviando ${textSample.length} caracteres (~${estimatedTokens} tokens) a Gemini`);

    // 🔥 FIX: Obtener prompt de la tabla ai_prompts (buenas prácticas)
    const prompt = await this.getPromptFromDatabase(textSample, filename);

    try {
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: config.gemini_config!.temperature,
          maxOutputTokens: config.gemini_config!.max_output_tokens,
        }
      });

      const response = result.response.text();
      const processingTime = Date.now() - startTime;
      
      console.log(`   🤖 Gemini respondió en ${processingTime}ms`);

      // 🐛 DEBUG: Mostrar prompt y respuesta para verificar
      console.log('\n🤖 [GEMINI DEBUG] PROMPT ENVIADO:');
      console.log('='.repeat(50));
      console.log(prompt.substring(0, 1000) + '...');
      console.log('='.repeat(50));
      
      console.log('\n🤖 [GEMINI DEBUG] RESPUESTA RECIBIDA:');
      console.log('='.repeat(50));
      console.log(response);
      console.log('='.repeat(50));

      // Parsear respuesta JSON
      const parseResult = ExtractorUtils.parseGeminiResponse(response);
      if (!parseResult.success) {
        console.log('\n❌ [GEMINI DEBUG] ERROR PARSING:');
        console.log(parseResult.errors);
        return {
          success: false,
          raw_response: response,
          parsed_data: null,
          confidence: 0,
          tokens_used: estimatedTokens,
          processing_time: processingTime,
          errors: parseResult.errors,
          warnings: []
        };
      }
      
      console.log('\n✅ [GEMINI DEBUG] DATOS PARSEADOS:');
      console.log(JSON.stringify(parseResult.data, null, 2));

      // Convertir datos de Gemini a estructura completa de ACTA
      const actaMetadata = this.convertGeminiDataToActaStructure(parseResult.data, filename, text);
      
      // Calcular confianza basada en completitud de datos
      const confidence = this.calculateExtractionConfidence(actaMetadata);

      return {
        success: true,
        raw_response: response,
        parsed_data: actaMetadata,
        confidence,
        tokens_used: estimatedTokens,
        processing_time: processingTime,
        errors: [],
        warnings: []
      };

    } catch (error) {
      return {
        success: false,
        raw_response: '',
        parsed_data: null,
        confidence: 0,
        tokens_used: estimatedTokens,
        processing_time: Date.now() - startTime,
        errors: [`Error en llamada Gemini: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * Construir prompt optimizado para extracción de metadatos de ACTA
   * Basado en las mejores prácticas del proyecto RAG
   */
  private buildOptimizedPrompt(text: string, filename: string): string {
    const validTopics = Object.values(TopicKeywords);
    const validTipos = Object.values(TipoReunion);

    return `Analiza este documento de ACTA y extrae los metadatos en formato JSON EXACTO:

ARCHIVO: ${filename}

TEXTO DEL ACTA:
${text}

EXTRAE ESTOS METADATOS (JSON válido, sin texto adicional):

{
  "fecha_documento": "fecha en formato YYYYMMDD",
  "tipo_junta": "ordinaria|extraordinaria", 
  "comunidad_nombre": "nombre completo de la comunidad",
  "direccion": "dirección del inmueble",
  "presidente_entrante": "nombre del presidente que asume",
  "presidente_saliente": "nombre del presidente que deja el cargo", 
  "administrador": "nombre del administrador de fincas",
  "secretario": "nombre del secretario",
  "propietarios_asistentes": número_de_propietarios_presentes,
  "propietarios_totales": número_total_de_propietarios,
  "cuotas_asistentes": "porcentaje de participación (ej: 65.5%)",
  "quorum_alcanzado": true_o_false,
  "orden_del_dia": ["punto 1", "punto 2", "punto 3"],
  "acuerdos": ["acuerdo 1", "acuerdo 2"],
  "temas_tratados": ["tema 1", "tema 2"],
  "votaciones": [{"tema": "descripción", "resultado": "aprobado/rechazado", "votos_favor": 0, "votos_contra": 0}],
  "topic_keywords": ["mantenimiento", "presupuesto", "obras"],
  "presupuesto_mencionado": ["presupuesto 1", "presupuesto 2"],
  "gastos_aprobados": ["gasto 1", "gasto 2"], 
  "derrama_extraordinaria": ["derrama 1 si aplica"]
}

REGLAS ESTRICTAS:
1. Devuelve SOLO el JSON, sin explicaciones
2. Si no encuentras un campo, usa valor por defecto ("", 0, [], false)
3. fecha_documento en formato YYYYMMDD (ej: 20220519)
4. tipo_junta DEBE ser "ordinaria" o "extraordinaria"
5. Números como enteros, no strings
6. Arrays vacíos [] si no hay información
7. Nombres sin títulos, solo "Nombre Apellido"
8. topic_keywords máximo 10 palabras clave relevantes

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido.`;
  }

  /**
   * 🔥 NUEVO: Obtener prompt desde tabla ai_prompts (buenas prácticas)
   */
  private async getPromptFromDatabase(text: string, filename: string): Promise<string> {
    try {
      // Importar createSupabaseClient dinámicamente para evitar problemas de SSR
      const { createSupabaseClient } = await import('@/supabase-clients/server');
      const supabase = await createSupabaseClient();
      
      console.log('🗄️ [ActaMetadataExtractor] Obteniendo prompt desde ai_prompts...');
      
      // Obtener prompt activo para extracción de metadatos de ACTA
      const { data: promptData, error } = await supabase
        .from('ai_prompts')
        .select('template, variables')
        .eq('name', 'acta_metadata_extraction')
        .eq('is_active', true)
        .single();

      if (error || !promptData) {
        console.warn('⚠️ [ActaMetadataExtractor] No se encontró prompt en ai_prompts, usando hardcoded');
        return this.buildOptimizedPrompt(text, filename);
      }

      console.log('✅ [ActaMetadataExtractor] Prompt obtenido de ai_prompts');

      // Reemplazar variables en el template
      let prompt = promptData.template;
      prompt = prompt.replace(/\{\{filename\}\}/g, filename);
      prompt = prompt.replace(/\{\{document_text\}\}/g, text);

      console.log('📝 [ActaMetadataExtractor] Variables reemplazadas en template');
      
      return prompt;

    } catch (error) {
      console.warn('⚠️ [ActaMetadataExtractor] Error accediendo a ai_prompts:', error.message);
      console.log('🔄 [ActaMetadataExtractor] Fallback a prompt hardcoded');
      return this.buildOptimizedPrompt(text, filename);
    }
  }

  /**
   * Convertir datos de Gemini a estructura completa de ACTA
   */
  private convertGeminiDataToActaStructure(
    geminiData: any, 
    filename: string, 
    fullText: string
  ): ActaMetadataStructure {
    
    // Crear estructura base vacía
    const metadata = this.contract.createEmpty();
    
    // Campos básicos
    metadata.document_id = this.generateDocumentId(filename, fullText);
    metadata.document_name = filename;
    metadata.content_length = fullText.length;
    metadata.extraction_status = 'success';
    metadata.chunk_type = 'document_overview'; // Nivel documento completo
    
    // 🔥 FIX: Mapeo correcto entre campos de Gemini y estructura ActaMetadata
    
    // Lugar (coincide)
    if (geminiData.lugar && typeof geminiData.lugar === 'string') {
      metadata.lugar = geminiData.lugar.trim();
    }
    // También probar direccion como alternativa
    if (!metadata.lugar && geminiData.direccion && typeof geminiData.direccion === 'string') {
      metadata.lugar = geminiData.direccion.trim();
    }
    
    // Fecha documento: Gemini devuelve "fecha_documento" -> sistema espera "document_date"  
    if (geminiData.fecha_documento) {
      metadata.document_date = MetadataDateUtils.convertToStandardFormat(geminiData.fecha_documento);
    }
    
    // Tipo junta: Gemini devuelve "tipo_junta" -> sistema espera "tipo_reunion"
    if (geminiData.tipo_junta && Object.values(TipoReunion).includes(geminiData.tipo_junta)) {
      metadata.tipo_reunion = geminiData.tipo_junta;
    }
    
    // Presidente entrante (coincide)
    if (geminiData.presidente_entrante && typeof geminiData.presidente_entrante === 'string') {
      metadata.presidente_entrante = geminiData.presidente_entrante.trim();
    }
    
    // Presidente saliente (coincide)
    if (geminiData.presidente_saliente && typeof geminiData.presidente_saliente === 'string') {
      metadata.presidente_saliente = geminiData.presidente_saliente.trim();
    }
    
    // Secretario: Gemini devuelve "secretario" -> sistema espera "secretario_actual"
    if (geminiData.secretario && typeof geminiData.secretario === 'string') {
      metadata.secretario_actual = geminiData.secretario.trim();
    }
    
    // Administrador (coincide)
    if (geminiData.administrador && typeof geminiData.administrador === 'string') {
      metadata.administrador = geminiData.administrador.trim();
    }
    
    // Asistentes: Gemini devuelve "propietarios_asistentes" -> sistema espera "asistentes_total"
    if (geminiData.propietarios_asistentes && typeof geminiData.propietarios_asistentes === 'number') {
      metadata.asistentes_total = geminiData.propietarios_asistentes;
    }
    
    // Coeficientes: Gemini devuelve "cuotas_asistentes" -> sistema espera "coeficiente_total"
    if (geminiData.cuotas_asistentes && typeof geminiData.cuotas_asistentes === 'string') {
      metadata.coeficiente_total = geminiData.cuotas_asistentes.trim();
    }
    
    // Comunidad nombre: Agregar mapeo para este campo común
    if (geminiData.comunidad_nombre && typeof geminiData.comunidad_nombre === 'string') {
      // Si lugar no está set, usar comunidad como fallback
      if (!metadata.lugar && geminiData.comunidad_nombre.includes('Calle') || geminiData.comunidad_nombre.includes('Av.')) {
        metadata.lugar = geminiData.comunidad_nombre.trim();
      }
    }
    
    // Quorum alcanzado: agregar este campo importante
    if (typeof geminiData.quorum_alcanzado === 'boolean') {
      // Esto podría ir en estructura_detectada
      if (!metadata.estructura_detectada) metadata.estructura_detectada = {};
      metadata.estructura_detectada.quorum_alcanzado = geminiData.quorum_alcanzado;
    }
    
    // Topic keywords con validación
    if (Array.isArray(geminiData.topic_keywords)) {
      const validTopics = Object.values(TopicKeywords);
      metadata.topic_keywords = geminiData.topic_keywords
        .filter(keyword => typeof keyword === 'string' && validTopics.includes(keyword as TopicKeywords));
    }
    
    // 🔥 FIX: Mapear arrays de Gemini a decisiones_principales
    
    // Decisiones principales desde Gemini "acuerdos"
    if (Array.isArray(geminiData.acuerdos)) {
      metadata.decisiones_principales = geminiData.acuerdos
        .filter(decision => typeof decision === 'string' && decision.trim().length > 0)
        .map(decision => decision.trim());
    }
    
    // También mapear "temas_tratados" si no hay acuerdos
    if (!metadata.decisiones_principales.length && Array.isArray(geminiData.temas_tratados)) {
      metadata.decisiones_principales = geminiData.temas_tratados
        .filter(tema => typeof tema === 'string' && tema.trim().length > 0)
        .map(tema => tema.trim());
    }
    
    // Guardar campos adicionales de Gemini en estructura_detectada
    if (!metadata.estructura_detectada) metadata.estructura_detectada = {};
    
    if (Array.isArray(geminiData.orden_del_dia)) {
      metadata.estructura_detectada.orden_del_dia = geminiData.orden_del_dia;
    }
    
    if (Array.isArray(geminiData.votaciones)) {
      metadata.estructura_detectada.votaciones = geminiData.votaciones;
    }
    
    if (Array.isArray(geminiData.presupuesto_mencionado)) {
      metadata.estructura_detectada.presupuesto_mencionado = geminiData.presupuesto_mencionado;
    }
    
    if (Array.isArray(geminiData.gastos_aprobados)) {
      metadata.estructura_detectada.gastos_aprobados = geminiData.gastos_aprobados;
    }
    
    if (Array.isArray(geminiData.derrama_extraordinaria)) {
      metadata.estructura_detectada.derrama_extraordinaria = geminiData.derrama_extraordinaria;
    }
    
    // Campos numéricos adicionales
    if (typeof geminiData.propietarios_totales === 'number') {
      metadata.estructura_detectada.propietarios_totales = geminiData.propietarios_totales;
    }
    
    // Merge con estructura detectada adicional de Gemini si existe
    if (geminiData.estructura_detectada && typeof geminiData.estructura_detectada === 'object') {
      metadata.estructura_detectada = { ...metadata.estructura_detectada, ...geminiData.estructura_detectada };
    }
    
    // Convertir topic keywords a campos booleanos usando el contrato
    const booleanFields = this.contract.convertTopicKeywordsToBooleanFields(metadata.topic_keywords);
    Object.assign(metadata, booleanFields);
    
    // Convertir doc_type a campos booleanos
    const docTypeBooleans = this.contract.convertDocTypeToBooleanFields('acta');
    Object.assign(metadata, docTypeBooleans);
    
    return metadata;
  }

  /**
   * Calcular confianza de extracción basada en completitud
   */
  private calculateExtractionConfidence(metadata: ActaMetadataStructure): number {
    let score = 0;
    let maxScore = 0;
    
    // Campos críticos (peso: 3)
    const criticalFields = ['lugar', 'document_date', 'tipo_reunion'];
    for (const field of criticalFields) {
      maxScore += 3;
      if (metadata[field as keyof ActaMetadataStructure] && 
          String(metadata[field as keyof ActaMetadataStructure]).trim().length > 0) {
        score += 3;
      }
    }
    
    // Campos importantes (peso: 2)
    const importantFields = ['presidente_entrante', 'secretario_actual', 'administrador'];
    for (const field of importantFields) {
      maxScore += 2;
      if (metadata[field as keyof ActaMetadataStructure] && 
          String(metadata[field as keyof ActaMetadataStructure]).trim().length > 0) {
        score += 2;
      }
    }
    
    // Campos adicionales (peso: 1)
    maxScore += 1;
    if (metadata.topic_keywords.length > 0) score += 1;
    
    maxScore += 1;
    if (metadata.decisiones_principales.length > 0) score += 1;
    
    return Math.min(score / maxScore, 1.0);
  }

  /**
   * Extracción fallback usando patrones simples
   */
  private extractWithFallback(text: string, filename: string): ActaMetadataStructure {
    const metadata = this.contract.createEmpty();
    
    // Campos básicos
    metadata.document_id = this.generateDocumentId(filename, text);
    metadata.document_name = filename;
    metadata.content_length = text.length;
    metadata.extraction_status = 'partial';
    metadata.chunk_type = 'document_overview';
    
    // Patrones simples para campos básicos
    const lowerText = text.toLowerCase();
    
    // Detectar tipo de reunión
    if (lowerText.includes('extraordinaria')) {
      metadata.tipo_reunion = TipoReunion.EXTRAORDINARIA;
    } else if (lowerText.includes('ordinaria')) {
      metadata.tipo_reunion = TipoReunion.ORDINARIA;
    }
    
    // Detectar algunos topics básicos
    const detectedTopics: string[] = [];
    if (lowerText.includes('piscina')) detectedTopics.push(TopicKeywords.PISCINA);
    if (lowerText.includes('jardin') || lowerText.includes('jardín')) detectedTopics.push(TopicKeywords.JARDIN);
    if (lowerText.includes('limpieza')) detectedTopics.push(TopicKeywords.LIMPIEZA);
    if (lowerText.includes('balance') || lowerText.includes('presupuesto')) detectedTopics.push(TopicKeywords.BALANCE);
    if (lowerText.includes('administracion') || lowerText.includes('administración')) detectedTopics.push(TopicKeywords.ADMINISTRACION);
    
    metadata.topic_keywords = detectedTopics;
    
    // Convertir a campos booleanos
    const booleanFields = this.contract.convertTopicKeywordsToBooleanFields(metadata.topic_keywords);
    Object.assign(metadata, booleanFields);
    
    const docTypeBooleans = this.contract.convertDocTypeToBooleanFields('acta');
    Object.assign(metadata, docTypeBooleans);
    
    return metadata;
  }

  /**
   * Corregir errores de validación comunes
   */
  private fixCommonValidationErrors(metadata: ActaMetadataStructure): ActaMetadataStructure {
    // Garantizar campos obligatorios
    if (!metadata.doc_type) metadata.doc_type = 'acta';
    if (!metadata.chunk_type) metadata.chunk_type = 'document_overview';
    if (!metadata.extraction_status) metadata.extraction_status = 'success';
    
    // Garantizar tipos correctos
    if (typeof metadata.asistentes_total !== 'number') metadata.asistentes_total = 0;
    if (!Array.isArray(metadata.topic_keywords)) metadata.topic_keywords = [];
    if (!Array.isArray(metadata.decisiones_principales)) metadata.decisiones_principales = [];
    if (typeof metadata.estructura_detectada !== 'object') metadata.estructura_detectada = {};
    
    return metadata;
  }
}

/**
 * Función de conveniencia para crear una instancia del extractor
 */
export function createActaMetadataExtractor(): ActaMetadataExtractor {
  return new ActaMetadataExtractor();
}

/**
 * Función de test integrada para probar el extractor con documentos reales
 */
export async function testActaMetadataExtractor(): Promise<void> {
  console.log('🧪 [ActaMetadataExtractor Test] Iniciando test del extractor...');
  console.log('=' .repeat(70));

  const extractor = new ActaMetadataExtractor();

  // Archivos de prueba
  const testFiles = [
    {
      path: '/home/sergi/proyectos/community-saas/datos/acta_prueba.pdf',
      description: 'PDF editable - Acta de junta'
    },
    {
      path: '/home/sergi/proyectos/community-saas/datos/Acta junta extraordinaria 02.06.25.pdf', 
      description: 'PDF escaneado - Acta junta extraordinaria'
    }
  ];

  console.log(`📋 [Test] Probando ${testFiles.length} archivos...\n`);

  for (let i = 0; i < testFiles.length; i++) {
    const testFile = testFiles[i];
    const fs = await import('fs/promises');
    const path = await import('path');
    const filename = path.basename(testFile.path);
    
    console.log(`📄 [Test ${i + 1}/${testFiles.length}] ${testFile.description}`);
    console.log(`   📁 Archivo: ${filename}`);

    try {
      // Verificar que el archivo existe
      await fs.access(testFile.path);
      
      // Extraer texto usando nuestro módulo de extracción
      const { extractTextFromPDF } = await import('../../extraction/pdfTextExtraction');
      const pdfBuffer = await fs.readFile(testFile.path);
      
      console.log(`   🔧 Extrayendo texto...`);
      const extractionResult = await extractTextFromPDF(pdfBuffer, 'application/pdf');
      
      if (!extractionResult.success) {
        throw new Error(`Extracción de texto falló: ${extractionResult.metadata.error}`);
      }
      
      console.log(`   📖 Texto extraído: ${extractionResult.text.length.toLocaleString()} caracteres`);
      
      // Extraer metadatos con nuestro extractor
      const startTime = Date.now();
      const metadataResult = await extractor.extractMetadata(extractionResult.text, filename);
      const totalTime = Date.now() - startTime;
      
      console.log(`   ⏱️ Tiempo extracción metadatos: ${totalTime}ms`);
      console.log(`   📊 Éxito: ${metadataResult.success}`);
      console.log(`   🎯 Método: ${metadataResult.method}`);
      console.log(`   📈 Confianza: ${(metadataResult.confidence * 100).toFixed(1)}%`);
      
      if (metadataResult.success) {
        const metadata = metadataResult.metadata;
        console.log(`   📍 Lugar: "${metadata.lugar}"`);
        console.log(`   📅 Fecha: "${metadata.document_date}"`);
        console.log(`   🏛️ Tipo reunión: "${metadata.tipo_reunion}"`);
        console.log(`   👤 Presidente: "${metadata.presidente_entrante}"`);
        console.log(`   👤 Secretario: "${metadata.secretario_actual}"`);
        console.log(`   👥 Asistentes: ${metadata.asistentes_total}`);
        console.log(`   🏷️ Topics (${metadata.topic_keywords.length}): ${metadata.topic_keywords.join(', ')}`);
        console.log(`   ✅ Decisiones (${metadata.decisiones_principales.length}): ${metadata.decisiones_principales.slice(0, 2).join(', ')}${metadata.decisiones_principales.length > 2 ? '...' : ''}`);
        
        // Validar con el contrato
        const contract = new ActaMetadataContract();
        const validation = contract.validateStructure(metadata);
        console.log(`   🔍 Validación: ${validation.is_valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        if (validation.errors.length > 0) {
          console.log(`   ⚠️ Errores: ${validation.errors.slice(0, 2).join(', ')}`);
        }
      } else {
        console.log(`   ❌ Error: ${metadataResult.errors?.join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ Error procesando archivo: ${error.message}`);
    }
    
    console.log(''); // Línea en blanco entre tests
  }

  // Mostrar estadísticas finales
  const stats = extractor.getStats();
  console.log('📊 [Test] Estadísticas del extractor:');
  console.log('-'.repeat(40));
  console.log(`   📋 Total extracciones: ${stats.total_extractions}`);
  console.log(`   ✅ Extracciones exitosas: ${stats.successful_extractions}`);
  console.log(`   ❌ Extracciones fallidas: ${stats.failed_extractions}`);
  console.log(`   📊 Tasa de éxito: ${extractor.getSuccessRate().toFixed(1)}%`);
  console.log(`   ⏱️ Tiempo promedio: ${stats.average_processing_time.toFixed(0)}ms`);
  console.log(`   🎯 Confianza promedio: ${(stats.average_confidence * 100).toFixed(1)}%`);
  console.log(`   💰 Tokens usados: ${stats.total_tokens_used.toLocaleString()}`);
  console.log(`   💵 Coste estimado: $${extractor.getEstimatedCost().toFixed(6)}`);
  
  console.log(`\n🏁 [Test] Testing completado`);
  console.log('=' .repeat(70));
}

// Test execution cuando se ejecuta directamente
if (require.main === module) {
  testActaMetadataExtractor().catch(console.error);
}