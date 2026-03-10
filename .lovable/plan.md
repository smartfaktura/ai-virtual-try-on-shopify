

## Fix: Contact Form Submission

The contact form in `src/pages/Contact.tsx` uses `supabase.from('contact_submissions' as any)` — the `as any` cast bypasses TypeScript type checking unnecessarily since `contact_submissions` exists in the generated types.

### Changes

**`src/pages/Contact.tsx` (line 28)**
- Remove `as any` cast: change `supabase.from('contact_submissions' as any)` to `supabase.from('contact_submissions')`
- This ensures full type safety and the insert fields (`name`, `email`, `inquiry_type`, `message`) already match the table schema

The RLS policy (`WITH CHECK (true)`) correctly allows unauthenticated inserts, and the table schema matches the form fields — so the only issue is the unnecessary type cast.

