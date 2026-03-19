

# Add Instagram Link & Copy Button to Tag Promo Card

## Changes — `src/components/app/LibraryDetailModal.tsx`

### 1. Add imports
- Import `Copy, Check` from lucide-react
- Add `useState` for copy feedback state

### 2. Replace the social tag promo block (lines 287-296)

Turn `@vovv.ai` into a clickable Instagram link, and add a "Copy Caption" button that copies a ready-to-post caption (e.g. `@vovv.ai #vovvai`) to clipboard with a brief checkmark confirmation.

```tsx
{/* Social tag promo */}
<div className="rounded-xl border border-border/40 bg-muted/30 p-5 space-y-3">
  <div className="flex items-center gap-2.5">
    <AtSign className="w-5 h-5 text-muted-foreground/70" />
    <h3 className="text-base font-semibold text-foreground">Tag Us, Win a Free Year</h3>
  </div>
  <p className="text-sm text-muted-foreground/80 leading-relaxed">
    Post your creation on social media with{' '}
    <a href="https://www.instagram.com/vovv.ai" target="_blank" rel="noopener noreferrer"
       className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors">
      @vovv.ai
    </a>{' '}
    and <span className="font-medium text-foreground">#vovvai</span> — we pick winners every month for a full year of free access.
  </p>
  <Button variant="outline" size="sm" className="h-9 rounded-lg text-xs font-medium gap-1.5"
    onClick={() => {
      navigator.clipboard.writeText('Created with @vovv.ai #vovvai');
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2000);
      toast.success('Caption copied!');
    }}>
    {captionCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    {captionCopied ? 'Copied!' : 'Copy Caption'}
  </Button>
</div>
```

### 3. Add state
Add `const [captionCopied, setCaptionCopied] = useState(false);` alongside the existing state declarations.

Single file change. The copy text will be `Created with @vovv.ai #vovvai` — a ready-to-paste social caption.

