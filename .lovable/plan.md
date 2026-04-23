

## Fix scene picker: not clickable + wrongly preselected with AI guess

### Root causes (from `AddToDiscoverModal.tsx`)

1. **Picker is invisible/unclickable.** `PopoverContent` uses `z-50` (default `src/components/ui/popover.tsx` line 20) but the modal backdrop is `z-[300]` (line 324–325). The popover portals to `<body>` and renders **behind** the backdrop, so the search input + scene options sit under the dim layer. Any click on them hits the backdrop, which has `onClick={onClose}` (line 324), and the modal closes.

2. **Wrong scene preselected as if it were correct.** This Library item is older and has `job.scene_name = null` (`useLibraryItems.ts` line 89), so `initialSceneName` is null. The AI auto-fill effect (lines 184–190) then **writes the AI suggestion into `pickedSceneName`** with only a small "AI" badge. Admin sees a confidently-selected wrong scene ("Shadow Play") and the missing-scene warning is hidden. The original generation context simply isn't in the DB — we can't recover it, but we should not pretend we did.

### Fix

**A. Make pickers actually usable inside the modal**

In `AddToDiscoverModal.tsx`, raise the z-index of each `PopoverContent` above the modal backdrop:

```tsx
<PopoverContent
  className="z-[320] w-[var(--radix-popover-trigger-width)] p-1 max-h-64 overflow-auto"
  align="start"
>
```

Apply to all three pickers (Workflow line 482, Scene line 523, Model line 592). Use `z-[320]` so it sits above the modal's `z-[300]` wrapper but below any global toast layer.

We do **not** edit `src/components/ui/popover.tsx` itself — keep the global default at `z-50` and override only inside this modal so we don't affect popovers elsewhere.

Sanity check on click-outside: backdrop has `onClick={onClose}` and the modal box uses `e.stopPropagation()` (line 328). The popover is portaled to `<body>` so its clicks don't bubble through the modal at all — once it's visible above the backdrop, clicks land on its options correctly. Radix's own outside-click handler will close the popover (not the modal) when clicking the backdrop while the popover is open.

**B. Stop pre-applying the AI scene guess as a confirmed selection**

Change the AI auto-fill block (lines 183–190) so the suggestion is **offered**, not **applied**:

```tsx
// AI scene suggestion — store as suggestion only, do NOT auto-select
if (!initialSceneName && data.suggested_scene_name) {
  const match = allScenes.find(s => s.name === data.suggested_scene_name);
  if (match) {
    setAiSuggestedScene(match.name);
    // pickedSceneName stays null → warning + "Apply suggestion" CTA shown
  }
}
```

Then update the missing-scene block (lines 567–574) to render the suggestion as a one-click hint:

```text
⚠ No scene detected. Pick one so Recreate works.
[Apply AI suggestion: "Shadow Play"]   ← small inline button, only shown when aiSuggestedScene && !pickedSceneName
```

The "Apply" button calls `setPickedSceneName(aiSuggestedScene)`. Admin keeps full control: they can ignore it and pick the correct scene from the (now-clickable) picker, or accept the suggestion with one click.

The existing "AI" badge inside the picker trigger (lines 516–518) keeps working — it now appears only after the admin actually applies the suggestion.

### Files touched

```text
EDIT  src/components/app/AddToDiscoverModal.tsx
        - PopoverContent (×3): add z-[320] to className
        - AI auto-fill: store suggestion in aiSuggestedScene only; do not setPickedSceneName
        - Missing-scene warning: add "Apply AI suggestion: <name>" button when suggestion exists
```

No other files. No DB migration. No edge function changes. Other consumers of Popover, Library, freestyle gallery — all untouched.

### Behavior after fix

| Case | Before | After |
|---|---|---|
| Admin clicks Scene/Workflow/Model picker in modal | Popover opens behind backdrop, clicks close the modal | Popover renders above backdrop, options clickable, modal stays open |
| Library item has no `scene_name` in DB | AI guess silently set as the picked scene → wrong metadata published | Picker stays empty, red warning + one-click "Apply AI suggestion" button shown — admin always confirms |
| Library item has correct `scene_name` | Preselected from prop (already worked) | Unchanged |
| Admin republishes a previously-broken preset with correct scene | Existing dedupe-by-`image_url` updates the row | Unchanged |

### Safety & performance

- Pure className + small effect-body changes. Zero new queries, hooks, deps, or schema changes.
- z-index override is scoped to this modal — `src/components/ui/popover.tsx` untouched, every other popover in the app keeps its current behavior.
- AI suggestion still runs (existing `describe-discover-metadata` call), just no longer auto-applied.
- If `aiSuggestedScene` is null (no suggestion or suggestion not in list), the warning falls back to its current text — no regression.
- Submit payload (lines 272–291) is unchanged: it already reads from `pickedSceneName`, so an empty selection correctly publishes `scene_name: null` rather than a wrong guess.

### Validation

1. Open Library item with missing scene → click Add to Discover → Scene picker opens above backdrop, search + scroll + select all work, modal stays open until admin clicks Publish.
2. Same item shows red warning + "Apply AI suggestion: Shadow Play" button. Clicking it sets the picker to Shadow Play with the AI badge. Clicking the picker instead lets admin pick the actual scene.
3. Open Library item with correct scene → picker preselected as before, no warning, no AI badge.
4. Workflow + Model pickers also clickable; selections persist into the published preset.
5. Clicking the dim backdrop (outside modal, outside popover) still closes the modal.
6. Discover entries created from broken items now reliably carry the admin-confirmed `scene_name`, restoring Recreate.

