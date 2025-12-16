# 🍌 Banana Builder

A collection of AI-powered tools for image generation and analysis.

## Tools

1. **Drip Extractor** - Extract precise prompts from outfit photos
   - Multi-provider AI support (Claude, Gemini, OpenAI, Ollama)
   - Batch image processing
   - Raw iPhone aesthetic prompts

2. **Nano Banana Remix** - Superimpose clothing onto subjects
   - Two-image input (subject + clothing)
   - Natural clothing superimposition
   - Multiple dimension options

3. **Nano Banana Wrapper** - Text + Image to Image generator
   - Text-to-image generation
   - Image-to-image editing
   - Gemini 2.5 Flash Image support

## Deployment

This site is configured for Netlify deployment. It's a **static site** - no serverless functions needed! All API calls are made directly from the browser.

### Netlify Configuration

- **Build command**: None needed (static site - already built)
- **Publish directory**: `.` (root)
- **Redirects**: Configured in `netlify.toml` and `_redirects` for SPA routing

### Quick Deploy Steps

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select the `banana-builder` repository
4. Netlify will auto-detect settings:
   - Build command: (leave empty or use: `echo 'Static site - no build needed'`)
   - Publish directory: `.` (root)
5. Click "Deploy site"

The site will be live immediately! All tools work client-side.

## Local Development

1. For the main site: Open `index.html` in a browser
2. For Drip Extractor: 
   ```bash
   cd drip-extractor
   npm install
   npm run dev
   ```

## Structure

```
banana-builder-site/
├── index.html              # Main navigation page
├── drip-extractor/         # Vite React app (built)
├── nano-banana-remix.html  # Remix tool
├── nano-banana-wrapper.html # Wrapper tool
├── netlify.toml           # Netlify configuration
└── _redirects             # Netlify redirects
```

## License

MIT






