Make the Fresh Scenes preview modal behave like a compact mobile sheet without image/text overlap:

1. Reduce the mobile image footprint
- Keep the image visually portrait, but cap it lower than now so it cannot consume the whole modal.
- Use a responsive mobile height cap around 48dvh while preserving the 4:5 crop.
- Keep the desktop 4:5 / 80vh behavior unchanged.

2. Tighten the content block
- Reduce mobile padding and gaps under the image.
- Keep only the scene title, primary CTA, and Close action on mobile.
- Prevent title wrapping from pushing buttons down by keeping it compact.

3. Correct CTA sizing and spacing
- Make the primary button slightly shorter and inset from the modal edges.
- Make Close compact with less vertical space.
- Ensure title, CTA, and Close all remain visible within the mobile viewport.

Technical details:
- Update only `src/components/app/DashboardFreshScenes.tsx`.
- Adjust the classes around lines 198-235: modal max height, mobile image wrapper max-height, content padding/gap, title size/line clamp, button height and margins.
- No business logic or desktop layout changes.