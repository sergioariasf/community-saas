/**
 * ARCHIVO: master-generator.js
 * PROPÓSITO: Generador maestro que coordina creación automática de todo lo necesario para nuevos tipos de documentos
 * ESTADO: development
 * DEPENDENCIAS: document-types-schema.json, supabase-table-generator.js, ui-component-generator.js
 * OUTPUTS: Tablas, componentes, configuración de pipeline, prompts automáticos
 * ACTUALIZADO: 2025-09-23
 */

const fs = require('fs');
const path = require('path');
const { SupabaseTableGenerator } = require('./supabase-table-generator');
const { UIComponentGenerator } = require('./ui-component-generator');

class MasterGenerator {
  constructor() {
    this.schemaPath = path.join(__dirname, '../schemas/document-types-schema.json');
    this.schema = this.loadSchema();
    this.tableGenerator = new SupabaseTableGenerator(this.schemaPath);
    this.uiGenerator = new UIComponentGenerator(this.schemaPath);
  }

  loadSchema() {
    const schemaContent = fs.readFileSync(this.schemaPath, 'utf8');
    return JSON.parse(schemaContent);
  }

  async generateNewDocumentType(documentType) {
    console.log(`🚀 GENERANDO TIPO DE DOCUMENTO: ${documentType.toUpperCase()}`);
    console.log('=' * 60);

    const typeConfig = this.schema.document_types[documentType];
    if (!typeConfig) {
      throw new Error(`❌ Tipo de documento '${documentType}' no encontrado en schema`);
    }

    const results = {
      documentType,
      displayName: typeConfig.metadata.display_name,
      generated: [],
      errors: []
    };

    try {
      // 1. Generar tabla de Supabase
      console.log('\\n📊 1. GENERANDO TABLA SUPABASE...');
      const tableSQL = this.tableGenerator.generateSingleTable(documentType);
      const tablePath = this.saveTableSQL(documentType, tableSQL);
      results.generated.push({
        type: 'database_table',
        file: tablePath,
        description: `Tabla ${typeConfig.metadata.table_name}`
      });
      console.log(`   ✅ Tabla SQL guardada: ${tablePath}`);

      // 2. Generar componente UI
      console.log('\\n🎨 2. GENERANDO COMPONENTE UI...');
      const componentResult = this.uiGenerator.generateComponentFile(documentType);
      results.generated.push({
        type: 'ui_component',
        file: componentResult.path,
        description: `Componente ${componentResult.filename}`
      });
      console.log(`   ✅ Componente creado: ${componentResult.filename}`);

      // 3. Generar extractor strategy
      console.log('\\n⚡ 3. GENERANDO EXTRACTOR STRATEGY...');
      const extractorPath = this.generateExtractorStrategy(documentType, typeConfig);
      results.generated.push({
        type: 'extractor_strategy',
        file: extractorPath,
        description: `Extractor ${this.capitalize(documentType)}Extractor.ts`
      });
      console.log(`   ✅ Extractor creado: ${extractorPath}`);

      // 4. Generar persistence layer
      console.log('\\n💾 4. GENERANDO PERSISTENCE LAYER...');
      const persistencePath = this.generatePersistenceLayer(documentType, typeConfig);
      results.generated.push({
        type: 'persistence_layer',
        file: persistencePath,
        description: `Persistence ${this.capitalize(documentType)}Persistence.ts`
      });
      console.log(`   ✅ Persistence creado: ${persistencePath}`);

      // 5. Generar template validation schema
      console.log('\\n📋 5. GENERANDO TEMPLATE VALIDATION...');
      const templateSchemaPath = this.generateTemplateSchema(documentType, typeConfig);
      results.generated.push({
        type: 'template_schema',
        file: templateSchemaPath,
        description: `Schema de validación para ${documentType}`
      });
      console.log(`   ✅ Template schema actualizado: ${templateSchemaPath}`);

      // 6. Actualizar configuraciones del pipeline
      console.log('\\n🔄 6. ACTUALIZANDO CONFIGURACIONES PIPELINE...');
      const configUpdates = this.updatePipelineConfigurations(documentType, typeConfig);
      results.generated.push(...configUpdates);
      console.log(`   ✅ ${configUpdates.length} archivos de configuración actualizados`);

      // 7. Generar prompt para agente
      console.log('\\n🧠 7. GENERANDO PROMPT PARA AGENTE...');
      const promptPath = this.generateAgentPrompt(documentType, typeConfig);
      results.generated.push({
        type: 'agent_prompt',
        file: promptPath,
        description: `Prompt para ${typeConfig.metadata.agent_name}`
      });
      console.log(`   ✅ Prompt generado: ${promptPath}`);

      // 8. Generar validador de datos
      console.log('\\n🔍 8. GENERANDO VALIDADOR DE DATOS...');
      const validatorPath = this.generateDataValidator(documentType, typeConfig);
      results.generated.push({
        type: 'data_validator',
        file: validatorPath,
        description: `Validador ${this.capitalize(documentType)}Validator.ts`
      });
      console.log(`   ✅ Validador creado: ${validatorPath}`);

      // 9. Integrar validador en ResponseParser
      console.log('\\n🔗 9. INTEGRANDO VALIDADOR EN RESPONSEPARSER...');
      const responseParserUpdated = this.integrateValidatorInResponseParser(documentType, typeConfig);
      if (responseParserUpdated) {
        results.generated.push({
          type: 'responseparser_integration',
          file: responseParserUpdated,
          description: `ResponseParser actualizado para ${documentType}`
        });
        console.log(`   ✅ ResponseParser actualizado: ${responseParserUpdated}`);
      } else {
        console.log(`   ⚠️  ResponseParser ya incluye validación para ${documentType}`);
      }

      // 10. 🪄 MAGIA AUTOMÁTICA: Actualizar pipeline switch
      console.log('\\n🪄 10. ACTUALIZANDO PIPELINE AUTOMÁTICAMENTE...');
      const pipelineUpdated = this.updatePipelineSwitch(documentType, typeConfig);
      if (pipelineUpdated) {
        results.generated.push({
          type: 'pipeline_switch_update',
          file: pipelineUpdated,
          description: `Pipeline switch actualizado para ${documentType}`
        });
        console.log(`   ✅ Pipeline switch actualizado: ${pipelineUpdated}`);
      } else {
        console.log(`   ⚠️  Pipeline ya incluye case para ${documentType}`);
      }

      console.log('\\n' + '=' * 60);
      console.log(`✅ GENERACIÓN COMPLETADA PARA: ${typeConfig.metadata.display_name}`);
      console.log(`📁 ${results.generated.length} archivos generados`);
      
      return results;

    } catch (error) {
      console.error(`❌ Error durante la generación: ${error.message}`);
      results.errors.push(error.message);
      throw error;
    }
  }

  saveTableSQL(documentType, sql) {
    const filename = `${documentType}_table.sql`;
    const outputPath = path.join(__dirname, '../../..', 'supabase', 'generated', filename);
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, sql);
    return outputPath;
  }

  generateExtractorStrategy(documentType, typeConfig) {
    const className = `${this.capitalize(documentType)}Extractor`;
    const agentName = typeConfig.metadata.agent_name;
    
    const extractorCode = `/**
 * ARCHIVO: ${className}.ts
 * PROPÓSITO: Extractor específico para documentos tipo ${typeConfig.metadata.display_name}
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, AgentOrchestrator
 * OUTPUTS: Datos estructurados de ${documentType}
 * ACTUALIZADO: ${new Date().toISOString().split('T')[0]}
 */

import { BaseDocumentExtractor, ExtractionResult } from './BaseDocumentExtractor';
import { callSaaSAgent } from '@/lib/agents/AgentOrchestrator';

export class ${className} extends BaseDocumentExtractor {
  getDocumentType(): string {
    return '${documentType}';
  }

  getAgentName(): string {
    return '${agentName}';
  }

  async extractData(content: string): Promise<ExtractionResult> {
    try {
      console.log(\`[${className}] Extrayendo datos de \${this.getDocumentType()}...\`);
      
      const inputs = {
        document_content: content,
        document_type: '${documentType}',
        extraction_mode: 'complete'
      };

      const agentResponse = await callSaaSAgent(this.getAgentName(), inputs);
      
      if (!agentResponse.success) {
        console.error(\`[${className}] Error del agente:\`, agentResponse.error);
        return {
          success: false,
          error: agentResponse.error || 'Error desconocido del agente',
          data: null,
          processingTime: agentResponse.processingTime || 0
        };
      }

      // Validar estructura de datos esperada
      const extractedData = agentResponse.data;
      if (!this.validateExtractedData(extractedData)) {
        return {
          success: false,
          error: 'Datos extraídos no cumplen estructura esperada',
          data: null,
          processingTime: agentResponse.processingTime || 0
        };
      }

      console.log(\`[${className}] Extracción exitosa en \${agentResponse.processingTime}ms\`);
      
      return {
        success: true,
        data: extractedData,
        processingTime: agentResponse.processingTime || 0,
        tokensUsed: agentResponse.tokensUsed || 0
      };

    } catch (error) {
      console.error(\`[${className}] Error durante extracción:\`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        data: null,
        processingTime: 0
      };
    }
  }

  private validateExtractedData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Validar campos obligatorios según schema
    const requiredFields = [${typeConfig.database_schema.primary_fields
      .filter(f => f.required)
      .map(f => `'${f.name}'`)
      .join(', ')}];
    
    return requiredFields.every(field => data.hasOwnProperty(field));
  }
}`;

    const outputPath = path.join(__dirname, '../../..', 'src', 'lib', 'ingesta', 'core', 'strategies', `${className}.ts`);
    fs.writeFileSync(outputPath, extractorCode);
    return outputPath;
  }

  generatePersistenceLayer(documentType, typeConfig) {
    const className = `${this.capitalize(documentType)}Persistence`;
    const tableName = typeConfig.metadata.table_name;
    const functionName = `saveExtracted${this.capitalize(documentType)}`;
    
    const persistenceCode = `/**
 * ARCHIVO: ${className}.ts
 * PROPÓSITO: Persistencia específica para datos de ${typeConfig.metadata.display_name}
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones ${functionName} migradas
 * ACTUALIZADO: ${new Date().toISOString().split('T')[0]}
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de ${documentType} en la tabla ${tableName}
 * Generado automáticamente desde schema
 */
export async function ${functionName}(
  documentId: string, 
  data: any
): Promise<boolean> {
  try {
    console.log(\`[${this.capitalize(documentType)} Persistence] Saving extracted ${documentType} for document: \${documentId}\`);
    
    const result = await insertWithOrganization(
      '${tableName}',
      documentId,
      data,
      false // usar client normal
    );

    if (result.success) {
      console.log(\`[${this.capitalize(documentType)} Persistence] Successfully saved ${documentType} for document: \${documentId} in \${result.metadata?.processingTime}ms\`);
      return true;
    } else {
      console.error(\`[${this.capitalize(documentType)} Persistence] Failed to save ${documentType}:\`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[${this.capitalize(documentType)} Persistence] Exception saving ${documentType}:', error);
    return false;
  }
}

/**
 * Alias para ${functionName} - mantiene compatibilidad con ${this.capitalize(documentType)}Extractor
 */
export const save${this.capitalize(documentType)}Data = ${functionName};`;

    const outputPath = path.join(__dirname, '../../..', 'src', 'lib', 'agents', 'persistence', `${className}.ts`);
    fs.writeFileSync(outputPath, persistenceCode);
    return outputPath;
  }

  generateTemplateSchema(documentType, typeConfig) {
    // Leer archivo existente
    const templatePath = path.join(__dirname, '../../..', 'src', 'lib', 'ingesta', 'validation', 'templateValidation.ts');
    let content = fs.readFileSync(templatePath, 'utf8');
    
    // Generar schema para el nuevo tipo
    const fields = [
      ...typeConfig.database_schema.primary_fields,
      ...typeConfig.database_schema.detail_fields
    ];
    
    const schemaFields = fields.map(field => {
      const tsType = this.mapToValidationType(field.type);
      return `    { name: '${field.name}', type: '${tsType}', required: ${field.required} }`;
    }).join(',\\n');
    
    const newSchema = `  ${documentType}: {
    name: '${typeConfig.metadata.component_name}',
    document_type: '${documentType}',
    extractor_agent: '${typeConfig.metadata.agent_name}',
    fields: [
${schemaFields}
    ]
  }`;
    
    // Insertar en TEMPLATE_SCHEMAS
    const schemasMatch = content.match(/(export const TEMPLATE_SCHEMAS[\\s\\S]*?= \\{)([\\s\\S]*?)(\\n\\};)/);
    if (schemasMatch) {
      const [, prefix, existing, suffix] = schemasMatch;
      const newContent = prefix + existing + ',\\n\\n' + newSchema + suffix;
      content = content.replace(schemasMatch[0], newContent);
      fs.writeFileSync(templatePath, content);
    }
    
    return templatePath;
  }

  updatePipelineConfigurations(documentType, typeConfig) {
    const updates = [];
    
    // 1. Actualizar DocumentExtractorFactory
    const factoryPath = path.join(__dirname, '../../..', 'src', 'lib', 'ingesta', 'core', 'strategies', 'DocumentExtractorFactory.ts');
    let factoryContent = fs.readFileSync(factoryPath, 'utf8');
    
    // Añadir import
    const importLine = `import { ${this.capitalize(documentType)}Extractor } from './${this.capitalize(documentType)}Extractor';`;
    if (!factoryContent.includes(importLine)) {
      factoryContent = factoryContent.replace(
        /(import.*Extractor.*\\n)+/,
        `$&${importLine}\\n`
      );
    }
    
    // Añadir case en switch
    const newCase = `        case '${documentType}':
          this.extractors.set(documentType, new ${this.capitalize(documentType)}Extractor());
          break;`;
    
    if (!factoryContent.includes(`case '${documentType}':`)) {
      factoryContent = factoryContent.replace(
        /(case 'escritura':.*?break;)/s,
        `$1\\n${newCase}`
      );
    }
    
    // Actualizar supportedTypes
    factoryContent = factoryContent.replace(
      /(const supportedTypes = \[.*?)(\];)/s,
      (match, start, end) => {
        if (!start.includes(`'${documentType}'`)) {
          return start.replace(/\]/, `, '${documentType}'${end}`);
        }
        return match;
      }
    );
    
    fs.writeFileSync(factoryPath, factoryContent);
    updates.push({
      type: 'pipeline_config',
      file: factoryPath,
      description: 'DocumentExtractorFactory actualizado'
    });
    
    // 2. Actualizar agentConfig.ts
    const configPath = path.join(__dirname, '../../..', 'src', 'lib', 'ingesta', 'config', 'agentConfig.ts');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Añadir a COMPLEX_AGENTS si es complejo
    if (typeConfig.metadata.extraction_complexity === 'complex') {
      configContent = configContent.replace(
        /(agents: \[.*?)(\])/s,
        (match, start, end) => {
          if (!start.includes(`'${typeConfig.metadata.agent_name}'`)) {
            return start.replace(/\]/, `, '${typeConfig.metadata.agent_name}'${end}`);
          }
          return match;
        }
      );
      fs.writeFileSync(configPath, configContent);
      updates.push({
        type: 'agent_config',
        file: configPath,
        description: 'agentConfig.ts actualizado'
      });
    }
    
    return updates;
  }

  generateAgentPrompt(documentType, typeConfig) {
    const fields = [
      ...typeConfig.database_schema.primary_fields,
      ...typeConfig.database_schema.detail_fields,
      ...(typeConfig.database_schema.topic_fields || [])
    ];
    
    const fieldsJSON = fields.map(field => {
      const example = this.getDetailedExampleValue(field, typeConfig.metadata.display_name);
      const comment = field.description || `${field.name} del ${typeConfig.metadata.display_name.toLowerCase()}`;
      return `    "${field.name}": ${example}, // ${comment}`;
    }).join('\\n');
    
    const promptContent = `Eres un experto en extraer información de ${typeConfig.metadata.display_name.toLowerCase()}s. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para arrays usar formato JSON válido
6. Para números, devolver valores numéricos (no strings)

CAMPOS A EXTRAIR:
{
${fieldsJSON}
}

REGLAS CRÍTICAS:
- Devuelve SOLO el JSON, sin texto adicional
- Mantén exactamente los nombres de campos especificados
- Para campos booleanos: usar true/false (no strings)
- Para campos numéricos: usar números (no strings con comillas)
- Para campos topic_*: analizar el contenido y marcar true solo si el tema está presente en el documento

CONTEXTO TÉCNICO:
- Agente: ${typeConfig.metadata.agent_name}
- Tabla destino: ${typeConfig.metadata.table_name}  
- Campos obligatorios: ${typeConfig.database_schema.primary_fields.filter(f => f.required).map(f => f.name).join(', ')}
- Generado automáticamente: ${new Date().toISOString().split('T')[0]}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.`;

    const outputPath = path.join(__dirname, '../../..', 'prompts', `${typeConfig.metadata.agent_name}_prompt.md`);
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, promptContent);
    return outputPath;
  }

  getExampleValue(field) {
    switch (field.type) {
      case 'text': return '"texto de ejemplo"';
      case 'numeric': case 'integer': return '123.45';
      case 'date': return '"2025-01-01"';
      case 'boolean': return 'true';
      case 'jsonb': return '["item1", "item2"]';
      default: return '"valor_ejemplo"';
    }
  }

  getDetailedExampleValue(field, displayName) {
    switch (field.type) {
      case 'text':
        if (field.name.includes('name') || field.name.includes('nombre')) {
          return field.name.includes('emisor') ? '"Empresa Emisora S.L."' : 
                 field.name.includes('receptor') ? '"Cliente Receptor S.A."' : 
                 '"Nombre completo"';
        }
        if (field.name.includes('direccion')) {
          return '"Calle Ejemplo 123, 28001 Madrid"';
        }
        if (field.name.includes('telefono')) {
          return '"912345678"';
        }
        if (field.name.includes('email')) {
          return '"contacto@empresa.com"';
        }
        if (field.name.includes('numero_albaran')) {
          return '"ALB-2025-001234"';
        }
        if (field.name.includes('numero_pedido')) {
          return '"PED-2025-005678"';
        }
        if (field.name.includes('category')) {
          return '"comercial"';
        }
        if (field.name.includes('estado')) {
          return '"entregado"';
        }
        if (field.name.includes('transportista')) {
          return '"Transportes García S.L."';
        }
        if (field.name.includes('matricula')) {
          return '"1234-ABC"';
        }
        if (field.name.includes('observaciones')) {
          return '"Entrega realizada correctamente"';
        }
        return '"texto específico"';
      
      case 'numeric':
      case 'integer':
        if (field.name.includes('cantidad')) return '25';
        if (field.name.includes('peso')) return '15.50';
        return '123.45';
      
      case 'date':
        return '"2025-01-15"';
      
      case 'boolean':
        if (field.name.startsWith('topic_')) {
          const topicName = field.name.replace('topic_', '');
          return field.description ? 'false' : 'false'; // Default false, será true si detecta el tema
        }
        return field.name.includes('firma') ? 'true' : 'false';
      
      case 'jsonb':
        if (field.name.includes('mercancia')) {
          return `[
      {
        "descripcion": "Producto ejemplo",
        "cantidad": 10,
        "unidad": "unidades",
        "peso": 2.5
      }
    ]`;
        }
        return '["item1", "item2"]';
      
      default:
        return '"valor específico"';
    }
  }

  mapToValidationType(dbType) {
    const mapping = {
      'text': 'string',
      'numeric': 'number',
      'integer': 'number',
      'date': 'date',
      'boolean': 'boolean',
      'jsonb': 'array'
    };
    return mapping[dbType] || 'string';
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Método para generar todo lo necesario para todos los tipos del schema
  async generateAllDocumentTypes() {
    const results = [];
    
    for (const documentType of Object.keys(this.schema.document_types)) {
      try {
        const result = await this.generateNewDocumentType(documentType);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error generando ${documentType}:`, error.message);
        results.push({
          documentType,
          errors: [error.message],
          generated: []
        });
      }
    }
    
    return results;
  }

  /**
   * Genera validador de datos siguiendo el patrón establecido (ActaValidator, EscrituraValidator)
   */
  generateDataValidator(documentType, typeConfig) {
    const className = this.capitalize(documentType);
    const fields = [
      ...typeConfig.database_schema.primary_fields,
      ...typeConfig.database_schema.detail_fields,
      ...(typeConfig.database_schema.topic_fields || [])
    ];

    // Generar imports de validadores base
    const baseValidators = new Set();
    fields.forEach(field => {
      switch(field.type) {
        case 'date': baseValidators.add('validateDate'); break;
        case 'numeric': 
        case 'integer': baseValidators.add('validateNumber'); break;
        case 'text': baseValidators.add('validateString'); break;
        case 'jsonb':
        case 'text[]': baseValidators.add('validateArray'); break;
        case 'boolean': baseValidators.add('validateBoolean'); break;
      }
    });
    
    const imports = Array.from(baseValidators).join(', ');

    // Generar campos de validación
    const fieldValidations = fields.map(field => {
      const fieldName = field.name;
      
      switch(field.type) {
        case 'date':
          return `    ${fieldName}: validateDate(data.${fieldName}),`;
        case 'numeric':
          return `    ${fieldName}: validateNumber(data.${fieldName}),`;
        case 'integer':
          return `    ${fieldName}: validateNumber(data.${fieldName}, true), // entero`;
        case 'text':
          const maxLength = field.max_length || 200;
          return `    ${fieldName}: validateString(data.${fieldName}, ${maxLength}),`;
        case 'jsonb':
          return `    ${fieldName}: validateArray(data.${fieldName} || []),`;
        case 'text[]':
          return `    ${fieldName}: validateArray(data.${fieldName}, undefined, (item) => validateString(item)),`;
        case 'boolean':
          return `    ${fieldName}: validateBoolean(data.${fieldName}),`;
        default:
          return `    ${fieldName}: data.${fieldName}, // sin validación específica`;
      }
    }).join('\n');

    const validatorCode = `/**
 * ARCHIVO: ${className}Validator.ts
 * PROPÓSITO: Validación específica para datos extraídos de ${typeConfig.metadata.display_name.toLowerCase()}s
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validate${className}Data completa y robusta
 * ACTUALIZADO: ${new Date().toISOString().split('T')[0]}
 */

import { 
  ${imports}
} from './BaseValidator';

/**
 * Valida y limpia datos extraídos de ${typeConfig.metadata.display_name.toLowerCase()}s
 * Generado automáticamente por master-generator
 */
export function validate${className}Data(data: any): any {
  return {
${fieldValidations}
  };
}`;

    const outputPath = path.join(
      __dirname, 
      '../agents/validation',
      `${className}Validator.ts`
    );
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, validatorCode);
    return outputPath;
  }

  /**
   * Integra el validador en ResponseParser dinámicamente
   */
  integrateValidatorInResponseParser(documentType, typeConfig) {
    const responseParserPath = path.join(
      __dirname, 
      '../agents/gemini/ResponseParser.ts'
    );
    
    if (!fs.existsSync(responseParserPath)) {
      console.warn(`ResponseParser not found at ${responseParserPath}`);
      return null;
    }

    const className = this.capitalize(documentType);
    const agentName = typeConfig.metadata.agent_name;
    
    let content = fs.readFileSync(responseParserPath, 'utf-8');
    
    // 1. Agregar import si no existe
    const importLine = `import { validate${className}Data } from '../validation/${className}Validator';`;
    if (!content.includes(importLine)) {
      // Encontrar después del último import de validator
      const lastValidatorImport = content.lastIndexOf("} from '../validation/");
      if (lastValidatorImport !== -1) {
        const endOfLine = content.indexOf('\\n', lastValidatorImport);
        content = content.slice(0, endOfLine + 1) + importLine + '\\n' + content.slice(endOfLine + 1);
      }
    }

    // 2. Agregar agente a extractorAgents si no existe
    if (!content.includes(`'${agentName}'`)) {
      const agentsPattern = /(const extractorAgents = \[([\\s\\S]*?)\])/;
      const match = content.match(agentsPattern);
      if (match) {
        const newAgentsList = match[2].trim() + `,\\n    '${agentName}'`;
        content = content.replace(match[1], `const extractorAgents = [${newAgentsList}]`);
      }
    }

    // 3. Agregar validación case si no existe  
    if (!content.includes(`agentName === '${agentName}'`)) {
      const validationCase = `  } else if (agentName === '${agentName}') {
    return validate${className}Data(data);`;
      
      const insertPoint = content.indexOf('  return data;\\n}');
      if (insertPoint !== -1) {
        content = content.slice(0, insertPoint) + validationCase + '\\n' + content.slice(insertPoint);
      }
    }

    // Solo escribir si hubo cambios
    const originalContent = fs.readFileSync(responseParserPath, 'utf-8');
    if (content !== originalContent) {
      fs.writeFileSync(responseParserPath, content);
      return responseParserPath;
    }
    
    return null;
  }

  /**
   * 🪄 MAGIA AUTOMÁTICA: Actualiza el switch statement en progressivePipelineSimple.ts
   */
  updatePipelineSwitch(documentType, typeConfig) {
    const pipelinePath = path.join(
      __dirname, 
      '../ingesta/core/progressivePipelineSimple.ts'
    );
    
    if (!fs.existsSync(pipelinePath)) {
      console.warn(`Pipeline not found at ${pipelinePath}`);
      return null;
    }

    const className = this.capitalize(documentType);
    const functionName = `saveExtracted${className}`;
    const agentName = typeConfig.metadata.agent_name;
    
    let content = fs.readFileSync(pipelinePath, 'utf-8');
    
    // 🔍 BUSCAR: ¿Ya existe este case?
    if (content.includes(`case '${documentType}':`)) {
      console.log(`   ⚠️  Case '${documentType}' ya existe en pipeline`);
      return null;
    }

    // 🧠 DECIDIR: ¿Usar persistence moderna o legacy?
    const usesModernPersistence = fs.existsSync(
      path.join(__dirname, `../../agents/persistence/${className}Persistence.ts`)
    );
    
    let newCase;
    if (usesModernPersistence) {
      // 🆕 PERSISTENCE MODERNA
      newCase = `        
        case '${documentType}':
          const { ${functionName} } = await import('@/lib/agents/persistence/${className}Persistence');
          return await ${functionName}(documentId, extractedData);`;
    } else {
      // 🗂️ LEGACY PERSISTENCE  
      newCase = `        
        case '${documentType}':
          const { ${functionName} } = await import('@/lib/gemini/saasAgents');
          return await ${functionName}(documentId, extractedData);`;
    }

    // 🎯 ENCONTRAR: El punto de inserción (antes del default)
    const defaultPattern = /(\s+default:\s*\n\s+throw new Error)/;
    const match = content.match(defaultPattern);
    
    if (!match) {
      console.error(`   ❌ No se encontró el case default en pipeline`);
      return null;
    }

    // ✂️ INSERTAR: El nuevo case antes del default
    const insertionPoint = content.indexOf(match[0]);
    const beforeDefault = content.slice(0, insertionPoint);
    const fromDefault = content.slice(insertionPoint);
    
    const newContent = beforeDefault + newCase + '\\n' + fromDefault;

    // 💾 ESCRIBIR: El archivo actualizado
    const originalContent = fs.readFileSync(pipelinePath, 'utf-8');
    if (newContent !== originalContent) {
      fs.writeFileSync(pipelinePath, newContent);
      console.log(`   🪄 ¡Magia completada! Case '${documentType}' añadido automáticamente`);
      return pipelinePath;
    }
    
    return null;
  }
}

// CLI interface
async function main() {
  const generator = new MasterGenerator();
  const documentType = process.argv[2];
  
  if (!documentType) {
    console.log('🤖 GENERADOR MAESTRO DE DOCUMENTOS');
    console.log('==================================');
    console.log('\\nUso: node master-generator.js <tipo_documento>');
    console.log('\\nTipos disponibles:');
    Object.entries(generator.schema.document_types).forEach(([type, config]) => {
      console.log(`  - ${type}: ${config.metadata.display_name}`);
    });
    console.log('\\nEjemplo: node master-generator.js albaran');
    return;
  }
  
  try {
    const result = await generator.generateNewDocumentType(documentType);
    
    console.log('\\n📋 RESUMEN DE GENERACIÓN:');
    console.log('=========================');
    result.generated.forEach(item => {
      console.log(`✅ ${item.type}: ${item.description}`);
    });
    
    if (result.errors.length > 0) {
      console.log('\\n⚠️  ERRORES:');
      result.errors.forEach(error => console.log(`❌ ${error}`));
    }
    
  } catch (error) {
    console.error('\\n💥 ERROR FATAL:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MasterGenerator };