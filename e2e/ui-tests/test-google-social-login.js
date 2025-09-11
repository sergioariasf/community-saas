const { chromium } = require('playwright');

async function testGoogleSocialLogin() {
  console.log('🎯 TESTING GOOGLE SOCIAL LOGIN - UI Guardian Methodology');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500 
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Step 1: Navigate to login page
    console.log('🔐 Step 1: Navigate to login page');
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded');

    // Step 2: Analyze login form structure for social providers
    console.log('📋 Step 2: Analyze social login providers available');
    
    // Look for Google button with multiple strategies
    const googleSelectors = [
      'button:has-text("Google")',
      'button:has-text("google")', 
      '[data-provider="google"]',
      'button[type="button"]:has-text("Google")',
      '.social-provider button:has-text("Google")',
      'button:text("Continue with Google")'
    ];

    let googleButton = null;
    let usedSelector = null;

    for (const selector of googleSelectors) {
      try {
        googleButton = await page.locator(selector).first();
        if (await googleButton.isVisible()) {
          usedSelector = selector;
          console.log(`✅ Google button found with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue trying next selector
      }
    }

    if (!googleButton || !usedSelector) {
      console.log('❌ No Google social login button found');
      console.log('📋 Available buttons:');
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        console.log(`   - Button ${i}: "${text}"`);
      }
      return;
    }

    // Step 3: Check if providers are enabled (not demo mode)
    console.log('🔍 Step 3: Check if social providers are enabled');
    
    // Look for demo warning or disabled state
    const demoWarning = await page.locator('text=demo').first();
    const isDisabled = await googleButton.isDisabled();
    
    if (isDisabled) {
      console.log('⚠️ Google button is disabled - checking for demo mode');
      
      // Look for hover cards or demo messages
      const hoverCard = await page.locator('[data-testid="hover-card"], .hover-card').first();
      if (await hoverCard.isVisible()) {
        console.log('📝 Demo mode detected - social login not functional in demo');
        return;
      }
    }

    console.log('✅ Google button is enabled and ready');

    // Step 4: Click Google button and monitor response
    console.log('🚀 Step 4: Click Google social login button');
    
    // Monitor network requests to see OAuth redirect
    const requestPromise = page.waitForRequest(request => 
      request.url().includes('accounts.google.com') || 
      request.url().includes('supabase.co/auth/v1/authorize')
    );

    await googleButton.click();
    console.log('✅ Google button clicked');

    // Wait for OAuth redirect or error
    try {
      const request = await requestPromise;
      console.log(`✅ OAuth redirect initiated to: ${request.url()}`);
      
      // Wait a bit to see if redirect happens
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('accounts.google.com')) {
        console.log('🎉 SUCCESS: Redirected to Google OAuth - Social login is working!');
        console.log('🔐 Google OAuth page loaded correctly');
        
        // Take screenshot of Google OAuth page
        await page.screenshot({ path: 'e2e/ui-tests/google-oauth-success.png' });
        console.log('📸 Screenshot saved: google-oauth-success.png');
        
      } else if (currentUrl === 'http://localhost:3001/login') {
        console.log('❌ Still on login page - social login may not be configured correctly');
      } else {
        console.log(`✅ Redirected to: ${currentUrl}`);
      }
      
    } catch (error) {
      console.log('⚠️ No OAuth redirect detected - checking for errors');
      console.log('📝 This could mean:');
      console.log('   - Social login is in demo mode');
      console.log('   - OAuth not properly configured');
      console.log('   - Network/connection issues');
      
      // Check for console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`🚨 Console error: ${msg.text()}`);
        }
      });
    }

    // Keep browser open for manual inspection
    console.log('🔍 Keeping browser open for 20 seconds for manual inspection...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ Error during social login test:', error);
  } finally {
    await browser.close();
  }
}

testGoogleSocialLogin().catch(console.error);