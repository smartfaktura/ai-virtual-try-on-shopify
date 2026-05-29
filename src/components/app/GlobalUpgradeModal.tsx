import { useCredits } from '@/contexts/CreditContext';
import { UpgradePlanModal } from './UpgradePlanModal';

/**
 * Globally mounted upgrade/topup modal controlled by CreditContext.
 * Variant is chosen automatically:
 *  - Free users → upgrade variant (preselects Growth)
 *  - Feature-gate CTAs (source ends with "-gate") → always upgrade picker,
 *    regardless of current plan (e.g. Starter user unlocking Brand Scenes
 *    needs to move to Growth/Pro, not buy a credit pack).
 *  - All other paid-plan triggers (sidebar "Get credits", etc.) → topup
 *    variant. Users who want to change tier use the "Compare plans" footer.
 */
export function GlobalUpgradeModal() {
  const { buyModalOpen, closeBuyModal, plan, buyModalSource } = useCredits();
  const isFeatureGate = typeof buyModalSource === 'string' && buyModalSource.endsWith('-gate');
  const isTopupOnly = plan !== 'free' && !isFeatureGate;
  return (
    <UpgradePlanModal
      open={buyModalOpen}
      onClose={closeBuyModal}
      variant={isTopupOnly ? 'topup' : 'auto'}
    />
  );
}

