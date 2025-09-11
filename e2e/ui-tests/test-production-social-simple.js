const { chromium } = require('playwright');

async function testProductionSocialSimple() {
  console.log('🎯 SIMPLE PRODUCTION SOCIAL LOGIN TEST - UI Guardian Methodology');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Step 1: Navigate to production login
    console.log('🌐 Step 1: Navigate to production login page');
    await page.goto('https://community-saas-mauve.vercel.app/login', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ Production login page loaded');

    // Step 2: Find and click Social Login tab
    console.log('📋 Step 2: Look for Social Login tab');
    const socialTab = await page.locator('button:has-text("Social Login")').first();
    
    if (await socialTab.isVisible()) {
      console.log('✅ Social Login tab found - clicking...');
      await socialTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ Social Login tab activated');
      
      // Step 3: Find Google button
      console.log('🔍 Step 3: Look for Google button');
      const googleButton = await page.locator('button:has-text("Google")').first();
      
      if (await googleButton.isVisible()) {
        console.log('✅ Google button found in production');
        
        // Step 4: Click Google button and monitor URL changes
        console.log('🚀 Step 4: Click Google button and monitor changes');
        const initialUrl = page.url();
        console.log(`📍 Initial URL: ${initialUrl}`);
        
        await googleButton.click();
        console.log('✅ Google button clicked');
        
        // Wait a bit and check URL
        await page.waitForTimeout(5000);
        const newUrl = page.url();
        console.log(`📍 URL after click: ${newUrl}`);
        
        if (newUrl !== initialUrl) {
          console.log('🎉 SUCCESS: URL changed after Google click!');
          
          if (newUrl.includes('accounts.google.com')) {
            console.log('🔐 ✅ Successfully redirected to Google OAuth!');
            console.log('🎯 PRODUCTION SOCIAL LOGIN: WORKING PERFECTLY!');
          } else if (newUrl.includes('supabase.co')) {
            console.log('🔐 ✅ Redirected to Supabase Auth - OAuth flow initiated!');
          } else {
            console.log(`🔍 Redirected to: ${newUrl}`);
          }
          
          // Take screenshot
          await page.screenshot({ path: 'e2e/ui-tests/production-oauth-success.png' });
          console.log('📸 Screenshot saved: production-oauth-success.png');
          
        } else {
          console.log('⚠️ URL did not change - checking for errors or demo mode');
          
          // Check for error messages
          const errorElements = await page.locator('[role="alert"], .text-red-500, .error').allTextContents();
          if (errorElements.length > 0) {
            console.log('🚨 Found error messages:', errorElements);
          }
          
          // Check if still on login page
          const pageTitle = await page.title();
          console.log(`📄 Page title: ${pageTitle}`);
          
          // Take debug screenshot
          await page.screenshot({ path: 'e2e/ui-tests/production-debug.png' });
          console.log('📸 Debug screenshot saved: production-debug.png');
        }
        
      } else {
        console.log('❌ Google button not found in production');
      }
      
    } else {
      console.log('❌ Social Login tab not found in production');
    }

    // Step 5: Keep browser open for manual verification
    console.log('🔍 Step 5: Manual verification - browser stays open for 20 seconds');
    console.log('📋 Please verify:');
    console.log('   ✅ Social Login tab is visible and clickable');
    console.log('   ✅ Google button is visible in Social Login tab'); 
    console.log('   ✅ Clicking Google redirects to OAuth or shows error');
    
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ Error during simple production test:', error);
  } finally {
    await browser.close();
  }
}

testProductionSocialSimple().catch(console.error);