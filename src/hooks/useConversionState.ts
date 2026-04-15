import { useState, useCallback } from 'react';
import { useCredits } from '@/contexts/CreditContext';

const L1_DISMISS_KEY = 'vovv_l1_dismiss_count';
const L1_SESSION_KEY = 'vovv_l1_shown';
const L2_SESSION_COUNT_KEY = 'vovv_l2_count';
const L2_LAST_DISMISS_KEY = 'vovv_l2_last_dismissed_at';

const RULES = {
  layer1_max_lifetime_dismissals: 3,
  layer2_max_per_session: 2,
  layer2_cooldown_ms: 5 * 60 * 1000,
};

export function useConversionState() {
  const { plan } = useCredits();
  const isFreeUser = plan === 'free';

  const [layer1Dismissed, setLayer1Dismissed] = useState(false);
  const [layer2Open, setLayer2Open] = useState(false);
  const [layer2Reason, setLayer2Reason] = useState<string>('');
  const [layer2DismissedAt, setLayer2DismissedAt] = useState(0);

  // ── Layer 1 ──────────────────────────────────────────────
  const canShowLayer1 = isFreeUser
    && !layer1Dismissed
    && parseInt(localStorage.getItem(L1_DISMISS_KEY) ?? '0', 10) < RULES.layer1_max_lifetime_dismissals
    && sessionStorage.getItem(L1_SESSION_KEY) !== 'true';

  const dismissLayer1 = useCallback(() => {
    setLayer1Dismissed(true);
    sessionStorage.setItem(L1_SESSION_KEY, 'true');
    const count = parseInt(localStorage.getItem(L1_DISMISS_KEY) ?? '0', 10);
    localStorage.setItem(L1_DISMISS_KEY, String(count + 1));
  }, []);

  // ── Layer 2 ──────────────────────────────────────────────
  const canShowLayer2 = isFreeUser
    && parseInt(sessionStorage.getItem(L2_SESSION_COUNT_KEY) ?? '0', 10) < RULES.layer2_max_per_session
    && (layer2DismissedAt === 0 || Date.now() - layer2DismissedAt >= RULES.layer2_cooldown_ms);

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
    const now = Date.now();
    setLayer2DismissedAt(now);
    sessionStorage.setItem(L2_LAST_DISMISS_KEY, String(now));
  }, []);

  return {
    isFreeUser,
    canShowLayer1,
    dismissLayer1,
    layer2Open,
    layer2Reason,
    canShowLayer2,
    openUpgradeDrawer,
    dismissLayer2,
  };
}
