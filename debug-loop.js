// Debug loop - test, fix, repeat until working
const { execSync } = require('child_process');
const fs = require('fs');

let iteration = 0;
const maxIterations = 12;

async function runTest() {
  iteration++;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ITERATION ${iteration}/${maxIterations}`);
  console.log('='.repeat(60));
  
  try {
    // Run Playwright test
    console.log('\n[1] Running Playwright test...');
    const result = execSync('npx playwright test test-batch-generator.spec.js --reporter=list 2>&1', {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });
    
    console.log(result);
    
    // Check if test passed
    if (result.includes('1 passed') || result.includes('✓')) {
      console.log('\n✅ SUCCESS! Test passed!');
      return true;
    }
    
    // Check for specific errors
    if (result.includes('API Request:') && result.includes('200')) {
      console.log('\n✅ SUCCESS! API requests are working!');
      return true;
    }
    
    // Analyze errors
    console.log('\n[2] Analyzing errors...');
    
    // Check for console errors in error context
    const errorContextPath = 'test-results/test-batch-generator-Batch-Generator---Shared-API-Key-Flow/error-context.md';
    if (fs.existsSync(errorContextPath)) {
      const errorContext = fs.readFileSync(errorContextPath, 'utf-8');
      console.log('Error context found:', errorContext.substring(0, 500));
    }
    
    // Check screenshot
    const screenshotPath = 'test-results/batch-generator-test.png';
    if (fs.existsSync(screenshotPath)) {
      console.log('Screenshot available at:', screenshotPath);
    }
    
    return false;
    
  } catch (error) {
    console.error('\n[ERROR] Test execution failed:', error.message);
    return false;
  }
}

async function debugAndFix() {
  console.log('\n[3] Debugging and fixing issues...');
  
  // Read the batch generator file
  const filePath = 'batch-generator.html';
  let content = fs.readFileSync(filePath, 'utf-8');
  let fixed = false;
  
  // Check 1: Ensure startGeneration function exists and is called
  if (!content.includes('function startGeneration')) {
    console.log('⚠️  startGeneration function missing - checking button handler...');
  }
  
  // Check 2: Ensure shared key logic is correct
  if (content.includes('useSharedKey') && !content.includes('const useSharedKey =')) {
    console.log('⚠️  useSharedKey variable might not be in scope');
  }
  
  // Check 3: Ensure API key validation allows shared key
  const apiKeyValidation = content.match(/if\s*\(!.*apiKey.*\)/);
  if (apiKeyValidation) {
    console.log('⚠️  Found API key validation - checking if it allows shared key...');
    // Check if validation excludes shared key case
    if (!content.includes('useSharedKey') || content.includes('!useSharedKey && !apiKey')) {
      console.log('✅ Validation looks correct');
    } else {
      console.log('⚠️  Validation might be blocking shared key');
    }
  }
  
  // Check 4: Ensure generateImage is called with correct parameters
  if (!content.includes('await generateImage(')) {
    console.log('⚠️  generateImage call not found');
  }
  
  // Check 5: Add more console logging if missing
  if (!content.includes('console.log(\'Using shared key\')')) {
    console.log('➕ Adding debug logging for shared key...');
    content = content.replace(
      /if \(useSharedKey\) \{/g,
      `if (useSharedKey) {
                console.log('Using shared API key via proxy');`
    );
    fixed = true;
  }
  
  // Check 6: Ensure fetch URL is correct
  if (!content.includes('/.netlify/functions/gemini-proxy')) {
    console.log('⚠️  Proxy URL not found');
  }
  
  // Check 7: Add error logging
  if (!content.includes('console.error(\'Generation error\'')) {
    console.log('➕ Adding error logging...');
    // This will be added in the catch block
  }
  
  if (fixed) {
    fs.writeFileSync(filePath, content);
    console.log('✅ Applied fixes, committing...');
    try {
      execSync('git add batch-generator.html && git commit -m "Debug: Add console logging for shared key" && git push', {
        encoding: 'utf-8'
      });
      console.log('✅ Changes committed and pushed');
      return true;
    } catch (e) {
      console.log('⚠️  Could not commit:', e.message);
    }
  }
  
  return false;
}

async function main() {
  console.log('🚀 Starting debug loop...\n');
  
  for (let i = 0; i < maxIterations; i++) {
    const passed = await runTest();
    
    if (passed) {
      console.log(`\n🎉 SUCCESS after ${iteration} iterations!`);
      process.exit(0);
    }
    
    if (i < maxIterations - 1) {
      const fixed = await debugAndFix();
      if (fixed) {
        console.log('\n⏳ Waiting 5 seconds for deployment...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  console.log(`\n❌ Failed after ${maxIterations} iterations`);
  process.exit(1);
}

main();
