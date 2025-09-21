const { createClient } = require('@supabase/supabase-js');

// Configuración desde .env.local
const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3OTgyMCwiZXhwIjoyMDcyOTU1ODIwfQ.cccxSgmi-46frrr_zz_vI4EhZLCDa6EYnFTyoa7Nzz4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSystematicTestRoles() {
  console.log('🧪 Creando roles sistemáticos para testing...\n');
  
  try {
    // IDs conocidos
    const userId = '12e1976b-4bd0-4062-833c-9d1cf78c49eb'; // sergioariasf@gmail.com
    const organizationId = 'e3f4370b-2235-45ad-869a-737ee9fd95ab'; // Organización Principal
    
    // IDs de comunidades conocidas
    const communities = {
      amara: 'c7e7b867-6180-4363-a2f8-2aa12eb804b5',
      losOlivos: '09431cb5-9b84-43b1-895e-23dc975432eb',
      torres: '1eb6665e-003e-48ec-8465-f9915ebf2d44',
      bellaVista: '8c1a6de3-c52d-4f7d-89af-e6dc53b7ce6f'
    };
    
    // 1. Limpiar roles existentes del usuario
    console.log('🧹 Limpiando roles existentes...');
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.log('⚠️ Error limpiando roles anteriores:', deleteError.message);
    } else {
      console.log('✅ Roles anteriores limpiados');
    }
    
    console.log('\n📝 Creando roles sistemáticos...');
    
    // 2. ADMIN GLOBAL - Acceso total a todo
    console.log('\n👑 ADMIN GLOBAL:');
    const adminRole = {
      user_id: userId,
      organization_id: organizationId,
      community_id: null, // NULL = rol global
      role: 'admin'
    };
    
    const { data: adminData, error: adminError } = await supabase
      .from('user_roles')
      .insert(adminRole)
      .select()
      .single();
      
    if (adminError) {
      console.log('❌ Error creando rol ADMIN:', adminError.message);
    } else {
      console.log('✅ ROL ADMIN GLOBAL creado - Acceso total a todas las comunidades');
    }
    
    // 3. MANAGER de MÚLTIPLES comunidades 
    console.log('\n🏢 MANAGER (Múltiples Comunidades):');
    const managerCommunities = ['amara', 'losOlivos', 'torres'];
    
    for (const communityKey of managerCommunities) {
      const managerRole = {
        user_id: userId,
        organization_id: organizationId,
        community_id: communities[communityKey],
        role: 'manager'
      };
      
      const { data: managerData, error: managerError } = await supabase
        .from('user_roles')
        .insert(managerRole)
        .select()
        .single();
        
      if (managerError) {
        console.log(`❌ Error creando rol MANAGER en ${communityKey}:`, managerError.message);
      } else {
        console.log(`✅ ROL MANAGER en ${communityKey} creado`);
      }
    }
    
    // 4. RESIDENT de UNA comunidad específica
    console.log('\n🏠 RESIDENT (Una Comunidad):');
    const residentRole = {
      user_id: userId,
      organization_id: organizationId,
      community_id: communities.bellaVista, // Solo Bella Vista
      role: 'resident'
    };
    
    const { data: residentData, error: residentError } = await supabase
      .from('user_roles')
      .insert(residentRole)
      .select()
      .single();
      
    if (residentError) {
      console.log('❌ Error creando rol RESIDENT:', residentError.message);
    } else {
      console.log('✅ ROL RESIDENT en Bella Vista creado');
    }
    
    // 5. Verificar roles creados con información detallada
    console.log('\n📊 RESUMEN DE ROLES CREADOS:');
    const { data: allRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role,
        community_id,
        communities:community_id (name)
      `)
      .eq('user_id', userId)
      .order('role');
      
    if (rolesError) {
      console.log('❌ Error verificando roles:', rolesError.message);
    } else {
      console.log(`\n✅ TOTAL ROLES CREADOS: ${allRoles.length}`);
      
      const adminRoles = allRoles.filter(r => r.role === 'admin');
      const managerRoles = allRoles.filter(r => r.role === 'manager');
      const residentRoles = allRoles.filter(r => r.role === 'resident');
      
      console.log(`\n👑 ADMIN: ${adminRoles.length} roles`);
      adminRoles.forEach(role => {
        const scope = role.community_id ? `en ${role.communities?.name}` : 'GLOBAL';
        console.log(`   - Admin ${scope}`);
      });
      
      console.log(`\n🏢 MANAGER: ${managerRoles.length} roles`);
      managerRoles.forEach(role => {
        console.log(`   - Manager en ${role.communities?.name}`);
      });
      
      console.log(`\n🏠 RESIDENT: ${residentRoles.length} roles`);
      residentRoles.forEach(role => {
        console.log(`   - Resident en ${role.communities?.name}`);
      });
    }
    
    // 6. Mostrar qué puede hacer cada rol
    console.log('\n🔍 TESTING GUIDE - QUÉ PROBAR:');
    console.log('\n👑 Como ADMIN GLOBAL:');
    console.log('   - Debe ver TODAS las 7 comunidades');
    console.log('   - Acceso total a dashboard, usuarios, documentos');
    console.log('   - Puede subir documentos a cualquier comunidad');
    
    console.log('\n🏢 Como MANAGER:');
    console.log('   - Debe ver solo: Amara, Los Olivos, Torres (3 comunidades)');
    console.log('   - Puede gestionar estas comunidades');
    console.log('   - Puede subir documentos solo a estas 3');
    
    console.log('\n🏠 Como RESIDENT:');
    console.log('   - Debe ver solo: Bella Vista (1 comunidad)');
    console.log('   - Solo lectura de información');
    console.log('   - No puede subir documentos');
    
    console.log('\n🧪 PRÓXIMOS PASOS:');
    console.log('1. Refresca la página en el navegador');
    console.log('2. Ve a /documents/upload - debe mostrar las comunidades según el rol');
    console.log('3. Prueba cambiar roles en base de datos para ver diferentes vistas');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createSystematicTestRoles();