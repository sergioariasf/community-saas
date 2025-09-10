const { chromium } = require('playwright');

async function testIncidentCreationV2() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🎯 TESTING INCIDENT CREATION V2 - UI Guardian Methodology');
  
  try {
    // Step 1: Login
    console.log('🔐 Step 1: Login');
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'sergioariasf@gmail.com');
    await page.fill('input[type="password"]', 'Elpato_46');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Login successful');
    
    // Step 2: Go directly to create incident (since you confirmed form appears)
    console.log('➕ Step 2: Navigate directly to create incident');
    await page.goto('http://localhost:3001/incidents/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for React to render
    
    console.log('📋 Step 3: Analyze form fields available');
    
    // Find ALL input fields
    const allInputs = await page.locator('input').all();
    console.log(`   Found ${allInputs.length} input fields`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type').catch(() => 'unknown');
      const name = await input.getAttribute('name').catch(() => 'no-name');
      const placeholder = await input.getAttribute('placeholder').catch(() => 'no-placeholder');
      console.log(`   Input ${i}: type="${type}" name="${name}" placeholder="${placeholder}"`);
    }
    
    // Find ALL textareas
    const allTextareas = await page.locator('textarea').all();
    console.log(`   Found ${allTextareas.length} textarea fields`);
    
    for (let i = 0; i < allTextareas.length; i++) {
      const textarea = allTextareas[i];
      const name = await textarea.getAttribute('name').catch(() => 'no-name');
      const placeholder = await textarea.getAttribute('placeholder').catch(() => 'no-placeholder');
      console.log(`   Textarea ${i}: name="${name}" placeholder="${placeholder}"`);
    }
    
    // Find ALL selects
    const allSelects = await page.locator('select').all();
    console.log(`   Found ${allSelects.length} select fields`);
    
    // Find ALL buttons
    const allButtons = await page.locator('button').all();
    console.log(`   Found ${allButtons.length} buttons`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const type = await button.getAttribute('type').catch(() => 'no-type');
      const text = await button.textContent().catch(() => '');
      console.log(`   Button ${i}: type="${type}" text="${text.trim()}"`);
    }
    
    // Step 4: Try to fill form with more flexible selectors
    console.log('📝 Step 4: Attempt to fill form fields');
    
    try {
      // Try multiple selectors for title/name field
      const titleSelectors = [
        'input[name="title"]',
        'input[name="name"]', 
        'input[placeholder*="título"]',
        'input[placeholder*="title"]',
        'input[placeholder*="nombre"]',
        'input[type="text"]',
        'input:not([type="hidden"]):not([type="email"]):not([type="password"])'
      ];
      
      let titleFilled = false;
      for (const selector of titleSelectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible()) {
            await field.fill('Test Incident - UI Guardian V2');
            console.log(`   ✅ Filled title using selector: ${selector}`);
            titleFilled = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!titleFilled) {
        console.log('   ⚠️ Could not find title field');
      }
      
      // Try to fill description
      const descSelectors = [
        'textarea[name="description"]',
        'textarea[placeholder*="descripción"]',
        'textarea[placeholder*="description"]',
        'textarea'
      ];
      
      let descFilled = false;
      for (const selector of descSelectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible()) {
            await field.fill('Testing incident creation with UI Guardian methodology v2');
            console.log(`   ✅ Filled description using selector: ${selector}`);
            descFilled = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!descFilled) {
        console.log('   ⚠️ Could not find description field');
      }
      
    } catch (error) {
      console.log(`   ⚠️ Error filling form: ${error.message}`);
    }
    
    // Step 5: Try to submit
    console.log('🚀 Step 5: Attempt to submit form');
    
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Crear")',
      'button:has-text("Create")',
      'button:has-text("Enviar")',
      'button:has-text("Submit")'
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          console.log(`   🎯 Found submit button with selector: ${selector}`);
          await button.click();
          console.log('   ✅ Submit button clicked');
          submitted = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!submitted) {
      console.log('   ⚠️ Could not find submit button');
    }
    
    // Step 6: Wait and check result
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`📍 Final URL: ${currentUrl}`);
    
    if (currentUrl.includes('/incidents') && !currentUrl.includes('/new')) {
      console.log('🎉 SUCCESS: Incident likely created (redirected from /new)');
    } else if (currentUrl.includes('/incidents/new')) {
      console.log('⚠️ Still on create page - check for errors');
    }
    
    console.log('\n🎯 UI GUARDIAN V2 TEST COMPLETE');
    console.log('Browser will remain open for 20 seconds for inspection...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  await browser.close();
}

testIncidentCreationV2().catch(console.error);