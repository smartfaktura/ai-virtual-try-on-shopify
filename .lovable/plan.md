

## Fix Plural Form for Try-On Product Selection Heading

When multiple products can be selected in Try-On mode, the heading and description should reflect plural form instead of always showing singular "a Clothing Item".

### Change in `src/pages/Generate.tsx` (lines 1874, 1882)

**Line 1874** — Change heading from static singular to dynamic:
```
'Select a Clothing Item' → 'Select Clothing Item(s)'
```

**Line 1882** — Change description from singular to plural-aware:
```
'Choose the clothing item you want to try on a model.' → 'Choose one or more clothing items to try on a model.'
```

Single change, two lines.

