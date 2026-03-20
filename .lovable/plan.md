

# Improve About Page

## Changes

### 1. Copy the founder image into the project
Copy the uploaded image to `src/assets/founder-tomas.jpg` for use in the component.

### 2. Remove fake stats section
The current stats (2M+ images, 5,000+ brands, etc.) are not real. Remove the entire stats section.

### 3. Refine hero and mission copy
- Keep the hero message but tighten it — more professional, less startup-cliché
- Refine mission/vision copy to sound grounded and credible

### 4. Keep the AI Team section and Values
These are good and truthful — the AI team members are the product's virtual team. Keep as-is.

### 5. Add a "Founder" section at the bottom
After the AI team section, add a minimal, elegant founder block:
- Optimized photo of Tomas Simkus (rounded, professional)
- Name: Tomas Simkus
- Title: Founder
- LinkedIn link (icon button) pointing to `https://www.linkedin.com/in/tomassimkusprofile/`
- No bio text beyond what's truthful — just the name, title, and LinkedIn

### File: `src/pages/About.tsx`
- Remove `stats` array and the stats `<section>`
- Import the founder image from `@/assets/founder-tomas.jpg`
- Add founder section after the team grid
- Add LinkedIn icon from lucide-react (`Linkedin`)

