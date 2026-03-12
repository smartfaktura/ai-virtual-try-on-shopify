

## Fix Chip Border Clipping

The chip container (`flex flex-nowrap` div on line 178) has `overflow-hidden` which clips the left border of the first chip. Add `pl-0.5` (2px left padding) to give the chips breathing room so borders aren't cut off.

**File**: `src/components/landing/FreestyleShowcaseSection.tsx` (line 178)
- Change: `className="flex flex-nowrap items-center gap-1.5 sm:gap-2 h-10 overflow-hidden"`
- To: `className="flex flex-nowrap items-center gap-1.5 sm:gap-2 h-10 overflow-hidden pl-0.5"`

