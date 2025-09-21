/**
 * Script para crear usuarios de prueba para testing del módulo de documentos
 * 
 * USUARIOS A CREAR:
 * 1. manager@test.com - Manager con acceso a 2-3 comunidades específicas
 * 2. resident@test.com - Resident con acceso a 1 comunidad
 * 
 * PROPÓSITO: Testing de RLS (Row Level Security) en progressive pipeline
 */

console.log('=== SETUP DE USUARIOS DE PRUEBA ===');
console.log();
console.log('Este script te ayudará a crear los usuarios necesarios para testing.');
console.log();
console.log('PASOS A SEGUIR:');
console.log('1. Ve a http://localhost:3001/login como admin (sergioariasf@gmail.com)');
console.log('2. Ve a la sección de Gestión de Usuarios');
console.log('3. Crea estos usuarios:');
console.log();

console.log('👤 USUARIO 1: MANAGER DE PRUEBA');
console.log('  📧 Email: manager@test.com');
console.log('  🔐 Password: TestManager123!');
console.log('  🎯 Roles: manager en 2-3 comunidades específicas');
console.log('  📝 Propósito: Testing RLS - acceso limitado a algunas comunidades');
console.log();

console.log('👤 USUARIO 2: RESIDENT DE PRUEBA');  
console.log('  📧 Email: resident@test.com');
console.log('  🔐 Password: TestResident123!');
console.log('  🎯 Roles: resident en 1 comunidad');
console.log('  📝 Propósito: Testing RLS - acceso muy restrictivo');
console.log();

console.log('📋 DESPUÉS DE CREAR LOS USUARIOS:');
console.log('1. Asigna roles específicos a cada usuario');
console.log('2. Verifica que cada usuario solo ve sus comunidades asignadas');
console.log('3. Ejecuta los tests de progressive pipeline');
console.log();

console.log('🎯 TESTING STRATEGY:');
console.log('- Admin Global: Prueba funcionalidad completa');
console.log('- Manager Limited: Prueba RLS y permisos por comunidad');  
console.log('- Resident Restricted: Prueba permisos mínimos');
console.log();

console.log('¿Quieres que continue con la creación automática? (Necesitará configurar APIs)');