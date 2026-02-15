

## Convert Creative Drop Wizard from Popup to Inline Page View

### What Changes

The wizard currently opens as a centered Dialog overlay. Instead, it will render directly inline within the Creative Drops page, replacing the schedules/tabs content when active.

### How It Works

When the user clicks "Create Schedule", the tabs and schedule list slide away and the wizard steps appear in-place on the page. Clicking "Cancel" or completing the wizard returns to the normal tabs view.

---

### Technical Changes

**File 1: `src/components/app/CreativeDropWizard.tsx`**

- Remove the `Dialog` / `DialogContent` wrapper (lines 208-209 and closing tags)
- Remove `ScrollArea` wrapper -- the page itself handles scrolling
- Change the component props: remove `open` and `onClose`, replace with just `onClose` (callback when done/cancelled)
- Remove the `useEffect` reset that triggers on `open` -- instead reset state on mount
- The component becomes a plain `div` with the step header, content, and footer buttons
- Remove the `enabled: open` condition from queries (always enabled when mounted)

**File 2: `src/pages/CreativeDrops.tsx`**

- Replace `wizardOpen` boolean toggle with a view state: when `wizardOpen` is true, render `<CreativeDropWizard onClose={() => setWizardOpen(false)} />` instead of the Tabs section
- Add a back/cancel link above the wizard so users can return to the list
- Conditionally render: if `wizardOpen` show wizard inline, else show the existing tabs

### Layout

```text
Creative Drops page (wizardOpen = false):
+----------------------------------+
| PageHeader: Creative Drops       |
| [Schedules] [Drops] [Calendar]   |
| [Create Schedule] button         |
| ... schedule list ...            |
+----------------------------------+

Creative Drops page (wizardOpen = true):
+----------------------------------+
| PageHeader: Creative Drops       |
| <- Back to Schedules             |
| Step bar: Theme > Products > ... |
| ... wizard step content ...      |
| [Cancel]            [Next ->]    |
+----------------------------------+
```

### Summary

| File | Change |
|------|--------|
| `CreativeDropWizard.tsx` | Remove Dialog wrapper, make it a plain inline component |
| `CreativeDrops.tsx` | Conditionally render wizard inline instead of tabs when creating |

Two files modified, no new files needed.

