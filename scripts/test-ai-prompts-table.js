/**
 * ARCHIVO: test-ai-prompts-table.js
 * PROPÓSITO: Verificar si la tabla ai_prompts ya existe y obtener el prompt de ACTA
 * ESTADO: testing
 * DEPENDENCIAS: @supabase/supabase-js
 * OUTPUTS: Verificación de tabla ai_prompts existente
 * ACTUALIZADO: 2025-09-15
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzMDA5NDMsImV4cCI6MjA0MTg3Njk0M30.ZtNqGDynKW4aMYHm7AggpZcKNa0XkF8YPCDHcxFLq8I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAiPromptsTable() {
  console.log('🔍 [Test] Verificando tabla ai_prompts...');
  
  try {
    // Intentar obtener prompts existentes
    const { data: prompts, error } = await supabase
      .from('ai_prompts')
      .select('name, version, is_active, category, description')
      .limit(10);

    if (error) {
      console.log('❌ [Test] Error accediendo a ai_prompts:', error.message);
      console.log('🤔 [Test] La tabla ai_prompts probablemente no existe aún');
      return false;
    }

    console.log('✅ [Test] Tabla ai_prompts existe y es accesible');
    console.log('📊 [Test] Prompts encontrados:', prompts?.length || 0);
    
    if (prompts && prompts.length > 0) {
      console.log('📋 [Test] Lista de prompts:');
      prompts.forEach(prompt => {
        console.log(`   📄 ${prompt.name} v${prompt.version} (${prompt.category})`);
        console.log(`      ${prompt.description}`);
        console.log(`      Estado: ${prompt.is_active ? '✅ ACTIVO' : '❌ inactivo'}`);
        console.log('');
      });
    } else {
      console.log('📭 [Test] No hay prompts en la tabla (tabla vacía)');
    }

    // Verificar específicamente el prompt de ACTA
    console.log('🎯 [Test] Buscando prompt acta_metadata_extraction...');
    
    const { data: actaPrompt, error: actaError } = await supabase
      .from('ai_prompts')
      .select('name, template, variables, model_config')
      .eq('name', 'acta_metadata_extraction')
      .eq('is_active', true)
      .single();

    if (actaError || !actaPrompt) {
      console.log('❌ [Test] Prompt de ACTA no encontrado');
      console.log('   Error:', actaError?.message || 'No data');
      return false;
    }

    console.log('✅ [Test] Prompt de ACTA encontrado y activo');
    console.log('📏 [Test] Template size:', actaPrompt.template?.length || 0, 'caracteres');
    console.log('🔧 [Test] Variables definidas:', Object.keys(actaPrompt.variables || {}).join(', '));
    
    // Mostrar una muestra del template
    if (actaPrompt.template) {
      console.log('📝 [Test] Muestra del template (primeros 300 caracteres):');
      console.log('   ', actaPrompt.template.substring(0, 300) + '...');
    }

    return true;

  } catch (error) {
    console.log('❌ [Test] Error inesperado:', error.message);
    return false;
  }
}

// Ejecutar test
testAiPromptsTable()
  .then(exists => {
    if (exists) {
      console.log('\n🎉 [Test] Tabla ai_prompts lista para usar');
    } else {
      console.log('\n⚠️ [Test] Tabla ai_prompts no está disponible');
    }
  })
  .catch(console.error);