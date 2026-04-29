## Goal

You're right — the global "Save Settings" button at the bottom is redundant and confusing:

- **Content Preferences** already has its own "Save preferences" button (saves categories/subcategories)
- **Notifications + Marketing** are the only things the global button actually saves — but it sits below an unrelated card, so users don't know what it applies to (and it's currently the one stuck on "Saving…")

Solution: remove the bottom global button, and move a scoped "Save" button **inside the Notifications card** so each section owns its own save action — matching the Content Preferences pattern.

## Changes (one file: `src/pages/Settings.tsx`)

### 1. Move the save button into the Notifications card

At the end of the Notifications card body (after the "In-App Notifications" block, around line 701, **inside** the card div that closes on line 702), add a right-aligned save button:

```tsx
<div className="flex justify-end pt-2">
  <Button size="pill" onClick={handleSave} disabled={isSaving}>
    {isSaving ? 'Saving…' : 'Save preferences'}
  </Button>
</div>
```

This button saves exactly what `handleSave` already saves: notification settings + marketing opt-in. Scope now matches the card it lives in.

### 2. Delete the standalone global save block

Remove lines 709–717 entirely:

```tsx
<div className="flex justify-end pt-4 border-t border-border">
  <Button size="pill" onClick={handleSave} disabled={isSaving}>
    {isSaving ? 'Saving…' : 'Save Settings'}
  </Button>
</div>
```

This kills the orphan button (and the stuck "Saving…" pill in your screenshot).

### 3. Keep `handleSave` and `isSaving` as-is

No logic changes — same handler, just relocated and relabeled. Content Preferences keeps its own independent save button and handler. Admin sections below remain untouched.

## Result

- Notifications card → its own "Save preferences" button (scoped, clear)
- Content Preferences card → its own "Save preferences" button (already exists)
- No more floating global button
- No more confusing "Saving…" pill hovering below an unrelated card