#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generateCleanupSQL() {
  console.log('🔍 Generando SQL para limpiar TODOS los agentes duplicados...');
  
  // Obtener todos los agentes agrupados por nombre
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, created_at')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Agrupar por nombre
  const grouped = {};
  data.forEach(agent => {
    if (!grouped[agent.name]) {
      grouped[agent.name] = [];
    }
    grouped[agent.name].push(agent);
  });
  
  console.log('📊 ANÁLISIS DE DUPLICADOS:');
  let totalToDelete = 0;
  let sqlStatements = [];
  
  for (const [name, agents] of Object.entries(grouped)) {
    if (agents.length > 1) {
      const duplicates = agents.slice(1); // Mantener el primero (más antiguo)
      totalToDelete += duplicates.length;
      
      console.log(`   ${name}: ${agents.length} copias → eliminar ${duplicates.length}`);
      console.log(`     Mantener: ${agents[0].id} (${agents[0].created_at})`);
      
      // Generar SQL para este agente
      const idsToDelete = duplicates.map(agent => `'${agent.id}'`).join(', ');
      sqlStatements.push(`-- Limpiar duplicados de ${name}
DELETE FROM agents WHERE id IN (${idsToDelete});`);
      
    } else {
      console.log(`   ${name}: ${agents.length} copia → OK`);
    }
  }
  
  console.log(`\n📈 RESUMEN:`);
  console.log(`   Total agentes: ${data.length}`);
  console.log(`   Agentes únicos: ${Object.keys(grouped).length}`);
  console.log(`   A eliminar: ${totalToDelete}`);
  console.log(`   Resultado final: ${data.length - totalToDelete} agentes`);
  
  if (sqlStatements.length > 0) {
    console.log(`\n🗑️ SQL COMPLETO PARA LIMPIAR DUPLICADOS:`);
    console.log('='.repeat(60));
    
    const fullSQL = `-- ARCHIVO: clean_all_duplicate_agents.sql
-- PROPÓSITO: Eliminar todos los agentes duplicados manteniendo el más antiguo de cada tipo
-- ESTADO: ready_to_execute
-- DEPENDENCIAS: tabla agents
-- OUTPUTS: Elimina ${totalToDelete} registros duplicados
-- ACTUALIZADO: 2025-09-18

-- Verificar estado actual
SELECT name, count(*) as copies 
FROM agents 
WHERE is_active = true 
GROUP BY name 
HAVING count(*) > 1
ORDER BY name;

${sqlStatements.join('\n\n')}

-- Verificar resultado final
SELECT name, count(*) as copies 
FROM agents 
WHERE is_active = true 
GROUP BY name 
ORDER BY name;`;

    console.log(fullSQL);
    
    // Guardar en archivo
    require('fs').writeFileSync('clean_all_duplicate_agents.sql', fullSQL);
    console.log('\n✅ SQL guardado en: clean_all_duplicate_agents.sql');
    
  } else {
    console.log('\n✅ No hay duplicados que limpiar');
  }
}

generateCleanupSQL().catch(console.error);