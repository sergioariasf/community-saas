/**
 * ARCHIVO: documentClassifier.ts
 * PROPÓSITO: Clasificación de documentos con IA usando Gemini API (optimizada en tokens)
 * ESTADO: production
 * DEPENDENCIAS: @google/generative-ai, types.ts, GEMINI_API_KEY
 * OUTPUTS: Clasificación automática (acta/contrato/factura/comunicado/otros)
 * ACTUALIZADO: 2025-09-14
 */

// Migrado y adaptado desde proyecto RAG detectar_tipo.py
// Optimizado para reducir costes de API de Gemini usando mínimos tokens
// 
// RESPONSABILIDADES:
// - Clasificar documentos en: acta, contrato, factura, comunicado
// - Usar solo primeras ~1000 caracteres para reducir coste
// - Proporcionar fallbacks basados en nombre de archivo
// - Manejar casos edge y documentos no categorizados
// - Validar que el tipo detectado esté en categorías soportadas
// 
// ESTRATEGIA:
// 1. Usar muestra pequeña del texto (1000 chars) → Barato
// 2. Prompt simple y directo → Pocos tokens de salida
// 3. Fallback por nombre de archivo si Gemini falla
// 4. Validación estricta de tipos soportados

import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentClassificationResult, DocumentType, ClassificationConfig, TokenEstimate, ClassificationContext } from './types';

export class DocumentClassifier {
  private gemini: GoogleGenerativeAI | null = null;
  private model: any = null;
  private verbose: boolean;

  // Tipos válidos soportados (migrado desde RAG)
  static readonly VALID_TYPES: DocumentType[] = ['acta', 'contrato', 'factura', 'comunicado'];

  // Configuración por defecto (optimizada desde RAG)
  static readonly DEFAULT_CONFIG: ClassificationConfig = {
    sampleSize: 1000,
    useFilenameFallback: true,
    geminiConfig: {
      temperature: 0.1,
      maxOutputTokens: 10  // Muy pocos tokens = muy barato
    }
  };

  constructor(verbose: boolean = true) {
    this.verbose = verbose;
    this.initializeGemini();
  }

  private initializeGemini(): void {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        if (this.verbose) {
          console.warn('[DocumentClassifier] No GEMINI_API_KEY found, using fallback methods only');
        }
        return;
      }

      this.gemini = new GoogleGenerativeAI(apiKey);
      this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      if (this.verbose) {
        console.log('[DocumentClassifier] Gemini client initialized successfully');
      }
    } catch (error) {
      if (this.verbose) {
        console.warn('[DocumentClassifier] Failed to initialize Gemini client:', error);
      }
    }
  }

  /**
   * Detectar tipo de documento de manera económica
   * Migrado desde RAG DocumentTypeDetector.detect_type()
   */
  async classifyDocument(
    text: string,
    filename: string = '',
    config: Partial<ClassificationConfig> = {}
  ): Promise<DocumentClassificationResult> {
    const startTime = Date.now();
    const fullConfig = { ...DocumentClassifier.DEFAULT_CONFIG, ...config };

    if (this.verbose) {
      console.log('🔍 [DocumentClassifier] Iniciando clasificación de documento');
      console.log(`   📄 Archivo: ${filename}`);
      console.log(`   📏 Texto total: ${text.length.toLocaleString()} caracteres`);
      console.log(`   🎯 Muestra para análisis: ${fullConfig.sampleSize} caracteres`);
    }

    // Validar entrada
    if (!text || text.trim().length === 0) {
      throw new Error('El texto del documento está vacío');
    }

    // Extraer muestra del texto (estrategia optimizada desde RAG)
    const textSample = this.extractTextSample(text, fullConfig.sampleSize);

    if (this.verbose) {
      console.log(`   📝 Muestra extraída: ${textSample.length} caracteres`);
    }

    // Intentar clasificación con Gemini
    let detectedType: DocumentType | null = null;
    let method: 'gemini' | 'filename-fallback' | 'default' = 'default';

    if (this.model) {
      try {
        detectedType = await this.classifyWithGemini(textSample, filename, fullConfig.geminiConfig);
        if (detectedType) {
          method = 'gemini';
          if (this.verbose) {
            console.log(`   ✅ Tipo detectado con Gemini: '${detectedType}'`);
          }
        }
      } catch (error) {
        if (this.verbose) {
          console.warn(`   ⚠️ Error en clasificación Gemini: ${error.message}`);
        }
      }
    } else {
      if (this.verbose) {
        console.log('   ⚠️ Gemini no disponible, usando fallback');
      }
    }

    // Fallback por nombre de archivo
    if (!detectedType && fullConfig.useFilenameFallback) {
      detectedType = this.classifyByFilename(filename);
      method = 'filename-fallback';
      if (this.verbose) {
        console.log(`   🔄 Fallback por filename: '${detectedType}'`);
      }
    }

    // Si todo falla, usar tipo por defecto
    if (!detectedType) {
      detectedType = 'comunicado'; // Tipo más genérico (como en RAG)
      method = 'default';
      if (this.verbose) {
        console.log(`   ⚠️ Usando tipo por defecto: '${detectedType}'`);
      }
    }

    const processingTime = Date.now() - startTime;
    const tokenEstimate = this.estimateClassificationCost(text, fullConfig.sampleSize);

    return {
      type: detectedType,
      confidence: method === 'gemini' ? 0.9 : method === 'filename-fallback' ? 0.7 : 0.5,
      method,
      metadata: {
        sampleLength: textSample.length,
        estimatedTokens: tokenEstimate.estimatedTotalTokens,
        processingTime,
      }
    };
  }

  /**
   * Extraer muestra representativa del texto para clasificación
   * Migrado desde RAG DocumentTypeDetector._extract_text_sample()
   */
  private extractTextSample(text: string, sampleSize: number): string {
    // Si el texto es pequeño, usar todo
    if (text.length <= sampleSize) {
      return text.trim();
    }

    // Estrategia desde RAG: Inicio + muestra del medio para capturar estructura
    const inicio = text.substring(0, Math.floor(sampleSize / 2)).trim();
    
    // Buscar una sección del medio que contenga información estructural
    const middleStart = Math.floor(text.length / 3);
    const middleEnd = middleStart + Math.floor(sampleSize / 2);
    const medio = text.substring(middleStart, middleEnd).trim();
    
    // Combinar inicio + medio (como en RAG)
    let combined = `${inicio}\n\n[...]\n\n${medio}`;
    
    // Si aún es muy largo, truncar
    if (combined.length > sampleSize) {
      combined = combined.substring(0, sampleSize) + '...';
    }
    
    return combined;
  }

  /**
   * Clasificar usando Gemini con prompt optimizado para bajo coste
   * Migrado desde RAG DocumentTypeDetector._classify_with_gemini()
   */
  private async classifyWithGemini(
    textSample: string,
    filename: string,
    geminiConfig: ClassificationConfig['geminiConfig']
  ): Promise<DocumentType | null> {
    
    // Prompt optimizado para respuesta corta (exacto desde RAG)
    const prompt = `Clasifica este documento en UNA de estas categorías exactas:

CATEGORÍAS:
- acta: Reuniones, juntas, asambleas (con asistentes, orden del día, acuerdos)
- contrato: Acuerdos comerciales, servicios, obligaciones entre partes
- factura: Documentos financieros, facturas, presupuestos, estados de cuenta
- comunicado: Avisos, notificaciones, circulares, convocatorias

DOCUMENTO:
Archivo: ${filename}
Texto: ${textSample}

INSTRUCCIONES:
- Responde SOLO con una palabra: acta, contrato, factura o comunicado
- NO añadas explicaciones
- Si hay duda entre dos tipos, elige el más específico

CLASIFICACIÓN:`;

    try {
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: geminiConfig.temperature,
          maxOutputTokens: geminiConfig.maxOutputTokens,
        }
      });

      const response = result.response;
      const classification = response.text().trim().toLowerCase();
      
      // Limpiar respuesta (como en RAG)
      const cleanClassification = classification.replace(/[^\w]/g, '');
      
      if (this.verbose) {
        console.log(`   🤖 Gemini clasificó como: '${cleanClassification}'`);
      }
      
      // Validar tipo
      if (this.isValidType(cleanClassification)) {
        return cleanClassification as DocumentType;
      }
      
      return null;
      
    } catch (error) {
      if (this.verbose) {
        console.error(`   ❌ Error en clasificación Gemini: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Clasificación de fallback basada en nombre de archivo
   * Migrado desde RAG DocumentTypeDetector._classify_by_filename()
   */
  private classifyByFilename(filename: string): DocumentType {
    if (!filename) {
      return 'comunicado';
    }

    const filenameLower = filename.toLowerCase();

    // Patrones específicos para cada tipo (exactos desde RAG)
    const patterns = {
      acta: [
        'acta', 'junta', 'reunion', 'asamblea', 'orden_del_dia',
        'extraordinaria', 'ordinaria', 'consejo'
      ],
      contrato: [
        'contrato', 'convenio', 'acuerdo', 'contratacion',
        'servicio', 'mantenimiento', 'limpieza'
      ],
      factura: [
        'factura', 'presupuesto', 'recibo', 'estado_cuenta',
        'balance', 'gasto', 'coste', 'precio'
      ],
      comunicado: [
        'comunicado', 'aviso', 'circular', 'notificacion',
        'convocatoria', 'info', 'informacion'
      ]
    };

    // Buscar coincidencias exactas
    for (const [docType, keywords] of Object.entries(patterns)) {
      for (const keyword of keywords) {
        if (filenameLower.includes(keyword)) {
          return docType as DocumentType;
        }
      }
    }

    // Análisis estructura del nombre (como en RAG)
    if (filenameLower.includes('acta') || filenameLower.includes('junta')) {
      return 'acta';
    } else if (filenameLower.includes('contrat')) {
      return 'contrato';  
    } else if (filenameLower.includes('factura') || filenameLower.includes('presupuesto')) {
      return 'factura';
    } else {
      return 'comunicado'; // Tipo más genérico
    }
  }

  /**
   * Verificar si el tipo detectado es válido
   * Migrado desde RAG DocumentTypeDetector._is_valid_type()
   */
  private isValidType(docType: string): boolean {
    return DocumentClassifier.VALID_TYPES.includes(docType as DocumentType);
  }

  /**
   * Obtener lista de tipos soportados
   */
  static getSupportedTypes(): DocumentType[] {
    return [...DocumentClassifier.VALID_TYPES];
  }

  /**
   * Estimar coste de clasificación (útil para debugging)
   * Migrado desde RAG DocumentTypeDetector.estimate_classification_cost()
   */
  estimateClassificationCost(text: string, sampleSize: number = 1000): TokenEstimate {
    const sample = this.extractTextSample(text, sampleSize);
    
    // Estimación aproximada (1 token ≈ 4 caracteres en español, como en RAG)
    const inputTokens = Math.ceil(sample.length / 4);
    const outputTokens = 2; // Solo una palabra de respuesta
    const totalTokens = inputTokens + outputTokens;
    
    return {
      sampleLength: sample.length,
      estimatedInputTokens: inputTokens,
      estimatedOutputTokens: outputTokens,
      estimatedTotalTokens: totalTokens,
      sampleTextPreview: sample.length > 200 ? sample.substring(0, 200) + '...' : sample
    };
  }
}

/**
 * Función de conveniencia para uso directo
 * Migrado desde RAG detect_document_type()
 */
export async function classifyDocument(
  text: string,
  filename: string = '',
  verbose: boolean = true
): Promise<DocumentClassificationResult> {
  const classifier = new DocumentClassifier(verbose);
  return await classifier.classifyDocument(text, filename);
}

/**
 * Crear una instancia del clasificador con configuración
 */
export function createDocumentClassifier(verbose: boolean = true): DocumentClassifier {
  return new DocumentClassifier(verbose);
}

/**
 * Función de test integrada para probar el clasificador
 * Usa los módulos de extracción existentes para obtener el texto
 */
export async function testDocumentClassification(): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  console.log('🧪 [DocumentClassifier Test] Iniciando test del clasificador...');
  console.log('=' .repeat(60));

  // Archivos de prueba
  const testFiles = [
    {
      path: '/home/sergi/proyectos/community-saas/datos/acta_prueba.pdf',
      expectedType: 'acta' as DocumentType,
      description: 'PDF editable - Acta de junta'
    },
    {
      path: '/home/sergi/proyectos/community-saas/datos/GIMNASIO_2023-1-230230.pdf', 
      expectedType: 'factura' as DocumentType,
      description: 'PDF con números - Posible factura gimnasio'
    }
  ];

  const classifier = new DocumentClassifier(true);
  const results: Array<{ file: string; result: DocumentClassificationResult; expected: DocumentType; match: boolean }> = [];

  console.log(`📋 [Test] Probando ${testFiles.length} archivos de prueba...\n`);

  for (let i = 0; i < testFiles.length; i++) {
    const testFile = testFiles[i];
    const filename = path.basename(testFile.path);
    
    console.log(`📄 [Test ${i + 1}/${testFiles.length}] ${testFile.description}`);
    console.log(`   📁 Archivo: ${filename}`);
    console.log(`   🎯 Tipo esperado: '${testFile.expectedType}'`);

    try {
      // Usar nuestros módulos de extracción existentes
      const pdfBuffer = await fs.readFile(testFile.path);
      
      // Importar nuestro módulo de extracción de PDF editables
      const { extractTextFromPDF } = await import('../extraction/pdfTextExtraction');
      
      console.log(`   🔧 Extrayendo texto con PDFTextExtraction...`);
      const extractionResult = await extractTextFromPDF(pdfBuffer, 'application/pdf');
      
      if (!extractionResult.success) {
        throw new Error(`Extracción falló: ${extractionResult.metadata.error}`);
      }
      
      console.log(`   📖 Texto extraído: ${extractionResult.text.length.toLocaleString()} caracteres`);
      console.log(`   📊 Método extracción: ${extractionResult.method}, confianza: ${(extractionResult.metadata.confidence * 100).toFixed(1)}%`);
      
      // Clasificar documento usando el texto extraído
      const startTime = Date.now();
      const result = await classifier.classifyDocument(extractionResult.text, filename);
      const processingTime = Date.now() - startTime;
      
      const match = result.type === testFile.expectedType;
      results.push({
        file: filename,
        result,
        expected: testFile.expectedType,
        match
      });
      
      console.log(`   ⏱️  Tiempo clasificación: ${processingTime}ms`);
      console.log(`   🎯 Tipo detectado: '${result.type}' (método: ${result.method})`);
      console.log(`   📊 Confianza: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   💰 Tokens estimados: ${result.metadata.estimatedTokens}`);
      console.log(`   ${match ? '✅' : '❌'} Resultado: ${match ? 'CORRECTO' : `INCORRECTO (esperado: '${testFile.expectedType}')`}`);
      
      // Mostrar muestra del texto enviada a Gemini
      if (result.method === 'gemini') {
        const tokenEstimate = classifier.estimateClassificationCost(extractionResult.text);
        console.log(`   📝 Muestra enviada: "${tokenEstimate.sampleTextPreview.substring(0, 100)}..."`);
      }

    } catch (error) {
      console.log(`   ❌ Error procesando archivo: ${error.message}`);
      results.push({
        file: filename,
        result: {
          type: 'comunicado',
          confidence: 0,
          method: 'default',
          metadata: { sampleLength: 0, estimatedTokens: 0, processingTime: 0, error: error.message }
        },
        expected: testFile.expectedType,
        match: false
      });
    }
    
    console.log(''); // Línea en blanco entre tests
  }

  // Estadísticas finales
  console.log('📊 [Test] Estadísticas finales:');
  console.log('-'.repeat(40));
  
  const correctClassifications = results.filter(r => r.match).length;
  const totalClassifications = results.length;
  const accuracy = totalClassifications > 0 ? (correctClassifications / totalClassifications * 100).toFixed(1) : '0.0';
  
  console.log(`   📋 Total archivos procesados: ${totalClassifications}`);
  console.log(`   ✅ Clasificaciones correctas: ${correctClassifications}`);
  console.log(`   ❌ Clasificaciones incorrectas: ${totalClassifications - correctClassifications}`);
  console.log(`   🎯 Precisión: ${accuracy}%`);
  
  // Distribución por método
  const methodCounts = results.reduce((acc, r) => {
    acc[r.result.method] = (acc[r.result.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n   📊 Distribución por método:`);
  Object.entries(methodCounts).forEach(([method, count]) => {
    const percentage = (count / totalClassifications * 100).toFixed(1);
    console.log(`      ${method}: ${count} archivos (${percentage}%)`);
  });
  
  // Coste estimado total
  const totalTokens = results.reduce((sum, r) => sum + r.result.metadata.estimatedTokens, 0);
  const estimatedCost = totalTokens * 0.000015; // Precio aproximado Gemini Flash
  
  console.log(`\n   💰 Estimación de coste:`);
  console.log(`      📊 Total tokens estimados: ${totalTokens.toLocaleString()}`);
  console.log(`      💵 Coste estimado total: ~$${estimatedCost.toFixed(6)} USD`);
  
  console.log(`\n🏁 [Test] Testing completado`);
  console.log('=' .repeat(60));
}

// Test execution cuando se ejecuta directamente
if (require.main === module) {
  testDocumentClassification().catch(console.error);
}