## Fix

The "Or explore AI product photography · try the AI product photo generator" line on the Home page (`/`) is left-aligned on mobile, breaking the centered layout of the surrounding hero block.

In `src/components/home/HomeTransformStrip.tsx` (around line 402), add `text-center` to the paragraph:

```tsx
<p className="text-sm text-muted-foreground mt-4 text-center">
  Or{' '}
  <Link to="/ai-product-photography" ...>explore AI product photography</Link>
  {' · '}
  <Link to="/ai-product-photo-generator" ...>try the AI product photo generator</Link>
</p>
```

That's the only change. One file edited, one class added.
