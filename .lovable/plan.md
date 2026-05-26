Tone down the Delete button in the library modal — replace red destructive styling with a minimal muted look.

**Change** in `src/components/app/LibraryDetailModal.tsx` (line 446-454):

Replace:
```tsx
className="w-full font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
```
with:
```tsx
className="w-full font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
```

Trash icon inherits the muted tone. No copy or behavior changes.