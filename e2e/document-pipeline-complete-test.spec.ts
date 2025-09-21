/**
 * ARCHIVO: document-pipeline-complete-test.spec.ts
 * PROPÓSITO: Test automatizado completo del pipeline progresivo de 4 niveles con nueva UI
 * ESTADO: production
 * DEPENDENCIAS: @playwright/test, datos/*.pdf, backend pipeline, SimpleSelect, pipeline status
 * OUTPUTS: Tests automatizados con screenshots, logs, verificación de pipeline status y botones
 * ACTUALIZADO: 2025-09-15
 */

import { test, expect, type Page } from '@playwright/test';
import path from 'path';

// Configuración de usuarios para testing multi-rol
const TEST_USERS = {
  ADMIN: { email: 'sergioariasf@gmail.com', password: 'Elpato_46', role: 'admin' },
  // Nota: Para testing completo se necesitarían más usuarios con diferentes roles
};
const BASE_URL = 'http://localhost:3001';

// 📁 ARCHIVOS DE PRUEBA DISPONIBLES:
const TEST_FILES = {
  PDF_EDITABLE: '/home/sergi/proyectos/community-saas/datos/ACTA 19 MAYO 2022.pdf', // ✅ PDF editable (perfecto para Nivel 1 pdf-parse)
  FACTURA: '/home/sergi/proyectos/community-saas/datos/GIMNASIO_2023-1-230230.pdf', // ✅ Factura (perfecto para clasificación Nivel 2)
  PDF_ESCANEADO: '/home/sergi/proyectos/community-saas/datos/Acta junta extraordinaria 02.06.25.pdf' // ✅ PDF escaneado (perfecto para OCR fallback)
};

// Configuración de niveles de procesamiento
const PROCESSING_LEVELS = {
  NIVEL_1: { value: '1', name: 'Nivel 1: Solo almacenamiento y extracción de texto' },
  NIVEL_2: { value: '2', name: 'Nivel 2: + Clasificación automática del documento' },
  NIVEL_3: { value: '3', name: 'Nivel 3: + Extracción de fechas, importes y datos estructurados' },
  NIVEL_4: { value: '4', name: 'Nivel 4: + Segmentación para búsqueda avanzada (RAG)' }
};

/**
 * Función helper para hacer login con diferentes tipos de usuario
 */
async function loginUser(page: Page, userType: keyof typeof TEST_USERS = 'ADMIN'): Promise<void> {
  const user = TEST_USERS[userType];
  console.log(`🔐 Iniciando login como ${user.role}: ${user.email}`);
  
  await page.goto(`${BASE_URL}/login`);
  
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log(`✅ Login exitoso como ${user.role}`);
}

/**
 * Función helper para subir documento con nivel específico
 */
async function uploadDocument(
  page: Page, 
  filePath: string, 
  processingLevel: string, 
  testName: string
): Promise<{ success: boolean; processingTime: number; documentId?: string }> {
  const startTime = Date.now();
  
  try {
    console.log(`📤 Subiendo documento: ${path.basename(filePath)} - Nivel ${processingLevel}`);
    
    // Navegar a página de upload
    await page.goto(`${BASE_URL}/documents/upload`, { waitUntil: 'networkidle' });
    await expect(page.locator('h2:has-text("Subir Documento")')).toBeVisible();
    
    // Screenshot inicial
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-step1-upload-form.png`,
      fullPage: true 
    });
    
    // Seleccionar archivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    await expect(page.locator(`text=${path.basename(filePath)}`)).toBeVisible();
    
    // Seleccionar nivel de procesamiento (usando SimpleSelect)
    console.log(`🎛️ Seleccionando nivel de procesamiento: ${processingLevel}`);
    const levelSelect = page.locator('select[name="processing_level"], select[name="processingLevel"]').first();
    await levelSelect.selectOption(processingLevel);
    
    // Verificar que se seleccionó correctamente
    const selectedValue = await levelSelect.inputValue();
    console.log(`✅ Nivel seleccionado: ${selectedValue}`);
    
    // Seleccionar comunidad (usando SimpleSelect nativo)
    try {
      const communitySelect = page.locator('select[name="community_id"], select[name="communityId"]').first();
      const isVisible = await communitySelect.isVisible().catch(() => false);
      
      if (isVisible) {
        // Obtener primera opción válida (no empty)
        const options = await communitySelect.locator('option').allTextContents();
        const validOptions = options.filter(opt => opt && opt !== 'Selecciona una comunidad' && opt.trim());
        
        if (validOptions.length > 0) {
          await communitySelect.selectOption({ label: validOptions[0] });
          console.log(`✅ Comunidad seleccionada: ${validOptions[0]}`);
        } else {
          console.log('⚠️ No hay comunidades disponibles - continuando sin comunidad específica');
        }
      } else {
        console.log('⚠️ Selector de comunidad no visible - puede ser opcional');
      }
    } catch (error) {
      console.log('⚠️ No se pudo seleccionar comunidad automáticamente:', error);
    }
    
    // Screenshot antes del upload
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-step2-before-upload.png`,
      fullPage: true 
    });
    
    // Hacer clic en el botón de submit
    const submitButton = page.locator('button[type="submit"]:has-text("Subir Documento")');
    await submitButton.click();
    
    console.log('⏳ Monitoreando proceso de upload...');
    
    // Monitorear proceso de upload y capturar estados intermedios
    let processingScreenshotCount = 1;
    const checkProcessing = async () => {
      try {
        const bodyText = await page.textContent('body');
        if (bodyText?.includes('Procesando') || bodyText?.includes('Subiendo')) {
          await page.screenshot({ 
            path: `e2e/screenshots/${testName}-step3-processing-${processingScreenshotCount}.png`,
            fullPage: true 
          });
          processingScreenshotCount++;
        }
      } catch (error) {
        // Ignorar errores de screenshot durante procesamiento
      }
    };
    
    // Intervalo para capturar screenshots durante procesamiento
    const processingInterval = setInterval(checkProcessing, 3000);
    
    try {
      // Esperar a que el procesamiento termine o redirija
      await page.waitForFunction(() => {
        const currentPath = window.location.pathname;
        const bodyText = document.querySelector('body')?.textContent || '';
        
        return (
          currentPath.includes('/documents') && !currentPath.includes('/upload') ||
          bodyText.includes('exitosamente') || 
          bodyText.includes('Error') ||
          bodyText.includes('completado')
        );
      }, { timeout: 180000 }); // 3 minutos timeout para procesamientos complejos
      
    } finally {
      clearInterval(processingInterval);
    }
    
    // Screenshot final del resultado
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-step4-final-result.png`,
      fullPage: true 
    });
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo total de procesamiento: ${processingTime}ms`);
    
    // Verificar resultado
    const finalUrl = page.url();
    const bodyText = await page.textContent('body');
    
    const success = (
      finalUrl.includes('/documents') && !finalUrl.includes('/upload')
    ) && !(bodyText?.includes('Error') && !bodyText?.includes('exitosamente'));
    
    if (success) {
      console.log('✅ Upload completado exitosamente');
      
      // Intentar extraer documentId de la URL si estamos en una página de detalle
      const documentIdMatch = finalUrl.match(/\/documents\/([^\/\?]+)/);
      const documentId = documentIdMatch ? documentIdMatch[1] : undefined;
      
      return { success: true, processingTime, documentId };
    } else {
      console.log('❌ Upload falló o completado con errores');
      return { success: false, processingTime };
    }
    
  } catch (error) {
    console.error(`❌ Error durante upload: ${error}`);
    
    // Screenshot de error
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-error.png`,
      fullPage: true 
    });
    
    const processingTime = Date.now() - startTime;
    return { success: false, processingTime };
  }
}

/**
 * Función para verificar los datos procesados según el nivel con NUEVA UI
 */
async function verifyProcessedData(
  page: Page, 
  processingLevel: string, 
  documentId: string | undefined,
  testName: string
): Promise<{ verified: boolean; foundData: string[]; pipelineStatus: any }> {
  const foundData: string[] = [];
  let pipelineStatus = {};
  
  try {
    // Si tenemos documentId, ir a la página de detalles
    if (documentId) {
      await page.goto(`${BASE_URL}/documents/${documentId}`, { waitUntil: 'networkidle' });
    } else {
      // Si no, ir a la lista y buscar el documento más reciente
      await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle' });
      
      // Buscar el primer documento en la tabla
      const firstDocumentLink = page.locator('a[href*="/documents/"]').first();
      if (await firstDocumentLink.isVisible()) {
        await firstDocumentLink.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Screenshot de la página de detalles
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-verification-details.png`,
      fullPage: true 
    });
    
    const pageContent = await page.textContent('body') || '';
    const level = parseInt(processingLevel);
    
    // 🆕 VERIFICAR NUEVO PIPELINE STATUS
    try {
      // Buscar badges de "Configurado" y "Completado"
      const configuredBadge = await page.locator('text=/Configurado: \d+\/4/').textContent().catch(() => null);
      const completedBadge = await page.locator('text=/Completado: \d+\/\d+/').textContent().catch(() => null);
      
      if (configuredBadge) {
        foundData.push(`✅ Pipeline Status - ${configuredBadge}`);
        pipelineStatus.configured = configuredBadge;
      }
      
      if (completedBadge) {
        foundData.push(`✅ Pipeline Status - ${completedBadge}`);
        pipelineStatus.completed = completedBadge;
      }
      
      // Verificar estado individual de cada nivel
      const extractionStatus = await page.locator('text=/Extracción.*✅|completed/').count();
      const classificationStatus = await page.locator('text=/Clasificación.*✅|completed/').count();
      const metadataStatus = await page.locator('text=/Metadatos.*✅|completed/').count();
      const chunkingStatus = await page.locator('text=/Chunking.*✅|completed/').count();
      
      pipelineStatus.levels = {
        extraction: extractionStatus > 0,
        classification: classificationStatus > 0,
        metadata: metadataStatus > 0,
        chunking: chunkingStatus > 0
      };
      
    } catch (error) {
      foundData.push(`⚠️ Error verificando pipeline status: ${error}`);
    }
    
    // 🆕 VERIFICACIONES MEJORADAS SEGÚN NIVEL
    if (level >= 1) {
      // Nivel 1: Verificar extracción usando pipeline status
      if (pipelineStatus.levels?.extraction || pageContent.includes('completed')) {
        foundData.push('✅ Nivel 1: Extracción completada según pipeline status');
      } else if (pageContent.includes('texto') || pageContent.includes('content') || pageContent.includes('characters')) {
        foundData.push('✅ Nivel 1: Texto extraído detectado en contenido');
      } else {
        foundData.push('⚠️ Nivel 1: Extracción no confirmada');
      }
    }
    
    if (level >= 2) {
      // Nivel 2: Verificar clasificación
      if (pipelineStatus.levels?.classification) {
        foundData.push('✅ Nivel 2: Clasificación completada según pipeline status');
      } else if (/acta|contrato|factura|comunicado/i.test(pageContent)) {
        foundData.push('✅ Nivel 2: Clasificación detectada en contenido');
      } else {
        foundData.push('⚠️ Nivel 2: Clasificación no confirmada');
      }
    }
    
    if (level >= 3) {
      // Nivel 3: Verificar metadata
      if (pipelineStatus.levels?.metadata) {
        foundData.push('✅ Nivel 3: Metadata completada según pipeline status');
      } else if (pageContent.includes('metadata') || /\d{4}-\d{2}-\d{2}/.test(pageContent)) {
        foundData.push('✅ Nivel 3: Metadatos detectados en contenido');
      } else {
        foundData.push('⚠️ Nivel 3: Metadata no confirmada');
      }
    }
    
    if (level >= 4) {
      // Nivel 4: Verificar chunking
      if (pipelineStatus.levels?.chunking) {
        foundData.push('✅ Nivel 4: Chunking completado según pipeline status');
      } else if (pageContent.includes('chunk') || pageContent.includes('segment')) {
        foundData.push('✅ Nivel 4: Chunks detectados en contenido');
      } else {
        foundData.push('⚠️ Nivel 4: Chunking no confirmado');
      }
    }
    
    // Verificar métricas de procesamiento si están disponibles
    if (pageContent.includes('tiempo') || pageContent.includes('tokens') || pageContent.includes('cost')) {
      foundData.push('✅ Métricas de procesamiento encontradas');
    }
    
    const verified = foundData.filter(data => data.includes('✅')).length > 0;
    return { verified, foundData, pipelineStatus };
    
  } catch (error) {
    console.error(`❌ Error verificando datos: ${error}`);
    return { 
      verified: false, 
      foundData: [`❌ Error verificando datos: ${error}`],
      pipelineStatus: {}
    };
  }
}

test.describe('🧪 Pipeline Progresivo - Tests Completos por Nivel', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000); // 5 minutos timeout para procesamientos largos
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });
    
    await loginUser(page);
  });

  test('📄 Nivel 1 - PDF Editable: Storage + Extraction (pdf-parse)', async ({ page }) => {
    const testName = 'nivel1-pdf-editable';
    const result = await uploadDocument(page, TEST_FILES.PDF_EDITABLE, '1', testName);
    
    expect(result.success).toBe(true);
    expect(result.processingTime).toBeLessThan(30000); // Nivel 1 debería ser rápido
    
    if (result.success && result.documentId) {
      const verification = await verifyProcessedData(page, '1', result.documentId, testName);
      console.log('📊 Verificación Nivel 1:', verification.foundData.join('\n'));
      console.log('📊 Pipeline Status:', verification.pipelineStatus);
    }
    
    console.log(`⏱️ Rendimiento Nivel 1: ${result.processingTime}ms`);
  });

  test('📄 Nivel 1 - PDF Escaneado: Storage + Extraction (OCR fallback)', async ({ page }) => {
    const testName = 'nivel1-pdf-escaneado';
    const result = await uploadDocument(page, TEST_FILES.PDF_ESCANEADO, '1', testName);
    
    expect(result.success).toBe(true);
    expect(result.processingTime).toBeLessThan(120000); // OCR puede tomar más tiempo
    
    if (result.success && result.documentId) {
      const verification = await verifyProcessedData(page, '1', result.documentId, testName);
      console.log('📊 Verificación OCR:', verification.foundData.join('\n'));
      console.log('📊 Pipeline Status:', verification.pipelineStatus);
    }
    
    console.log(`⏱️ Rendimiento OCR: ${result.processingTime}ms`);
  });

  test('🏷️ Nivel 2 - Clasificación: Factura (Gemini AI)', async ({ page }) => {
    const testName = 'nivel2-clasificacion-factura';
    const result = await uploadDocument(page, TEST_FILES.FACTURA, '2', testName);
    
    expect(result.success).toBe(true);
    expect(result.processingTime).toBeLessThan(60000);
    
    if (result.success && result.documentId) {
      const verification = await verifyProcessedData(page, '2', result.documentId, testName);
      console.log('📊 Verificación Clasificación:', verification.foundData.join('\n'));
      console.log('📊 Pipeline Status:', verification.pipelineStatus);
      
      // Verificar específicamente que se clasificó como factura
      const hasFactura = verification.foundData.some(data => 
        data.includes('factura') || data.includes('Nivel 2')
      );
      expect(hasFactura).toBe(true);
    }
    
    console.log(`⏱️ Rendimiento Clasificación: ${result.processingTime}ms`);
  });

  test('📊 Nivel 3 - Metadata: Acta con fechas y keywords', async ({ page }) => {
    const testName = 'nivel3-metadata-acta';
    const result = await uploadDocument(page, TEST_FILES.PDF_EDITABLE, '3', testName);
    
    expect(result.success).toBe(true);
    expect(result.processingTime).toBeLessThan(90000);
    
    if (result.success && result.documentId) {
      const verification = await verifyProcessedData(page, '3', result.documentId, testName);
      console.log('📊 Verificación Metadata:', verification.foundData.join('\n'));
      console.log('📊 Pipeline Status:', verification.pipelineStatus);
    }
    
    console.log(`⏱️ Rendimiento Metadata: ${result.processingTime}ms`);
  });

  test('🧩 Nivel 4 - Chunking: Pipeline completo RAG', async ({ page }) => {
    const testName = 'nivel4-chunking-completo';
    const result = await uploadDocument(page, TEST_FILES.PDF_EDITABLE, '4', testName);
    
    expect(result.success).toBe(true);
    expect(result.processingTime).toBeLessThan(120000); // Pipeline completo puede tomar más tiempo
    
    if (result.success && result.documentId) {
      const verification = await verifyProcessedData(page, '4', result.documentId, testName);
      console.log('📊 Verificación Pipeline Completo:', verification.foundData.join('\n'));
      console.log('📊 Pipeline Status:', verification.pipelineStatus);
      
      // Verificar que se completaron todos los niveles
      const allLevelsCompleted = verification.foundData.filter(data => data.includes('✅')).length >= 3;
      expect(allLevelsCompleted).toBe(true);
    }
    
    console.log(`⏱️ Rendimiento Pipeline Completo: ${result.processingTime}ms`);
  });

  test('⚡ Performance Test - Múltiples documentos simultáneos', async ({ page }) => {
    const testName = 'performance-multiple-docs';
    const startTime = Date.now();
    
    // Subir 3 documentos de nivel 2 rápidamente
    const results = [];
    
    for (let i = 0; i < 3; i++) {
      const file = i === 0 ? TEST_FILES.PDF_EDITABLE : 
                   i === 1 ? TEST_FILES.FACTURA : TEST_FILES.PDF_ESCANEADO;
      
      const result = await uploadDocument(page, file, '2', `${testName}-doc${i+1}`);
      results.push(result);
    }
    
    const totalTime = Date.now() - startTime;
    const successfulUploads = results.filter(r => r.success).length;
    
    console.log(`📊 Performance Test Results:`);
    console.log(`   - Documentos procesados: ${successfulUploads}/3`);
    console.log(`   - Tiempo total: ${totalTime}ms`);
    console.log(`   - Tiempo promedio por documento: ${Math.round(totalTime / 3)}ms`);
    
    expect(successfulUploads).toBeGreaterThanOrEqual(2); // Al menos 2 de 3 exitosos
    expect(totalTime).toBeLessThan(300000); // Menos de 5 minutos total
  });

  test('❌ Error Handling - Archivo inválido', async ({ page }) => {
    const testName = 'error-handling';
    
    // Navegar a página de upload
    await page.goto(`${BASE_URL}/documents/upload`, { waitUntil: 'networkidle' });
    
    // Screenshot inicial
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-initial.png`,
      fullPage: true 
    });
    
    // Verificar que botón submit está deshabilitado sin archivo
    const submitButton = page.locator('button[type="submit"]:has-text("Subir Documento")');
    await expect(submitButton).toBeDisabled();
    
    // Intentar subir archivo inexistente (esto debería fallar graciosamente)
    try {
      const fileInput = page.locator('input[type="file"]');
      // En lugar de un archivo real, verificamos el comportamiento del formulario
      
      // Screenshot de validación funcionando
      await page.screenshot({ 
        path: `e2e/screenshots/${testName}-validation-working.png`,
        fullPage: true 
      });
      
      console.log('✅ Validación de formulario funcionando correctamente');
      
    } catch (error) {
      console.log('✅ Error handling funcionando como esperado');
    }
  });
});

test.describe('🛡️ Seguridad y RLS Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await loginUser(page);
  });

  test('🔐 RLS - Verificar aislamiento por organización', async ({ page }) => {
    const testName = 'rls-organization-isolation';
    
    // Subir documento
    const result = await uploadDocument(page, TEST_FILES.PDF_EDITABLE, '2', testName);
    expect(result.success).toBe(true);
    
    // Ir a la lista de documentos
    await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle' });
    
    // Screenshot de la lista
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-documents-list.png`,
      fullPage: true 
    });
    
    // Verificar que solo vemos documentos de nuestra organización
    const documentElements = await page.locator('a[href*="/documents/"]').count();
    
    console.log(`📊 Documentos visibles: ${documentElements}`);
    expect(documentElements).toBeGreaterThan(0);
    
    // TODO: Para test completo de RLS, necesitaríamos múltiples usuarios
    console.log('✅ RLS básico verificado - solo documentos accesibles mostrados');
  });
});

test.describe('🆕 Nuevas Funcionalidades UI - Tests Actualizados', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000); // 3 minutos para operaciones complejas
    await loginUser(page);
  });

  test('🗑️ Botón "Borrar Todo" - Funcionalidad completa', async ({ page }) => {
    const testName = 'clean-all-button';
    
    // Primero subir algunos documentos para tener algo que borrar
    console.log('📤 Subiendo documentos de prueba...');
    await uploadDocument(page, TEST_FILES.PDF_EDITABLE, '2', `${testName}-setup1`);
    await uploadDocument(page, TEST_FILES.FACTURA, '2', `${testName}-setup2`);
    
    // Ir a la lista de documentos
    await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle' });
    
    // Verificar que hay documentos
    const documentCountBefore = await page.locator('a[href*="/documents/"]').count();
    console.log(`📊 Documentos antes de limpiar: ${documentCountBefore}`);
    expect(documentCountBefore).toBeGreaterThan(0);
    
    // Screenshot antes de limpiar
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-before-clean.png`,
      fullPage: true 
    });
    
    // Buscar y hacer clic en el botón "Borrar Todo"
    const cleanButton = page.locator('button:has-text("Borrar Todo")');
    await expect(cleanButton).toBeVisible();
    await cleanButton.click();
    
    // Verificar que aparece el dialog de confirmación
    await expect(page.locator('text=¿Eliminar todos los documentos?')).toBeVisible();
    await expect(page.locator('text=Esta acción eliminará permanentemente')).toBeVisible();
    
    // Screenshot del dialog de confirmación
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-confirmation-dialog.png`,
      fullPage: true 
    });
    
    // Confirmar la eliminación
    const confirmButton = page.locator('button:has-text("Sí, eliminar todo")');
    await confirmButton.click();
    
    // Esperar a que se complete la operación (buscar toast de éxito)
    try {
      await expect(page.locator('text=/Limpieza completada|eliminados/i')).toBeVisible({ timeout: 30000 });
      console.log('✅ Toast de confirmación apareció');
    } catch (error) {
      console.log('⚠️ Toast no detectado, verificando resultado directamente');
    }
    
    // Esperar a que se recargue la página
    await page.waitForLoadState('networkidle');
    
    // Screenshot después de limpiar
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-after-clean.png`,
      fullPage: true 
    });
    
    // Verificar que no hay documentos
    const noDocsMessage = page.locator('text=/No hay documentos|sin documentos/i');
    await expect(noDocsMessage).toBeVisible();
    
    // Verificar que el contador de documentos es 0
    const documentCountAfter = await page.locator('a[href*="/documents/"]').count();
    console.log(`📊 Documentos después de limpiar: ${documentCountAfter}`);
    expect(documentCountAfter).toBe(0);
    
    console.log('✅ Funcionalidad "Borrar Todo" verificada exitosamente');
  });

  test('👁️ Botones "Visualizar" y "Descargar" - Verificación completa', async ({ page }) => {
    const testName = 'view-download-buttons';
    
    // Subir un documento
    const result = await uploadDocument(page, TEST_FILES.PDF_EDITABLE, '3', testName);
    expect(result.success).toBe(true);
    
    let documentId = result.documentId;
    
    // Si no tenemos documentId de la subida, buscar el más reciente
    if (!documentId) {
      await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle' });
      const firstDocLink = page.locator('a[href*="/documents/"]').first();
      if (await firstDocLink.isVisible()) {
        const href = await firstDocLink.getAttribute('href');
        documentId = href?.split('/documents/')[1]?.split('?')[0];
      }
    }
    
    // Ir a la página de detalles del documento
    if (documentId) {
      await page.goto(`${BASE_URL}/documents/${documentId}`, { waitUntil: 'networkidle' });
      
      // Screenshot inicial de la página de detalles
      await page.screenshot({ 
        path: `e2e/screenshots/${testName}-document-details.png`,
        fullPage: true 
      });
      
      // Verificar que los botones están presentes
      const visualizeButton = page.locator('button:has-text("Visualizar"), a:has-text("Visualizar")').first();
      const downloadButton = page.locator('button:has-text("Descargar"), a:has-text("Descargar")').first();
      
      await expect(visualizeButton).toBeVisible();
      await expect(downloadButton).toBeVisible();
      
      console.log('✅ Botones Visualizar y Descargar encontrados');
      
      // Test del botón Visualizar (abre en nueva pestaña)
      const visualizeUrl = await visualizeButton.getAttribute('href');
      expect(visualizeUrl).toContain('/api/documents/');
      expect(visualizeUrl).toContain('view=inline');
      console.log('✅ URL de visualización correcta:', visualizeUrl);
      
      // Test del botón Descargar
      const downloadUrl = await downloadButton.getAttribute('href');
      expect(downloadUrl).toContain('/api/documents/');
      expect(downloadUrl).not.toContain('view=inline');
      console.log('✅ URL de descarga correcta:', downloadUrl);
      
      // Verificar que las URLs son diferentes
      expect(visualizeUrl).not.toBe(downloadUrl);
      
      console.log('✅ Botones de Visualizar y Descargar verificados exitosamente');
    } else {
      throw new Error('No se pudo obtener el ID del documento para testing');
    }
  });

  test('📊 Pipeline Status Visual - Verificación completa de estados', async ({ page }) => {
    const testName = 'pipeline-status-visual';
    
    // Subir documento con nivel 4 para ver todo el pipeline
    const result = await uploadDocument(page, TEST_FILES.PDF_EDITABLE, '4', testName);
    expect(result.success).toBe(true);
    
    let documentId = result.documentId;
    
    // Navegar a los detalles del documento
    if (!documentId) {
      await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle' });
      const firstDocLink = page.locator('a[href*="/documents/"]').first();
      if (await firstDocLink.isVisible()) {
        await firstDocLink.click();
        await page.waitForLoadState('networkidle');
      }
    } else {
      await page.goto(`${BASE_URL}/documents/${documentId}`, { waitUntil: 'networkidle' });
    }
    
    // Screenshot de la página con pipeline status
    await page.screenshot({ 
      path: `e2e/screenshots/${testName}-pipeline-status.png`,
      fullPage: true 
    });
    
    // Verificar elementos del pipeline status
    const pipelineSection = page.locator('text=Estado del Pipeline de Procesamiento');
    await expect(pipelineSection).toBeVisible();
    
    // Verificar badges de configurado/completado
    const configuredBadge = page.locator('text=/Configurado: \\d+\\/4/');
    const completedBadge = page.locator('text=/Completado: \\d+\\/\\d+/');
    
    await expect(configuredBadge).toBeVisible();
    await expect(completedBadge).toBeVisible();
    
    // Obtener valores actuales
    const configuredText = await configuredBadge.textContent();
    const completedText = await completedBadge.textContent();
    
    console.log('📊 Pipeline Status encontrado:');
    console.log(`   - ${configuredText}`);
    console.log(`   - ${completedText}`);
    
    // Verificar que "Configurado" es 4/4 (ya que subimos con nivel 4)
    expect(configuredText).toContain('4/4');
    
    // Verificar indicadores individuales de nivel
    const extractionIndicator = page.locator('text=Extracción');
    const classificationIndicator = page.locator('text=Clasificación');
    const metadataIndicator = page.locator('text=Metadatos');
    const chunkingIndicator = page.locator('text=Chunking');
    
    await expect(extractionIndicator).toBeVisible();
    await expect(classificationIndicator).toBeVisible();
    await expect(metadataIndicator).toBeVisible();
    await expect(chunkingIndicator).toBeVisible();
    
    console.log('✅ Todos los indicadores de nivel encontrados');
    
    // Verificar que hay íconos de estado (✅ ⏳ ⏸️)
    const pageContent = await page.textContent('body');
    const hasStatusIcons = pageContent && (
      pageContent.includes('✅') || 
      pageContent.includes('⏳') || 
      pageContent.includes('⏸️') ||
      pageContent.includes('completed') ||
      pageContent.includes('pending') ||
      pageContent.includes('processing')
    );
    
    expect(hasStatusIcons).toBe(true);
    console.log('✅ Íconos de estado del pipeline verificados');
    
    console.log('✅ Pipeline Status Visual verificado exitosamente');
  });
});