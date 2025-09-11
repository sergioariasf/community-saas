const { chromium } = require('playwright');

async function testProductionSocialLogin() {
  console.log('🎯 TESTING PRODUCTION SOCIAL LOGIN - UI Guardian Methodology');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500 
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Step 1: Test production URL with longer timeout
    console.log('🌐 Step 1: Navigate to production login page');
    const productionUrl = 'https://community-saas-mauve.vercel.app/login';
    
    try {
      await page.goto(productionUrl, { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      console.log('✅ Production login page loaded');
    } catch (error) {
      console.log('⚠️ Direct navigation failed, trying home page first...');
      await page.goto('https://community-saas-mauve.vercel.app', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      
      // Navigate to login from home page
      await page.goto(productionUrl, { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      console.log('✅ Production login page loaded via home redirect');
    }

    // Step 2: Click Social Login tab
    console.log('📋 Step 2: Access Social Login tab');
    const socialTab = await page.locator('button:has-text("Social Login")').first();
    
    if (await socialTab.isVisible()) {
      await socialTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ Social Login tab activated');
      
      // Step 3: Look for Google button
      console.log('🔍 Step 3: Look for Google social login button');
      const googleButton = await page.locator('button:has-text("Google")').first();
      
      if (await googleButton.isVisible()) {
        console.log('✅ Google button found in production');
        
        // Step 4: Test Google OAuth redirect
        console.log('🚀 Step 4: Test Google OAuth redirect');
        
        // Monitor for OAuth redirect with broader pattern
        const requestPromise = page.waitForRequest(request => 
          request.url().includes('accounts.google.com') || 
          request.url().includes('supabase.co/auth/v1/authorize') ||
          request.url().includes('oauth'), 
          { timeout: 15000 }
        );

        await googleButton.click();
        console.log('✅ Google button clicked');

        try {
          const request = await requestPromise;
          console.log(`🎉 SUCCESS: OAuth redirect to Google in production!`);
          console.log(`📍 Redirect URL: ${request.url()}`);
          
          // Wait for Google OAuth page to load
          await page.waitForTimeout(3000);
          const currentUrl = page.url();
          
          if (currentUrl.includes('accounts.google.com')) {
            console.log('🔐 ✅ Google OAuth page loaded successfully');
            console.log('🎯 PRODUCTION SOCIAL LOGIN: WORKING PERFECTLY!');
            
            // Take screenshot for documentation
            await page.screenshot({ path: 'e2e/ui-tests/production-google-oauth.png' });
            console.log('📸 Screenshot saved: production-google-oauth.png');
            
          } else {
            console.log(`⚠️ Unexpected URL: ${currentUrl}`);
          }
          
        } catch (error) {
          console.log('❌ OAuth redirect failed or timed out');
          console.log('🔍 Checking current state...');
          
          // Check current URL and page state
          const currentUrl = page.url();
          console.log('📍 Current URL after click:', currentUrl);
          
          // Check for any error messages on the page
          const errorMessages = await page.locator('[role="alert"], .error, .text-red-500').allTextContents();
          if (errorMessages.length > 0) {
            console.log('🚨 Error messages found:', errorMessages);
          }
          
          // Check if we're still on login page and look for social login content
          const socialContent = await page.locator('.social-provider, button:has-text("Google")').count();
          console.log(`📋 Social login elements still visible: ${socialContent}`);
          
          // Take a screenshot for debugging
          await page.screenshot({ path: 'e2e/ui-tests/production-debug.png' });
          console.log('📸 Debug screenshot saved: production-debug.png');
        }
        
      } else {
        console.log('❌ Google button not found in production');
      }
      
    } else {
      console.log('❌ Social Login tab not found in production');
    }

    // Step 5: Extended inspection
    console.log('🔍 Step 5: Extended inspection - keeping browser open');
    console.log('📋 Manual verification checklist:');
    console.log('   ✅ Can you see the Social Login tab?');
    console.log('   ✅ Does clicking it show Google/GitHub/Twitter buttons?');
    console.log('   ✅ Does Google button redirect to OAuth?');
    console.log('   ✅ Can you complete the OAuth flow?');
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error during production social login test:', error);
  } finally {
    await browser.close();
  }
}

testProductionSocialLogin().catch(console.error);