/**
 * ARCHIVO: update-database-schema.js
 * PROPÓSITO: Genera automáticamente documentación COMPLETA del esquema de BD para contexto de programación
 * ESTADO: production
 * DEPENDENCIAS: @supabase/supabase-js, dotenv, fs, supabase/status/*.csv
 * OUTPUTS: supabase/database_schema_current.md con esquema completo, tablas, RLS, triggers, etc.
 * ACTUALIZADO: 2025-09-22
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

async function updateDatabaseSchema() {
  console.log('🔍 [SCHEMA] Conectando a Supabase...');
  
  try {
    // Crear cliente de Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('📊 [SCHEMA] Generando esquema de base de datos...');

    // Generar esquema básico directamente
    await generateBasicSchema(supabase);

  } catch (error) {
    console.error('❌ [SCHEMA] Error general:', error);
    process.exit(1);
  }
}

async function generateBasicSchema(supabase) {
  console.log('🔄 [SCHEMA] Generando esquema COMPLETO...');
  
  const results = {};
  
  try {
    // 1. Leer información completa desde status/*.csv
    console.log('📋 [SCHEMA] Cargando información desde supabase/status...');
    await loadStatusFiles(results);
    
    // 2. Obtener información mediante consulta directa de tablas conocidas
    console.log('📊 [SCHEMA] Verificando tablas conocidas...');
    
    const knownTables = [
      'documents', 'agents', 'communities', 'community_members', 
      'issues', 'issue_comments', 'extracted_minutes', 
      'extracted_communications', 'extracted_contracts', 
      'extracted_invoices', 'document_chunks', 'organizations',
      'user_roles', 'vector_embeddings', 'document_classifications',
      'document_metadata', 'items', 'private_items'
    ];
    
    const tableInfo = [];
    const extractedTables = [];
    
    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (!error) {
          tableInfo.push({ table_name: tableName, table_type: 'BASE TABLE' });
          if (tableName.startsWith('extracted_')) {
            extractedTables.push({ table_name: tableName });
          }
          console.log(`✅ [SCHEMA] Tabla verificada: ${tableName}`);
        }
      } catch (err) {
        console.log(`⚠️ [SCHEMA] Tabla no encontrada: ${tableName}`);
      }
    }
    
    results.tables = tableInfo;
    results.extracted_tables = extractedTables;
    console.log(`✅ [SCHEMA] Encontradas ${results.tables.length} tablas verificadas`);

    // Obtener muestra de la tabla documents
    console.log('📄 [SCHEMA] Obteniendo muestra de tabla documents...');
    const { data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);
      
    if (documentsError) {
      console.warn('⚠️ [SCHEMA] Error obteniendo muestra documents:', documentsError.message);
      results.documents = [];
    } else {
      // Extraer estructura de columnas del primer registro
      if (documentsData && documentsData.length > 0) {
        const sampleDoc = documentsData[0];
        results.documents = Object.keys(sampleDoc).map(key => ({
          column_name: key,
          data_type: typeof sampleDoc[key],
          is_nullable: sampleDoc[key] === null ? 'YES' : 'NO',
          column_default: null
        }));
        console.log(`✅ [SCHEMA] Estructura documents inferida: ${results.documents.length} columnas`);
      } else {
        results.documents = [];
      }
    }

    // Obtener agentes activos
    console.log('🤖 [SCHEMA] Obteniendo agentes activos...');
    const { data: agentsData, error: agentsError } = await supabase
      .from('agents')
      .select('name, is_active, created_at')
      .eq('is_active', true)
      .order('name');
      
    if (agentsError) {
      console.warn('⚠️ [SCHEMA] Error obteniendo agentes:', agentsError.message);
      results.agents = [];
    } else {
      results.agents = agentsData || [];
      console.log(`✅ [SCHEMA] Encontrados ${results.agents.length} agentes activos`);
    }

    // Obtener tablas extracted_* de la lista de tablas
    results.extracted_tables = results.tables.filter(table => 
      table.table_name.startsWith('extracted_')
    );
    console.log(`✅ [SCHEMA] Encontradas ${results.extracted_tables.length} tablas extracted_*`);

  } catch (err) {
    console.warn(`⚠️ [SCHEMA] Exception general:`, err.message);
    results.tables = [];
    results.documents = [];
    results.agents = [];
    results.extracted_tables = [];
  }

  const markdown = generateCompleteMarkdown(results);
  
  const outputPath = path.join(__dirname, '../database_schema_current.md');
  await fs.writeFile(outputPath, markdown);
  
  console.log(`✅ [SCHEMA] Esquema COMPLETO generado: ${outputPath}`);
}

function generateMarkdown(data) {
  const timestamp = new Date().toISOString();
  
  return `# 🗄️ Database Schema - Community SaaS

**Última actualización:** ${timestamp}
**Generado automáticamente por:** scripts/update-database-schema.js

## 📊 Esquema Completo

\`\`\`sql
${data}
\`\`\`

---
*Este archivo se actualiza automáticamente. No editar manualmente.*
`;
}

async function loadStatusFiles(results) {
  console.log('📂 [SCHEMA] Cargando archivos de status...');
  
  try {
    // Cargar CSV de tablas
    const tablesPath = path.join(__dirname, '../status/Supabase Snippet Public Schema Table Inventory.csv');
    const tablesContent = await fs.readFile(tablesPath, 'utf8');
    results.allTables = parseCSV(tablesContent);
    console.log(`✅ [SCHEMA] Tablas cargadas: ${results.allTables.length}`);
    
    // Cargar CSV de columnas
    const columnsPath = path.join(__dirname, '../status/Supabase Snippet COLUMNAS DE TODAS LAS TABLAS.csv');
    const columnsContent = await fs.readFile(columnsPath, 'utf8');
    results.allColumns = parseCSV(columnsContent);
    console.log(`✅ [SCHEMA] Columnas cargadas: ${results.allColumns.length}`);
    
    // Cargar CSV de RLS policies
    const rlsPath = path.join(__dirname, '../status/Supabase Snippet Row-Level Security Policies Overview (public schema).csv');
    const rlsContent = await fs.readFile(rlsPath, 'utf8');
    results.rlsPolicies = parseCSV(rlsContent);
    console.log(`✅ [SCHEMA] RLS Policies cargadas: ${results.rlsPolicies.length}`);
    
    // Cargar CSV de foreign keys
    const fkPath = path.join(__dirname, '../status/Supabase Snippet Foreign Key References and Rules.csv');
    const fkContent = await fs.readFile(fkPath, 'utf8');
    results.foreignKeys = parseCSV(fkContent);
    console.log(`✅ [SCHEMA] Foreign Keys cargadas: ${results.foreignKeys.length}`);
    
    // Cargar CSV de índices
    const indexPath = path.join(__dirname, '../status/Supabase Snippet Public Indexes Inventory.csv');
    const indexContent = await fs.readFile(indexPath, 'utf8');
    results.indexes = parseCSV(indexContent);
    console.log(`✅ [SCHEMA] Índices cargados: ${results.indexes.length}`);
    
  } catch (error) {
    console.warn('⚠️ [SCHEMA] Error cargando archivos status:', error.message);
    results.allTables = [];
    results.allColumns = [];
    results.rlsPolicies = [];
    results.foreignKeys = [];
    results.indexes = [];
  }
}

function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length <= 1) return [];
  
  const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const values = line.split('|').map(v => v.trim()).filter((v, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });
        data.push(row);
      }
    }
  }
  
  return data;
}

function generateCompleteMarkdown(results) {
  const timestamp = new Date().toISOString();
  
  let markdown = `# 🗄️ Database Schema - Community SaaS (COMPLETO)

**Última actualización:** ${timestamp}  
**Generado automáticamente por:** supabase/scripts/update-database-schema.js  
**Para:** Contexto completo de programación

---

## 📊 RESUMEN EJECUTIVO

`;

  // Resumen de tablas
  if (results.allTables && results.allTables.length > 0) {
    const baseTables = results.allTables.filter(t => t.table_type === 'BASE TABLE');
    const views = results.allTables.filter(t => t.table_type === 'VIEW');
    
    markdown += `- **${results.allTables.length} tablas totales** (${baseTables.length} BASE TABLE + ${views.length} VIEW)\n`;
    markdown += `- **${results.allColumns?.length || 0} columnas** en total\n`;
    markdown += `- **${results.rlsPolicies?.length || 0} políticas RLS** activas\n`;
    markdown += `- **${results.foreignKeys?.length || 0} foreign keys** definidas\n`;
    markdown += `- **${results.indexes?.length || 0} índices** para optimización\n`;
    markdown += `- **${results.agents?.length || 0} agentes IA** activos\n\n`;
  }

  // TABLAS COMPLETAS
  if (results.allTables && results.allTables.length > 0) {
    markdown += `## 📋 TODAS LAS TABLAS\n\n`;
    markdown += `| Tabla | Tipo | Insertable | Descripción |\n`;
    markdown += `|-------|------|------------|-------------|\n`;
    
    results.allTables.forEach(table => {
      let desc = '';
      if (table.table_name.startsWith('extracted_')) desc = '🎯 Metadatos extraídos';
      else if (table.table_name === 'documents') desc = '📄 Sistema de documentos';
      else if (table.table_name === 'agents') desc = '🤖 Agentes IA';
      else if (table.table_name === 'communities') desc = '🏘️ Comunidades';
      else if (table.table_name.includes('incident')) desc = '⚠️ Sistema incidencias';
      else if (table.table_name.includes('organization')) desc = '🏢 Multi-tenant';
      
      markdown += `| **${table.table_name}** | ${table.table_type} | ${table.is_insertable_into} | ${desc} |\n`;
    });
    markdown += `\n`;
  }

  // ESTRUCTURA DOCUMENTS (tabla crítica)
  if (results.documents && results.documents.length > 0) {
    markdown += `## 📄 ESTRUCTURA CRÍTICA: documents\n\n`;
    markdown += `| Columna | Tipo | Nullable | Propósito |\n`;
    markdown += `|---------|------|----------|----------|\n`;
    results.documents.forEach(col => {
      let purpose = '';
      if (col.column_name.includes('status')) purpose = '🔄 Estado del pipeline';
      else if (col.column_name.includes('error')) purpose = '❌ Control de errores';
      else if (col.column_name.includes('completed_at')) purpose = '⏱️ Timestamps de procesamiento';
      else if (col.column_name.includes('extraction')) purpose = '📝 Extracción de texto';
      else if (col.column_name.includes('classification')) purpose = '🏷️ Clasificación IA';
      else if (col.column_name.includes('metadata')) purpose = '🎯 Metadatos estructurados';
      else if (col.column_name.includes('chunking')) purpose = '🧩 Fragmentación RAG';
      
      markdown += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${purpose} |\n`;
    });
    markdown += `\n`;
  }

  // RLS POLICIES (seguridad crítica)
  if (results.rlsPolicies && results.rlsPolicies.length > 0) {
    markdown += `## 🔐 POLÍTICAS RLS (Row Level Security)\n\n`;
    markdown += `| Tabla | Política | Comando | Rol | Condición |\n`;
    markdown += `|-------|----------|---------|-----|----------|\n`;
    results.rlsPolicies.forEach(policy => {
      markdown += `| ${policy.table_name} | **${policy.policy_name}** | ${policy.command} | ${policy.roles || 'ALL'} | \`${policy.condition || 'N/A'}\` |\n`;
    });
    markdown += `\n`;
  }

  // FOREIGN KEYS (relaciones críticas)
  if (results.foreignKeys && results.foreignKeys.length > 0) {
    markdown += `## 🔗 RELACIONES (Foreign Keys)\n\n`;
    markdown += `| Tabla Origen | Columna | → | Tabla Destino | Columna | Acción |\n`;
    markdown += `|--------------|---------|---|---------------|---------|--------|\n`;
    results.foreignKeys.forEach(fk => {
      markdown += `| ${fk.table_name} | \`${fk.column_name}\` | → | ${fk.foreign_table_name} | \`${fk.foreign_column_name}\` | ${fk.delete_rule || 'RESTRICT'} |\n`;
    });
    markdown += `\n`;
  }

  // ÍNDICES (optimización)
  if (results.indexes && results.indexes.length > 0) {
    markdown += `## ⚡ ÍNDICES DE RENDIMIENTO\n\n`;
    markdown += `| Tabla | Índice | Columnas | Único | Método |\n`;
    markdown += `|-------|--------|----------|-------|--------|\n`;
    results.indexes.forEach(idx => {
      markdown += `| ${idx.table_name} | \`${idx.index_name}\` | ${idx.column_names || 'N/A'} | ${idx.is_unique} | ${idx.index_type || 'btree'} |\n`;
    });
    markdown += `\n`;
  }

  // AGENTES IA (lógica de negocio)
  if (results.agents && results.agents.length > 0) {
    markdown += `## 🤖 AGENTES IA ACTIVOS\n\n`;
    results.agents.forEach(agent => {
      markdown += `### ${agent.name}\n`;
      markdown += `- **Creado:** ${agent.created_at}\n`;
      markdown += `- **Estado:** ${agent.is_active ? '✅ Activo' : '❌ Inactivo'}\n\n`;
    });
  }

  // TABLAS EXTRACTED (metadatos estructurados)
  if (results.extracted_tables && results.extracted_tables.length > 0) {
    markdown += `## 🎯 METADATOS EXTRAÍDOS\n\n`;
    results.extracted_tables.forEach(table => {
      markdown += `- **${table.table_name}** - Metadatos estructurados\n`;
    });
    markdown += `\n`;
  }

  markdown += `---\n\n## 💡 NOTAS PARA PROGRAMACIÓN\n\n`;
  markdown += `1. **Pipeline de documentos:** documents → extracted_* (por tipo)\n`;
  markdown += `2. **Seguridad:** RLS activo en todas las tablas críticas\n`;
  markdown += `3. **Multi-tenant:** Via organization_id en tablas principales\n`;
  markdown += `4. **IA/RAG:** Agentes especializados + document_chunks + vector_embeddings\n`;
  markdown += `5. **Estado:** Tracking completo en columnas *_status y *_completed_at\n\n`;
  
  markdown += `*Este archivo se actualiza automáticamente. No editar manualmente.*\n`;
  
  return markdown;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateDatabaseSchema().catch(console.error);
}

module.exports = { updateDatabaseSchema };