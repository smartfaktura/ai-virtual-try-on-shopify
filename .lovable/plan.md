

# Add "Create with Promt" Button to Dashboard Quick Actions

## Change — `src/pages/Dashboard.tsx`

Insert a new `Button` at the beginning of the quick actions row (line 531, before "Browse Templates"):

```tsx
<Button variant="outline" size="sm" className="shrink-0 rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/freestyle')}>
  <Wand2 className="w-3.5 h-3.5" />
  Create with Promt
</Button>
```

Also ensure `Wand2` is imported from `lucide-react` (check existing imports).

Single file, single insertion.

