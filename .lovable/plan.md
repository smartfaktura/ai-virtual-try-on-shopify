

# Fix: Background Always Injected

## Problem
Scenes whose templates **lack** a `{{background}}` token never get the user's background choice because line 1159 checks `!prompt.toLowerCase().includes('background')` — and many resolved prompts already contain the word "background" from default descriptions.

Scenes that **do** have `{{background}}` in their template work correctly (the token is resolved on line 1141).

## Fix

**File:** `src/lib/productImagePromptBuilder.ts`, line 1159

Remove the broken guard so the user's explicit background choice is always appended when the template didn't include the token:

```ts
// Before (line 1159):
if (bgResolved && !prompt.toLowerCase().includes('background')) {

// After:
if (bgResolved) {
```

**1 condition removed, 1 line, 1 file.** No other changes needed.

## Why this is safe
- Templates WITH `{{background}}` are unaffected (the `hasBgToken` check on line 1156 skips this block entirely)
- Templates WITHOUT the token now always get the user's choice appended — which is correct behavior since the user explicitly picked a non-auto background
- Worst case: a prompt might mention "background" twice, but the user's explicit choice at the end takes priority for the AI model

