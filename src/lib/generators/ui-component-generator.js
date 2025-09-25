/**
 * ARCHIVO: ui-component-generator.js
 * PROPÓSITO: Genera automáticamente componentes UI desde document-types-schema.json
 * ESTADO: development
 * DEPENDENCIAS: document-types-schema.json
 * OUTPUTS: Componentes React TypeScript para plantillas de documentos
 * ACTUALIZADO: 2025-09-23
 */

const fs = require('fs');
const path = require('path');

class UIComponentGenerator {
  constructor(schemaPath) {
    this.schemaPath = schemaPath;
    this.schema = this.loadSchema();
  }

  loadSchema() {
    const schemaContent = fs.readFileSync(this.schemaPath, 'utf8');
    return JSON.parse(schemaContent);
  }

  generateTypeDefinitions(documentType, typeConfig) {
    const tableName = typeConfig.metadata.table_name;
    const primaryFields = typeConfig.database_schema.primary_fields;
    const detailFields = typeConfig.database_schema.detail_fields;
    const topicFields = typeConfig.database_schema.topic_fields || [];
    
    let types = `// Tipos basados en la tabla ${tableName}\n`;
    types += `export type Extracted${this.capitalize(documentType)} = {\n`;
    types += `  id: string;\n`;
    types += `  document_id: string;\n`;
    types += `  organization_id: string;\n`;
    types += `  created_at: string;\n`;
    
    [...primaryFields, ...detailFields, ...topicFields].forEach(field => {
      const tsType = this.mapToTypeScript(field.type);
      const nullable = field.required ? '' : ' | null';
      types += `  ${field.name}: ${tsType}${nullable};\n`;
    });
    
    types += `};\n\n`;
    
    // Tipo para metadatos adicionales
    types += `export type ${this.capitalize(documentType)}Metadata = {\n`;
    [...primaryFields, ...detailFields, ...topicFields].forEach(field => {
      const tsType = this.mapToTypeScript(field.type);
      types += `  ${field.name}?: ${tsType};\n`;
    });
    types += `};\n\n`;
    
    return types;
  }

  generateImports(typeConfig) {
    const commonImports = this.schema.generation_rules.ui_components.common_imports;
    
    let imports = `/**\n`;
    imports += ` * ARCHIVO: ${typeConfig.metadata.component_name}.tsx\n`;
    imports += ` * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo ${typeConfig.metadata.display_name}\n`;
    imports += ` * ESTADO: development\n`;
    imports += ` * DEPENDENCIAS: ${commonImports.join(', ')}\n`;
    imports += ` * OUTPUTS: Vista detallada optimizada para ${typeConfig.metadata.display_name}\n`;
    imports += ` * ACTUALIZADO: ${new Date().toISOString().split('T')[0]}\n`;
    imports += ` */\n\n`;
    
    // Imports de UI components
    imports += `import { Badge } from '@/components/ui/badge';\n`;
    imports += `import { Card, CardContent, CardHeader } from '@/components/ui/card';\n`;
    imports += `import { Separator } from '@/components/ui/separator';\n`;
    imports += `import { T } from '@/components/ui/Typography';\n`;
    
    // Icons dinámicos basados en secciones
    const icons = this.extractIcons(typeConfig.ui_template.sections);
    imports += `import { ${icons.join(', ')} } from 'lucide-react';\n\n`;
    
    return imports;
  }

  extractIcons(sections) {
    const icons = new Set(['Calendar', 'Clock']); // Icons comunes
    sections.forEach(section => {
      if (section.icon) {
        icons.add(section.icon);
      }
    });
    return Array.from(icons);
  }

  generateHelperFunctions() {
    return `// Funciones de formateo\nconst formatDate = (date: string | null): string => {\n  if (!date) return '❌ No especificada';\n  try {\n    return new Date(date).toLocaleDateString('es-ES');\n  } catch {\n    return date;\n  }\n};\n\nconst formatAmount = (amount: number | null): string => {\n  if (!amount) return '❌ No especificado';\n  return new Intl.NumberFormat('es-ES', {\n    style: 'currency',\n    currency: 'EUR'\n  }).format(amount);\n};\n\nconst formatArray = (arr: any[] | null): string => {\n  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'No especificado';\n  return arr.join(', ');\n};\n\n`;
  }

  generateSection(section, documentType, typeConfig) {
    const iconComponent = section.icon || 'FileText';
    const sectionColor = typeConfig.metadata.color === 'blue' ? 'blue-600' : 
                        typeConfig.metadata.color === 'green' ? 'green-600' :
                        typeConfig.metadata.color === 'orange' ? 'orange-600' : 'gray-600';
    
    let sectionCode = `          {/* ${section.title} */}\n`;
    sectionCode += `          <Card>\n`;
    sectionCode += `            <CardHeader className="pb-3">\n`;
    sectionCode += `              <div className="flex items-center gap-2">\n`;
    sectionCode += `                <${iconComponent} className="h-5 w-5 text-${sectionColor}" />\n`;
    sectionCode += `                <T.H4 className="mb-0">${section.title}</T.H4>\n`;
    sectionCode += `              </div>\n`;
    sectionCode += `            </CardHeader>\n`;
    sectionCode += `            <CardContent className="space-y-3">\n`;
    
    // Detectar si es sección de temas para usar grid layout
    const isTopicSection = section.fields.some(field => field.startsWith('topic_'));
    const layoutClass = isTopicSection ? 'grid grid-cols-2 gap-2 text-sm' : 'space-y-2 text-sm';
    
    sectionCode += `              <div className="${layoutClass}">\n`;
    
    // Generar campos de la sección
    section.fields.forEach(fieldName => {
      const fieldConfig = this.findFieldConfig(fieldName, typeConfig);
      if (fieldConfig) {
        sectionCode += this.generateFieldDisplay(fieldName, fieldConfig, documentType);
      }
    });
    
    sectionCode += `              </div>\n`;
    sectionCode += `            </CardContent>\n`;
    sectionCode += `          </Card>\n\n`;
    
    return sectionCode;
  }

  findFieldConfig(fieldName, typeConfig) {
    const allFields = [
      ...typeConfig.database_schema.primary_fields,
      ...typeConfig.database_schema.detail_fields,
      ...(typeConfig.database_schema.topic_fields || [])
    ];
    return allFields.find(field => field.name === fieldName);
  }

  generateFieldDisplay(fieldName, fieldConfig, documentType) {
    let fieldCode = `                <div className="flex justify-between">\n`;
    fieldCode += `                  <span className="text-muted-foreground">${this.humanizeFieldName(fieldName)}:</span>\n`;
    
    // Lógica de formateo según tipo
    if (fieldConfig.type === 'date') {
      fieldCode += `                  <span className={${documentType}Data.${fieldName} ? 'text-primary font-medium' : 'text-destructive'}>\n`;
      fieldCode += `                    {formatDate(${documentType}Data.${fieldName})}\n`;
    } else if (fieldConfig.type === 'numeric' && fieldName.includes('precio')) {
      fieldCode += `                  <span className={${documentType}Data.${fieldName} ? 'text-green-600 font-bold' : 'text-destructive'}>\n`;
      fieldCode += `                    {formatAmount(${documentType}Data.${fieldName})}\n`;
    } else if (fieldConfig.type === 'boolean') {
      fieldCode += `                  <span className={${documentType}Data.${fieldName} ? 'text-green-600' : 'text-gray-500'}>\n`;
      fieldCode += `                    {${documentType}Data.${fieldName} ? '✅ Sí' : '❌ No'}\n`;
    } else if (fieldConfig.type === 'jsonb') {
      fieldCode += `                  <span className="text-primary">\n`;
      fieldCode += `                    {formatArray(${documentType}Data.${fieldName})}\n`;
    } else {
      fieldCode += `                  <span className={${documentType}Data.${fieldName} ? 'text-primary font-medium' : 'text-destructive'}>\n`;
      fieldCode += `                    {${documentType}Data.${fieldName} || '❌ No especificado'}\n`;
    }
    
    fieldCode += `                  </span>\n`;
    fieldCode += `                </div>\n`;
    
    return fieldCode;
  }

  generateComponent(documentType, typeConfig) {
    const componentName = typeConfig.metadata.component_name;
    const sections = typeConfig.ui_template.sections;
    
    let component = this.generateImports(typeConfig);
    component += this.generateTypeDefinitions(documentType, typeConfig);
    component += this.generateHelperFunctions();
    
    // Props interface
    component += `interface ${componentName}Props {\n`;
    component += `  ${documentType}Data: Extracted${this.capitalize(documentType)};\n`;
    component += `  metadata?: ${this.capitalize(documentType)}Metadata;\n`;
    component += `  confidence: number;\n`;
    component += `  extractionMethod: string;\n`;
    component += `  processingTime: number;\n`;
    component += `  tokensUsed: number;\n`;
    component += `}\n\n`;
    
    // Componente principal
    component += `export function ${componentName}({\n`;
    component += `  ${documentType}Data,\n`;
    component += `  metadata,\n`;
    component += `  confidence,\n`;
    component += `  extractionMethod,\n`;
    component += `  processingTime,\n`;
    component += `  tokensUsed\n`;
    component += `}: ${componentName}Props) {\n`;
    component += `  return (\n`;
    component += `    <div className="space-y-6">\n`;
    component += `      {/* Header con metadatos de extracción */}\n`;
    component += `      <div className="flex items-center justify-between">\n`;
    component += `        <div className="flex items-center gap-2">\n`;
    component += `          <span className="text-2xl">${typeConfig.metadata.icon}</span>\n`;
    component += `          <T.H3>${typeConfig.metadata.display_name}</T.H3>\n`;
    component += `        </div>\n`;
    component += `        <div className="flex gap-2">\n`;
    component += `          <Badge variant="outline">Confianza: {(confidence * 100).toFixed(1)}%</Badge>\n`;
    component += `          <Badge variant="secondary">{extractionMethod}</Badge>\n`;
    component += `        </div>\n`;
    component += `      </div>\n\n`;
    component += `      <Separator />\n\n`;
    
    // Generar secciones
    sections.forEach(section => {
      component += this.generateSection(section, documentType, typeConfig);
    });
    
    // Footer con estadísticas
    component += `      {/* Estadísticas de procesamiento */}\n`;
    component += `      <Card className="bg-muted/20">\n`;
    component += `        <CardContent className="pt-4">\n`;
    component += `          <div className="flex justify-between text-sm text-muted-foreground">\n`;
    component += `            <div className="flex items-center gap-1">\n`;
    component += `              <Clock className="h-4 w-4" />\n`;
    component += `              <span>Tiempo: {processingTime}ms</span>\n`;
    component += `            </div>\n`;
    component += `            <div className="flex items-center gap-1">\n`;
    component += `              <span>Tokens: {tokensUsed}</span>\n`;
    component += `            </div>\n`;
    component += `          </div>\n`;
    component += `        </CardContent>\n`;
    component += `      </Card>\n`;
    component += `    </div>\n`;
    component += `  );\n`;
    component += `}\n\n`;
    
    // Export por defecto
    component += `export default ${componentName};\n`;
    
    return component;
  }

  generateComponentFile(documentType) {
    if (!this.schema.document_types[documentType]) {
      throw new Error(`Tipo de documento '${documentType}' no encontrado en schema`);
    }
    
    const typeConfig = this.schema.document_types[documentType];
    const componentCode = this.generateComponent(documentType, typeConfig);
    const filename = `${typeConfig.metadata.component_name}.tsx`;
    
    const outputPath = path.join(__dirname, '../../..', 'src', 'components', 'documents', 'templates', filename);
    
    // Crear directorio si no existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, componentCode);
    
    return {
      filename,
      path: outputPath,
      code: componentCode
    };
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  humanizeFieldName(fieldName) {
    // Mapa de traducciones para campos topic_*
    const topicTranslations = {
      'topic_presupuesto': 'Presupuesto',
      'topic_mantenimiento': 'Mantenimiento',
      'topic_administracion': 'Administración',
      'topic_piscina': 'Piscina',
      'topic_jardin': 'Jardín',
      'topic_limpieza': 'Limpieza',
      'topic_balance': 'Balance',
      'topic_paqueteria': 'Paquetería',
      'topic_energia': 'Energía',
      'topic_normativa': 'Normativa',
      'topic_proveedor': 'Proveedor',
      'topic_dinero': 'Dinero',
      'topic_ascensor': 'Ascensor',
      'topic_incendios': 'Incendios',
      'topic_porteria': 'Portería'
    };
    
    if (topicTranslations[fieldName]) {
      return topicTranslations[fieldName];
    }
    
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  mapToTypeScript(dbType) {
    const mapping = {
      'text': 'string',
      'numeric': 'number',
      'integer': 'number',
      'date': 'string',
      'boolean': 'boolean',
      'jsonb': 'any[]',
      'uuid': 'string'
    };
    return mapping[dbType] || 'any';
  }
}

// Función de utilidad para usar desde CLI
function generateComponent(documentType) {
  const schemaPath = path.join(__dirname, '../schemas/document-types-schema.json');
  const generator = new UIComponentGenerator(schemaPath);
  
  console.log(`Generando componente para: ${documentType}`);
  const result = generator.generateComponentFile(documentType);
  console.log(`Componente creado: ${result.filename}`);
  console.log(`Ruta: ${result.path}`);
  console.log('\\nCódigo generado:');
  console.log(result.code.substring(0, 1000) + '...');
}

// Si se ejecuta directamente
if (require.main === module) {
  const documentType = process.argv[2];
  if (!documentType) {
    console.error('Usage: node ui-component-generator.js <documentType>');
    process.exit(1);
  }
  generateComponent(documentType);
}

module.exports = {
  UIComponentGenerator,
  generateComponent
};