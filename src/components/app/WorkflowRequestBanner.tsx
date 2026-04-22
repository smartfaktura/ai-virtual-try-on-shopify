import { UnifiedFeedbackBanner } from './UnifiedFeedbackBanner';

export function WorkflowRequestBanner() {
  return (
    <UnifiedFeedbackBanner
      category="workflow"
      mode="request"
      title="Missing a Visual Type for your brand?"
      subtitle="Tell us what you need — we'll build it and add it to our lineup."
      placeholder="Describe the Visual Type, niche, or product type you need…"
    />
  );
}
