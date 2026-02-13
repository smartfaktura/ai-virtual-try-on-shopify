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
  starter: { name: 'Starter', monthlyCredits: 1000, nextPlanId: 'growth' },
  growth: { name: 'Growth', monthlyCredits: 2500, nextPlanId: 'pro' },
  pro: { name: 'Pro', monthlyCredits: 6000, nextPlanId: 'enterprise' },
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
  cancelSubscription: () => void;
  reactivateSubscription: () => void;
  
  buyModalOpen: boolean;
  openBuyModal: () => void;
  closeBuyModal: () => void;
  
  calculateCost: (settings: { count: number; quality: ImageQuality; mode: GenerationMode; hasModel?: boolean; hasScene?: boolean }) => number;
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
  cancelSubscription: () => {},
  reactivateSubscription: () => {},
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
  const [isLoading, setIsLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setPlan('free');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('credits_balance, plan')
      .eq('user_id', user.id)
      .single();
    
    if (!error && data) {
      setBalance(data.credits_balance);
      setPlan(data.plan || 'free');
    }
    setIsLoading(false);
  }, [user]);
  
  // Fetch real credits and plan from profiles table
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  
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

  // Placeholder subscription state (will be fetched from DB in Phase 2)
  const subscriptionStatus: SubscriptionStatus = 'none';
  const currentPeriodEnd: Date | null = null;

  const cancelSubscription = useCallback(() => {
    // Placeholder — will call edge function in Phase 2
    toast('Subscription cancelled (placeholder)');
  }, []);

  const reactivateSubscription = useCallback(() => {
    // Placeholder — will call edge function in Phase 2
    toast('Subscription reactivated (placeholder)');
  }, []);
  
  const calculateCost = useCallback((settings: { count: number; quality: ImageQuality; mode: GenerationMode; hasModel?: boolean; hasScene?: boolean }) => {
    const { count, quality, mode, hasModel, hasScene } = settings;
    if (mode === 'video') {
      return count * 30;
    }
    if (mode === 'virtual-try-on') {
      return count * 8;
    }
    // Model-reference pricing: Pro model is used automatically
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
        cancelSubscription,
        reactivateSubscription,
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
