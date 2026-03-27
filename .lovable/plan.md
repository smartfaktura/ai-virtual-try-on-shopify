

# Show "Metadata saved" Toast on Opposite Side

## Problem
The "Metadata saved" toast appears top-right (same as all other toasts). The user wants it on the opposite side for this specific action.

## Fix

### `src/components/app/DiscoverDetailModal.tsx` (line 696)
Change the toast call to include a `position` override:

```typescript
// Before
toast.success('Metadata saved');

// After
toast.success('Metadata saved', { position: 'top-left' });
```

Also apply to the error toast on line 694:
```typescript
toast.error('Failed to save', { position: 'top-left' });
```

One-line change per toast call. Sonner supports per-toast position overrides natively.

