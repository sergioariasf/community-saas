/**
 * ===============================================================================
 * CREADOR DE USUARIOS DE PRUEBA PARA TESTING DEL MÓDULO DE DOCUMENTOS
 * ===============================================================================
 * Crea usuarios específicos para probar RLS y permisos del progressive pipeline
 * 
 * USUARIOS A CREAR:
 * 1. manager@test.com - Manager con acceso a 2-3 comunidades específicas
 * 2. resident@test.com - Resident con acceso a 1 comunidad
 * 
 * PROPÓSITO: Testing de RLS (Row Level Security) en progressive pipeline
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 CREADOR DE USUARIOS DE PRUEBA');
console.log('================================');
console.log(`📡 URL: ${supabaseUrl}`);
console.log(`🔑 Service Key: ${serviceKey ? 'OK' : 'FALTA'}`);

if (!supabaseUrl || !serviceKey) {
    console.error('❌ ERROR: Variables de entorno faltantes');
    process.exit(1);
}

// Cliente admin con service role
const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Definición de usuarios de prueba
const testUsers = [
    {
        email: 'manager@test.com',
        password: 'TestManager123!',
        role: 'manager',
        description: 'Manager con acceso a 2-3 comunidades',
        communities_access: 2, // Número de comunidades a las que tendrá acceso
        purpose: 'Testing RLS - acceso limitado a algunas comunidades'
    },
    {
        email: 'resident@test.com',
        password: 'TestResident123!',
        role: 'resident',
        description: 'Resident con acceso a 1 comunidad',
        communities_access: 1, // Solo 1 comunidad
        purpose: 'Testing RLS - acceso muy restrictivo'
    }
];

async function getCurrentOrganization() {
    console.log('🏢 Obteniendo organización actual...');
    
    const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('❌ Error obteniendo organizaciones:', error.message);
        return null;
    }
    
    if (orgs && orgs.length > 0) {
        console.log(`✅ Organización encontrada: ${orgs[0].id} - ${orgs[0].name || 'Sin nombre'}`);
        return orgs[0];
    }
    
    console.log('⚠️ No se encontraron organizaciones');
    return null;
}

async function getAvailableCommunities() {
    console.log('🏘️ Obteniendo comunidades disponibles...');
    
    const { data: communities, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .limit(5);
    
    if (error) {
        console.error('❌ Error obteniendo comunidades:', error.message);
        return [];
    }
    
    console.log(`✅ ${communities?.length || 0} comunidades activas encontradas`);
    communities?.forEach((community, i) => {
        console.log(`   ${i + 1}. ${community.name} (${community.id})`);
    });
    
    return communities || [];
}

async function createTestUser(userConfig, organization, communities) {
    console.log('');
    console.log(`👤 CREANDO USUARIO: ${userConfig.email}`);
    console.log('=====================================');
    console.log(`🎯 Rol: ${userConfig.role}`);
    console.log(`🏘️ Acceso a comunidades: ${userConfig.communities_access}`);
    console.log(`📝 Propósito: ${userConfig.purpose}`);
    
    try {
        // 1. Crear usuario en Supabase Auth
        console.log('🔐 Creando usuario en Auth...');
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: userConfig.email,
            password: userConfig.password,
            email_confirm: true // Auto-confirmar email
        });
        
        if (authError) {
            console.error(`❌ Error creando usuario Auth: ${authError.message}`);
            return false;
        }
        
        console.log(`✅ Usuario Auth creado: ${authData.user.id}`);
        const userId = authData.user.id;
        
        // 2. Asignar roles en las comunidades
        console.log('🏷️ Asignando roles en comunidades...');
        
        // Determinar qué comunidades asignar
        const communitiesToAssign = communities.slice(0, userConfig.communities_access);
        
        for (const community of communitiesToAssign) {
            console.log(`   📌 Asignando rol ${userConfig.role} en: ${community.name}`);
            
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                    user_id: userId,
                    community_id: community.id,
                    role: userConfig.role,
                    organization_id: organization.id
                });
            
            if (roleError) {
                console.error(`   ❌ Error asignando rol: ${roleError.message}`);
            } else {
                console.log(`   ✅ Rol asignado exitosamente`);
            }
        }
        
        console.log(`✅ Usuario ${userConfig.email} creado exitosamente`);
        
        // 3. Resumen del usuario creado
        console.log('');
        console.log('📊 RESUMEN:');
        console.log(`   👤 Email: ${userConfig.email}`);
        console.log(`   🆔 ID: ${userId}`);
        console.log(`   🔐 Password: ${userConfig.password}`);
        console.log(`   🏷️ Rol: ${userConfig.role}`);
        console.log(`   🏘️ Comunidades: ${communitiesToAssign.length}`);
        communitiesToAssign.forEach((community, i) => {
            console.log(`      ${i + 1}. ${community.name}`);
        });
        
        return true;
        
    } catch (error) {
        console.error(`❌ Excepción creando usuario: ${error.message}`);
        return false;
    }
}

async function verifyTestUsers() {
    console.log('');
    console.log('🔍 VERIFICANDO USUARIOS EXISTENTES...');
    console.log('====================================');
    
    for (const userConfig of testUsers) {
        console.log(`👤 Verificando: ${userConfig.email}`);
        
        // Buscar en user_roles para ver si ya existe
        const { data: roles, error } = await supabase
            .from('user_roles')
            .select(`
                user_id,
                role,
                community_id,
                communities!inner(name)
            `)
            .eq('user_id', 'user_id'); // Esta query necesita mejorarse
        
        // Por ahora, simplemente intentar crear y manejar errores
    }
}

async function main() {
    try {
        // 1. Obtener organización actual
        const organization = await getCurrentOrganization();
        if (!organization) {
            console.error('❌ No se puede proceder sin una organización');
            process.exit(1);
        }
        
        // 2. Obtener comunidades disponibles
        const communities = await getAvailableCommunities();
        if (communities.length === 0) {
            console.error('❌ No hay comunidades disponibles para asignar');
            process.exit(1);
        }
        
        // 3. Crear usuarios de prueba
        console.log('');
        console.log('🚀 INICIANDO CREACIÓN DE USUARIOS...');
        console.log('===================================');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const userConfig of testUsers) {
            const success = await createTestUser(userConfig, organization, communities);
            if (success) {
                successCount++;
            } else {
                errorCount++;
            }
        }
        
        // 4. Resumen final
        console.log('');
        console.log('🏁 PROCESO COMPLETADO');
        console.log('====================');
        console.log(`✅ Usuarios creados exitosamente: ${successCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📊 Total procesados: ${testUsers.length}`);
        
        if (successCount > 0) {
            console.log('');
            console.log('🎯 PRÓXIMOS PASOS PARA TESTING:');
            console.log('==============================');
            console.log('1. Probar login con cada usuario');
            console.log('2. Verificar que solo ven sus comunidades asignadas');
            console.log('3. Probar subida de documentos con cada rol');
            console.log('4. Verificar RLS en progressive pipeline');
            console.log('');
            console.log('🔐 CREDENCIALES DE ACCESO:');
            testUsers.forEach((user, i) => {
                console.log(`   ${i + 1}. ${user.email} / ${user.password}`);
            });
        }
        
    } catch (error) {
        console.error('❌ ERROR FATAL:', error);
        process.exit(1);
    }
}

// Ejecutar
main();