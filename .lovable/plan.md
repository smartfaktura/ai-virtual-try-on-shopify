

# Fix Help Center FAQ — Remove False Information

## Audit Results

Going through each FAQ answer, here are the issues found and fixes needed:

### Issues to Fix

**1. "Can I invite team members?"** — FALSE  
Says: "Team collaboration features are available on Growth and Pro plans. You can manage team access and permissions from Settings > Team & Permissions."  
Reality: There is no "Team & Permissions" section in Settings. No team invite feature exists in the app.  
**Fix**: Remove this question entirely.

**2. Freestyle credit cost** — INCONSISTENT  
Help Center says: "Freestyle costs 6 credits per image" (in two places).  
Reality per code (`FreestyleSettingsChips.tsx`): Standard quality = 4 credits, Pro quality = 6 credits. Landing FAQ also says "4 credits per image, or 6 credits when you add a model or scene."  
**Fix**: Update both mentions to: "Freestyle costs 4 credits per image at Standard quality, or 6 credits at Pro quality or when you add a model or scene."

**3. "You can delete your data at any time from Settings"** — FALSE  
There is no delete account/data feature in Settings.  
**Fix**: Change to: "Your images are private and never used to train our AI models. Contact hello@vovv.ai to request data deletion."

**4. "Upload up to 5 images per product"** — UNVERIFIED  
No `maxFiles` or upload limit of 5 found in the upload components. The number 5 appears only in blog posts as a recommendation, not a hard limit.  
**Fix**: Remove the specific "up to 5" claim. Say: "For best results, use images with clean backgrounds and at least 1024×1024 resolution."

### Answers Verified as Correct
- Getting Started Q1 (first product image) ✓
- Background removal ✓  
- Brand Profile ✓
- Credits & Billing (run out, free trial, change plan, refunds) ✓
- All Workflows & Generation answers ✓
- Image Quality answers ✓
- Export images (ZIP download exists in Jobs.tsx) ✓
- Commercial use ✓

## File
**`src/pages/HelpCenter.tsx`** — 4 edits:
1. Remove "Can I invite team members?" Q&A entirely (lines 113-116)
2. Fix Freestyle credit mentions in two places (lines 27, 40)
3. Fix data storage answer — remove "delete from Settings" claim (line 111)
4. Fix upload formats answer — remove "up to 5 images" claim (line 19)

