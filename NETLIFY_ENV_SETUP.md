# Netlify Environment Variables Setup

## For Beta Testing - Shared API Keys

This setup allows you to provide shared API keys for beta testers who don't have their own API keys.

## Setup Instructions

### 1. Add Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Add the following variables:

#### For Gemini API:
- **Variable name**: `GEMINI_API_KEY`
- **Value**: Your Gemini API key (e.g., `AIza...`)

#### For Seedream/Freepik API (optional):
- **Variable name**: `SEEDREAM_API_KEY` or `FREEPIK_API_KEY`
- **Value**: Your Freepik API key

### 2. How It Works

- **Shared Key Check**: The app automatically checks if shared keys are available via `/.netlify/functions/check-shared-key`
- **User Option**: Users see a checkbox "Use Shared API Key (Beta Testing)" if a shared key is configured
- **Secure Proxy**: When using shared key, API requests go through `/.netlify/functions/gemini-proxy` which keeps the API key secure on the server side
- **User's Own Key**: Users can still use their own API keys if they prefer

### 3. Security Notes

- API keys are stored in Netlify environment variables (encrypted)
- Keys never leave the server when using shared keys
- Users can't see or access the shared API key
- Each request is proxied through Netlify functions

### 4. Next Steps (Future)

- OAuth integration for user authentication
- Token limits per user
- Usage tracking per user

## Testing

1. Set `GEMINI_API_KEY` in Netlify environment variables
2. Deploy the site
3. Open the batch generator
4. You should see "✓ Shared Gemini API key available"
5. Check "Use Shared API Key (Beta Testing)"
6. The API key input field will hide
7. Generate images - they should work without entering an API key
