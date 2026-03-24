

# Remove Facial Oil Shot from Product Editorial Carousel

## Change

### `src/components/app/workflowAnimationData.tsx`

Remove `showcase4` from the `backgrounds` array on line 73:

```
// Before
backgrounds: [showcase1, showcase2, showcase3, showcase4, showcase5, showcase6, showcase7],

// After
backgrounds: [showcase1, showcase2, showcase3, showcase5, showcase6, showcase7],
```

Optionally remove the `const showcase4` declaration on line 29 since it's no longer used.

### Files
- `src/components/app/workflowAnimationData.tsx` — remove showcase4 from carousel

