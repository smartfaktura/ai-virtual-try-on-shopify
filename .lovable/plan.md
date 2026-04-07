

# Fix: Generate Prompt loading state affects all cards

## Problem
`generatePrompts.isPending` from the shared `useMutation` is passed to every `DraftSceneCard`. When one card's button is clicked, all cards show the spinner and become disabled.

## Fix
Track which recipe ID is currently generating using local state in `DraftScenesPanel`:

1. Add `const [generatingId, setGeneratingId] = useState<string | null>(null)` in `DraftScenesPanel`
2. Wrap the `generatePrompts.mutate` call to set/clear `generatingId`
3. Pass `isGenerating={generatingId === recipe.id}` instead of `generatePrompts.isPending`

## File
- `src/components/app/trend-watch/DraftScenesPanel.tsx` — add state tracking, update props

