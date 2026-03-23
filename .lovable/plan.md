

# Dashboard Workflows: 3-Column Desktop, 2-Column Mobile

## Change

### `src/pages/Dashboard.tsx` (line 372)

Update the grid classes:

```
// From:
grid grid-cols-1 sm:grid-cols-2 gap-6

// To:
grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6
```

- **Mobile**: 2 columns
- **Tablet (md+)**: 3 columns
- Tighter gap on mobile (`gap-4`) for better fit

### File
- `src/pages/Dashboard.tsx` — line 372

