import { useCredits } from '@/contexts/CreditContext';
import { UpgradePlanModal } from './UpgradePlanModal';

/**
 * Globally mounted upgrade/topup modal controlled by CreditContext.
 * Variant is chosen automatically:
 *  - Free users → upgrade variant (preselects Growth)
 *  - All paid plans (Starter/Growth/Pro/Enterprise) → topup variant
 *    (users who want to change tier use the "Compare plans" footer link)
 */
export function GlobalUpgradeModal() {
  const { buyModalOpen, closeBuyModal, plan } = useCredits();
  const isTopupOnly = plan !== 'free';
  return (
    <UpgradePlanModal
      open={buyModalOpen}
      onClose={closeBuyModal}
      variant={isTopupOnly ? 'topup' : 'auto'}
    />
  );
}
