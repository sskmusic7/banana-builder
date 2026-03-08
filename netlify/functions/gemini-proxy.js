// Netlify function to proxy Gemini API requests using environment variable API key
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const requestData = JSON.parse(event.body);
    const { model, contents, generationConfig } = requestData;
    
    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'GEMINI_API_KEY not configured in Netlify environment variables' 
        })
      };
    }
    
    // Clean generationConfig - remove invalid fields that Gemini API doesn't accept
    // Explicitly exclude: width, height, aspectRatio (not valid for Gemini image API)
    const cleanGenerationConfig = generationConfig ? {
      ...(generationConfig.temperature !== undefined && { temperature: generationConfig.temperature }),
      ...(generationConfig.topK !== undefined && { topK: generationConfig.topK }),
      ...(generationConfig.topP !== undefined && { topP: generationConfig.topP }),
      ...(generationConfig.maxOutputTokens !== undefined && { maxOutputTokens: generationConfig.maxOutputTokens })
    } : {
      temperature: 1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192
    };
    
    // Build the Gemini API URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: cleanGenerationConfig
      })
    });
    
    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: data
    };
    
  } catch (error) {
    console.error('Gemini proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack 
      })
    };
  }
};
