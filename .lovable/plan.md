

# Route "Try Freestyle Free" to Public Freestyle

## Change

### `src/components/landing/FreestyleShowcaseSection.tsx`

Update the button's `onClick` handler (line 302):
- If authenticated → `/app/freestyle`
- If not authenticated → `/freestyle` (public freestyle page, not `/auth`)

Single line change: `navigate(user ? '/app/freestyle' : '/auth')` → `navigate(user ? '/app/freestyle' : '/freestyle')`

### Files
- `src/components/landing/FreestyleShowcaseSection.tsx`

