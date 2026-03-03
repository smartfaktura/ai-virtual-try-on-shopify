

## Strengthen Terms of Service and Privacy Policy for AI Image Generation

### Research Findings

After examining Midjourney, HeadshotPro, and PhotoGPT's legal terms, here are the key patterns every serious AI image platform uses to protect themselves:

**1. User bears ALL responsibility for uploads AND outputs**
- PhotoGPT (strongest example): "The Customer is solely and exclusively responsible for all Generations, including: (i) the decision to create such Generations; (ii) any use, distribution, publication, display, commercialization, or sharing; (iii) ensuring Generations do not infringe any third-party IP, privacy, or publicity rights; (iv) any claims or liability arising from third parties"
- Midjourney: "You are responsible for Your use of the service. If You harm someone else or get into a dispute with someone else, we will not be involved."

**2. Upload warranties (user must confirm they have rights)**
- HeadshotPro requires users to warrant they own all uploaded content, have obtained consent from depicted individuals, and that content doesn't infringe third-party rights
- PhotoGPT requires explicit written consent from anyone depicted in uploaded content

**3. Full indemnification clause**
- All three platforms require users to indemnify the platform against any claims arising from their uploads, generations, or use of the service

**4. IP status disclaimer for AI-generated content**
- PhotoGPT explicitly states: "The intellectual property status of AI-generated content is legally evolving and unsettled" and makes no warranties about copyrightability

**5. No editorial control disclaimer**
- PhotoGPT: "provides generation tools only, exercises no editorial control over Generations, and has no obligation to review, monitor, or screen Generations"

**6. Unauthorized likeness prohibition**
- Both PhotoGPT and HeadshotPro prohibit generating recognizable likenesses without consent

### What Your Current Terms Are Missing

Your current Terms of Service are a basic template. They lack:
- User responsibility for generated outputs (only a vague "review before commercial use" line)
- Upload warranties (no requirement to confirm rights)
- Indemnification clause (completely absent)
- AI content IP disclaimer (absent)
- Reference image / likeness protections (absent)
- "Tool provider, not content creator" framing (absent)
- Prohibited content details (very thin list)

### Plan: Rewrite Terms of Service

The Terms of Service page will be significantly expanded with the following new/strengthened sections:

**Section 3 (Service Description)** -- Add "tool provider" framing:
- VOVV.AI provides AI-powered generation tools only. We do not exercise editorial control over content you create and have no obligation to review, monitor, or screen your outputs.

**Section 5 (Acceptable Use)** -- Expand significantly:
- Add: no generating unauthorized likenesses of real people without consent
- Add: no creating deepfakes, deceptive media, or content designed to mislead
- Add: no uploading copyrighted/trademarked material you don't have rights to
- Add: no generating content that violates any person's privacy, publicity, or moral rights

**New Section: "Your Uploads -- Representations and Warranties"**
- You represent and warrant that you own or have all necessary rights, licenses, consents, and permissions for all content you upload
- If your uploads contain recognizable likenesses of individuals, you have obtained their explicit written consent
- Your uploads do not infringe any third-party IP, privacy, publicity, or moral rights
- You have full authority to grant the licenses described in these Terms
- VOVV.AI does not verify uploads and relies entirely on your representations

**New Section: "Your Responsibility for Generated Content"**
- You are solely and exclusively responsible for ALL generated content (Generations), including:
  - The decision to create such content
  - Any use, distribution, publication, display, commercialization, or sharing
  - Ensuring outputs do not infringe third-party rights
  - Any claims, damages, or liability arising from third parties' exposure to your outputs
  - Compliance with all applicable laws when distributing outputs
- VOVV.AI provides generation tools only, exercises no editorial control, and bears no responsibility for how outputs are used after creation

**New Section: "Intellectual Property Status of AI-Generated Content"**
- The IP status of AI-generated content is legally evolving and unsettled
- Certain jurisdictions may not recognize copyright for AI-generated content
- VOVV.AI makes no representations about copyrightability of outputs
- Users seeking IP protection should consult independent legal counsel

**New Section: "Indemnification"**
- You shall indemnify and hold harmless VOVV.AI from any claims, damages, liabilities, losses, costs, and expenses arising from:
  - Your use of the Service
  - Any content you upload or generate
  - Violation of any law or these Terms
  - Infringement of any third-party rights
  - Any breach of your representations and warranties
  - Distribution, publication, or commercialization of your generated content

**Strengthen Section 8 (Limitation of Liability)**
- Make it clearer with ALL CAPS formatting (industry standard for enforceability)
- Add: "in no event shall VOVV.AI be liable for any claims arising from your Generations"
- Cap total liability at amount paid in 12 months (keep existing) or $10 (PhotoGPT model)

**New Section: "DMCA and Takedowns"**
- Contact address for copyright claims
- Counter-notification process

**Update Section 9 (Disclaimer of Warranties)**
- Add explicit disclaimers about accuracy of AI outputs, resemblance to real people/brands, and fitness for commercial use

### Privacy Policy Updates

Minor additions:
- Add a line in "AI Training" section reinforcing that reference images are processed only to provide the Service and are never shared with third parties
- Add mention that VOVV.AI does not verify or validate the rights status of uploaded content

### Files Changed

| File | Change |
|------|--------|
| `src/pages/TermsOfService.tsx` | Major rewrite -- expand from 13 sections to ~18 sections with all protections above |
| `src/pages/PrivacyPolicy.tsx` | Minor updates -- strengthen AI Training section, add upload disclaimer |

### Important Disclaimer
These changes follow industry best practices from Midjourney, HeadshotPro, and PhotoGPT. However, this is still template content -- I strongly recommend having a lawyer review the final terms before going live, as legal requirements vary by jurisdiction.

