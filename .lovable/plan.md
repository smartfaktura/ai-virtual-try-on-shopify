## Goal

Replace the body content of both legal documents with the finalized, EU + US-safe versions you provided. Keep page chrome, routing, SEO, and styling untouched — only the section content changes.

## Files to update

1. **`src/components/legal/TermsContent.tsx`** — Full rewrite of the body using your 24-section Terms of Service.
2. **`src/components/legal/PrivacyContent.tsx`** — Full rewrite of the body using your 16-section Privacy Policy.
3. **`src/pages/TermsOfService.tsx`** — Update "Last updated: March 2026" → "Last updated: April 2026".
4. **`src/pages/PrivacyPolicy.tsx`** — Update "Last updated: March 2026" → "Last updated: April 2026".

## Content rules

- Keep the existing Tailwind `prose` wrapper and heading classes in both `*Content.tsx` components — only swap inner `<h2>/<h3>/<p>/<ul>` content.
- Use **VOVV.AI** uppercase everywhere.
- Hyperlink every `hello@vovv.ai` mention with `<a href="mailto:hello@vovv.ai" className="text-primary hover:underline">`.
- Add the **Company Information** section to both docs (MB 123PRESETS, code 306675527, VAT LT100016637411, Lithuania).
- Terms: include all 24 sections exactly as you wrote them (Definitions → Acceptance → Eligibility → Account → Service Description → Experimental Features → Availability → Credits & Payments incl. EU 14-day withdrawal → Acceptable Use → Your Responsibility → AI Limitations → AI Transparency (EU AI Act) → IP → Confidentiality → Third-Party → Indemnification → Limitation of Liability → Disclaimer → Copyright Complaints → DSA Compliance → Termination → Governing Law → Changes → Company Info).
- Privacy: include all 16 sections (Introduction → Company Info → Roles → Data Collected → Legal Basis → Use → Subprocessors → AI Data Use → International Transfers → Retention → Security → Breach Notification → Rights → Cookies → Automated Processing → Changes).

## Untouched

- Routes (`/terms`, `/privacy`), SEO components, JSON-LD, breadcrumbs, hero/icon styling
- The signup modal that imports these same components (auto-inherits the new copy)
- All other pages and templates

## Result

Both `/terms` and `/privacy` (plus the in-modal versions used at signup) display the finalized EU + US-safe legal text dated April 2026, with consistent VOVV.AI branding and the MB 123PRESETS company details.
