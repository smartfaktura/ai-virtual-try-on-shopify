

## Update FreestyleShowcaseSection with Local Assets

### File: `src/components/landing/FreestyleShowcaseSection.tsx`

**1. Update prompt text** to reference the White Crop Top:
```
'Studio portrait of our White Crop Top, natural lighting with soft shadows in a lifestyle setting...'
```

**2. Update CHIPS** — swap Supabase URLs to local paths:
- Product thumb: `/images/source-crop-top.jpg`, label: `White Crop Top`
- Model thumb: keep Supabase URL (no local model headshot available), label stays `Sofia`
- Scene thumb: `/images/try-showcase/cafe-lifestyle.png`, label: `Café`

**3. Update RESULT_CARDS** — use 3 local try-showcase images:
```typescript
{ label: 'Studio Lookbook', src: '/images/try-showcase/studio-lookbook.png' },
{ label: 'Café Lifestyle', src: '/images/try-showcase/cafe-lifestyle.png' },
{ label: 'Golden Hour', src: '/images/try-showcase/golden-hour.png' },
```

**4. Remove unused `getLandingAssetUrl` import** if model thumb also switches to local (or keep if model thumb stays on Supabase).

No other files change.

