const { createClient } = require('@supabase/supabase-js');

// Configuración desde .env.local  
const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3OTgyMCwiZXhwIjoyMDcyOTU1ODIwfQ.cccxSgmi-46frrr_zz_vI4EhZLCDa6EYnFTyoa7Nzz4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserRoles() {
  console.log('🔧 Arreglando roles de usuario...\n');
  
  try {
    // IDs conocidos del debug anterior
    const userId = '12e1976b-4bd0-4062-833c-9d1cf78c49eb'; // sergioariasf@gmail.com
    const organizationId = 'e3f4370b-2235-45ad-869a-737ee9fd95ab'; // Organización Principal
    const amaraCommunityId = 'c7e7b867-6180-4363-a2f8-2aa12eb804b5'; // Amara
    
    console.log('📝 Creando roles para sergioariasf@gmail.com...');
    
    // 1. Crear rol de ADMIN global (sin community_id)
    const { data: adminRole, error: adminError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        community_id: null, // Admin global
        role: 'admin'
      })
      .select()
      .single();
      
    if (adminError) {
      console.log('❌ Error creando rol admin:', adminError.message);
    } else {
      console.log('✅ Rol ADMIN global creado');
    }
    
    // 2. Crear rol de MANAGER en Amara
    const { data: managerRole, error: managerError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        community_id: amaraCommunityId,
        role: 'manager'
      })
      .select()
      .single();
      
    if (managerError) {
      console.log('❌ Error creando rol manager en Amara:', managerError.message);
    } else {
      console.log('✅ Rol MANAGER en Amara creado');
    }
    
    // 3. Verificar roles creados
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        *,
        communities (name)
      `)
      .eq('user_id', userId);
      
    if (rolesError) {
      console.log('❌ Error verificando roles:', rolesError.message);
    } else {
      console.log('\n✅ Roles creados para sergioariasf@gmail.com:');
      userRoles.forEach(role => {
        const communityName = role.communities?.name || 'Global';
        console.log(`   - ${role.role.toUpperCase()} en ${communityName}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

fixUserRoles();