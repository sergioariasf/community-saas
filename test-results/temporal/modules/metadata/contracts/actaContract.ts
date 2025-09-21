/**
 * ARCHIVO: actaContract.ts
 * PROPÓSITO: Contrato de validación para metadatos de actas de junta
 * ESTADO: production
 * DEPENDENCIAS: types.ts
 * OUTPUTS: ActaMetadataStructure, validadores, extractores de metadatos
 * ACTUALIZADO: 2025-09-14
 */

import { 
  BaseMetadataStructure, 
  DocumentType, 
  MetadataContract, 
  MetadataValidationResult,
  MetadataValidationUtils,
  MetadataDateUtils
} from './types';

// ============================================================================
// 📋 CAPA 1: DEFINICIÓN - Catálogo de valores válidos
// ============================================================================

/**
 * Tipos de reunión que detecta el sistema
 * Migrado desde RAG TipoReunion enum
 */
export enum TipoReunion {
  ORDINARIA = 'ordinaria',
  EXTRAORDINARIA = 'extraordinaria'
}

/**
 * Categorías de capítulos para chunking estratégico
 * Migrado desde RAG ChapterCategory enum
 */
export enum ChapterCategory {
  FINANCIERO = 'financiero',
  ADMINISTRATIVO = 'administrativo',
  TECNICO = 'tecnico',
  LEGAL = 'legal'
}

/**
 * Topic keywords EXACTOS que el sistema puede detectar
 * Migrado desde RAG TopicKeywords enum
 */
export enum TopicKeywords {
  PISCINA = 'Piscina',
  JARDIN = 'Jardin',
  LIMPIEZA = 'Limpieza',
  ADMINISTRACION = 'Administracion',
  BALANCE = 'Balance',
  PAQUETERIA = 'Paqueteria',
  ENERGIA = 'Energia',
  NORMATIVA = 'Normativa',
  PROVEEDOR = 'Proveedor',
  DINERO = 'Dinero',
  ASCENSOR = 'Ascensor',
  INCENDIOS = 'Incendios',
  PORTERIA = 'Porteria'
}

// ============================================================================
// 🏗️ CAPA 2: MOLDE - Plantilla para crear chunks
// ============================================================================

/**
 * Estructura EXACTA que tendrá cada chunk de ACTA
 * Migrado desde RAG ActaMetadataStructure
 * 
 * FLUJO:
 * 1. Gemini analiza → analysis = {"topic_keywords": ["Piscina", "Balance"]}
 * 2. Extractor usa este molde → crea chunk con todos los campos definidos aquí
 * 3. Storage almacena → chunk tiene estructura consistente
 */
export interface ActaMetadataStructure extends BaseMetadataStructure {
  // ===== METADATOS ESPECÍFICOS DE ACTA =====
  lugar: string;
  tipo_reunion: string;                    // TipoReunion value
  presidente_entrante: string;             // Presidente que asume el cargo
  presidente_saliente: string;             // Presidente que deja el cargo
  secretario_actual: string;
  administrador: string;
  asistentes_total: number;
  coeficiente_total: string;
  
  // ===== CAMPOS BOOLEANOS PARA FILTROS EFICIENTES =====
  // Topic keywords individuales (para filtros rápidos)
  topic_piscina: boolean;
  topic_jardin: boolean;
  topic_limpieza: boolean;
  topic_administracion: boolean;
  topic_balance: boolean;
  topic_paqueteria: boolean;
  topic_energia: boolean;
  topic_normativa: boolean;
  topic_proveedor: boolean;
  topic_dinero: boolean;
  topic_ascensor: boolean;
  topic_incendios: boolean;
  topic_porteria: boolean;
  
  // Tipos de documento individuales (para filtros rápidos)
  doc_type_acta: boolean;
  doc_type_contrato: boolean;
  doc_type_factura: boolean;
  doc_type_comunicado: boolean;
}

// ============================================================================
// 🏷️ CAPA 3: TIPADO - Validación de tipos y consistencia
// ============================================================================

/**
 * Validador de tipos específico para ACTAs
 * Migrado desde RAG MetadataTypes
 */
export class ActaMetadataTypes {
  /**
   * Catálogo de tipos esperados para cada campo de ACTA
   * Migrado desde RAG get_expected_field_types()
   */
  static getExpectedFieldTypes(): Record<keyof ActaMetadataStructure, string> {
    return {
      // Campos base (heredados)
      doc_type: 'string',
      chunk_type: 'string',
      document_id: 'string',
      community_id: 'string',
      document_name: 'string',
      document_date: 'string',
      topic_keywords: 'string[]',
      decisiones_principales: 'string[]',
      estructura_detectada: 'object',
      title: 'string',
      capitulo: 'string',
      category: 'string',
      content_type: 'string',
      chunk_id: 'string',
      chunk_number: 'number',
      content_length: 'number',
      extraction_status: 'string',
      
      // Campos específicos de ACTA
      lugar: 'string',
      tipo_reunion: 'string',
      presidente_entrante: 'string',
      presidente_saliente: 'string',
      secretario_actual: 'string',
      administrador: 'string',
      asistentes_total: 'number',
      coeficiente_total: 'string',
      
      // Campos booleanos de topics
      topic_piscina: 'boolean',
      topic_jardin: 'boolean',
      topic_limpieza: 'boolean',
      topic_administracion: 'boolean',
      topic_balance: 'boolean',
      topic_paqueteria: 'boolean',
      topic_energia: 'boolean',
      topic_normativa: 'boolean',
      topic_proveedor: 'boolean',
      topic_dinero: 'boolean',
      topic_ascensor: 'boolean',
      topic_incendios: 'boolean',
      topic_porteria: 'boolean',
      
      // Campos booleanos de doc types
      doc_type_acta: 'boolean',
      doc_type_contrato: 'boolean',
      doc_type_factura: 'boolean',
      doc_type_comunicado: 'boolean'
    };
  }

  /**
   * Validar estructura completa de metadatos de ACTA
   * Migrado desde RAG validate_metadata_structure()
   */
  static validateActaStructure(metadata: Partial<ActaMetadataStructure>): MetadataValidationResult {
    // Validación base
    const baseValidation = MetadataValidationUtils.validateBaseStructure(metadata);
    
    // Validaciones específicas de ACTA
    if (metadata.doc_type && metadata.doc_type !== 'acta') {
      baseValidation.errors.push(`doc_type debe ser 'acta', recibido: ${metadata.doc_type}`);
      baseValidation.is_valid = false;
    }

    if (metadata.tipo_reunion && !Object.values(TipoReunion).includes(metadata.tipo_reunion as TipoReunion)) {
      baseValidation.warnings.push(`tipo_reunion no reconocido: ${metadata.tipo_reunion}`);
    }

    if (metadata.asistentes_total !== undefined && (typeof metadata.asistentes_total !== 'number' || metadata.asistentes_total < 0)) {
      baseValidation.warnings.push(`asistentes_total debe ser un número positivo`);
    }

    // Validar topic keywords
    if (metadata.topic_keywords) {
      const validTopics = Object.values(TopicKeywords);
      for (const keyword of metadata.topic_keywords) {
        if (!validTopics.includes(keyword as TopicKeywords)) {
          baseValidation.warnings.push(`Topic keyword no reconocido: ${keyword}`);
        }
      }
    }

    return baseValidation;
  }
}

// ============================================================================
// 🔌 CAPA 4: API - Interfaz pública para componentes externos
// ============================================================================

/**
 * Contrato API público para metadatos de ACTA
 * Migrado desde RAG ActaMetadataContract
 */
export class ActaMetadataContract implements MetadataContract<ActaMetadataStructure> {
  
  // ===== INFORMACIÓN DEL CONTRATO =====
  
  getDocumentType(): DocumentType {
    return 'acta';
  }

  getSupportedTypes(): string[] {
    return ['acta'];
  }

  // ===== VALIDACIÓN =====

  validateStructure(metadata: Partial<ActaMetadataStructure>): MetadataValidationResult {
    return ActaMetadataTypes.validateActaStructure(metadata);
  }

  validateField(fieldName: keyof ActaMetadataStructure, value: any): boolean {
    const expectedTypes = ActaMetadataTypes.getExpectedFieldTypes();
    const expectedType = expectedTypes[fieldName];

    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'string[]':
        return Array.isArray(value) && value.every(item => typeof item === 'string');
      case 'object':
        return typeof value === 'object' && value !== null;
      default:
        return true;
    }
  }

  // ===== CONVERSIONES =====

  /**
   * Convertir a formato de almacenamiento (Supabase compatible)
   */
  convertToStorageFormat(metadata: ActaMetadataStructure): Record<string, any> {
    // Para Supabase, convertimos estructuras complejas a JSON strings si es necesario
    return {
      ...metadata,
      topic_keywords: JSON.stringify(metadata.topic_keywords),
      decisiones_principales: JSON.stringify(metadata.decisiones_principales),
      estructura_detectada: JSON.stringify(metadata.estructura_detectada)
    };
  }

  /**
   * Convertir desde formato de almacenamiento
   */
  convertFromStorageFormat(data: Record<string, any>): ActaMetadataStructure {
    return {
      ...data,
      topic_keywords: typeof data.topic_keywords === 'string' 
        ? JSON.parse(data.topic_keywords) 
        : data.topic_keywords || [],
      decisiones_principales: typeof data.decisiones_principales === 'string'
        ? JSON.parse(data.decisiones_principales)
        : data.decisiones_principales || [],
      estructura_detectada: typeof data.estructura_detectada === 'string'
        ? JSON.parse(data.estructura_detectada)
        : data.estructura_detectada || {}
    } as ActaMetadataStructure;
  }

  // ===== UTILIDADES =====

  createEmpty(): ActaMetadataStructure {
    return {
      // Campos base
      doc_type: 'acta',
      chunk_type: 'document_overview',
      document_id: '',
      community_id: '',
      document_name: '',
      document_date: '',
      topic_keywords: [],
      decisiones_principales: [],
      estructura_detectada: {},
      title: '',
      capitulo: '',
      category: '',
      content_type: 'text',
      chunk_id: '',
      chunk_number: 0,
      content_length: 0,
      extraction_status: 'success',
      
      // Campos específicos de ACTA
      lugar: '',
      tipo_reunion: '',
      presidente_entrante: '',
      presidente_saliente: '',
      secretario_actual: '',
      administrador: '',
      asistentes_total: 0,
      coeficiente_total: '',
      
      // Campos booleanos de topics (todos false por defecto)
      topic_piscina: false,
      topic_jardin: false,
      topic_limpieza: false,
      topic_administracion: false,
      topic_balance: false,
      topic_paqueteria: false,
      topic_energia: false,
      topic_normativa: false,
      topic_proveedor: false,
      topic_dinero: false,
      topic_ascensor: false,
      topic_incendios: false,
      topic_porteria: false,
      
      // Campos booleanos de doc types
      doc_type_acta: true,  // Solo este en true para ACTAs
      doc_type_contrato: false,
      doc_type_factura: false,
      doc_type_comunicado: false
    };
  }

  getRequiredFields(): Array<keyof ActaMetadataStructure> {
    return [
      'doc_type', 'chunk_type', 'document_id', 'community_id',
      'document_name', 'document_date'
    ];
  }

  getFieldTypes(): Record<keyof ActaMetadataStructure, string> {
    return ActaMetadataTypes.getExpectedFieldTypes();
  }

  // ===== MÉTODOS DE CONVERSIÓN (PARA EXTRACTORES) =====

  /**
   * CONVERSIÓN PRINCIPAL para extractores
   * Convierte lista de keywords a campos booleanos individuales
   * Migrado desde RAG convert_topic_keywords_to_boolean_fields()
   */
  convertTopicKeywordsToBooleanFields(topicKeywords: string[]): Partial<ActaMetadataStructure> {
    // Inicializar todos como false
    const topicFields: Partial<ActaMetadataStructure> = {
      topic_piscina: false,
      topic_jardin: false,
      topic_limpieza: false,
      topic_administracion: false,
      topic_balance: false,
      topic_paqueteria: false,
      topic_energia: false,
      topic_normativa: false,
      topic_proveedor: false,
      topic_dinero: false,
      topic_ascensor: false,
      topic_incendios: false,
      topic_porteria: false
    };

    // Activar campos basados en keywords recibidos
    if (topicKeywords) {
      for (const keyword of topicKeywords) {
        const fieldName = `topic_${keyword.toLowerCase()}` as keyof ActaMetadataStructure;
        if (fieldName in topicFields) {
          (topicFields as any)[fieldName] = true;
        }
      }
    }

    return topicFields;
  }

  /**
   * Conversión doc_type a campos booleanos
   * Migrado desde RAG convert_doc_type_to_boolean_fields()
   */
  convertDocTypeToBooleanFields(docType: string): Partial<ActaMetadataStructure> {
    return {
      doc_type_acta: docType === 'acta',
      doc_type_contrato: docType === 'contrato',
      doc_type_factura: docType === 'factura',
      doc_type_comunicado: docType === 'comunicado'
    };
  }

  /**
   * Conversión inversa: campos booleanos a lista de keywords
   * Migrado desde RAG convert_boolean_fields_to_topic_keywords()
   */
  convertBooleanFieldsToTopicKeywords(metadata: Partial<ActaMetadataStructure>): string[] {
    const keywords: string[] = [];
    
    const fieldToKeyword: Record<string, string> = {
      topic_piscina: 'Piscina',
      topic_jardin: 'Jardin',
      topic_limpieza: 'Limpieza',
      topic_administracion: 'Administracion',
      topic_balance: 'Balance',
      topic_paqueteria: 'Paqueteria',
      topic_energia: 'Energia',
      topic_normativa: 'Normativa',
      topic_proveedor: 'Proveedor',
      topic_dinero: 'Dinero',
      topic_ascensor: 'Ascensor',
      topic_incendios: 'Incendios',
      topic_porteria: 'Porteria'
    };

    for (const [fieldName, keyword] of Object.entries(fieldToKeyword)) {
      if ((metadata as any)[fieldName]) {
        keywords.push(keyword);
      }
    }

    return keywords;
  }

  // ===== MÉTODOS PARA FILTROS SUPABASE =====

  /**
   * Construir filtro temporal para Supabase
   * Migrado desde RAG build_temporal_filter()
   */
  buildTemporalFilter(dateStart?: string, dateEnd?: string): Record<string, any> {
    if (!dateStart && !dateEnd) {
      return {};
    }

    const filter: Record<string, any> = {};

    if (dateStart) {
      const normalizedStart = MetadataDateUtils.convertToStandardFormat(dateStart);
      if (normalizedStart) {
        filter.document_date = { gte: normalizedStart };
      }
    }

    if (dateEnd) {
      const normalizedEnd = MetadataDateUtils.convertToStandardFormat(dateEnd);
      if (normalizedEnd) {
        if (filter.document_date) {
          filter.document_date.lte = normalizedEnd;
        } else {
          filter.document_date = { lte: normalizedEnd };
        }
      }
    }

    return filter;
  }

  /**
   * Obtener listas de valores únicos para filtros UI
   * Migrado desde RAG extract_xxx_from_documents()
   */
  static extractLugaresFromDocuments(documents: any[]): string[] {
    const lugares = new Set<string>();
    
    for (const doc of documents) {
      const metadata = doc?.metadata || doc;
      const lugar = metadata?.lugar;
      
      if (typeof lugar === 'string' && lugar.trim()) {
        lugares.add(lugar.trim());
      }
    }

    return Array.from(lugares).sort();
  }

  static extractAdministradoresFromDocuments(documents: any[]): string[] {
    const administradores = new Set<string>();
    
    for (const doc of documents) {
      const metadata = doc?.metadata || doc;
      const administrador = metadata?.administrador;
      
      if (typeof administrador === 'string' && administrador.trim()) {
        administradores.add(administrador.trim());
      }
    }

    return Array.from(administradores).sort();
  }

  static extractDecisionesPrincipalesFromDocuments(documents: any[]): string[] {
    const decisiones = new Set<string>();
    
    for (const doc of documents) {
      const metadata = doc?.metadata || doc;
      let docDecisiones = metadata?.decisiones_principales;
      
      // Manejar tanto arrays como strings JSON
      if (typeof docDecisiones === 'string') {
        try {
          docDecisiones = JSON.parse(docDecisiones);
        } catch {
          continue;
        }
      }
      
      if (Array.isArray(docDecisiones)) {
        for (const decision of docDecisiones) {
          if (typeof decision === 'string' && decision.trim()) {
            decisiones.add(decision.trim());
          }
        }
      }
    }

    return Array.from(decisiones).sort();
  }
}

// ============================================================================
// 🧪 FUNCIÓN DE TEST INTEGRADA
// ============================================================================

/**
 * Función de test para validar el contrato de ACTA
 * Incluye tests de todas las capas y funcionalidades
 */
export async function testActaContract(): Promise<void> {
  console.log('🧪 [ActaContract Test] Iniciando test del contrato de ACTA...');
  console.log('=' .repeat(60));

  const contract = new ActaMetadataContract();

  // Test 1: Información básica del contrato
  console.log('📋 [Test 1] Información del contrato:');
  console.log(`   Tipo de documento: ${contract.getDocumentType()}`);
  console.log(`   Tipos soportados: ${contract.getSupportedTypes().join(', ')}`);
  console.log(`   Campos requeridos: ${contract.getRequiredFields().length} campos`);

  // Test 2: Crear estructura vacía
  console.log('\n🏗️ [Test 2] Crear estructura vacía:');
  const emptyMetadata = contract.createEmpty();
  console.log(`   doc_type: ${emptyMetadata.doc_type}`);
  console.log(`   chunk_type: ${emptyMetadata.chunk_type}`);
  console.log(`   topic_piscina: ${emptyMetadata.topic_piscina}`);
  console.log(`   doc_type_acta: ${emptyMetadata.doc_type_acta}`);

  // Test 3: Validación de estructura
  console.log('\n🏷️ [Test 3] Validación de estructura:');
  
  // Estructura válida
  const validMetadata: Partial<ActaMetadataStructure> = {
    doc_type: 'acta',
    chunk_type: 'document_overview',
    document_id: 'test-001',
    community_id: 'amara-homes',
    document_name: 'Acta Junta Extraordinaria',
    document_date: '20250602'
  };
  
  const validation = contract.validateStructure(validMetadata);
  console.log(`   Estructura válida: ${validation.is_valid}`);
  console.log(`   Errores: ${validation.errors.length}`);
  console.log(`   Warnings: ${validation.warnings.length}`);

  // Estructura inválida
  const invalidMetadata: Partial<ActaMetadataStructure> = {
    doc_type: 'acta',
    // Falta chunk_type (requerido)
    document_id: 'test-002',
    community_id: 'test',
    document_date: 'fecha-invalida'  // Formato incorrecto
  };
  
  const invalidValidation = contract.validateStructure(invalidMetadata);
  console.log(`   Estructura inválida: ${invalidValidation.is_valid}`);
  console.log(`   Errores encontrados: ${invalidValidation.errors.length}`);
  if (invalidValidation.errors.length > 0) {
    console.log(`   Primer error: ${invalidValidation.errors[0]}`);
  }

  // Test 4: Conversión de topic keywords
  console.log('\n🔄 [Test 4] Conversión de topic keywords:');
  const keywords = ['Piscina', 'Balance', 'Administracion'];
  const booleanFields = contract.convertTopicKeywordsToBooleanFields(keywords);
  console.log(`   Keywords de entrada: ${keywords.join(', ')}`);
  console.log(`   topic_piscina: ${booleanFields.topic_piscina}`);
  console.log(`   topic_balance: ${booleanFields.topic_balance}`);
  console.log(`   topic_jardin: ${booleanFields.topic_jardin}`);

  // Conversión inversa
  const testMetadataWithTopics = { ...emptyMetadata, ...booleanFields };
  const extractedKeywords = contract.convertBooleanFieldsToTopicKeywords(testMetadataWithTopics);
  console.log(`   Keywords extraídos: ${extractedKeywords.join(', ')}`);
  console.log(`   Conversión correcta: ${JSON.stringify(keywords.sort()) === JSON.stringify(extractedKeywords.sort())}`);

  // Test 5: Conversión de storage
  console.log('\n💾 [Test 5] Conversión de storage:');
  const completeMetadata: ActaMetadataStructure = {
    ...emptyMetadata,
    document_name: 'Test Acta',
    topic_keywords: ['Piscina', 'Balance'],
    decisiones_principales: ['Renovar piscina', 'Aprobar presupuesto'],
    estructura_detectada: { puntos_orden_dia: ['Punto 1', 'Punto 2'] }
  };

  const storageFormat = contract.convertToStorageFormat(completeMetadata);
  console.log(`   topic_keywords como string: ${typeof storageFormat.topic_keywords === 'string'}`);
  console.log(`   decisiones_principales como string: ${typeof storageFormat.decisiones_principales === 'string'}`);

  const restored = contract.convertFromStorageFormat(storageFormat);
  console.log(`   Restaurado topic_keywords: ${Array.isArray(restored.topic_keywords)}`);
  console.log(`   Cantidad keywords: ${restored.topic_keywords.length}`);

  // Test 6: Validación de campos individuales
  console.log('\n🔍 [Test 6] Validación de campos individuales:');
  console.log(`   doc_type válido: ${contract.validateField('doc_type', 'acta')}`);
  console.log(`   doc_type inválido: ${contract.validateField('doc_type', 123)}`);
  console.log(`   asistentes_total válido: ${contract.validateField('asistentes_total', 15)}`);
  console.log(`   topic_keywords válido: ${contract.validateField('topic_keywords', ['Piscina'])}`);

  // Test 7: Utilidades de fecha
  console.log('\n📅 [Test 7] Utilidades de fecha:');
  const dates = ['02/06/2025', '20250602', '2025-06-02', '02062025'];
  for (const date of dates) {
    const converted = MetadataDateUtils.convertToStandardFormat(date);
    console.log(`   ${date} → ${converted} (válido: ${MetadataDateUtils.isValidDateFormat(converted)})`);
  }

  // Test 8: Filtros temporales
  console.log('\n🔍 [Test 8] Filtros temporales:');
  const temporalFilter = contract.buildTemporalFilter('01/01/2025', '31/12/2025');
  console.log(`   Filtro generado:`, temporalFilter);

  console.log('\n✅ [ActaContract Test] Todos los tests completados');
  console.log('=' .repeat(60));
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testActaContract().catch(console.error);
}