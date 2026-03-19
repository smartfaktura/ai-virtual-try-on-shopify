

## Add Online Status & Instant Reply Indicator to Studio Chat

### What Changes
In the chat header, replace the static "Your creative team" subtitle with a line that includes a green online dot and "Online — replies instantly" text.

### File: `src/pages/../StudioChat.tsx` (lines 136-139)

Replace the subtitle area:
```tsx
<div>
  <p className="text-sm font-semibold leading-tight">VOVV.AI Studio</p>
  <div className="flex items-center gap-1.5">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
    <p className="text-[10px] text-muted-foreground leading-tight">Online · replies instantly</p>
  </div>
</div>
```

This adds a pulsing green dot with "Online · replies instantly" text, replacing the current "Your creative team" subtitle. Single file, ~5 lines changed.

