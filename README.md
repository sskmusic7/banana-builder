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

This site is configured for Netlify deployment. Simply connect your GitHub repository to Netlify and it will automatically deploy.

### Netlify Configuration

- **Build command**: None (static site)
- **Publish directory**: `.` (root)
- **Redirects**: Configured in `netlify.toml` and `_redirects`

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

