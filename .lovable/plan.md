

## Remove Scene Library from Virtual Try-On in Creative Drops Wizard

Virtual Try-On already has its own built-in scene variations (the variation strategy grid shown above it). The general "Scene Library" section showing poses is redundant and confusing for try-on workflows.

### Changes in `src/components/app/CreativeDropWizard.tsx`

**1. Hide Scene Library for try-on workflows (Step 3, line 821)**

Change the condition from:
```
{showPosePicker && (
```
to:
```
{showPosePicker && !wf.uses_tryon && (
```

**2. Hide pose badge in Step 5 summary (line 1392)**

Same condition update:
```
{showPosePicker && !wf.uses_tryon && (
```

Two single-line changes, no logic or layout impact on other workflows.

