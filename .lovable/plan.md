

# Use Zap Icon for Buy Credits Button

## Change
**`src/components/app/CreditIndicator.tsx`**:
- Replace the text `+` character with `<Zap className="w-3.5 h-3.5" />` from `lucide-react`
- Add `Zap` to the import statement
- Keep all existing button container styling (`w-8 h-8 rounded-full bg-white/10 ...`)

One-line swap — no other changes needed.

