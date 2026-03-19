

# Add Enter Key Shortcut to Generate in Freestyle

## Current State
The textarea already supports **Cmd/Ctrl+Enter** to generate. The user wants plain **Enter** to also trigger generation (since this is a prompt field, not a multi-line text editor).

## Change

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx` (line 250-255)**

Update the `onKeyDown` handler:
- **Enter** (no modifier): prevent default newline, call `onGenerate()` if `canGenerate` is true and not already loading
- **Shift+Enter**: allow newline (standard convention for multi-line input)
- Keep existing **Cmd/Ctrl+Enter** as an additional shortcut

This is a single 5-line change in one file. Add a small hint in the placeholder text like "Press Enter to generate" so users discover the shortcut.

