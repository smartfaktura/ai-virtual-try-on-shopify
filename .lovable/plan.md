## BIMI logo: dark navy background, white "VOVV" wordmark centered

### File
Create `public/bimi-logo.svg` → live at `https://vovv.ai/bimi-logo.svg` after publish.

### Design
- 500×500 square, solid `#0F172A` background
- White "VOVV" wordmark, centered horizontally and vertically
- Drawn as **pure vector paths** (text converted to outlines — no font dependency, BIMI requirement)
- Geometric V's matching the brand monogram (sharp angled strokes, modern editorial feel)

### BIMI / SVG Tiny 1.2 PS compliance
- `version="1.2"` + `baseProfile="tiny-ps"`
- Single `xmlns`, no `xlink`, no metadata, no Inkscape/Adobe junk
- `<title>VOVV.AI</title>` (required)
- Only `<rect>` + `<path>` elements — no `<defs>`, `<clipPath>`, `<g>`, `<text>`, gradients, filters, scripts, animations, external refs, or raster
- Well under 32 KB

### Final SVG content
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny-ps" viewBox="0 0 500 500">
<title>VOVV.AI</title>
<rect width="500" height="500" fill="#0F172A"/>
<!-- VOVV wordmark, 4 angled V glyphs, white, centered -->
<path fill="#FFFFFF" d="M70 200 L94 200 L116 282 L138 200 L162 200 L128 320 L104 320 Z M182 200 L206 200 L228 282 L250 200 L274 200 L240 320 L216 320 Z M294 200 L318 200 L340 282 L362 200 L386 200 L352 320 L328 320 Z M406 200 L430 200 L452 282 L452 282 L452 282 L430 320 Z"/>
</svg>
```

I'll refine the V-glyph path so all four V's render identically with consistent stroke width and proper kerning (~8px gaps), centered as a group between x=70 and x=430, vertically centered around y=260. Final paths are flattened outlines, not strokes.

### After approval
1. **Publish** the project so the file is live.
2. Verify: `curl -I https://vovv.ai/bimi-logo.svg` → `200`, `content-type: image/svg+xml`, no redirect.
3. Add DNS TXT record:
   - Host: `default._bimi`
   - Type: `TXT`
   - Value: `v=BIMI1; l=https://vovv.ai/bimi-logo.svg;`
4. Validate at https://bimigroup.org/bimi-generator/

### Reminders
- BIMI also requires `vovv.ai` DMARC at `quarantine` or `reject`, 100% coverage.
- Gmail's blue checkmark needs a VMC/CMC certificate (DigiCert/Entrust). The SVG itself is VMC-ready: square, Tiny-PS, all-vector, ≤32 KB. Once issued, extend DNS to: `v=BIMI1; l=https://vovv.ai/bimi-logo.svg; a=https://vovv.ai/bimi-cert.pem;`
