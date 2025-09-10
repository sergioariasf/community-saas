const { chromium } = require('playwright');

async function testIncidentCreation() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for easier observation
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🎯 TESTING INCIDENT CREATION - UI Guardian Methodology');
  
  // Capture all console messages including errors
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleMessages.push(message);
    console.log(`   Console: ${message}`);
  });
  
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
    
    // Step 2: Navigate to incidents
    console.log('🎫 Step 2: Navigate to incidents');
    await page.goto('http://localhost:3001/incidents');
    await page.waitForLoadState('networkidle');
    console.log('✅ Incidents page loaded');
    
    // Step 3: Check for error messages
    const errorElements = await page.locator('text=/error|Error|ERROR|no tienes acceso|No tienes acceso/i').all();
    if (errorElements.length > 0) {
      console.log('❌ ERRORS found on incidents page:');
      for (const error of errorElements) {
        const errorText = await error.textContent();
        console.log(`   🔴 ${errorText}`);
      }
    } else {
      console.log('✅ No error messages on incidents page');
    }
    
    // Step 4: Try to navigate to create incident
    console.log('➕ Step 4: Navigate to create incident');
    await page.goto('http://localhost:3001/incidents/new');
    await page.waitForLoadState('networkidle');
    
    // Check if create form is accessible
    const titleField = await page.locator('input[name="title"], input[placeholder*="título"], input[placeholder*="title"]').first();
    const isFormVisible = await titleField.isVisible().catch(() => false);
    
    if (isFormVisible) {
      console.log('✅ Create incident form is accessible');
      
      // Step 5: Fill out form
      console.log('📝 Step 5: Fill out incident form');
      await titleField.fill('Test Incident via UI Guardian');
      
      // Look for description field
      const descField = await page.locator('textarea[name="description"], textarea[placeholder*="descripción"], textarea[placeholder*="description"]').first();
      if (await descField.isVisible().catch(() => false)) {
        await descField.fill('This is a test incident created using UI Guardian methodology');
      }
      
      // Look for community/severity selects
      const communitySelect = await page.locator('select[name="community_id"], select[name="communityId"]').first();
      if (await communitySelect.isVisible().catch(() => false)) {
        // Select first available community
        await communitySelect.selectOption({ index: 1 });
        console.log('✅ Selected community');
      }
      
      // Step 6: Submit form
      console.log('🚀 Step 6: Submit incident form');
      const submitButton = await page.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Create")').first();
      await submitButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check current URL to see if creation was successful
      const currentUrl = page.url();
      console.log(`📍 Current URL after submit: ${currentUrl}`);
      
      if (currentUrl.includes('/incidents') && !currentUrl.includes('/new')) {
        console.log('✅ SUCCESS: Incident created successfully (redirected away from /new)');
      } else if (currentUrl.includes('/incidents/new')) {
        console.log('❌ FAILED: Still on create page, likely validation or server error');
      } else {
        console.log(`⚠️  UNCLEAR: Unexpected redirect to ${currentUrl}`);
      }
      
    } else {
      console.log('❌ Create incident form is not visible/accessible');
    }
    
    // Step 7: Check for any error messages after form submission
    const postSubmitErrors = await page.locator('text=/error|Error|ERROR|failed|Failed|FAILED/i').all();
    if (postSubmitErrors.length > 0) {
      console.log('❌ POST-SUBMIT ERRORS detected:');
      for (const error of postSubmitErrors) {
        const errorText = await error.textContent();
        console.log(`   🔴 ${errorText}`);
      }
    }
    
    console.log('\n📊 SUMMARY OF CONSOLE MESSAGES:');
    console.log('================================================');
    consoleMessages.forEach(msg => console.log(`   ${msg}`));
    
    console.log('\n🎯 UI GUARDIAN TEST COMPLETE');
    console.log('Browser will remain open for 30 seconds for manual inspection...');
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.log(`❌ Error during incident creation test: ${error.message}`);
  }
  
  await browser.close();
}

testIncidentCreation().catch(console.error);