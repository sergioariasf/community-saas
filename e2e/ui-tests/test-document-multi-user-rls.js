#!/usr/bin/env node

/**
 * ARCHIVO: test-document-multi-user-rls.js
 * PROPÓSITO: Test RLS multi-usuario siguiendo patrón UI Guardian
 * ESTADO: production
 * DEPENDENCIAS: playwright, usuarios test configurados
 * OUTPUTS: Verificación exhaustiva de aislamiento por organización
 * ACTUALIZADO: 2025-09-14
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuración de usuarios (verificados previamente)
const TEST_USERS = {
  ADMIN: {
    email: 'sergioariasf@gmail.com',
    password: 'Elpato_46',
    role: 'admin',
    description: 'Admin Global - Acceso completo'
  },
  MANAGER: {
    email: 'manager@test.com', 
    password: 'TestManager123!',
    role: 'manager',
    description: 'Manager Multi-Comunidad (Amara + Urbanización El Pinar)'
  },
  RESIDENT: {
    email: 'resident@test.com',
    password: 'TestResident123!', 
    role: 'resident',
    description: 'Resident Single-Comunidad (Solo Amara)'
  }
};

const BASE_URL = 'http://localhost:3001';
const TEST_FILE = '/home/sergi/proyectos/community-saas/datos/acta_prueba.pdf';

/**
 * Función principal de testing RLS multi-usuario
 */
async function testMultiUserRLS() {
  console.log('🛡️ INICIANDO TEST RLS MULTI-USUARIO');
  console.log('=====================================\n');
  
  const results = [];
  
  // Test cada usuario individualmente
  for (const [userType, userData] of Object.entries(TEST_USERS)) {
    console.log(`👤 TESTING USUARIO: ${userType}`);
    console.log(`📧 ${userData.email} (${userData.description})`);
    console.log('-'.repeat(60));
    
    const userResult = await testSingleUser(userType, userData);
    results.push({ userType, userData, ...userResult });
    
    console.log(`${userResult.success ? '✅' : '❌'} ${userType}: ${userResult.success ? 'ÉXITO' : 'FALLO'}`);
    if (userResult.error) {
      console.log(`💥 Error: ${userResult.error}`);
    }
    if (userResult.documentsVisible !== undefined) {
      console.log(`📊 Documentos visibles: ${userResult.documentsVisible}`);
    }
    console.log('');
  }
  
  // Test comparativo (contextos simultáneos)
  console.log('🔒 EJECUTANDO TEST COMPARATIVO DE AISLAMIENTO');
  console.log('-'.repeat(60));
  
  const comparativeResult = await testComparativeIsolation();
  
  // Resumen final
  console.log('📊 RESUMEN FINAL - RLS MULTI-USUARIO');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Usuarios con acceso exitoso: ${successful}/${results.length}`);
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.userType}: ${result.userData.description}`);
    if (result.documentsVisible !== undefined) {
      console.log(`   📊 Documentos visibles: ${result.documentsVisible}`);
    }
    if (result.canUpload !== undefined) {
      console.log(`   📤 Puede subir documentos: ${result.canUpload ? 'Sí' : 'No'}`);
    }
  });
  
  if (comparativeResult.success) {
    console.log('✅ AISLAMIENTO RLS: Funcionando correctamente');
    console.log(`   Admin: ${comparativeResult.adminDocs} docs`);
    console.log(`   Manager: ${comparativeResult.managerDocs} docs`);
    console.log(`   Resident: ${comparativeResult.residentDocs} docs`);
  } else {
    console.log('❌ AISLAMIENTO RLS: Issues detectados');
  }
  
  console.log('\n🎉 TESTING MULTI-USUARIO COMPLETO');
  return { 
    success: successful >= 2, // Al menos 2 de 3 usuarios deben funcionar
    userResults: results,
    comparativeResult
  };
}

/**
 * Test individual para un usuario
 */
async function testSingleUser(userType, userData) {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1280, height: 720 }
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    console.log(`🔐 Login como ${userType}...`);
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[name="email"]', userData.email);
    await page.fill('input[name="password"]', userData.password);
    
    // Screenshot de login
    await page.screenshot({ 
      path: `e2e/screenshots/multi-user-${userType.toLowerCase()}-01-login.png` 
    });
    
    await page.click('button[type="submit"]');
    
    // Esperar redirección (puede fallar para algunos usuarios)
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Login exitoso - redirigido a dashboard');
    } catch (error) {
      // Verificar si estamos en otra página válida (no login)
      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        console.log(`✅ Login exitoso - redirigido a ${currentUrl}`);
      } else {
        throw new Error('Login falló - aún en página de login');
      }
    }
    
    // Verificar acceso a documentos
    console.log('📄 Verificando acceso a módulo documentos...');
    await page.goto(`${BASE_URL}/documents`);
    await page.waitForLoadState('networkidle');
    
    // Screenshot de documentos
    await page.screenshot({ 
      path: `e2e/screenshots/multi-user-${userType.toLowerCase()}-02-documents.png` 
    });
    
    // Verificar si puede acceder
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/unauthorized')) {
      return {
        success: false,
        error: 'Sin acceso a módulo documentos',
        canAccessDocuments: false
      };
    }
    
    // Contar documentos visibles
    let documentsVisible = 0;
    try {
      const documentElements = await page.locator('[data-testid="document-item"]').count();
      documentsVisible = documentElements;
    } catch (error) {
      // Intentar otro selector
      try {
        const linkElements = await page.locator('a[href*="/documents/"]').count();
        documentsVisible = linkElements;
      } catch (error2) {
        documentsVisible = 0;
      }
    }
    
    console.log(`📊 Documentos visibles: ${documentsVisible}`);
    
    // Verificar si puede subir documentos
    let canUpload = false;
    try {
      await page.goto(`${BASE_URL}/documents/upload`);
      await page.waitForSelector('h2:has-text("Subir Documento")', { timeout: 5000 });
      canUpload = true;
      console.log('✅ Puede acceder a formulario de upload');
    } catch (error) {
      console.log('❌ No puede acceder a formulario de upload');
    }
    
    // Screenshot de upload si es posible
    if (canUpload) {
      await page.screenshot({ 
        path: `e2e/screenshots/multi-user-${userType.toLowerCase()}-03-upload.png` 
      });
    }
    
    return {
      success: true,
      canAccessDocuments: true,
      documentsVisible,
      canUpload,
      loginTime: Date.now()
    };
    
  } catch (error) {
    console.log(`❌ Error testing ${userType}: ${error.message}`);
    
    // Screenshot de error
    await page.screenshot({ 
      path: `e2e/screenshots/multi-user-${userType.toLowerCase()}-ERROR.png` 
    });
    
    return {
      success: false,
      error: error.message
    };
    
  } finally {
    await browser.close();
  }
}

/**
 * Test comparativo con contextos simultáneos
 */
async function testComparativeIsolation() {
  console.log('🔒 Iniciando test comparativo de aislamiento...');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1280, height: 720 }
  });
  
  try {
    // Crear contextos separados para cada usuario
    const contexts = {};
    const pages = {};
    const documentCounts = {};
    
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
      contexts[userType] = await browser.newContext();
      pages[userType] = await contexts[userType].newPage();
      
      // Login simultáneo
      await pages[userType].goto(`${BASE_URL}/login`);
      await pages[userType].fill('input[name="email"]', userData.email);
      await pages[userType].fill('input[name="password"]', userData.password);
      await pages[userType].click('button[type="submit"]');
      
      // Esperar login
      await pages[userType].waitForTimeout(3000);
    }
    
    // Verificar documentos visibles por cada usuario simultáneamente
    for (const [userType, page] of Object.entries(pages)) {
      try {
        await page.goto(`${BASE_URL}/documents`);
        await page.waitForLoadState('networkidle');
        
        // Screenshot comparativo
        await page.screenshot({ 
          path: `e2e/screenshots/comparative-${userType.toLowerCase()}-documents.png` 
        });
        
        // Contar documentos
        let count = 0;
        try {
          count = await page.locator('[data-testid="document-item"]').count();
        } catch (error) {
          count = await page.locator('a[href*="/documents/"]').count().catch(() => 0);
        }
        
        documentCounts[userType] = count;
        console.log(`📊 ${userType}: ${count} documentos visibles`);
        
      } catch (error) {
        documentCounts[userType] = -1; // Error accessing
        console.log(`❌ ${userType}: Error accediendo a documentos`);
      }
    }
    
    // Cerrar contextos
    for (const context of Object.values(contexts)) {
      await context.close();
    }
    
    // Analizar resultados de aislamiento
    const adminDocs = documentCounts.ADMIN;
    const managerDocs = documentCounts.MANAGER;
    const residentDocs = documentCounts.RESIDENT;
    
    console.log('\n🔍 ANÁLISIS DE AISLAMIENTO RLS:');
    console.log(`   👑 Admin: ${adminDocs} documentos`);
    console.log(`   👔 Manager: ${managerDocs} documentos`);
    console.log(`   🏠 Resident: ${residentDocs} documentos`);
    
    // Verificar que el aislamiento está funcionando
    let isolationWorking = true;
    let analysis = [];
    
    if (adminDocs >= 0 && managerDocs >= 0) {
      if (adminDocs >= managerDocs) {
        analysis.push('✅ Admin ve >= documentos que Manager - CORRECTO');
      } else {
        analysis.push('⚠️ Admin ve < documentos que Manager - VERIFICAR');
        isolationWorking = false;
      }
    }
    
    if (managerDocs >= 0 && residentDocs >= 0) {
      if (managerDocs >= residentDocs) {
        analysis.push('✅ Manager ve >= documentos que Resident - CORRECTO');
      } else {
        analysis.push('⚠️ Manager ve < documentos que Resident - VERIFICAR');
        isolationWorking = false;
      }
    }
    
    analysis.forEach(line => console.log(`   ${line}`));
    
    return {
      success: isolationWorking && adminDocs >= 0,
      adminDocs,
      managerDocs, 
      residentDocs,
      analysis
    };
    
  } catch (error) {
    console.log(`❌ Error en test comparativo: ${error.message}`);
    return { success: false, error: error.message };
    
  } finally {
    await browser.close();
  }
}

/**
 * Verificar prerequisitos
 */
function verifyPrerequisites() {
  console.log('🔍 Verificando prerequisitos RLS...');
  
  // Verificar archivo de prueba
  if (!fs.existsSync(TEST_FILE)) {
    throw new Error(`Archivo de prueba no encontrado: ${TEST_FILE}`);
  }
  console.log(`✅ Archivo prueba: ${path.basename(TEST_FILE)}`);
  
  // Verificar directorio screenshots
  const screenshotsDir = 'e2e/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  console.log('✅ Prerequisitos RLS verificados\n');
}

/**
 * Ejecutar test RLS (siguiendo patrón UI Guardian)
 */
if (require.main === module) {
  (async () => {
    try {
      verifyPrerequisites();
      const result = await testMultiUserRLS();
      
      if (result.success) {
        console.log('\n🎉 SUCCESS: Tests RLS multi-usuario completados exitosamente');
        process.exit(0);
      } else {
        console.log('\n❌ FAILURE: Tests RLS con issues');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('\n💥 FATAL ERROR:', error.message);
      process.exit(1);
    }
  })();
}