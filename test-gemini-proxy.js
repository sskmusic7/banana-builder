// Test script for Gemini proxy function
// Run with: node test-gemini-proxy.js

const testGeminiProxy = async () => {
  const testUrl = 'https://driprip.netlify.app/.netlify/functions/gemini-proxy';
  
  const testPayload = {
    model: 'gemini-2.5-flash-image',
    contents: [{
      role: 'user',
      parts: [{ text: 'A simple test image of a red apple on a white background' }]
    }],
    generationConfig: {
      temperature: 1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192
    }
  };

  try {
    console.log('Testing Gemini proxy function...');
    console.log('URL:', testUrl);
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('\nResponse Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\nResponse Body Length:', responseText.length);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\nResponse Data Keys:', Object.keys(data));
        
        if (data.candidates && data.candidates[0]) {
          const candidate = data.candidates[0];
          console.log('Candidate Keys:', Object.keys(candidate));
          
          if (candidate.content && candidate.content.parts) {
            const part = candidate.content.parts.find(p => p.inlineData);
            if (part && part.inlineData) {
              console.log('✓ Image data found!');
              console.log('Image MIME type:', part.inlineData.mimeType);
              console.log('Image data length:', part.inlineData.data.length);
            } else {
              console.log('✗ No image data in parts');
            }
          } else {
            console.log('✗ No content.parts in candidate');
          }
        } else {
          console.log('✗ No candidates in response');
        }
      } catch (e) {
        console.log('✗ Failed to parse JSON:', e.message);
        console.log('Response preview:', responseText.substring(0, 500));
      }
    } else {
      console.log('✗ Request failed');
      console.log('Response:', responseText);
    }
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Test check-shared-key function
const testCheckSharedKey = async () => {
  const testUrl = 'https://driprip.netlify.app/.netlify/functions/check-shared-key';
  
  try {
    console.log('\n\nTesting check-shared-key function...');
    console.log('URL:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\nResponse Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('Response Data:', data);
    
    if (data.gemini) {
      console.log('✓ Gemini API key is configured');
    } else {
      console.log('✗ Gemini API key is NOT configured');
    }
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
};

// Run tests
(async () => {
  await testCheckSharedKey();
  await testGeminiProxy();
})();
