import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ImageQuality, GenerationMode } from '@/types';


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
  
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  refreshBalance: () => Promise<void>;
  setBalanceFromServer: (newBalance: number) => void;
  
  buyModalOpen: boolean;
  buyModalDefaultTab: 'upgrade' | 'topup';
  openBuyModal: (tab?: 'upgrade' | 'topup') => void;
  closeBuyModal: () => void;
  
  calculateCost: (settings: { count: number; quality: ImageQuality; mode: GenerationMode }) => number;
}

const defaultValue: CreditContextValue = {
  balance: 0,
  isLow: false,
  isCritical: false,
  isEmpty: true,
  isLoading: true,
  plan: 'free',
  planConfig: PLAN_CONFIG.free,
  deductCredits: () => {},
  addCredits: () => {},
  refreshBalance: async () => {},
  setBalanceFromServer: () => {},
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
  
  const calculateCost = useCallback((settings: { count: number; quality: ImageQuality; mode: GenerationMode }) => {
    const { count, quality, mode } = settings;
    if (mode === 'video') {
      return count * 30;
    }
    if (mode === 'virtual-try-on') {
      return count * 8;
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
        deductCredits,
        addCredits,
        refreshBalance: fetchCredits,
        setBalanceFromServer,
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
