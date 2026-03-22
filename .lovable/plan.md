

# Show Saved as Heart Icon on Mobile, Only When Items Exist

## Changes

### File: `src/components/app/DiscoverCategoryBar.tsx`

1. **Import `Heart` from lucide-react**

2. **Update the Saved section** (lines 98-114):
   - Only render when `savedCount !== undefined && savedCount > 0` (hide entirely if no saved items)
   - On **mobile**: show a compact heart icon button instead of the full "Saved" text pill
   - On **desktop**: keep the current "Saved · N" pill with divider

```tsx
{savedCount !== undefined && savedCount > 0 && (
  <>
    {/* Desktop: divider + text pill */}
    <div className="hidden sm:block shrink-0 h-6 border-l border-border/30 ml-1" />
    <button
      onClick={() => onSelectCategory('saved')}
      className={cn(
        'hidden sm:flex shrink-0 px-5 py-2 rounded-full text-sm ...',
        selectedCategory === 'saved' ? '...' : '...'
      )}
    >
      Saved <span>· {savedCount}</span>
    </button>

    {/* Mobile: heart icon only */}
    <button
      onClick={() => onSelectCategory('saved')}
      className={cn(
        'sm:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center ...',
        selectedCategory === 'saved'
          ? 'bg-foreground text-background'
          : 'bg-muted/20 text-muted-foreground/80'
      )}
    >
      <Heart className={cn('w-4 h-4', selectedCategory === 'saved' && 'fill-current')} />
    </button>
  </>
)}
```

### Result
- **No saved items** → Saved button hidden completely
- **Has saved items + mobile** → Small heart icon button at the end of the row
- **Has saved items + desktop** → Full "Saved · N" pill with divider (unchanged)

One file changed.

