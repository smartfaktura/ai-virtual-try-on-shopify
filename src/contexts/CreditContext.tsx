import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { ImageQuality, GenerationMode } from '@/types';

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
  
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  refreshBalance: () => Promise<void>;
  setBalanceFromServer: (newBalance: number) => void;
  checkSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  startCheckout: (priceId: string, mode: 'subscription' | 'payment') => Promise<void>;
  
  buyModalOpen: boolean;
  openBuyModal: () => void;
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
  deductCredits: () => {},
  addCredits: () => {},
  refreshBalance: async () => {},
  setBalanceFromServer: () => {},
  checkSubscription: async () => {},
  openCustomerPortal: async () => {},
  startCheckout: async () => {},
  buyModalOpen: false,
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
  const [isLoading, setIsLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setPlan('free');
      setSubscriptionStatus('none');
      setCurrentPeriodEnd(null);
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('credits_balance, plan, subscription_status, current_period_end')
      .eq('user_id', user.id)
      .single();
    
    if (!error && data) {
      setBalance(data.credits_balance);
      setPlan(data.plan || 'free');
      setSubscriptionStatus((data.subscription_status as SubscriptionStatus) || 'none');
      setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
    }
    setIsLoading(false);
  }, [user]);
  
  const checkSubscription = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('check-subscription error:', error);
        return;
      }
      if (data) {
        if (data.plan) setPlan(data.plan);
        if (data.subscription_status !== undefined) setSubscriptionStatus(data.subscription_status as SubscriptionStatus);
        if (data.credits_balance !== null && data.credits_balance !== undefined) setBalance(data.credits_balance);
        if (data.current_period_end) setCurrentPeriodEnd(new Date(data.current_period_end));
        else setCurrentPeriodEnd(null);
      }
    } catch (err) {
      console.error('Failed to check subscription:', err);
    }
  }, [user]);

  const startCheckout = useCallback(async (priceId: string, mode: 'subscription' | 'payment') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, mode },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
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
    const interval = setInterval(checkSubscription, 60000); // every minute
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  // Handle payment return query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      toast.success('Payment successful! Your credits are being updated…');
      // Delay to give Stripe time to process
      setTimeout(() => checkSubscription(), 2000);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
    } else if (payment === 'cancelled') {
      toast.info('Payment cancelled.');
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
    }
  }, [checkSubscription]);
  
  const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const lowThreshold = planConfig.monthlyCredits === Infinity ? 0 : Math.round(planConfig.monthlyCredits * 0.2);
  const criticalThreshold = planConfig.monthlyCredits === Infinity ? 0 : Math.round(planConfig.monthlyCredits * 0.05);
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
  
  const openBuyModal = useCallback(() => setBuyModalOpen(true), []);
  const closeBuyModal = useCallback(() => setBuyModalOpen(false), []);
  
  const calculateCost = useCallback((settings: { count: number; quality: ImageQuality; mode: GenerationMode; hasModel?: boolean; hasScene?: boolean; modelName?: string; duration?: string }) => {
    const { count, quality, mode, hasModel, hasScene, modelName, duration } = settings;
    if (mode === 'video') {
      const isV16 = modelName === 'kling-v1-6';
      const baseCost = isV16 ? 70 : 90;
      const multiplier = duration === '10' ? 2 : 1;
      return count * baseCost * multiplier;
    }
    if (mode === 'virtual-try-on') {
      return count * 8;
    }
    if (hasModel && hasScene) {
      return count * 15;
    }
    if (hasModel) {
      return count * 12;
    }
    return count * (quality === 'high' ? 10 : 4);
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
        deductCredits,
        addCredits,
        refreshBalance: fetchCredits,
        setBalanceFromServer,
        checkSubscription,
        openCustomerPortal,
        startCheckout,
        buyModalOpen,
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
