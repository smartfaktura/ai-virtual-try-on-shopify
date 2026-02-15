

## Fix: Hide Variation Scenes (not Scene Library) for Virtual Try-On

The previous change hid the wrong section. The user wants to keep the "Scene Library" (poses) but hide the **"Scenes" variation strategy grid** (Front View, 3/4 Turn, Back View, etc.) for try-on workflows.

### Changes in `src/components/app/CreativeDropWizard.tsx`

**1. Revert Scene Library visibility (line 821)** -- Remove `!wf.uses_tryon` so Scene Library shows for all workflows again:
```
{showPosePicker && (
```

**2. Revert pose badge in summary (line 1392)** -- Same revert:
```
{showPosePicker && (
```

**3. Hide the Scenes variation grid for try-on (line 746)** -- Add `!wf.uses_tryon` to the Scenes collapsible:
```
{variations.length > 0 && !wf.uses_tryon && (
```

**4. Hide scenes badge in summary (line 1389)** -- Same condition:
```
{variations.length > 0 && !wf.uses_tryon && (
```

Four single-line condition changes. The Scene Library stays visible for try-on; the redundant variation scenes (Front View, 3/4 Turn, etc.) get hidden.
