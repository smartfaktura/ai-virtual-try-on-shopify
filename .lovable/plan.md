

## Topaz Labs API Integration Assessment

### Verdict: Not difficult at all. It's a clean REST API that fits perfectly into our existing queue architecture.

### How the Topaz API Works

1. **Submit** — `POST https://api.topazlabs.com/image/v1/enhance/async` with the image (via `source_url` or file upload) + `output_width`/`output_height` + `model` choice. Returns a `process_id`.
2. **Poll** — Check status via their Status endpoint using `process_id` until "Completed".
3. **Download** — Fetch the processed image from their presigned `download_url`.

They also support **webhooks** — you can pass a `webhook_url` and they'll POST the result when done, which would eliminate polling entirely.

### Why This Solves the Resolution Problem

Unlike Gemini which outputs a fixed ~1024px regardless of prompt, Topaz supports **exact pixel output up to 32,000px** per dimension. You specify `output_width: 2048` for 2K or `output_width: 4096` for 4K and get exactly that. This is a true super-resolution engine, not a generative model.

### Available Models

| Model | Type | Best For |
|-------|------|----------|
| **Standard V2** | Standard | General-purpose, fast, preserves fidelity |
| **High Fidelity V2** | Standard | Maximum detail preservation |
| **Low Resolution V2** | Standard | Small source images (web graphics) |
| **Standard MAX** | Generative | Higher quality, slower |
| **Redefine** | Generative | Most creative output |

For our use case, **Standard V2** (fast, faithful) for 2K and **High Fidelity V2** for 4K would be ideal.

### Integration Plan — 2 files

**1. `supabase/functions/upscale-worker/index.ts` — Replace Gemini with Topaz API**

- Remove the Gemini AI call entirely
- Submit image via `source_url` to Topaz async endpoint with exact `output_width`/`output_height`
- Poll the status endpoint every 3-5 seconds until completed (with timeout)
- Download the result and upload to storage
- Use `Standard V2` model for 2K, `High Fidelity V2` for 4K
- Auth: `X-API-Key` header with the Topaz API key

**2. Secret required: `TOPAZ_API_KEY`**

- You'll need a Topaz Labs account and API key from https://topazlabs.com/my-account/
- Their pricing is credit-based (plans start at ~$0.07/credit, upscale costs vary by resolution)

### What Stays the Same

- Our queue system (`enqueue-generation` → `process-queue` → `upscale-worker`) stays identical
- The `useUpscaleImages` hook stays identical
- Credit costs, UI, Luna avatars — all unchanged
- Only the worker's internal processing logic changes

### Pricing Consideration

Topaz uses their own credit system. You'd need to factor their per-image cost into your credit pricing. Their Standard models are described as "blazingly fast" and low-cost. Check https://www.topazlabs.com/enhance-api for current plan pricing.

### Want to proceed?

If you'd like to integrate Topaz, the first step is getting an API key. I'll then securely store it and rewrite the upscale worker to use their API instead of Gemini.

