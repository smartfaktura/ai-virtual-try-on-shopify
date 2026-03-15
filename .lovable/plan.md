

## Make Scene Filter Tabs Larger in Expanded View

The `renderFilterTabs()` function currently uses the same tiny sizing (`text-[10px]`, `px-2.5 py-1`) for both the popover and the expanded dialog. In the expanded dialog, these should be significantly larger for easy tapping.

### Change

**`src/components/app/freestyle/SceneSelectorChip.tsx`**

Update `renderFilterTabs` to accept an `expanded` boolean parameter, then conditionally apply larger styles:

- **Compact (popover)**: Keep current `text-[10px] px-2.5 py-1`
- **Expanded (dialog)**: Use `text-sm px-4 py-2` for bigger touch targets and better visual hierarchy

```tsx
const renderFilterTabs = (expanded: boolean) => (
  <div className={cn('flex gap-1 mb-3 flex-wrap', expanded && 'gap-2 mb-4')}>
    {filterTabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => setActiveFilter(tab.key)}
        className={cn(
          'rounded-full font-medium transition-colors',
          expanded
            ? 'px-4 py-2 text-sm'
            : 'px-2.5 py-1 text-[10px]',
          activeFilter === tab.key
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
```

Then update the two call sites:
- Popover: `renderFilterTabs(false)`
- Dialog: `renderFilterTabs(true)`

Single file change, minimal diff.

