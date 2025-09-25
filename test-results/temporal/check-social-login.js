/**
 * Script para verificar el problema del Social Login
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3OTgyMCwiZXhwIjoyMDcyOTU1ODIwfQ.cccxSgmi-46frrr_zz_vI4EhZLCDa6EYnFTyoa7Nzz4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSocialLoginIssue() {
  console.log('🔍 Verificando problema de Social Login...\n');
  
  try {
    // 1. Ver todos los usuarios en auth.users con email sergioariasf@gmail.com
    console.log('1. Usuarios en auth.users con email sergioariasf@gmail.com:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ No pudimos acceder a auth.users (necesita service role)');
    } else {
      const sergioUsers = authUsers.users.filter(u => u.email === 'sergioariasf@gmail.com');
      sergioUsers.forEach(user => {
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Provider: ${user.app_metadata?.provider || 'email'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('---');
      });
    }

    // 2. Ver roles en user_roles
    console.log('\n2. Roles en user_roles:');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role, community_id')
      .order('user_id');

    if (rolesError) {
      console.error('❌ Error:', rolesError);
    } else {
      userRoles.forEach(role => {
        console.log(`   User ID: ${role.user_id}`);
        console.log(`   Role: ${role.role}`);
        console.log(`   Community: ${role.community_id || 'Global'}`);
        console.log('---');
      });
    }

    // 3. Identificar el problema
    console.log('\n3. 🎯 ANÁLISIS:');
    if (authUsers?.users) {
      const sergioUsers = authUsers.users.filter(u => u.email === 'sergioariasf@gmail.com');
      const rolesUserIds = userRoles?.map(r => r.user_id) || [];
      
      sergioUsers.forEach(user => {
        const hasRoles = rolesUserIds.includes(user.id);
        console.log(`   Usuario ${user.id.substring(0, 8)}... (${user.app_metadata?.provider || 'email'}): ${hasRoles ? '✅ Tiene roles' : '❌ Sin roles'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkSocialLoginIssue().then(() => {
  console.log('\n✅ Verificación completada');
  process.exit(0);
});