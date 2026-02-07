

## Rebrand Color System: Studio Infrastructure / Control Blue

Replace the current Shopify Green-based color palette with the new "Studio Infrastructure" color system. The UI becomes a neutral photo-studio backdrop where product visuals are the most colorful elements on screen, with a single dark-blue accent (#1E293B) for authority.

---

### What Changes

**Phase 1: CSS Variable Foundation (1 file)**

Update `src/index.css` to replace all CSS custom property values:

| Token | Current (Shopify Green) | New (Studio) |
|---|---|---|
| `--background` | `210 20% 98%` (cool gray) | `40 10% 98%` (#FAFAF9 warm stone) |
| `--foreground` | `212 14% 15%` | `222 47% 11%` (#0F172A slate-900) |
| `--card` | `0 0% 100%` | `0 0% 100%` (no change) |
| `--primary` | `161 100% 25%` (green) | `217 33% 17%` (#1E293B slate-800) |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` (no change) |
| `--secondary` | `210 14% 95%` | `40 7% 94%` (#F1F1EF warm gray) |
| `--muted` | `210 14% 95%` | `40 7% 94%` |
| `--muted-foreground` | `212 10% 45%` | `215 16% 47%` (#475569 slate-600) |
| `--border` | `210 14% 89%` | `220 9% 87%` (neutral) |
| `--ring` | `161 100% 25%` (green) | `217 33% 17%` (brand blue) |
| `--destructive` | `0 72% 51%` | `0 72% 30%` (#991B1B deep red) |
| `--status-success` | `161 60% 35%` (green) | `215 25% 27%` (#334155 dark slate) |
| `--status-warning` | `40 85% 50%` | `19 83% 34%` (#9A3412 amber-brown) |
| `--status-critical` | `0 65% 50%` | `0 72% 30%` (#991B1B) |
| `--surface-selected` | `161 70% 95%` (green tint) | `220 29% 92%` (#E8EBF1 soft brand) |
| `--accent-highlight` | `161 100% 25%` (green) | `217 33% 17%` (brand blue) |

Sidebar variables also update from green accents to brand blue. Dark mode section is updated to match.

Remove all Shopify-specific comments ("Shopify Polaris", "Shopify Green as primary"). Remove the `--shopify-*` variable references.

**Phase 2: Tailwind Config Cleanup (1 file)**

Update `tailwind.config.ts`:
- Remove the entire `shopify` color group (lines 61-67) since those CSS variables no longer exist
- No other structural changes needed -- the existing `primary`, `secondary`, `muted`, `status`, `surface` tokens all read from CSS variables, so they automatically pick up the new values

**Phase 3: Hardcoded Color Overrides (3 files)**

Some components use hardcoded Tailwind colors (e.g., `bg-green-100`, `text-green-800`) instead of CSS variable tokens. These need updating:

1. **`src/components/app/StatusBadge.tsx`**
   - `completed`: Change `bg-green-100 text-green-800` to `bg-slate-100 text-slate-800` (matches new success = dark slate)

2. **`src/components/app/DropCard.tsx`**
   - `ready` status: Change `bg-green-100 text-green-800` to `bg-slate-100 text-slate-800`

3. **`src/index.css`** (component layer)
   - `.status-badge--success`: Change `bg-green-100 text-green-800` to `bg-slate-100 text-slate-800`

**Phase 4: Accent Color Refinements (2 files)**

Components that use `bg-primary/10`, `text-primary`, `shadow-primary/25` etc. will automatically pick up the new brand blue (#1E293B) through CSS variables. However, some specific spots need review:

1. **`src/components/app/CreditIndicator.tsx`**
   - Replace `text-yellow-600` and `bg-yellow-500/10 border-yellow-500/30` (low credits) with the new warning color tokens for consistency

2. **`src/components/app/BulkProgressTracker.tsx`**
   - Replace `bg-green-50/50` (completed items) with `bg-slate-50/50`

---

### What Does NOT Change

- **No component restructuring.** Every component keeps its current layout and class structure.
- **No Tailwind token renaming.** `bg-primary`, `text-primary`, `text-muted-foreground` etc. all stay -- only the underlying CSS variable values change.
- **No gradient removal.** The hero gradient (`from-primary/5 via-background to-background`) still works but shifts from green to a subtle dark-blue tint, which is more understated.
- **No dark mode removal.** The `.dark` block in index.css is updated to match the new palette but retains the same token structure.

---

### Visual Impact Summary

- **Landing page**: Warm stone background (#FAFAF9), dark-blue CTAs, no green anywhere
- **Dashboard/App**: Same warm background, sidebar accent shifts from green to dark blue
- **Status badges**: Success = dark slate (quiet), Warning = muted amber-brown, Error = deep red (rare)
- **Overall feel**: Photo studio control room -- calm, authoritative, product visuals are the star

---

### Files Modified (6 total)

1. `src/index.css` -- CSS variables + component overrides
2. `tailwind.config.ts` -- Remove Shopify color group
3. `src/components/app/StatusBadge.tsx` -- Green to slate
4. `src/components/app/DropCard.tsx` -- Green to slate
5. `src/components/app/CreditIndicator.tsx` -- Yellow to warning tokens
6. `src/components/app/BulkProgressTracker.tsx` -- Green to slate

