import { UnifiedFeedbackBanner } from './UnifiedFeedbackBanner';

export function FeedbackBanner() {
  return (
    <UnifiedFeedbackBanner
      category="general"
      mode="feedback"
      title="Help us improve VOVV.AI"
      subtitle="Bugs, feature ideas, anything — we read every one."
      placeholder="Tell us more…"
      ctaLabel="Share feedback"
      submitLabel="Send Feedback"
    />
  );
}
