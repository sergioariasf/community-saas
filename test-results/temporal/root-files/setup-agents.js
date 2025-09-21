#!/usr/bin/env node

/**
 * Script para configurar los agentes SaaS en Supabase
 * Ejecuta el archivo setup_agents.sql usando las credenciales de .env.local
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

async function setupAgents() {
  console.log('🤖 Configurando agentes SaaS...');

  try {
    // Crear cliente de Supabase con service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('❌ Variables de entorno de Supabase no encontradas en .env.local');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔗 Conectando a Supabase...');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'setup_agents.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el SQL en comandos individuales
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Ejecutando ${sqlCommands.length} comandos SQL...`);

    // Ejecutar cada comando
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      if (command.toUpperCase().startsWith('SELECT')) {
        // Para SELECT, mostrar los resultados
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: command 
        });
        
        if (error && !error.message.includes('does not exist')) {
          console.warn(`⚠️  Warning en comando ${i + 1}:`, error.message);
        } else if (data) {
          console.log(`✅ Comando ${i + 1} ejecutado:`, data);
        }
      } else {
        // Para otros comandos, ejecutar directamente
        try {
          if (command.toUpperCase().includes('INSERT INTO agents')) {
            // Insertar agentes uno por uno para mejor control
            await insertAgentsDirectly(supabase);
            console.log('✅ Agentes insertados correctamente');
          } else if (command.toUpperCase().includes('DELETE FROM agents')) {
            const { error } = await supabase
              .from('agents')
              .delete()
              .is('organization_id', null);
            
            if (error) {
              console.warn('⚠️  Warning al limpiar agentes:', error.message);
            } else {
              console.log('🧹 Agentes globales limpiados');
            }
          }
        } catch (cmdError) {
          console.warn(`⚠️  Warning en comando ${i + 1}:`, cmdError.message);
        }
      }
    }

    // Verificar que los agentes se crearon
    console.log('\n🔍 Verificando agentes creados...');
    const { data: agents, error: selectError } = await supabase
      .from('agents')
      .select('name, purpose, created_at')
      .is('organization_id', null);

    if (selectError) {
      console.error('❌ Error verificando agentes:', selectError);
    } else {
      console.log(`✅ ${agents.length} agentes configurados:`);
      agents.forEach(agent => {
        console.log(`  - ${agent.name}: ${agent.purpose}`);
      });
    }

    console.log('\n🎉 Configuración de agentes completada!');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

/**
 * Inserta los agentes directamente usando el cliente de Supabase
 */
async function insertAgentsDirectly(supabase) {
  const agents = [
    {
      name: 'document_classifier',
      purpose: 'Determinar si un documento es acta o factura',
      prompt_template: `Analiza el siguiente documento y determina si es un "acta" de reunión/junta o una "factura" comercial. 

Responde SOLO con la palabra "acta" o "factura", sin texto adicional.

Criterios:
- ACTA: menciona juntas, reuniones, presidentes, votaciones, decisiones, administradores de fincas
- FACTURA: menciona importes, proveedores, clientes, fechas de pago, conceptos facturados

Documento: {document_text}`,
      variables: { input_key: 'document_text' },
    },
    {
      name: 'minutes_extractor',
      purpose: 'Extraer información clave de actas de juntas',
      prompt_template: `Extrae la información más importante del siguiente acta de junta/reunión.

Busca específicamente:
- Presidente entrante (nuevo presidente elegido)
- Presidente saliente (presidente anterior que deja el cargo)  
- Administrador (empresa o persona que administra la finca/comunidad)
- Resumen de los temas principales tratados
- Decisiones más importantes tomadas

Si algún dato no aparece en el acta, usa null para ese campo.

Acta: {document_text}`,
      variables: { input_key: 'document_text' },
    },
    {
      name: 'invoice_extractor',
      purpose: 'Extraer información comercial de facturas',
      prompt_template: `Extrae los datos comerciales principales de la siguiente factura.

Busca específicamente:
- Nombre del proveedor (quien emite la factura)
- Nombre del cliente (quien recibe/paga la factura)
- Importe total (cantidad numérica, sin símbolo de moneda)
- Fecha de la factura (formato YYYY-MM-DD)
- Categoría o tipo de servicio/producto facturado

Si algún dato no aparece claramente, usa null para ese campo.

Factura: {document_text}`,
      variables: { input_key: 'document_text' },
    }
  ];

  for (const agent of agents) {
    const { error } = await supabase
      .from('agents')
      .insert({
        organization_id: null, // Agente global
        name: agent.name,
        purpose: agent.purpose,
        prompt_template: agent.prompt_template,
        variables: agent.variables,
      });

    if (error) {
      console.warn(`⚠️  Warning insertando ${agent.name}:`, error.message);
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupAgents();
}

module.exports = { setupAgents };