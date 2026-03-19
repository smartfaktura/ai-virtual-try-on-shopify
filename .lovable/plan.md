

# Improve Quality Chip Icons

## Change

Replace `Zap` and `Diamond` with better-fitting icons from lucide-react:

- **Standard** → `CirclePlay` (or `Gauge`) — conveys speed/efficiency
- **Pro** → `Sparkles` — conveys premium quality, polished output

### File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`

1. Update imports: replace `Zap, Diamond` with `Gauge, Sparkles`
2. Line 177 (chip trigger): swap icons
3. Lines 184-185 (popover options): swap icons

