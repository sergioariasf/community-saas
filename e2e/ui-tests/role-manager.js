/**
 * Role Manager para E2E Testing
 * 
 * Utilidad para cambiar roles dinámicamente durante tests E2E
 * Permite probar diferentes combinaciones de permisos rápidamente
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3OTgyMCwiZXhwIjoyMDcyOTU1ODIwfQ.cccxSgmi-46frrr_zz_vI4EhZLCDa6EYnFTyoa7Nzz4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Constantes de testing
const TEST_USER_ID = '12e1976b-4bd0-4062-833c-9d1cf78c49eb';
const ORGANIZATION_ID = 'e3f4370b-2235-45ad-869a-737ee9fd95ab';

const COMMUNITIES = {
  amara: 'c7e7b867-6180-4363-a2f8-2aa12eb804b5',
  losOlivos: '09431cb5-9b84-43b1-895e-23dc975432eb',
  torres: '1eb6665e-003e-48ec-8465-f9915ebf2d44',
  bellaVista: '8c1a6de3-c52d-4f7d-89af-e6dc53b7ce6f'
};

/**
 * Configuraciones predefinidas de roles para testing
 */
const ROLE_PRESETS = {
  adminOnly: [
    { role: 'admin', community_id: null }
  ],
  
  managerMultiple: [
    { role: 'manager', community_id: COMMUNITIES.amara },
    { role: 'manager', community_id: COMMUNITIES.losOlivos },
    { role: 'manager', community_id: COMMUNITIES.torres }
  ],
  
  managerSingle: [
    { role: 'manager', community_id: COMMUNITIES.amara }
  ],
  
  residentOnly: [
    { role: 'resident', community_id: COMMUNITIES.bellaVista }
  ],
  
  mixedRoles: [
    { role: 'admin', community_id: null },
    { role: 'manager', community_id: COMMUNITIES.amara },
    { role: 'resident', community_id: COMMUNITIES.bellaVista }
  ],
  
  noRoles: []
};

/**
 * Aplicar configuración de roles específica
 */
async function applyRoleConfiguration(presetName) {
  const roles = ROLE_PRESETS[presetName];
  
  if (!roles) {
    throw new Error(`Preset '${presetName}' no encontrado. Disponibles: ${Object.keys(ROLE_PRESETS).join(', ')}`);
  }
  
  console.log(`🔄 Aplicando configuración: ${presetName}`);
  
  try {
    // 1. Limpiar roles existentes
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', TEST_USER_ID);
      
    if (deleteError) {
      throw new Error(`Error limpiando roles: ${deleteError.message}`);
    }
    
    // 2. Insertar nuevos roles
    if (roles.length > 0) {
      const rolesToInsert = roles.map(role => ({
        user_id: TEST_USER_ID,
        organization_id: ORGANIZATION_ID,
        community_id: role.community_id,
        role: role.role
      }));
      
      const { data, error: insertError } = await supabase
        .from('user_roles')
        .insert(rolesToInsert)
        .select();
        
      if (insertError) {
        throw new Error(`Error insertando roles: ${insertError.message}`);
      }
      
      console.log(`✅ ${roles.length} roles aplicados exitosamente`);
    } else {
      console.log('✅ Usuario sin roles (para test de acceso denegado)');
    }
    
    // 3. Verificar roles aplicados
    await verifyCurrentRoles();
    
  } catch (error) {
    console.error('❌ Error aplicando configuración:', error.message);
    throw error;
  }
}

/**
 * Verificar roles actuales del usuario de prueba
 */
async function verifyCurrentRoles() {
  try {
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select(`
        role,
        community_id,
        communities:community_id (name)
      `)
      .eq('user_id', TEST_USER_ID)
      .order('role');
      
    if (error) {
      throw new Error(`Error verificando roles: ${error.message}`);
    }
    
    console.log('\n📋 Roles actuales del usuario de prueba:');
    if (roles.length === 0) {
      console.log('   (Sin roles asignados)');
    } else {
      roles.forEach(role => {
        const scope = role.community_id ? `en ${role.communities?.name}` : 'GLOBAL';
        console.log(`   - ${role.role.toUpperCase()} ${scope}`);
      });
    }
    console.log('');
    
    return roles;
  } catch (error) {
    console.error('❌ Error verificando roles:', error.message);
    throw error;
  }
}

/**
 * Función principal para manejo desde línea de comandos
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'apply':
        const preset = args[1];
        if (!preset) {
          console.log('❌ Uso: node role-manager.js apply <preset>');
          console.log('Presets disponibles:', Object.keys(ROLE_PRESETS).join(', '));
          process.exit(1);
        }
        await applyRoleConfiguration(preset);
        break;
        
      case 'verify':
        await verifyCurrentRoles();
        break;
        
      case 'list':
        console.log('📋 Configuraciones disponibles:\n');
        for (const [name, roles] of Object.entries(ROLE_PRESETS)) {
          console.log(`🔹 ${name}:`);
          if (roles.length === 0) {
            console.log('   - Sin roles');
          } else {
            roles.forEach(role => {
              const scope = role.community_id ? 'comunidad específica' : 'global';
              console.log(`   - ${role.role} (${scope})`);
            });
          }
          console.log('');
        }
        break;
        
      default:
        console.log('🎭 Role Manager - Gestión de roles para E2E Testing\n');
        console.log('Comandos disponibles:');
        console.log('  apply <preset>  - Aplicar configuración de roles');
        console.log('  verify         - Ver roles actuales');
        console.log('  list          - Listar configuraciones disponibles');
        console.log('\nEjemplo: node role-manager.js apply adminOnly');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente desde línea de comandos
if (require.main === module) {
  main();
}

// Exportar funciones para uso en tests
module.exports = {
  applyRoleConfiguration,
  verifyCurrentRoles,
  ROLE_PRESETS,
  TEST_USER_ID,
  COMMUNITIES
};