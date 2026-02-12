// Netlify function to proxy API requests using environment variable API keys
// This keeps the API keys secure on the server side
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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { apiType, url, body, headers } = JSON.parse(event.body);
    
    let apiKey = null;
    
    // Get the appropriate API key from environment variables
    if (apiType === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY;
    } else if (apiType === 'seedream' || apiType === 'freepik') {
      apiKey = process.env.SEEDREAM_API_KEY || process.env.FREEPIK_API_KEY;
    }
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'API key not configured in environment variables' })
      };
    }
    
    // Add API key to the request
    const requestUrl = url.includes('?') 
      ? `${url}&key=${apiKey}` 
      : `${url}?key=${apiKey}`;
    
    // Make the API request
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
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
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
