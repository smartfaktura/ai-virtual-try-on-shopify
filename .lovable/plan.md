

# Add Prompt Editor to Admin Metadata (Freestyle Only)

## Change

### `src/components/app/DiscoverDetailModal.tsx`

1. **Add state** `editPrompt` (line ~78): `const [editPrompt, setEditPrompt] = useState('');`

2. **Initialize in useEffect** (line ~95): `setEditPrompt(item.data.prompt || '');`

3. **Add Textarea** between the Scene selector grid and the Save button (after line 296), conditionally shown only when `editWorkflowSlug === '__freestyle__'`:
```tsx
{editWorkflowSlug === '__freestyle__' && (
  <Textarea
    value={editPrompt}
    onChange={(e) => setEditPrompt(e.target.value)}
    placeholder="Prompt for Recreate this..."
    className="text-xs min-h-[60px]"
    rows={3}
  />
)}
```

4. **Include in save handler** (line ~307): Add `prompt: editPrompt || null` to the update object.

5. **Update local state on save** (line ~328): Add `(item.data as any).prompt = editPrompt || null;`

6. **Import** `Textarea` from `@/components/ui/textarea`.

One file, ~10 lines added. Prompt textarea only appears when Freestyle is selected in the workflow dropdown.

