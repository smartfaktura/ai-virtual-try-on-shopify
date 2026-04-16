import { useCredits } from '@/contexts/CreditContext';
import { UpgradePlanModal } from './UpgradePlanModal';

/**
 * Globally mounted upgrade/topup modal controlled by CreditContext.
 * Replaces the legacy BuyCreditsModal. Variant is chosen automatically:
 *  - Pro / Enterprise users (no upgrade path) → topup variant
 *  - All other users → upgrade variant (preselects Growth)
 */
export function GlobalUpgradeModal() {
  const { buyModalOpen, closeBuyModal, plan } = useCredits();
  const isTopupOnly = plan === 'pro' || plan === 'enterprise';
  return (
    <UpgradePlanModal
      open={buyModalOpen}
      onClose={closeBuyModal}
      variant={isTopupOnly ? 'topup' : 'auto'}
    />
  );
}
