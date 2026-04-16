import { UpgradePlanModal } from '@/components/app/UpgradePlanModal';
import type { ConversionCategory } from '@/lib/conversionCopy';

interface NoCreditsModalProps {
  open: boolean;
  onClose: () => void;
  /** Kept for backward compat — unused after unification with UpgradePlanModal */
  category?: ConversionCategory;
  /** Kept for backward compat — unused after unification with UpgradePlanModal */
  generationCount?: number;
  previewPlan?: string;
}

/**
 * NoCreditsModal is now a thin wrapper around UpgradePlanModal so every
 * "buy/upgrade/top-up/out-of-credits" surface uses the same compact, centered,
 * rounded modal with state-aware copy.
 *
 * Triggered after a free user runs out of credits during a generation attempt.
 * UpgradePlanModal auto-detects that state and shows the right title/subtitle.
 */
export function NoCreditsModal({ open, onClose, previewPlan }: NoCreditsModalProps) {
  return (
    <UpgradePlanModal
      open={open}
      onClose={onClose}
      previewPlan={previewPlan}
      variant="no-credits"
    />
  );
}
