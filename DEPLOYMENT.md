# Deployment Guide

## Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Visit http://localhost:3000

## Production Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides excellent support for Nuxt applications.

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

Or use the Vercel GitHub integration:
1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Deploy automatically

**Environment Variables**: None required for this app

### 2. Netlify

```bash
# Install Netlify CLI
bun add -g netlify-cli

# Build
bun run build

# Deploy
netlify deploy --prod --dir=.output/public
```

Or use Netlify's GitHub integration:
1. Connect GitHub repository
2. Build command: `bun run build`
3. Publish directory: `.output/public`

### 3. Static Hosting (Cloudflare Pages, GitHub Pages, etc.)

Since this is an SPA (SSR disabled), you can deploy to any static hosting:

```bash
# Build
bun run build

# The static files will be in .output/public
# Upload this directory to your hosting provider
```

### 4. Docker

Create a `Dockerfile`:

```dockerfile
FROM oven/bun:1 as builder

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app/.output /app/.output
EXPOSE 3000
CMD ["bun", "run", ".output/server/index.mjs"]
```

Build and run:

```bash
docker build -t csv-cleaner .
docker run -p 3000:3000 csv-cleaner
```

## Environment Configuration

### Development
- Port: 3000 (default)
- Mode: SPA (client-side only)
- Hot reload enabled

### Production
- Build output: `.output/public` (static files)
- No server-side rendering
- All processing happens client-side

## Performance Optimization

The app is already optimized for production:

✅ SPA mode for fast client-side processing
✅ Tailwind CSS with JIT compilation
✅ Vite for optimized builds
✅ Tree-shaking and code splitting
✅ Lazy loading of components

## Browser Requirements

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled (required for SPA)
- No polyfills needed for ES2020+ features

## Monitoring & Analytics

To add analytics, you can use Nuxt modules:

```bash
# Google Analytics
bun add @nuxtjs/google-analytics

# Vercel Analytics
bun add @vercel/analytics
```

Then add to `nuxt.config.ts`:

```typescript
modules: [
  '@nuxtjs/tailwindcss',
  '@pinia/nuxt',
  '@nuxtjs/google-analytics'
],

googleAnalytics: {
  id: 'UA-XXXXXXXXX-X'
}
```

## Security Considerations

✅ All data processing happens client-side
✅ No sensitive data sent to server
✅ File size limits prevent abuse (10MB max)
✅ CSV format validation
✅ No user authentication required

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .nuxt .output node_modules
bun install
bun run build
```

### Dev Server Issues

```bash
# Check port 3000 is not in use
lsof -ti:3000 | xargs kill -9

# Restart dev server
bun run dev
```

### Type Errors

Disable type checking temporarily:
```typescript
// nuxt.config.ts
typescript: {
  typeCheck: false
}
```

## Post-Deployment Checklist

- [ ] Test file upload with sample CSV
- [ ] Verify phone validation works
- [ ] Test export functionality
- [ ] Check responsive design on mobile
- [ ] Verify all buttons work
- [ ] Test with large file (5000+ rows)
- [ ] Check browser console for errors

## Support

For issues or questions:
- Check TESTING.md for common issues
- Review README.md for feature documentation
- Contact: Ish (hackathon participant)

---

**Deployment completed**: ___________
**URL**: ___________
**Status**: ___________

