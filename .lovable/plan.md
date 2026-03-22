

# Add Bottom Spacing to Recreate Banner in Freestyle

## Change

### `src/pages/Freestyle.tsx` (line 748)

Add `mb-2` to the Alert to create spacing between the banner and the content below it:

```
Before: <Alert className="border-primary/20 bg-primary/5">
After:  <Alert className="border-primary/20 bg-primary/5 mb-2">
```

One line, one class added.

