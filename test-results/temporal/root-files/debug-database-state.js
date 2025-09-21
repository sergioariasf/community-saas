const { createClient } = require('@supabase/supabase-js');

// Configuración desde .env.local
const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3OTgyMCwiZXhwIjoyMDcyOTU1ODIwfQ.cccxSgmi-46frrr_zz_vI4EhZLCDa6EYnFTyoa7Nzz4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseState() {
  console.log('🔍 Verificando estado de la base de datos...\n');
  
  try {
    // 1. Verificar si existe la tabla organizations
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (orgError && orgError.code === '42P01') {
      console.log('❌ Tabla organizations NO existe');
    } else if (orgError) {
      console.log('❌ Error consultando organizations:', orgError.message);
    } else {
      console.log('✅ Tabla organizations existe:', orgData.length, 'registros');
      orgData.forEach(org => console.log(`   - ${org.name} (${org.id})`));
    }
    
    // 2. Verificar usuarios auth
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.log('❌ Error obteniendo usuarios:', userError.message);
    } else {
      console.log('\n✅ Usuarios auth:', userData.users.length);
      userData.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    }
    
    // 3. Verificar estructura de user_roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(10);
      
    if (rolesError) {
      console.log('\n❌ Error consultando user_roles:', rolesError.message);
    } else {
      console.log('\n✅ Tabla user_roles:', rolesData.length, 'registros');
      rolesData.forEach(role => {
        console.log(`   - Usuario: ${role.user_id}, Comunidad: ${role.community_id || 'NULL'}, Role: ${role.role}, Org: ${role.organization_id || 'NULL'}`);
      });
    }
    
    // 4. Verificar comunidades
    const { data: commData, error: commError } = await supabase
      .from('communities')
      .select('*')
      .limit(10);
      
    if (commError) {
      console.log('\n❌ Error consultando communities:', commError.message);
    } else {
      console.log('\n✅ Comunidades:', commData.length, 'registros');
      commData.forEach(comm => {
        console.log(`   - ${comm.name} (${comm.id}) - Org: ${comm.organization_id || 'NULL'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkDatabaseState();