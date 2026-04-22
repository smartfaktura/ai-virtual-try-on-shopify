import { UnifiedFeedbackBanner } from './UnifiedFeedbackBanner';

interface MissingRequestBannerProps {
  category: string;
  title?: string;
  placeholder?: string;
  compact?: boolean;
  showImageLinkField?: boolean;
}

export function MissingRequestBanner({
  category,
  title,
  placeholder,
  compact = false,
  showImageLinkField = false,
}: MissingRequestBannerProps) {
  const defaultTitle =
    category === 'workflow'
      ? 'Missing a feature or Visual Type? Let us know what you need.'
      : `Missing a ${category}? Tell us, we'll create it in 1–2 business days.`;

  const defaultPlaceholder =
    category === 'workflow'
      ? 'Describe the Visual Type or feature you need…'
      : `Describe the ${category} you'd like us to create…`;

  return (
    <UnifiedFeedbackBanner
      category={category}
      mode="request"
      density={compact ? 'compact' : 'default'}
      title={title || defaultTitle}
      subtitle={compact ? undefined : "We'll review and add it to the lineup."}
      placeholder={placeholder || defaultPlaceholder}
      showImageLinkField={showImageLinkField}
      showAvatars={!compact}
    />
  );
}
