#!/usr/bin/env node

/**
 * Script de debug para interceptar valores del formulario
 */

const { chromium } = require('playwright');

async function debugFormValues() {
  console.log('🔍 DEBUGGING FORM VALUES');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'sergioariasf@gmail.com');
    await page.fill('input[name="password"]', 'Elpato_46');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    // Ir al formulario
    await page.goto('http://localhost:3001/documents/upload');
    await page.waitForLoadState('networkidle');
    
    // Seleccionar archivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('/home/sergi/proyectos/community-saas/datos/acta_prueba.pdf');
    
    // Seleccionar comunidad
    await page.locator('[role="combobox"]').first().click();
    await page.waitForSelector('[role="option"]');
    await page.locator('[role="option"]').first().click();
    
    // Seleccionar nivel
    await page.locator('[role="combobox"]').nth(1).click();
    await page.waitForSelector('[role="option"]');
    await page.locator('[role="option"]:has-text("4"), [role="option"]:has-text("Completo")').first().click();
    
    // Esperar un poco para que se actualice la validación
    await page.waitForTimeout(2000);
    
    // Interceptar valores del formulario antes del submit
    const formValues = await page.evaluate(() => {
      // Buscar el formulario
      const form = document.querySelector('form');
      if (!form) return { error: 'No form found' };
      
      // Extraer valores de todos los campos
      const formData = new FormData(form);
      const values = {};
      
      for (let [key, value] of formData.entries()) {
        values[key] = {
          value: value,
          type: typeof value,
          constructor: value.constructor.name
        };
      }
      
      // También verificar el estado de react-hook-form
      const submitButton = form.querySelector('button[type="submit"]');
      
      return {
        formDataValues: values,
        submitButtonDisabled: submitButton ? submitButton.disabled : 'not found',
        submitButtonClasses: submitButton ? submitButton.className : 'not found'
      };
    });
    
    console.log('📋 FORM VALUES DEBUG:');
    console.log(JSON.stringify(formValues, null, 2));
    
    // También interceptar console.log del cliente
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`🌐 CLIENT: ${msg.text()}`);
      }
    });
    
    // Intentar hacer submit y ver qué pasa
    console.log('\n🚀 Intentando submit...');
    
    try {
      await page.click('button[type="submit"]', { timeout: 5000 });
      console.log('✅ Click en submit ejecutado');
    } catch (error) {
      console.log('❌ Error en click submit:', error.message);
    }
    
    // Esperar un poco más para ver logs
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    
  } finally {
    console.log('\n⏸️ Presiona Enter para cerrar el browser...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => {
      browser.close();
      process.exit(0);
    });
  }
}

debugFormValues();