

# Add TikTok to Footer

## Change

### File: `src/components/landing/LandingFooter.tsx`

Add a TikTok icon link after the Facebook icon, using a simple SVG since Lucide doesn't have a TikTok icon.

```tsx
<a href="https://www.tiktok.com/@vovv.ai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="TikTok">
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.83 4.83 0 01-1-.1z"/>
  </svg>
</a>
```

Place it after the Facebook `<a>` tag in the social icons row (around line 63).

## Summary
- 1 file, ~5 lines added

