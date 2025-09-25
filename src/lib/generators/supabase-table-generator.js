/**
 * ARCHIVO: supabase-table-generator.js
 * PROPÓSITO: Genera automáticamente tablas de Supabase desde document-types-schema.json
 * ESTADO: development
 * DEPENDENCIAS: document-types-schema.json
 * OUTPUTS: Scripts SQL para crear tablas y migraciónes
 * ACTUALIZADO: 2025-09-23
 */

const fs = require('fs');
const path = require('path');

// Mapeo de tipos schema → PostgreSQL
const TYPE_MAPPING = {
  'text': 'text',
  'numeric': 'numeric',
  'integer': 'integer', 
  'date': 'date',
  'boolean': 'boolean',
  'jsonb': 'jsonb',
  'uuid': 'uuid',
  'timestamptz': 'timestamptz'
};

class SupabaseTableGenerator {
  constructor(schemaPath) {
    this.schemaPath = schemaPath;
    this.schema = this.loadSchema();
  }

  loadSchema() {
    const schemaContent = fs.readFileSync(this.schemaPath, 'utf8');
    return JSON.parse(schemaContent);
  }

  generateTableSQL(documentType, typeConfig) {
    const tableName = typeConfig.metadata.table_name;
    const baseColumns = this.schema.generation_rules.database.base_columns;
    const primaryFields = typeConfig.database_schema.primary_fields;
    const detailFields = typeConfig.database_schema.detail_fields;
    
    let sql = `-- Tabla para ${typeConfig.metadata.display_name}\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    
    // Columnas base
    const baseColumnSQLs = baseColumns.map(col => {
      let columnSQL = `  ${col.name} ${TYPE_MAPPING[col.type] || col.type}`;
      
      if (col.primary_key) columnSQL += ' PRIMARY KEY';
      if (col.default) columnSQL += ` DEFAULT ${col.default}`;
      if (col.references) columnSQL += ` REFERENCES ${col.references}`; 
      if (col.cascade) columnSQL += ' ON DELETE CASCADE';
      
      return columnSQL;
    });
    
    // Campos principales
    const primaryFieldSQLs = primaryFields.map(field => {
      const required = field.required ? ' NOT NULL' : '';
      return `  ${field.name} ${TYPE_MAPPING[field.type]}${required}`;
    });
    
    // Campos detalle
    const detailFieldSQLs = detailFields.map(field => {
      const required = field.required ? ' NOT NULL' : '';
      return `  ${field.name} ${TYPE_MAPPING[field.type]}${required}`;
    });
    
    // Comentarios de campos
    const commentSQLs = [];
    [...primaryFields, ...detailFields].forEach(field => {
      if (field.description) {
        commentSQLs.push(`COMMENT ON COLUMN ${tableName}.${field.name} IS '${field.description}';`);
      }
    });
    
    sql += [...baseColumnSQLs, ...primaryFieldSQLs, ...detailFieldSQLs].join(',\n');
    sql += '\n);\n\n';
    
    // Índices
    const indexes = this.schema.generation_rules.database.indexes;
    indexes.forEach(indexCol => {
      sql += `CREATE INDEX IF NOT EXISTS idx_${tableName}_${indexCol} ON ${tableName}(${indexCol});\n`;
    });
    
    sql += '\n';
    
    // Comentarios
    if (commentSQLs.length > 0) {
      sql += commentSQLs.join('\n') + '\n\n';
    }
    
    // RLS Policy
    sql += `-- RLS para ${tableName}\n`;
    sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;
    sql += `CREATE POLICY "${tableName}_organization_isolation" ON ${tableName}\n`;
    sql += `  FOR ALL USING (organization_id = get_user_organization_id());\n\n`;
    
    return sql;
  }

  generateAllTables() {
    let allSQL = `-- AUTO-GENERADO desde document-types-schema.json\n`;
    allSQL += `-- Fecha: ${new Date().toISOString()}\n`;
    allSQL += `-- Versión schema: ${this.schema.meta.version}\n\n`;
    
    Object.entries(this.schema.document_types).forEach(([docType, config]) => {
      allSQL += this.generateTableSQL(docType, config);
      allSQL += '\\n'.repeat(3);
    });
    
    return allSQL;
  }

  generateMigrationFile() {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substr(0, 14);
    const filename = `${timestamp}_auto_generated_document_tables.sql`;
    const sql = this.generateAllTables();
    
    const outputPath = path.join(__dirname, '../../..', 'supabase', 'migrations', filename);
    
    // Crear directorio si no existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, sql);
    
    return {
      filename,
      path: outputPath,
      sql
    };
  }

  generateSingleTable(documentType) {
    if (!this.schema.document_types[documentType]) {
      throw new Error(`Tipo de documento '${documentType}' no encontrado en schema`);
    }
    
    return this.generateTableSQL(documentType, this.schema.document_types[documentType]);
  }
}

// Función de utilidad para usar desde CLI
function generateTables(documentType = null) {
  const schemaPath = path.join(__dirname, '../schemas/document-types-schema.json');
  const generator = new SupabaseTableGenerator(schemaPath);
  
  if (documentType) {
    console.log(`Generando tabla para: ${documentType}`);
    console.log(generator.generateSingleTable(documentType));
  } else {
    console.log('Generando todas las tablas...');
    const migration = generator.generateMigrationFile();
    console.log(`Migración creada: ${migration.filename}`);
    console.log(`Ruta: ${migration.path}`);
    console.log('\\nSQL generado:');
    console.log(migration.sql);
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const documentType = process.argv[2];
  generateTables(documentType);
}

module.exports = {
  SupabaseTableGenerator,
  generateTables
};