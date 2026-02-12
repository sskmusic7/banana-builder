// Enhanced Playwright test with detailed debugging
const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('Batch Generator - Debug Shared API Key', async ({ page }) => {
  const consoleLogs = [];
  const consoleErrors = [];
  const networkRequests = [];
  const networkResponses = [];
  
  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text, timestamp: Date.now() });
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`[CONSOLE ERROR] ${text}`);
    } else if (type === 'log' && (text.includes('Shared') || text.includes('API') || text.includes('useShared') || text.includes('generate'))) {
      console.log(`[CONSOLE LOG] ${text}`);
    }
  });
  
  // Capture network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('gemini') || url.includes('netlify') || url.includes('generateContent')) {
      networkRequests.push({
        url,
        method: request.method(),
        timestamp: Date.now()
      });
      console.log(`[NETWORK REQUEST] ${request.method()} ${url}`);
    }
  });
  
  // Capture network responses
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('gemini') || url.includes('netlify') || url.includes('generateContent')) {
      const status = response.status();
      const text = await response.text().catch(() => '');
      networkResponses.push({
        url,
        status,
        text: text.substring(0, 500),
        timestamp: Date.now()
      });
      console.log(`[NETWORK RESPONSE] ${status} ${url}`);
      if (status !== 200) {
        console.log(`[ERROR RESPONSE] ${text.substring(0, 500)}`);
      }
    }
  });
  
  // Navigate to page
  console.log('[TEST] Navigating to batch generator...');
  await page.goto('https://driprip.netlify.app/batch-generator', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Check shared key status
  const sharedKeyStatus = await page.locator('#sharedKeyStatus').textContent().catch(() => '');
  console.log('[TEST] Shared key status:', sharedKeyStatus);
  
  // Check and enable shared key
  const useSharedCheckbox = page.locator('#useSharedGeminiKey');
  const isEnabled = await useSharedCheckbox.isEnabled();
  const isChecked = await useSharedCheckbox.isChecked();
  console.log('[TEST] Checkbox - Enabled:', isEnabled, 'Checked:', isChecked);
  
  if (isEnabled && !isChecked) {
    await useSharedCheckbox.check();
    await page.waitForTimeout(500);
  }
  
  // Enter prompt
  await page.locator('#promptsInput').fill('Test image: red apple');
  await page.waitForTimeout(500);
  
  // Click Parse
  console.log('[TEST] Clicking Parse button...');
  await page.locator('button:has-text("Parse Prompts")').click();
  await page.waitForTimeout(2000);
  
  // Check for generate button
  const generateBtn = page.locator('#startBtn, button:has-text("Start Generation")');
  const btnCount = await generateBtn.count();
  console.log('[TEST] Generate button count:', btnCount);
  
  if (btnCount === 0) {
    console.log('[ERROR] Generate button not found!');
    await page.screenshot({ path: 'test-results/debug-no-button.png', fullPage: true });
    throw new Error('Generate button not found');
  }
  
  // Set up alert handler
  let alertMessage = null;
  page.on('dialog', async dialog => {
    alertMessage = dialog.message();
    console.log(`[ALERT] ${alertMessage}`);
    await dialog.accept();
  });
  
  // Click generate
  console.log('[TEST] Clicking Generate button...');
  await generateBtn.first().click();
  
  // Wait a moment for any alerts
  await page.waitForTimeout(1000);
  
  if (alertMessage) {
    console.log(`[ERROR] Alert shown: ${alertMessage}`);
    throw new Error(`Generation blocked by alert: ${alertMessage}`);
  }
  
  // Wait and monitor for API calls
  console.log('[TEST] Waiting for API calls...');
  await page.waitForTimeout(10000); // Wait longer for API call
  
  // Check for API requests
  console.log(`[TEST] Network requests: ${networkRequests.length}`);
  console.log(`[TEST] Network responses: ${networkResponses.length}`);
  console.log(`[TEST] Console logs: ${consoleLogs.length}`);
  console.log(`[TEST] Console errors: ${consoleErrors.length}`);
  
  // Log all relevant console messages
  console.log('\n[DEBUG] All console messages:');
  consoleLogs.filter(log => 
    log.text.includes('Shared') || 
    log.text.includes('API') || 
    log.text.includes('useShared') || 
    log.text.includes('generate') ||
    log.text.includes('error') ||
    log.text.includes('Error')
  ).forEach(log => {
    console.log(`  [${log.type}] ${log.text}`);
  });
  
  // Check for success/error indicators
  const successCount = await page.locator('.status-success, .prompt-item.success').count();
  const errorCount = await page.locator('.status-error, .prompt-item.error').count();
  const processingCount = await page.locator('.status-processing, .prompt-item.processing').count();
  
  console.log(`[TEST] Status - Success: ${successCount}, Error: ${errorCount}, Processing: ${processingCount}`);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-final.png', fullPage: true });
  
  // Determine result
  if (networkRequests.length > 0) {
    console.log('[SUCCESS] API requests detected!');
    if (networkResponses.some(r => r.status === 200)) {
      console.log('[SUCCESS] Successful API response received!');
    }
  } else {
    console.log('[FAILURE] No API requests detected');
    if (consoleErrors.length > 0) {
      console.log('[FAILURE] Console errors found:', consoleErrors);
    }
  }
  
  // Save debug info
  const debugInfo = {
    networkRequests,
    networkResponses,
    consoleLogs: consoleLogs.filter(l => l.type === 'error' || l.text.includes('Shared') || l.text.includes('API')),
    consoleErrors,
    successCount,
    errorCount,
    processingCount
  };
  
  fs.writeFileSync('test-results/debug-info.json', JSON.stringify(debugInfo, null, 2));
  console.log('[DEBUG] Debug info saved to test-results/debug-info.json');
});
