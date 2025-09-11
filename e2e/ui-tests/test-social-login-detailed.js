const { chromium } = require('playwright');

async function testSocialLoginDetailed() {
  console.log('🎯 DETAILED SOCIAL LOGIN ANALYSIS - UI Guardian Methodology');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500 
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Step 1: Navigate and analyze tabs
    console.log('🔐 Step 1: Navigate to login page');
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Check for Social Login tab
    console.log('📋 Step 2: Look for Social Login tab');
    const socialTab = await page.locator('button:has-text("Social Login")').first();
    
    if (await socialTab.isVisible()) {
      console.log('✅ Social Login tab found - clicking it');
      await socialTab.click();
      await page.waitForTimeout(1000);
      
      // Step 3: Analyze social providers in the tab
      console.log('📋 Step 3: Analyze social providers after clicking tab');
      
      // Look for Google provider more thoroughly
      const socialButtons = await page.locator('button').all();
      console.log('📋 All buttons after clicking Social Login tab:');
      
      for (let i = 0; i < socialButtons.length; i++) {
        const text = await socialButtons[i].textContent();
        const isVisible = await socialButtons[i].isVisible();
        console.log(`   - Button ${i}: "${text}" (visible: ${isVisible})`);
      }
      
      // Look specifically for Google
      const googleSelectors = [
        'button:has-text("Google")',
        'button:has-text("google")',
        '[data-provider="google"]',
        'button[class*="google"]',
        'button svg + span:has-text("Google")',
        '.social-provider',
        '[role="button"]:has-text("Google")'
      ];

      let googleFound = false;
      for (const selector of googleSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            console.log(`✅ Google element found with selector: ${selector}`);
            googleFound = true;
            
            // Try clicking it
            console.log('🚀 Attempting to click Google login...');
            await element.click();
            await page.waitForTimeout(2000);
            
            const currentUrl = page.url();
            console.log(`📍 URL after click: ${currentUrl}`);
            
            if (currentUrl.includes('accounts.google.com')) {
              console.log('🎉 SUCCESS: Google OAuth redirect working!');
            } else {
              console.log('⚠️ No redirect to Google - checking console for errors');
            }
            break;
          }
        } catch (error) {
          // Continue trying
        }
      }
      
      if (!googleFound) {
        console.log('❌ Google provider not found in Social Login tab');
        
        // Check if providers are in demo mode
        const demoText = await page.locator('text*="demo"').first();
        if (await demoText.isVisible()) {
          const demoContent = await demoText.textContent();
          console.log(`⚠️ Demo mode detected: ${demoContent}`);
        }
        
        // Check for hover cards or disabled states
        const hoverCards = await page.locator('[role="tooltip"], .hover-card').all();
        if (hoverCards.length > 0) {
          console.log('📝 Hover cards found - social login may be in demo mode');
        }
      }
      
    } else {
      console.log('❌ Social Login tab not found');
    }

    // Step 4: Check page source for Google provider configuration
    console.log('🔍 Step 4: Check if Google is configured in providers list');
    const pageContent = await page.content();
    
    if (pageContent.includes('google')) {
      console.log('✅ "google" found in page content');
    } else {
      console.log('❌ "google" not found in page content');
    }
    
    if (pageContent.includes('providers')) {
      console.log('✅ "providers" found in page content');
    }

    // Keep browser open for inspection
    console.log('🔍 Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error during detailed social login test:', error);
  } finally {
    await browser.close();
  }
}

testSocialLoginDetailed().catch(console.error);