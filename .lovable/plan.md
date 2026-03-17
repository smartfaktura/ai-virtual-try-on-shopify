

## Fix Product Switcher Pills Overflowing on Desktop/Tablet

### Problem
The switcher pills container sits below the 200px-wide upload card but the pills with `px-5 py-2 text-sm` are too wide to fit within that column, causing them to overflow or look misaligned.

### Fix in `src/components/landing/HeroSection.tsx`

**Desktop pills (lines 426-446):**
- Reduce pill sizing back to `px-3 py-1.5 text-xs` so all 3 fit within the ~200px card width
- Allow wrapping with `flex-wrap` as a safety net
- Remove the "Try different products" label to save vertical space — the pills are now large enough to look interactive on their own

**Tablet check:** At `md` breakpoint (~768px), the same desktop layout applies. The card is `w-[200px]` so smaller pills will fit fine. No separate tablet fix needed.

### Changes
```tsx
// Lines 426-446 — shrink pills to fit card width
<div className="flex flex-col items-center gap-1.5 mt-3">
  <span className="text-[11px] text-muted-foreground">Try different products</span>
  <div className="flex items-center justify-center gap-1.5 flex-wrap">
    {showcases.map((sc, i) => (
      <button
        key={i}
        onClick={() => selectScene(i)}
        onMouseEnter={() => preloadScene(i)}
        className={`px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
          activeScene === i
            ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
            : 'bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground hover:bg-accent/50'
        }`}
      >
        {sc.product.label}
      </button>
    ))}
  </div>
</div>
```

### File
- `src/components/landing/HeroSection.tsx` — one location (~line 426-446)

