#!/usr/bin/env node

/**
 * ARCHIVO: test-document-pipeline-complete.js
 * PROPÓSITO: Test completo del pipeline progresivo usando patrón UI Guardian
 * ESTADO: production
 * DEPENDENCIAS: playwright, archivos PDF de prueba, servidor Next.js
 * OUTPUTS: Test exhaustivo con screenshots y validaciones paso a paso
 * ACTUALIZADO: 2025-09-14
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuración (siguiendo patrón UI Guardian)
const TEST_USER_EMAIL = 'sergioariasf@gmail.com';
const TEST_USER_PASSWORD = 'Elpato_46';
const BASE_URL = 'http://localhost:3001';

// Archivos de prueba
const TEST_FILES = {
  PDF_EDITABLE: '/home/sergi/proyectos/community-saas/datos/ACTA 19 MAYO 2022.pdf',
  PDF_ESCANEADO: '/home/sergi/proyectos/community-saas/datos/Acta junta extraordinaria 02.06.25.pdf', 
  FACTURA: '/home/sergi/proyectos/community-saas/datos/GIMNASIO_2023-1-230230.pdf',
  ACTA_SIMPLE: '/home/sergi/proyectos/community-saas/datos/acta_prueba.pdf'
};

// Configuración de niveles
const PROCESSING_LEVELS = {
  1: 'Nivel 1: Solo almacenamiento y extracción de texto',
  2: 'Nivel 2: + Clasificación automática del documento', 
  3: 'Nivel 3: + Extracción de fechas, importes y datos estructurados',
  4: 'Nivel 4: + Segmentación para búsqueda avanzada (RAG)'
};

/**
 * Función principal de testing (siguiendo estructura UI Guardian)
 */
async function testDocumentPipeline() {
  console.log('🧪 INICIANDO TEST COMPLETO DEL PIPELINE PROGRESIVO');
  console.log('===================================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Como UI Guardian - visual para debugging
    viewport: { width: 1280, height: 720 }
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // ===== PASO 1: LOGIN =====
    console.log('🔐 PASO 1: Autenticación');
    console.log('-'.repeat(30));
    
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', TEST_USER_EMAIL);
    await page.fill('input[name="password"]', TEST_USER_PASSWORD);
    
    // Screenshot de login
    await page.screenshot({ path: 'e2e/screenshots/pipeline-test-01-login.png' });
    
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    console.log('✅ Login exitoso\n');
    
    // ===== PASO 2: NAVEGACIÓN A DOCUMENTOS =====
    console.log('📄 PASO 2: Navegación a módulo documentos');
    console.log('-'.repeat(30));
    
    await page.goto(`${BASE_URL}/documents`);
    await page.waitForLoadState('networkidle');
    
    // Screenshot de lista de documentos
    await page.screenshot({ path: 'e2e/screenshots/pipeline-test-02-documents-list.png' });
    
    console.log('✅ Módulo documentos accesible\n');
    
    // ===== PASO 3: TESTS POR NIVEL =====
    const testResults = [];
    
    for (const [level, description] of Object.entries(PROCESSING_LEVELS)) {
      console.log(`🔄 PASO 3.${level}: Testing ${description}`);
      console.log('-'.repeat(50));
      
      const testFile = level === '1' ? TEST_FILES.PDF_EDITABLE :
                      level === '2' ? TEST_FILES.FACTURA :
                      level === '3' ? TEST_FILES.PDF_EDITABLE :
                      TEST_FILES.ACTA_SIMPLE;
      
      const result = await testDocumentUpload(page, level, testFile, `nivel-${level}`);
      testResults.push({ level, description, ...result });
      
      console.log(`${result.success ? '✅' : '❌'} Nivel ${level}: ${result.success ? 'ÉXITO' : 'FALLO'}`);
      if (result.processingTime) {
        console.log(`⏱️ Tiempo: ${result.processingTime}ms`);
      }
      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      }
      console.log('');
    }
    
    // ===== PASO 4: RESUMEN FINAL =====
    console.log('📊 RESUMEN FINAL DEL TESTING');
    console.log('='.repeat(50));
    
    const successful = testResults.filter(r => r.success).length;
    const total = testResults.length;
    
    console.log(`✅ Tests exitosos: ${successful}/${total}`);
    console.log('');
    
    testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.description}`);
      if (result.processingTime) {
        console.log(`   ⏱️ ${result.processingTime}ms`);
      }
      if (result.error) {
        console.log(`   💥 ${result.error}`);
      }
    });
    
    // Screenshot final
    await page.screenshot({ path: 'e2e/screenshots/pipeline-test-99-final-summary.png' });
    
    console.log('\n🎉 TESTING COMPLETO');
    return { success: successful === total, results: testResults };
    
  } catch (error) {
    console.error('💥 ERROR FATAL EN TESTING:', error.message);
    
    // Screenshot de error
    await page.screenshot({ path: 'e2e/screenshots/pipeline-test-ERROR.png' });
    return { success: false, error: error.message };
    
  } finally {
    await browser.close();
  }
}

/**
 * Función para testear upload de documento con nivel específico
 */
async function testDocumentUpload(page, level, filePath, testName) {
  const startTime = Date.now();
  
  try {
    console.log(`📤 Subiendo: ${path.basename(filePath)} (Nivel ${level})`);
    
    // Ir a página de upload
    await page.goto(`${BASE_URL}/documents/upload`);
    await page.waitForSelector('h2:has-text("Subir Documento")');
    
    // Screenshot inicial
    await page.screenshot({ 
      path: `e2e/screenshots/pipeline-test-${testName}-01-form.png` 
    });
    
    // Seleccionar archivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Verificar que el archivo se seleccionó
    await page.waitForSelector(`text=${path.basename(filePath)}`);
    
    // Seleccionar nivel de procesamiento
    const levelSelect = page.locator('select[name="processing_level"], select[name="processingLevel"]');
    await levelSelect.selectOption(level);
    
    console.log(`✅ Archivo y nivel seleccionados`);
    
    // Intentar seleccionar comunidad
    try {
      const communityButton = page.locator('button:has-text("Selecciona")').first();
      if (await communityButton.isVisible()) {
        await communityButton.click();
        await page.waitForTimeout(1000);
        
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          console.log('✅ Comunidad seleccionada');
        }
      }
    } catch (error) {
      console.log('⚠️ No se pudo seleccionar comunidad automáticamente');
    }
    
    // Screenshot antes del upload
    await page.screenshot({ 
      path: `e2e/screenshots/pipeline-test-${testName}-02-ready.png` 
    });
    
    // Hacer clic en submit
    const submitButton = page.locator('button[type="submit"]:has-text("Subir Documento")');
    
    if (await submitButton.isDisabled()) {
      console.log('⚠️ Botón submit deshabilitado (falta comunidad)');
      return { 
        success: false, 
        error: 'Submit button disabled - missing required fields',
        processingTime: Date.now() - startTime 
      };
    }
    
    await submitButton.click();
    console.log('⏳ Procesando documento...');
    
    // Monitorear el procesamiento
    let processingCount = 0;
    const maxWaitTime = 120000; // 2 minutos
    const checkInterval = 3000; // cada 3 segundos
    
    while (processingCount < maxWaitTime / checkInterval) {
      try {
        // Screenshot de progreso
        await page.screenshot({ 
          path: `e2e/screenshots/pipeline-test-${testName}-03-processing-${processingCount + 1}.png` 
        });
        
        const currentUrl = page.url();
        const bodyText = await page.textContent('body');
        
        // Verificar si el procesamiento terminó
        if (currentUrl.includes('/documents') && !currentUrl.includes('/upload')) {
          console.log('✅ Redirigido a documentos - procesamiento completo');
          break;
        }
        
        if (bodyText.includes('exitosamente') || bodyText.includes('completado')) {
          console.log('✅ Mensaje de éxito detectado');
          break;
        }
        
        if (bodyText.includes('Error') && !bodyText.includes('exitosamente')) {
          throw new Error('Error detectado durante procesamiento');
        }
        
        await page.waitForTimeout(checkInterval);
        processingCount++;
        
      } catch (error) {
        if (error.message.includes('Error detectado')) {
          throw error;
        }
        // Continuar si es otro tipo de error
        processingCount++;
      }
    }
    
    // Screenshot final
    await page.screenshot({ 
      path: `e2e/screenshots/pipeline-test-${testName}-04-result.png` 
    });
    
    const processingTime = Date.now() - startTime;
    
    if (processingCount >= maxWaitTime / checkInterval) {
      return {
        success: false,
        error: 'Timeout esperando procesamiento',
        processingTime
      };
    }
    
    console.log('✅ Upload completado exitosamente');
    return { success: true, processingTime };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.log(`❌ Error durante upload: ${error.message}`);
    
    // Screenshot de error
    await page.screenshot({ 
      path: `e2e/screenshots/pipeline-test-${testName}-ERROR.png` 
    });
    
    return { success: false, error: error.message, processingTime };
  }
}

/**
 * Verificar prerequisitos antes del test
 */
function verifyPrerequisites() {
  console.log('🔍 Verificando prerequisitos...');
  
  // Verificar archivos de prueba
  for (const [name, filePath] of Object.entries(TEST_FILES)) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo de prueba no encontrado: ${filePath}`);
    }
    console.log(`✅ ${name}: ${path.basename(filePath)}`);
  }
  
  // Crear directorio de screenshots si no existe
  const screenshotsDir = 'e2e/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  console.log('✅ Prerequisitos verificados\n');
}

/**
 * Ejecutar el test (siguiendo patrón UI Guardian)
 */
if (require.main === module) {
  (async () => {
    try {
      verifyPrerequisites();
      const result = await testDocumentPipeline();
      
      if (result.success) {
        console.log('\n🎉 SUCCESS: Todos los tests del pipeline completados exitosamente');
        process.exit(0);
      } else {
        console.log('\n❌ FAILURE: Algunos tests fallaron');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('\n💥 FATAL ERROR:', error.message);
      process.exit(1);
    }
  })();
}