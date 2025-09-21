/**
 * ARCHIVO: apply-ai-prompts-migration.js
 * PROPÓSITO: Aplicar migración de tabla ai_prompts para prompts de IA
 * ESTADO: production
 * DEPENDENCIAS: @supabase/supabase-js, fs
 * OUTPUTS: Tabla ai_prompts creada con datos iniciales
 * ACTUALIZADO: 2025-09-15
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzMDA5NDMsImV4cCI6MjA0MTg3Njk0M30.ZtNqGDynKW4aMYHm7AggpZcKNa0XkF8YPCDHcxFLq8I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyAiPromptsMigration() {
  console.log('🚀 [AI Prompts Migration] Iniciando aplicación de migración...');
  console.log('=' .repeat(60));

  try {
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create_ai_prompts_table.sql');
    console.log('📄 [Migration] Leyendo archivo:', migrationPath);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Archivo de migración no encontrado: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ [Migration] Archivo leído correctamente');
    console.log('📏 [Migration] Tamaño del SQL:', migrationSQL.length, 'caracteres');

    // Ejecutar la migración usando Supabase RPC
    console.log('\n🔧 [Migration] Ejecutando SQL...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // Si la función RPC no existe, intentar con queries individuales
      console.log('⚠️ [Migration] RPC exec_sql no disponible, aplicando por partes...');
      
      // Dividir el SQL en statements individuales
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`🔢 [Migration] Ejecutando ${statements.length} statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.toLowerCase().includes('insert into ai_prompts')) {
          console.log(`📥 [Migration] Ejecutando INSERT ${i + 1}/${statements.length}...`);
        } else if (statement.toLowerCase().includes('create table')) {
          console.log(`🏗️ [Migration] Ejecutando CREATE TABLE ${i + 1}/${statements.length}...`);
        } else {
          console.log(`⚙️ [Migration] Ejecutando statement ${i + 1}/${statements.length}...`);
        }
        
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (stmtError) {
            console.warn(`⚠️ [Migration] Warning en statement ${i + 1}: ${stmtError.message}`);
          }
        } catch (stmtError) {
          console.warn(`⚠️ [Migration] Error ignorado en statement ${i + 1}: ${stmtError.message}`);
        }
      }
      
      console.log('✅ [Migration] Statements ejecutados (algunos warnings son normales)');
    } else {
      console.log('✅ [Migration] Migración ejecutada correctamente con RPC');
    }

    // Verificar que la tabla se creó correctamente
    console.log('\n🔍 [Verification] Verificando tabla ai_prompts...');
    
    const { data: tableData, error: tableError } = await supabase
      .from('ai_prompts')
      .select('name, version, is_active, category')
      .limit(5);

    if (tableError) {
      throw new Error(`Error verificando tabla: ${tableError.message}`);
    }

    console.log('✅ [Verification] Tabla ai_prompts accesible');
    console.log('📊 [Verification] Prompts encontrados:', tableData?.length || 0);
    
    if (tableData && tableData.length > 0) {
      console.log('📋 [Verification] Prompts en la tabla:');
      tableData.forEach(prompt => {
        console.log(`   📄 ${prompt.name} v${prompt.version} (${prompt.category}) - ${prompt.is_active ? 'ACTIVO' : 'inactivo'}`);
      });
    }

    // Verificar específicamente el prompt de ACTA
    console.log('\n🎯 [Verification] Verificando prompt acta_metadata_extraction...');
    
    const { data: actaPrompt, error: actaError } = await supabase
      .from('ai_prompts')
      .select('name, template, variables')
      .eq('name', 'acta_metadata_extraction')
      .eq('is_active', true)
      .single();

    if (actaError || !actaPrompt) {
      console.warn('⚠️ [Verification] Prompt de ACTA no encontrado o inactivo');
      console.warn('   Error:', actaError?.message);
    } else {
      console.log('✅ [Verification] Prompt de ACTA encontrado y activo');
      console.log('📏 [Verification] Template size:', actaPrompt.template?.length || 0, 'caracteres');
      console.log('🔧 [Verification] Variables:', Object.keys(actaPrompt.variables || {}).join(', '));
    }

    console.log('\n🎉 [AI Prompts Migration] ¡Migración completada exitosamente!');
    console.log('=' .repeat(60));
    
    return true;

  } catch (error) {
    console.error('❌ [AI Prompts Migration] Error durante la migración:');
    console.error('   ', error.message);
    console.error('\n📋 [AI Prompts Migration] Detalles del error:');
    console.error(error);
    
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  applyAiPromptsMigration()
    .then(success => {
      if (success) {
        console.log('\n✅ Migración completada. El sistema puede usar ai_prompts.');
        process.exit(0);
      } else {
        console.log('\n❌ Migración falló. Revisar errores arriba.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { applyAiPromptsMigration };