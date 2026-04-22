
## Round the ErrorBoundary "Reload page" button

Tiny one-line polish to match the rest of the app's pill-button standard.

### Change — `src/components/ErrorBoundary.tsx` (line 52)

Swap `rounded-md` → `rounded-full` and bump padding slightly so the pill reads balanced (`px-6 py-2.5` → `h-11 px-6`):

```tsx
className="inline-flex items-center justify-center h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
```

That's it — matches the global Button `lg`/`pill-lg` size used everywhere else (Auth, ResetPassword, etc.).

### Untouched
Heading, body copy, layout, localStorage cleanup logic.
