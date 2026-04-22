import { UnifiedFeedbackBanner } from './UnifiedFeedbackBanner';

export function SceneRequestBanner() {
  return (
    <UnifiedFeedbackBanner
      category="scene"
      mode="request"
      title="Missing a scene for your products?"
      subtitle="Tell us what you need — we'll create it in 1–2 business days."
      placeholder="Describe the scene, mood, or setting you need…"
      showImageLinkField
    />
  );
}
