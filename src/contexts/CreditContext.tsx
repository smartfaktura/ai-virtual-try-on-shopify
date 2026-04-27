import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { useAuth } from '@/contexts/AuthContext';
import type { ImageQuality, GenerationMode } from '@/types';
import { trackInitiateCheckout } from '@/lib/fbPixel';
import { gtmBeginCheckout, gtmCheckoutSessionCreated, gtmPurchase, pickTransactionId } from '@/lib/gtm';
import { pricingPlans, creditPacks } from '@/data/mockData';

export type SubscriptionStatus = 'none' | 'active' | 'past_due' | 'canceling';

export interface PlanConfig {
  name: string;
  monthlyCredits: number;
  nextPlanId: string | null;
}

export const PLAN_CONFIG: Record<string, PlanConfig> = {
  free: { name: 'Free', monthlyCredits: 20, nextPlanId: 'starter' },
  starter: { name: 'Starter', monthlyCredits: 500, nextPlanId: 'growth' },
  growth: { name: 'Growth', monthlyCredits: 1500, nextPlanId: 'pro' },
  pro: { name: 'Pro', monthlyCredits: 4500, nextPlanId: 'enterprise' },
  enterprise: { name: 'Enterprise', monthlyCredits: Infinity, nextPlanId: null },
};

interface CreditContextValue {
  balance: number;
  isLow: boolean;
  isCritical: boolean;
  isEmpty: boolean;
  isLoading: boolean;
  plan: string;
  planConfig: PlanConfig;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  billingInterval: 'monthly' | 'annual' | null;
  
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  refreshBalance: () => Promise<void>;
  setBalanceFromServer: (newBalance: number) => void;
  checkSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  startCheckout: (priceId: string, mode: 'subscription' | 'payment', planName?: string) => Promise<void>;
  
  buyModalOpen: boolean;
  buyModalSource: string | null;
  openBuyModal: (source?: string) => void;
  closeBuyModal: () => void;
  
  calculateCost: (settings: { count: number; quality: ImageQuality; mode: GenerationMode; hasModel?: boolean; hasScene?: boolean; modelName?: string; duration?: string }) => number;
}

const defaultValue: CreditContextValue = {
  balance: 0,
  isLow: false,
  isCritical: false,
  isEmpty: true,
  isLoading: true,
  plan: 'free',
  planConfig: PLAN_CONFIG.free,
  subscriptionStatus: 'none',
  currentPeriodEnd: null,
  billingInterval: null,
  deductCredits: () => {},
  addCredits: () => {},
  refreshBalance: async () => {},
  setBalanceFromServer: () => {},
  checkSubscription: async () => {},
  openCustomerPortal: async () => {},
  startCheckout: async () => {},
  buyModalOpen: false,
  buyModalSource: null,
  openBuyModal: () => {},
  closeBuyModal: () => {},
  calculateCost: () => 0,
};

const CreditContext = createContext<CreditContextValue>(defaultValue);

interface CreditProviderProps {
  children: ReactNode;
}

export function CreditProvider({ children }: CreditProviderProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [plan, setPlan] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyModalSource, setBuyModalSource] = useState<string | null>(null);
  const checkingRef = useRef(false);
  const latestSubscriptionMetaRef = useRef<{
    subscriptionStatus: SubscriptionStatus;
    stripeSubscriptionId: string | null;
    latestInvoiceId: string | null;
    latestSessionId: string | null;
    plan: string;
    amount: number | null;
    currency: string | null;
    lastCreditPackPurchase: {
      payment_intent_id: string | null;
      session_id: string;
      amount: number;
      currency: string;
      credits: number;
      plan_name: string;
    } | null;
  } | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setPlan('free');
      setSubscriptionStatus('none');
      setCurrentPeriodEnd(null);
      setBillingInterval(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits_balance, plan, subscription_status, current_period_end, billing_interval')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        setBalance(data.credits_balance);
        setPlan(data.plan || 'free');
        setSubscriptionStatus((data.subscription_status as SubscriptionStatus) || 'none');
        setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
        setBillingInterval((data as any).billing_interval as 'monthly' | 'annual' | null);
      }
    } catch (err) {
      console.error('CreditProvider: fetchCredits failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  const checkSubscription = useCallback(async () => {
    if (!user || checkingRef.current) return;
    checkingRef.current = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Retry transient edge-runtime errors (503 / cold-start churn) with backoff.
      // These come from the platform before our handler runs (lineno: 0, RUNTIME_ERROR)
      // and resolve on a subsequent invocation once the isolate is warm.
      let data: any = null;
      let error: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await supabase.functions.invoke('check-subscription');
        data = res.data;
        error = res.error;
        const msg = (error as any)?.message || '';
        const isTransient =
          /503|temporarily unavailable|SUPABASE_EDGE_RUNTIME_ERROR|Failed to fetch|boot/i.test(msg);
        if (!error || !isTransient) break;
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }

      if (error) {
        // Silent on transient platform errors — user state stays as-is and next
        // periodic refresh will pick up the latest values.
        console.warn('check-subscription transient failure (state unchanged):', (error as any)?.message);
        return;
      }
      if (data) {
        if (data.plan) setPlan(data.plan);
        if (data.subscription_status !== undefined) setSubscriptionStatus(data.subscription_status as SubscriptionStatus);
        if (data.credits_balance !== null && data.credits_balance !== undefined) setBalance(data.credits_balance);
        if (data.current_period_end) setCurrentPeriodEnd(new Date(data.current_period_end));
        else setCurrentPeriodEnd(null);
        if (data.billing_interval !== undefined) setBillingInterval(data.billing_interval as 'monthly' | 'annual' | null);
        // Stash latest Stripe IDs so the payment-success handler can pick the
        // strongest transaction id (invoice → session → subscription) for GTM.
        latestSubscriptionMetaRef.current = {
          subscriptionStatus: (data.subscription_status as SubscriptionStatus) ?? 'none',
          stripeSubscriptionId: data.stripe_subscription_id ?? null,
          latestInvoiceId: data.latest_invoice_id ?? null,
          latestSessionId: data.latest_session_id ?? null,
          plan: data.plan ?? 'free',
          amount: typeof data.amount === 'number' ? data.amount : null,
          currency: data.currency ?? null,
        };
      }
    } catch (err) {
      console.error('Failed to check subscription:', err);
    } finally {
      checkingRef.current = false;
    }
  }, [user]);

  const startCheckout = useCallback(async (priceId: string, mode: 'subscription' | 'payment', planName?: string) => {
    // TODO: Meta Pixel InitiateCheckout currently fires before Stripe session
    // is created. Move it after data.url returns in a follow-up PR.
    trackInitiateCheckout();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please log in to continue.');
      return;
    }
    const sessionUserId = session.user?.id || user?.id || null;

    // Resolve plan name + value from local catalog so the GTM event has full
    // commerce context BEFORE we hit the backend.
    const plan = pricingPlans.find(
      (p) => p.stripePriceIdMonthly === priceId || p.stripePriceIdAnnual === priceId
    );
    const pack = creditPacks.find((c) => c.stripePriceId === priceId);
    const resolvedPlanName =
      planName ||
      plan?.name ||
      (pack ? `${pack.credits} Credits` : mode === 'payment' ? 'Buy Credits' : 'Subscription');
    const resolvedValue =
      plan
        ? (plan.stripePriceIdAnnual === priceId ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice)
        : pack
          ? pack.price
          : 0;

    const debug = (() => {
      try {
        return typeof localStorage !== 'undefined' && localStorage.getItem('vovv_gtm_debug') === '1';
      } catch { return false; }
    })();

    // Fire begin_checkout IMMEDIATELY on user intent — before the backend call
    // and before any redirect can tear down the page.
    const beginResult = gtmBeginCheckout({
      userId: sessionUserId,
      planName: resolvedPlanName,
      checkoutMode: mode,
      value: resolvedValue,
      currency: 'USD',
      pageLocation: typeof window !== 'undefined' ? window.location.href : undefined,
    });
    if (debug) {
      // eslint-disable-next-line no-console
      console.log('[GTM DEBUG begin_checkout fired]', {
        beginResult,
        sessionUserId,
        planName: resolvedPlanName,
        mode,
        value: resolvedValue,
      });
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, mode },
      });
      if (error) throw error;

      if (debug) {
        // eslint-disable-next-line no-console
        console.log('[GTM DEBUG begin_checkout after create-checkout]', {
          sessionUserId,
          hasUrl: !!data?.url,
          checkoutId: data?.sessionId,
          planName: resolvedPlanName,
          value: data?.amount,
          currency: data?.currency,
        });
      }

      if (data?.sessionId) {
        // Debug-only signal — never bind a marketing tag to this event.
        gtmCheckoutSessionCreated({
          userId: sessionUserId,
          checkoutId: data.sessionId,
          planName: resolvedPlanName,
        });
      }

      if (data?.url) {
        // Brief 250ms hold so any sync GTM listeners can flush before the
        // Stripe redirect tears down the page. Independent of begin_checkout.
        await new Promise((r) => setTimeout(r, 250));
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    }
  }, [user]);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
      toast.error('Failed to open billing portal. Please try again.');
    }
  }, []);

  // Fetch credits on mount
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  
  // Check subscription on login and periodically
  useEffect(() => {
    if (!user) return;
    checkSubscription();
    const interval = setInterval(checkSubscription, 300000); // every 5 minutes
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  // Handle payment return query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const returnedSessionId = params.get('session_id'); // from Stripe success_url
    if (payment === 'success') {
      toast.success('Payment successful! Your credits are being updated…');

      // Fire Facebook Pixel Purchase event with the checkout amount
      const amount = params.get('amount');
      if (amount) {
        const value = parseFloat(amount);
        if (!isNaN(value) && value > 0) {
          trackPurchase(value, 'USD');
          gtagPurchase(value, 'USD');
        }
      }

      // Delay to give Stripe time to process, then fire GTM purchase event
      // ONLY when checkSubscription confirms an active subscription AND we
      // have a transaction id we have not fired before. Helper dedupes by
      // transaction_id so this is idempotent across refreshes.
      setTimeout(async () => {
        await checkSubscription();
        if (!user) return;
        const meta = latestSubscriptionMetaRef.current;
        if (!meta) return;
        if (meta.subscriptionStatus !== 'active') return;
        const txId = pickTransactionId({
          invoiceId: meta.latestInvoiceId,
          sessionId: returnedSessionId || meta.latestSessionId,
          subscriptionId: meta.stripeSubscriptionId,
        });
        if (!txId) return;
        const value = amount ? parseFloat(amount) : (meta.amount ?? 0);
        gtmSubscriptionPurchase({
          userId: user.id,
          transactionId: txId,
          planName: meta.plan,
          value: isNaN(value) ? 0 : value,
          currency: meta.currency || 'usd',
        });
      }, 2000);

      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('amount');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
    } else if (payment === 'cancelled') {
      toast.info('Payment cancelled.');
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
    }
  }, [checkSubscription, user]);
  
  const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const lowThreshold = planConfig.monthlyCredits === Infinity ? 0 : Math.min(Math.round(planConfig.monthlyCredits * 0.2), 200);
  const criticalThreshold = planConfig.monthlyCredits === Infinity ? 0 : Math.min(Math.round(planConfig.monthlyCredits * 0.05), 50);
  const isLow = balance > 0 && balance < lowThreshold;
  const isCritical = balance > 0 && balance < criticalThreshold;
  const isEmpty = balance === 0;
  
  const deductCredits = useCallback((amount: number) => {
    setBalance(prev => Math.max(0, prev - amount));
  }, []);
  
  const addCredits = useCallback((amount: number) => {
    setBalance(prev => prev + amount);
  }, []);

  const setBalanceFromServer = useCallback((newBalance: number) => {
    setBalance(newBalance);
  }, []);
  
  const openBuyModal = useCallback((source?: string) => {
    setBuyModalSource(source ?? null);
    setBuyModalOpen(true);
  }, []);
  const closeBuyModal = useCallback(() => {
    setBuyModalOpen(false);
    setBuyModalSource(null);
  }, []);
  
  const calculateCost = useCallback((settings: { count: number; quality: ImageQuality; mode: GenerationMode; hasModel?: boolean; hasScene?: boolean; modelName?: string; duration?: string }) => {
    const { count, quality, mode, hasModel, hasScene, modelName, duration } = settings;
    if (mode === 'video') {
      const isV16 = modelName === 'kling-v1-6';
      const baseCost = isV16 ? 70 : 90;
      const multiplier = duration === '10' ? 2 : 1;
      return count * baseCost * multiplier;
    }
    if (mode === 'virtual-try-on') return count * 6;
    if (hasModel || hasScene || quality === 'high') return count * 6;
    return count * 4;
  }, []);
  
  return (
    <CreditContext.Provider
      value={{
        balance,
        isLow,
        isCritical,
        isEmpty,
        isLoading,
        plan,
        planConfig,
        subscriptionStatus,
        currentPeriodEnd,
        billingInterval,
        deductCredits,
        addCredits,
        refreshBalance: fetchCredits,
        setBalanceFromServer,
        checkSubscription,
        openCustomerPortal,
        startCheckout,
        buyModalOpen,
        buyModalSource,
        openBuyModal,
        closeBuyModal,
        calculateCost,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditContext);
}
