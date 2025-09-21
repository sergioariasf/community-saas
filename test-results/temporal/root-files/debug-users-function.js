/**
 * Debug script para verificar qué está devolviendo getAllUsers()
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3OTgyMCwiZXhwIjoyMDcyOTU1ODIwfQ.cccxSgmi-46frrr_zz_vI4EhZLCDa6EYnFTyoa7Nzz4';
const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_USER_ID = '12e1976b-4bd0-4062-833c-9d1cf78c49eb';

async function debugGetAllUsers() {
  console.log('🔍 DEBUG: Simulando getAllUsers()');
  
  try {
    // 1. Query exacta de la función getAllUsers()
    console.log('\n1. Obteniendo user_roles...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        community_id,
        communities:community_id (
          name
        )
      `);

    if (rolesError) {
      console.error('❌ Error fetching user roles:', rolesError);
      return [];
    }

    console.log('✅ Raw user roles:', JSON.stringify(userRoles, null, 2));

    // 2. Obtener IDs únicos
    const userIds = [...new Set(userRoles?.map(role => role.user_id) || [])];
    console.log('\n2. User IDs únicos:', userIds);
    
    if (userIds.length === 0) {
      console.log('❌ No hay usuarios con roles');
      return [];
    }

    // 3. Para cada usuario, crear el objeto
    const users = [];
    
    for (const userId of userIds) {
      console.log(`\n3. Procesando usuario: ${userId}`);
      const userRolesList = userRoles?.filter(role => role.user_id === userId) || [];
      console.log('   Roles del usuario:', userRolesList);
      
      let userInfo = { email: 'Usuario desconocido', created_at: null, last_sign_in_at: null };
      
      if (userId === TEST_USER_ID) {
        userInfo = {
          email: 'sergioariasf@gmail.com',
          created_at: '2025-09-09T00:00:00Z',
          last_sign_in_at: '2025-09-12T00:00:00Z'
        };
      }
      
      const processedRoles = userRolesList.map(role => ({
        role: role.role,
        community_id: role.community_id,
        community_name: role.community_id ? 
          (role.communities?.name || 'Comunidad desconocida') : 
          (role.role === 'admin' ? 'Global' : null)
      }));
      
      console.log('   Roles procesados:', processedRoles);
      
      users.push({
        id: userId,
        email: userInfo.email,
        created_at: userInfo.created_at,
        last_sign_in_at: userInfo.last_sign_in_at,
        roles: processedRoles
      });
    }

    console.log('\n4. Resultado final:');
    console.log(JSON.stringify(users, null, 2));
    
    return users;

  } catch (error) {
    console.error('❌ Error en debugGetAllUsers:', error);
    return [];
  }
}

// Ejecutar
debugGetAllUsers().then(() => {
  console.log('\n✅ Debug completado');
  process.exit(0);
});