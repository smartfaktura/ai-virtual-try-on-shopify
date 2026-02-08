

## Add 9:16 Story Format to Image Size Options

### What Changes

Add a **9:16** vertical (story/reel) aspect ratio option to the Freestyle studio's Image Size selector. This is the standard format for Instagram Stories, TikTok, YouTube Shorts, and similar vertical content.

### Technical Details

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

1. Update the `FreestyleAspectRatio` type to include `'9:16'`:
   - From: `'1:1' | '3:4' | '4:5' | '16:9'`
   - To: `'1:1' | '3:4' | '4:5' | '9:16' | '16:9'`

2. Add the 9:16 entry to the `ASPECT_RATIOS` array, placed between 4:5 and 16:9 (ordering from square to tallest vertical, then horizontal):
   - `{ value: '9:16', label: '9:16', icon: Smartphone }`

The updated order will be:
| Ratio | Type | Use Case |
|---|---|---|
| 1:1 | Square | Instagram Feed |
| 3:4 | Portrait | General portrait |
| 4:5 | Portrait | Instagram portrait |
| 9:16 | Tall vertical | Stories, Reels, TikTok |
| 16:9 | Landscape | YouTube, website heroes |

No changes needed in the backend edge function -- it already passes the aspect ratio string directly to the AI model, so `9:16` will work without modification.

