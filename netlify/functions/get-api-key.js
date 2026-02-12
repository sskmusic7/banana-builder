// Netlify function to securely provide API keys from environment variables
exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get the API type from query parameter
  const apiType = event.queryStringParameters?.type || 'gemini';
  
  let apiKey = null;
  
  // Get the appropriate API key from environment variables
  if (apiType === 'gemini') {
    apiKey = process.env.GEMINI_API_KEY;
  } else if (apiType === 'seedream' || apiType === 'freepik') {
    apiKey = process.env.SEEDREAM_API_KEY || process.env.FREEPIK_API_KEY;
  }
  
  // Return the API key (or null if not set)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow CORS for client-side access
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    },
    body: JSON.stringify({
      hasKey: !!apiKey,
      apiType: apiType
      // Note: We don't return the actual key for security - client will use it directly
      // Instead, we'll return a flag and the client will make requests through this function
    })
  };
};
