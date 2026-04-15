import { useState, useCallback, useMemo } from 'react';
import { useCredits } from '@/contexts/CreditContext';

const L1_DISMISS_KEY = 'vovv_l1_dismiss_count';
const L1_SESSION_KEY = 'vovv_l1_shown';
const L2_SESSION_COUNT_KEY = 'vovv_l2_count';
const L2_LAST_DISMISS_KEY = 'vovv_l2_last_dismissed_at';

const RULES = {
  layer1_max_lifetime_dismissals: 3,
  layer2_max_per_session: 2,
  layer2_cooldown_ms: 5 * 60 * 1000, // 5 minutes
};

export function useConversionState() {
  const { plan } = useCredits();
  const isFreeUser = plan === 'free';

  const [layer1Visible, setLayer1Visible] = useState(false);
  const [layer2Open, setLayer2Open] = useState(false);
  const [layer2Reason, setLayer2Reason] = useState<string>('');

  // ── Layer 1 logic ──────────────────────────────────────────────

  const canShowLayer1 = useMemo(() => {
    if (!isFreeUser) return false;
    const dismissCount = parseInt(localStorage.getItem(L1_DISMISS_KEY) ?? '0', 10);
    if (dismissCount >= RULES.layer1_max_lifetime_dismissals) return false;
    if (sessionStorage.getItem(L1_SESSION_KEY) === 'true') return false;
    return true;
  }, [isFreeUser]);

  const showLayer1 = useCallback(() => {
    if (!canShowLayer1) return;
    sessionStorage.setItem(L1_SESSION_KEY, 'true');
    setLayer1Visible(true);
  }, [canShowLayer1]);

  const dismissLayer1 = useCallback(() => {
    setLayer1Visible(false);
    const count = parseInt(localStorage.getItem(L1_DISMISS_KEY) ?? '0', 10);
    localStorage.setItem(L1_DISMISS_KEY, String(count + 1));
  }, []);

  // ── Layer 2 logic ──────────────────────────────────────────────

  const canShowLayer2 = useMemo(() => {
    if (!isFreeUser) return false;
    const count = parseInt(sessionStorage.getItem(L2_SESSION_COUNT_KEY) ?? '0', 10);
    if (count >= RULES.layer2_max_per_session) return false;
    const lastDismiss = parseInt(sessionStorage.getItem(L2_LAST_DISMISS_KEY) ?? '0', 10);
    if (lastDismiss && Date.now() - lastDismiss < RULES.layer2_cooldown_ms) return false;
    return true;
  }, [isFreeUser]);

  const openUpgradeDrawer = useCallback((reason: string) => {
    if (!canShowLayer2) return;
    const count = parseInt(sessionStorage.getItem(L2_SESSION_COUNT_KEY) ?? '0', 10);
    sessionStorage.setItem(L2_SESSION_COUNT_KEY, String(count + 1));
    setLayer2Reason(reason);
    setLayer2Open(true);
  }, [canShowLayer2]);

  const dismissLayer2 = useCallback(() => {
    setLayer2Open(false);
    setLayer2Reason('');
    sessionStorage.setItem(L2_LAST_DISMISS_KEY, String(Date.now()));
  }, []);

  return {
    isFreeUser,
    // Layer 1
    layer1Visible,
    canShowLayer1,
    showLayer1,
    dismissLayer1,
    // Layer 2
    layer2Open,
    layer2Reason,
    canShowLayer2,
    openUpgradeDrawer,
    dismissLayer2,
  };
}
