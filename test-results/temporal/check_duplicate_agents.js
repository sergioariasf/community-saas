#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDuplicateAgents() {
  console.log('🔍 Verificando si los agentes duplicados son idénticos...');
  
  // Verificar comunicado_extractor_v1
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, purpose, prompt_template')
    .eq('name', 'comunicado_extractor_v1')
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`📊 Analizando ${data.length} copias de comunicado_extractor_v1:`);
  
  // Comparar contenido
  const first = data[0];
  let allIdentical = true;
  
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    if (
      current.purpose !== first.purpose ||
      current.prompt_template !== first.prompt_template
    ) {
      allIdentical = false;
      console.log(`❌ Copia ${i+1} es DIFERENTE:`);
      console.log(`   Purpose igual: ${current.purpose === first.purpose}`);
      console.log(`   Prompt igual: ${current.prompt_template === first.prompt_template}`);
      
      if (current.purpose !== first.purpose) {
        console.log('   Purpose 1:', first.purpose);
        console.log('   Purpose ' + (i+1) + ':', current.purpose);
      }
      
      if (current.prompt_template !== first.prompt_template) {
        console.log('   Prompt lengths:', first.prompt_template.length, 'vs', current.prompt_template.length);
      }
      break;
    }
  }
  
  if (allIdentical) {
    console.log('✅ Todas las copias son IDÉNTICAS');
    console.log(`📝 Purpose: ${first.purpose}`);
    console.log(`📏 Prompt length: ${first.prompt_template.length} caracteres`);
    console.log(`📋 Prompt preview: ${first.prompt_template.substring(0, 100)}...`);
    
    console.log('\n🗑️ Se pueden eliminar las copias extras sin problemas');
    console.log('IDs de duplicados a eliminar:');
    data.slice(1).forEach((agent, i) => {
      console.log(`   ${i+2}. ${agent.id}`);
    });
    
    console.log('\n📋 SQL para limpiar duplicados:');
    const idsToDelete = data.slice(1).map(agent => `'${agent.id}'`).join(', ');
    console.log(`DELETE FROM agents WHERE id IN (${idsToDelete});`);
    
  } else {
    console.log('⚠️ Las copias son DIFERENTES - revisar antes de eliminar');
  }
}

checkDuplicateAgents().catch(console.error);