/**
 * ARCHIVO: schemaBasedConfig.ts
 * PROPÓSITO: Auto-descubrimiento de configuraciones desde document-types-schema.json
 * ESTADO: development
 * DEPENDENCIAS: document-types-schema.json
 * OUTPUTS: Configuraciones dinámicas para pipeline
 * ACTUALIZADO: 2025-09-23
 */

import fs from 'fs';
import path from 'path';

// Tipos para configuración del pipeline
export interface DocumentTypeConfig {
  agentName: string;
  saveFunctionName: string;
  tableName: string;
  extractorClass?: string;
}

export interface DocumentConfigs {
  [documentType: string]: DocumentTypeConfig;
}

/**
 * Lee el schema JSON y genera configuraciones dinámicamente
 */
export function getDocumentConfigs(): DocumentConfigs {
  try {
    // Leer el schema desde la fuente de verdad
    const schemaPath = path.join(process.cwd(), 'src/lib/schemas/document-types-schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    const configs: DocumentConfigs = {};
    const documentTypes = schema.document_types || {};

    // Generar configuración para cada tipo definido en el schema
    for (const [typeName, typeConfig] of Object.entries(documentTypes)) {
      const metadata = (typeConfig as any).metadata;
      
      if (metadata && metadata.agent_name && metadata.table_name) {
        configs[typeName] = {
          agentName: metadata.agent_name,
          saveFunctionName: generateSaveFunctionName(typeName),
          tableName: metadata.table_name,
          extractorClass: generateExtractorClassName(typeName)
        };
      }
    }

    console.log('📋 [SchemaConfig] Auto-discovered document types:', Object.keys(configs));
    return configs;

  } catch (error) {
    console.error('❌ [SchemaConfig] Error reading document schema:', error);
    
    // Fallback a configuración manual para evitar errores
    return getFallbackConfigs();
  }
}

/**
 * Obtiene la lista de tipos soportados dinámicamente
 */
export function getSupportedDocumentTypes(): string[] {
  const configs = getDocumentConfigs();
  return Object.keys(configs);
}

/**
 * Verifica si un tipo de documento está soportado
 */
export function isDocumentTypeSupported(documentType: string): boolean {
  const supportedTypes = getSupportedDocumentTypes();
  return supportedTypes.includes(documentType);
}

/**
 * Obtiene configuración específica de un tipo de documento
 */
export function getDocumentTypeConfig(documentType: string): DocumentTypeConfig | null {
  const configs = getDocumentConfigs();
  return configs[documentType] || null;
}

/**
 * Lee el schema JSON desde la fuente de verdad
 */
function getDocumentSchema(): any {
  const schemaPath = path.join(process.cwd(), 'src/lib/schemas/document-types-schema.json');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  return JSON.parse(schemaContent);
}

/**
 * Genera el nombre de la función de guardado basado en el tipo
 * ELIMINADO HARDCODING - Usa convenciones automáticas
 */
function generateSaveFunctionName(typeName: string): string {
  // Mapeo específico basado en tabla del schema (para casos especiales)
  try {
    const schema = getDocumentSchema();
    const docConfig = schema.document_types?.[typeName];
    const tableName = docConfig?.metadata?.table_name;
    
    // Generar nombre basado en tabla si está disponible
    if (tableName) {
      // extracted_minutes -> saveExtractedMinutes
      // extracted_budgets -> saveExtractedBudgets  
      const tableBaseName = tableName.replace('extracted_', '');
      const capitalizedBase = tableBaseName.charAt(0).toUpperCase() + tableBaseName.slice(1);
      return `saveExtracted${capitalizedBase}`;
    }
  } catch (error) {
    console.warn(`[SchemaConfig] Could not load schema for ${typeName}, using fallback`);
  }

  // Fallback: Generación automática estándar
  const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);
  return `saveExtracted${capitalizedType}`;
}

/**
 * Genera el nombre de la clase extractor basado en el tipo
 */
function generateExtractorClassName(typeName: string): string {
  const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);
  return `${capitalizedType}Extractor`;
}

/**
 * Configuración de fallback si el schema no está disponible
 */
function getFallbackConfigs(): DocumentConfigs {
  console.log('⚠️ [SchemaConfig] Using fallback configuration');
  
  return {
    'acta': {
      agentName: 'acta_extractor_v2',
      saveFunctionName: 'saveExtractedMinutes',
      tableName: 'extracted_minutes'
    },
    'comunicado': {
      agentName: 'comunicado_extractor_v1', 
      saveFunctionName: 'saveExtractedComunicado',
      tableName: 'extracted_communications'
    },
    'factura': {
      agentName: 'factura_extractor_v2',
      saveFunctionName: 'saveExtractedInvoice',
      tableName: 'extracted_invoices'
    },
    'contrato': {
      agentName: 'contrato_extractor_v1',
      saveFunctionName: 'saveExtractedContract', 
      tableName: 'extracted_contracts'
    },
    'escritura': {
      agentName: 'escritura_extractor_v1',
      saveFunctionName: 'saveExtractedEscritura',
      tableName: 'extracted_property_deeds'
    },
    'albaran': {
      agentName: 'albaran_extractor_v1',
      saveFunctionName: 'saveExtractedAlbaran',
      tableName: 'extracted_delivery_notes'
    }
  };
}

/**
 * Función de utilidad para logging y debug
 */
export function logSchemaBasedConfig(): void {
  const configs = getDocumentConfigs();
  const supportedTypes = getSupportedDocumentTypes();
  
  console.log('🔧 [SchemaConfig] === CONFIGURACIÓN AUTO-GENERADA ===');
  console.log('📋 Tipos soportados:', supportedTypes);
  console.log('⚙️ Configuraciones:', Object.keys(configs).length);
  
  for (const [type, config] of Object.entries(configs)) {
    console.log(`   ${type}:`, {
      agent: config.agentName,
      table: config.tableName,
      saveFunction: config.saveFunctionName
    });
  }
  console.log('🔧 [SchemaConfig] === FIN CONFIGURACIÓN ===');
}