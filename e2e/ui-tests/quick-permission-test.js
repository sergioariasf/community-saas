/**
 * Quick Permission Test - Prueba rápida de permisos sin Playwright
 * 
 * Este script hace peticiones HTTP directas para verificar permisos
 * de manera rápida durante el desarrollo
 */

const axios = require('axios');
const { applyRoleConfiguration, ROLE_PRESETS } = require('./role-manager');

const BASE_URL = 'http://localhost:3001';

/**
 * Simular autenticación y obtener cookies de sesión
 */
async function simulateLogin() {
  try {
    // En una implementación real, harías login programáticamente
    // Por ahora, asumimos que el usuario ya está logueado en el navegador
    console.log('🔐 Simulando autenticación...');
    
    // Para un test más completo, podrías:
    // 1. Hacer POST a /auth/login con credenciales
    // 2. Extraer cookies de sesión
    // 3. Usar cookies en requests posteriores
    
    return 'mock-session-cookie';
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message);
    throw error;
  }
}

/**
 * Verificar acceso a una página específica
 */
async function checkPageAccess(path, sessionCookie = null) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`, {
      headers: sessionCookie ? { Cookie: sessionCookie } : {},
      timeout: 5000,
      validateStatus: () => true // No lanzar error en códigos de estado HTTP
    });
    
    const isRedirectToLogin = response.data.includes('login') || response.status === 302;
    const hasError = response.data.includes('insufficient_permissions') || response.data.includes('error');
    const hasContent = response.data.length > 1000; // Página con contenido real
    
    return {
      status: response.status,
      accessible: !isRedirectToLogin && !hasError && hasContent,
      redirectedToLogin: isRedirectToLogin,
      hasError: hasError,
      contentLength: response.data.length
    };
  } catch (error) {
    return {
      status: 0,
      accessible: false,
      redirectedToLogin: false,
      hasError: true,
      error: error.message,
      contentLength: 0
    };
  }
}

/**
 * Probar acceso a todas las páginas principales
 */
async function testAllPages(roleName) {
  console.log(`\n🔍 Probando acceso con rol: ${roleName.toUpperCase()}`);
  console.log('━'.repeat(50));
  
  const pages = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/communities', name: 'Comunidades' },
    { path: '/documents', name: 'Documentos' },
    { path: '/documents/upload', name: 'Subir Documentos' },
    { path: '/incidents', name: 'Incidencias' },
    { path: '/users', name: 'Usuarios' }
  ];
  
  const sessionCookie = await simulateLogin();
  const results = [];
  
  for (const page of pages) {
    const result = await checkPageAccess(page.path, sessionCookie);
    results.push({ ...page, ...result });
    
    const statusIcon = result.accessible ? '✅' : 
                      result.redirectedToLogin ? '🔐' : 
                      result.hasError ? '❌' : '⚠️';
    
    const statusText = result.accessible ? 'ACCESIBLE' :
                      result.redirectedToLogin ? 'LOGIN REQUERIDO' :
                      result.hasError ? 'ERROR PERMISOS' : 'DESCONOCIDO';
    
    console.log(`${statusIcon} ${page.name.padEnd(20)} - ${statusText} (${result.status})`);
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * Ejecutar pruebas sistemáticas para todos los roles
 */
async function runSystematicTests() {
  console.log('🧪 INICIANDO PRUEBAS SISTEMÁTICAS DE PERMISOS\n');
  
  const testResults = {};
  
  // Probar cada configuración de rol
  const rolesToTest = ['adminOnly', 'managerMultiple', 'managerSingle', 'residentOnly', 'noRoles'];
  
  for (const roleName of rolesToTest) {
    try {
      // Aplicar configuración de rol
      await applyRoleConfiguration(roleName);
      
      // Esperar un poco para que los cambios se propaguen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Probar acceso a páginas
      const results = await testAllPages(roleName);
      testResults[roleName] = results;
      
    } catch (error) {
      console.error(`❌ Error probando rol ${roleName}:`, error.message);
      testResults[roleName] = { error: error.message };
    }
  }
  
  // Generar reporte final
  generateTestReport(testResults);
}

/**
 * Generar reporte de resultados
 */
function generateTestReport(testResults) {
  console.log('\n📊 REPORTE FINAL DE PRUEBAS');
  console.log('='.repeat(80));
  
  const pages = ['Dashboard', 'Comunidades', 'Documentos', 'Subir Documentos', 'Incidencias', 'Usuarios'];
  
  // Tabla de resultados
  const tableHeader = 'Rol'.padEnd(20) + pages.map(p => p.substring(0, 8).padEnd(10)).join('');
  console.log(tableHeader);
  console.log('─'.repeat(tableHeader.length));
  
  for (const [roleName, results] of Object.entries(testResults)) {
    if (results.error) {
      console.log(`${roleName.padEnd(20)} ERROR: ${results.error}`);
      continue;
    }
    
    let row = roleName.padEnd(20);
    for (const page of pages) {
      const result = results.find(r => r.name === page);
      const icon = result?.accessible ? '✅' : 
                  result?.redirectedToLogin ? '🔐' : 
                  result?.hasError ? '❌' : '❓';
      row += (icon + ' '.repeat(9)).substring(0, 10);
    }
    console.log(row);
  }
  
  console.log('\n📋 LEYENDA:');
  console.log('✅ = Accesible   🔐 = Login requerido   ❌ = Sin permisos   ❓ = Error');
  
  console.log('\n🎯 CONCLUSIONES:');
  console.log('- ADMIN: Debe tener acceso a todo (✅)');
  console.log('- MANAGER: Acceso limitado, sin usuarios');
  console.log('- RESIDENT: Solo lectura básica');
  console.log('- NO ROLES: Solo login/error permisos');
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'full':
        await runSystematicTests();
        break;
        
      case 'single':
        const roleName = args[1] || 'adminOnly';
        if (!ROLE_PRESETS[roleName]) {
          console.log('❌ Rol no válido. Disponibles:', Object.keys(ROLE_PRESETS).join(', '));
          process.exit(1);
        }
        await applyRoleConfiguration(roleName);
        await testAllPages(roleName);
        break;
        
      case 'quick':
        // Solo probar páginas principales con rol actual
        await testAllPages('current');
        break;
        
      default:
        console.log('🚀 Quick Permission Test - Prueba rápida de permisos\n');
        console.log('Comandos disponibles:');
        console.log('  full           - Prueba sistemática todos los roles');
        console.log('  single <role>  - Prueba un rol específico');
        console.log('  quick          - Prueba rápida con rol actual');
        console.log('\nEjemplo: node quick-permission-test.js full');
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { 
  checkPageAccess, 
  testAllPages, 
  runSystematicTests 
};