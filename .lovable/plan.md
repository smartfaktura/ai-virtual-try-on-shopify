

# Fix Admin Select Dropdowns Flashing/Not Showing Selection

## Root Cause
The Radix `SelectContent` renders in a **portal** outside the modal DOM tree. When clicking a dropdown option, the pointer event passes through to the backdrop `div` (which has `onClick={onClose}`), closing the entire modal before the selection registers. The `e.stopPropagation()` on the right panel doesn't help because the portal is not a child of that panel.

Additionally, the Category dropdown appears empty in the screenshot — likely because `editCategory` initializes to an empty string momentarily before the `useEffect` fires.

## Changes

### `src/components/app/DiscoverDetailModal.tsx`

**1. Prevent SelectContent portal clicks from closing the modal**
Add `onPointerDownOutside={(e) => e.preventDefault()}` to all four `SelectContent` components. This stops the Radix "click outside" behavior from propagating to the backdrop.

```tsx
<SelectContent className="z-[300] max-h-60" onPointerDownOutside={(e) => e.preventDefault()}>
```

Applied to: Category, Workflow, Model, Scene — all four selects.

**2. Fix category not showing current value**
Change `editCategory` default from `''` to `'fashion'` (line 76) so it always has a valid value even before the useEffect runs:
```
Before: const [editCategory, setEditCategory] = useState('');
After:  const [editCategory, setEditCategory] = useState('fashion');
```

Similarly for workflow:
```
Before: const [editWorkflowSlug, setEditWorkflowSlug] = useState('');
After:  const [editWorkflowSlug, setEditWorkflowSlug] = useState('__freestyle__');
```

And for model/scene:
```
Before: const [editModelName, setEditModelName] = useState('');
        const [editSceneName, setEditSceneName] = useState('');
After:  const [editModelName, setEditModelName] = useState('__none__');
        const [editSceneName, setEditSceneName] = useState('__none__');
```

One file, ~8 lines changed. Fixes both the flash-close and empty-field issues.

