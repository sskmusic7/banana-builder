// Playwright test for batch generator with shared API key
const { test, expect } = require('@playwright/test');

test('Batch Generator - Shared API Key Flow', async ({ page }) => {
  // Navigate to batch generator
  await page.goto('https://driprip.netlify.app/batch-generator');
  
  console.log('Page loaded, checking for shared key status...');
  
  // Wait for page to load and check shared key status
  await page.waitForTimeout(2000);
  
  // Check if shared key status is visible
  const sharedKeyStatus = await page.locator('#sharedKeyStatus').textContent().catch(() => null);
  console.log('Shared key status:', sharedKeyStatus);
  
  // Check if checkbox exists and is enabled
  const useSharedCheckbox = page.locator('#useSharedGeminiKey');
  const isChecked = await useSharedCheckbox.isChecked().catch(() => false);
  const isEnabled = await useSharedCheckbox.isEnabled().catch(() => false);
  
  console.log('Use Shared Key checkbox - Checked:', isChecked, 'Enabled:', isEnabled);
  
  // If checkbox is enabled but not checked, check it
  if (isEnabled && !isChecked) {
    console.log('Checking the shared key checkbox...');
    await useSharedCheckbox.check();
    await page.waitForTimeout(500);
  }
  
  // Verify checkbox is now checked
  const nowChecked = await useSharedCheckbox.isChecked();
  console.log('Checkbox is now checked:', nowChecked);
  
  // Check if API key input is hidden when using shared key
  const apiKeyGroup = page.locator('#apiKeyGroup');
  const apiKeyGroupVisible = await apiKeyGroup.isVisible().catch(() => true);
  console.log('API Key input group visible:', apiKeyGroupVisible);
  
  // Add a test prompt
  const promptInput = page.locator('#promptsInput');
  await promptInput.fill('A simple test image of a red apple');
  
  console.log('Prompt entered, clicking Parse...');
  
  // Click Parse button
  const parseBtn = page.locator('button:has-text("Parse Prompts")');
  await parseBtn.click();
  
  // Wait for prompts to be parsed
  await page.waitForTimeout(1000);
  
  // Check if generate button appears
  const generateBtn = page.locator('#startBtn, button:has-text("Start Generation"), button:has-text("Generate")');
  const generateBtnExists = await generateBtn.count() > 0;
  console.log('Generate button exists:', generateBtnExists);
  
  // Set up console and network monitoring BEFORE clicking
  const consoleMessages = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      console.log('Console error:', text);
    } else if (msg.type() === 'log' && (text.includes('Shared keys') || text.includes('useSharedKey') || text.includes('API'))) {
      console.log('Console log:', text);
    }
  });
  
  if (generateBtnExists) {
    console.log('Clicking generate button...');
    
    // Monitor network requests
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('gemini-proxy') || request.url().includes('generateContent') || request.url().includes('netlify')) {
        networkRequests.push({
          url: request.url(),
          method: request.method()
        });
        console.log('API Request:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('gemini-proxy') || response.url().includes('generateContent')) {
        console.log('API Response:', response.status(), response.url());
        response.text().then(text => {
          if (response.status() !== 200) {
            console.log('Error response:', text.substring(0, 500));
          } else {
            try {
              const data = JSON.parse(text);
              if (data.candidates && data.candidates[0]) {
                console.log('✓ Image generation successful!');
              } else {
                console.log('Response structure:', Object.keys(data));
              }
            } catch (e) {
              console.log('Response preview:', text.substring(0, 500));
            }
          }
        }).catch(() => {});
      }
    });
    
    await generateBtn.click();
    
    // Wait for generation to start
    await page.waitForTimeout(3000);
    
    // Log all console messages
    console.log('Total console messages:', consoleMessages.length);
    console.log('Console errors:', consoleErrors.length);
    
    
    // Wait longer for generation to complete (up to 30 seconds)
    console.log('Waiting for generation to complete...');
    try {
      await page.waitForSelector('.status-success, .status-error, .prompt-item.success, .prompt-item.error', { 
        timeout: 30000 
      });
    } catch (e) {
      console.log('Timeout waiting for status indicator');
    }
    
    await page.waitForTimeout(2000);
    
    // Check for success or error in the UI
    const successIndicator = page.locator('.status-success, .prompt-item.success');
    const errorIndicator = page.locator('.status-error, .prompt-item.error');
    
    const hasSuccess = await successIndicator.count() > 0;
    const hasError = await errorIndicator.count() > 0;
    
    console.log('Generation status - Success:', hasSuccess, 'Error:', hasError);
    
    if (hasError) {
      const errorText = await errorIndicator.first().textContent().catch(() => '');
      console.log('Error text:', errorText);
    }
    
    if (hasSuccess) {
      console.log('✓ Generation completed successfully!');
    }
    
    // Log network requests
    if (networkRequests.length > 0) {
      console.log('Network requests made:', networkRequests.length);
    } else {
      console.log('⚠ No API requests detected - generation may not have started');
    }
    
    // Log any console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  }
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/batch-generator-test.png', fullPage: true });
  console.log('Screenshot saved to test-results/batch-generator-test.png');
});
