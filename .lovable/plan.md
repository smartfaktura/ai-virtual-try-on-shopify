

# Fix Buy Credits Modal Design

## Issues Identified

1. **Balance section layout**: The wallet icon is positioned on the far left with text on the right, creating awkward empty space in the middle
2. **Undefined Tailwind tokens**: Classes like `bg-surface-subdued`, `border-border`, `border-primary` may not exist in Tailwind config
3. **Overall spacing**: The balance box is too sparse for its minimal content

## Solution

Replace custom Tailwind classes with standard Tailwind utilities and improve the layout of the balance section.

### File: `src/components/app/BuyCreditsModal.tsx`

**Changes:**

1. **Balance section** - Make it more compact with icon and text properly aligned:
   - Change from `InlineStack` with spread content to centered content
   - Use standard gray background (`bg-gray-50 border-gray-200`)

2. **Credit pack cards** - Fix border colors:
   - Replace `border-primary` with `border-green-600` 
   - Replace `bg-primary/5` with `bg-green-50`
   - Replace `border-border` with `border-gray-200`
   - Replace `bg-surface-subdued` with `bg-gray-50`

3. **Upsell section** - Same color fixes

### Visual Result

**Before (current):**
```text
+------------------------------------------+
| [wallet icon]         Current Balance    |
|                       847 credits        |
+------------------------------------------+
```

**After (fixed):**
```text
+------------------------------------------+
|    [wallet] Current Balance              |
|             847 credits                  |
+------------------------------------------+
```

Or alternatively, right-aligned:
```text
+------------------------------------------+
|                    Current Balance       |
|    [wallet icon]   847 credits           |
+------------------------------------------+
```

### CSS Token Replacements

| Current (broken) | Replacement |
|-----------------|-------------|
| `bg-surface-subdued` | `bg-gray-50` |
| `border-border` | `border-gray-200` |
| `border-primary` | `border-green-600` |
| `bg-primary/5` | `bg-green-50` |
| `hover:border-primary/50` | `hover:border-green-400` |

### Implementation

Update the component to use standard Tailwind classes and improve the balance section layout to be more compact and visually balanced.

