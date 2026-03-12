

## Reduce Upscale Animation Blur Further

### Change — `src/components/app/WorkflowAnimatedThumbnail.tsx`

Line 320: Change `blur(3px)` to `blur(1.5px)` and reduce scale from `1.03` to `1.015`:

```
style={{ filter: 'blur(1.5px) saturate(0.97)', transform: 'scale(1.015)' }}
```

This creates a subtler "slightly soft" look rather than an obviously blurred image, making the before/after contrast more natural.

