
## Refine Model Catalog modal — sidebar polish

### Problems

1. Three "active" looking rows at once ("All models", "Any" body, "Any" age) — every section's default item is highlighted, making it unclear which filter the user is actually engaging with.
2. **Body Type** sidebar section ("Slim / Athletic / Average / Plus") risks being offensive — needs to be removed entirely.

### Fix — `src/components/app/freestyle/ModelCatalogModal.tsx`

**1. Remove Body Type section**
- Delete the entire `BODY TYPE` sidebar group (label + Any/Slim/Athletic/Average/Plus buttons).
- Remove the `bodyFilter` state and its usage in the filter predicate.
- Sidebar sections become: **Quick** (All models / My Brand Models) and **Age** only.

**2. Calmer "active" styling for default ("Any") rows**
- Treat the default value of each filter group as **non-active** visually:
  - Quick → "All models" only renders the filled active pill when the user has explicitly chosen something else and switched back, OR (simpler) when a Brand-Models-related filter is active. Practically: show "All models" in the **muted** style by default; only the **non-default** selection ("My Brand Models") gets the filled active pill.
  - Age → "Any" rendered in muted style by default; only a real choice (Young adult / Adult / Mature) gets the active pill.
- Active style stays the existing dark filled pill; inactive becomes plain text-on-hover (`text-muted-foreground hover:bg-muted/60`), matching how Scene Look's sidebar reads.
- Net effect: at rest the sidebar shows **zero filled pills**, so the eye isn't pulled to three competing "active" rows. As soon as the user picks a real filter, exactly one pill lights up per section.

**3. Section label spacing**
- Keep Quick section, then Age. Remove the now-empty gap left by Body Type so the sidebar looks tight, not sparse.

### Validation

- Open Model modal on desktop → sidebar shows Quick (All models, My Brand Models) and Age (Any, Young adult, Adult, Mature) with **no filled pills** by default.
- Click "Young adult" → only that row gets the active pill; Quick/All models stays muted.
- Click "My Brand Models" → only that row lights up.
- Grid filtering still works: gender chips + age filter only. No body filter applied anywhere.
- Mobile picker untouched.

### Untouched

`ModelSelectorChip.tsx`, mobile sheet, gender chips row, sort dropdown, grid card rendering, upgrade flow, footer Use-model logic.
