

# try.vovv.ai — Website Product Shot Generator

## Overview
When someone visits `try.vovv.ai`, they see a dedicated landing page (not the main VOVV.AI site). They can enter a store URL or visit `try.vovv.ai/nike.com` to pre-fill it. Clicking "Generate" scrapes 1-2 products from the site and generates AI product shots — no login required for the demo, but with strong anti-abuse protections.

## Architecture

```text
try.vovv.ai/nike.com
    │
    ▼
┌─────────────────────────┐
│  TryShot Landing Page   │  ← hostname detection in App.tsx
│  URL input pre-filled   │
│  Click "Generate"       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Edge: try-website-shot │  ← NO auth required
│  1. Rate limit by IP    │
│  2. Validate domain     │
│  3. Scrape site homepage│
│  4. Extract 1-2 products│
│  5. Generate 2 images   │
│  6. Return results      │
└─────────────────────────┘
```

## Security & Anti-Abuse (Edge Function)

- **IP-based rate limiting**: Max 3 generations per IP per 24h, tracked in a `try_shot_sessions` table
- **Domain blocklist**: Block localhost, internal IPs, non-HTTP protocols
- **Domain allowlist validation**: Must be a real-looking domain (has TLD, no IP addresses)
- **Captcha-ready**: Accept optional turnstile token for future integration
- **No auth required**: Function uses service role key internally, no user JWT needed
- **Result expiry**: Generated images stored with 48h TTL in a public bucket, auto-cleaned

## Changes

### File 1: `src/App.tsx`
- Add hostname detection: if `window.location.hostname === 'try.vovv.ai'`, render a separate `TryShotRoutes` component with only the try-shot page and a catch-all for `/:domain`
- Main VOVV.AI routes stay completely untouched

### File 2: `src/pages/TryShot.tsx` (NEW)
Standalone landing page inspired by shot.new reference:
- VOVV.AI logo + minimal nav ("Sign up" link to main site)
- Typewriter headline: "Product shots for [sneakers|skincare|furniture|fashion]"
- URL input with domain pre-fill from route params (`useParams`)
- "Generate" button triggers the edge function
- Loading state with animated progress (scraping → extracting → generating)
- Results: 2 generated images in a grid with download buttons
- CTA below results: "Want more? Sign up for 60 free credits" → links to vovv.ai/auth
- "Works with most products" showcase section at bottom
- Fully responsive, dark theme matching VOVV brand

### File 3: `supabase/functions/try-website-shot/index.ts` (NEW)
Public edge function (no JWT required):

1. **Rate limit check**: Query `try_shot_sessions` table by IP, reject if >= 3 in 24h
2. **Domain validation**: Parse URL, reject internal/invalid domains
3. **Scrape homepage**: Fetch the domain's homepage HTML
4. **Extract products**: Use AI (Gemini Flash) to find 1-2 product image URLs from the HTML
5. **Generate images**: For each product, call existing generation logic (simplified — use Gemini image model to create a styled product shot from the extracted image)
6. **Store results**: Upload to `scratch-uploads` bucket (already public)
7. **Log session**: Insert into `try_shot_sessions` with IP, domain, timestamp
8. **Return**: Product names + generated image URLs

### File 4: DB Migration — `try_shot_sessions` table
```sql
CREATE TABLE public.try_shot_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  domain text NOT NULL,
  created_at timestamptz DEFAULT now(),
  results jsonb DEFAULT '{}'
);

-- Index for rate limit queries
CREATE INDEX idx_try_shot_ip_time ON public.try_shot_sessions(ip_address, created_at DESC);

-- No RLS needed — only accessed by service role in edge function
ALTER TABLE public.try_shot_sessions ENABLE ROW LEVEL SECURITY;
-- No policies = no public access (service role bypasses RLS)
```

### File 5: `supabase/config.toml`
Add function config block:
```toml
[functions.try-website-shot]
verify_jwt = false
```

## Flow Detail

1. User visits `try.vovv.ai` or `try.vovv.ai/nike.com`
2. Page loads with URL pre-filled (if domain in path)
3. User clicks "Generate"
4. Frontend calls edge function with `{ domain: "nike.com" }`
5. Edge function: rate-limit check → scrape → extract → generate → return
6. Frontend shows 2 AI-generated product shots
7. CTA: "Sign up for 60 free credits" → `https://vovv.ai/auth`

## Summary
- 2 new files (page + edge function), 1 modified file (App.tsx), 1 migration
- Zero impact on existing VOVV.AI routes — hostname detection isolates everything
- Anti-abuse: IP rate limiting, domain validation, no auth bypass possible
- Results are throwaway (public bucket, can be cleaned periodically)

