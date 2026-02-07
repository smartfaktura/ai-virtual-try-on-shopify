import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ImageQuality, GenerationMode } from '@/types';

const LOW_CREDIT_THRESHOLD = 50;
const CRITICAL_THRESHOLD = 10;

interface CreditContextValue {
  balance: number;
  isLow: boolean;
  isCritical: boolean;
  isEmpty: boolean;
  isLoading: boolean;
  
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  
  buyModalOpen: boolean;
  openBuyModal: () => void;
  closeBuyModal: () => void;
  
  calculateCost: (settings: { count: number; quality: ImageQuality; mode: GenerationMode }) => number;
}

const defaultValue: CreditContextValue = {
  balance: 0,
  isLow: false,
  isCritical: false,
  isEmpty: true,
  isLoading: true,
  deductCredits: () => {},
  addCredits: () => {},
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
  const [isLoading, setIsLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  
  // Fetch real credits from profiles table
  useEffect(() => {
    if (!user) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    const fetchCredits = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setBalance(data.credits_balance);
      }
      setIsLoading(false);
    };

    fetchCredits();
  }, [user]);
  
  const isLow = balance > 0 && balance < LOW_CREDIT_THRESHOLD;
  const isCritical = balance > 0 && balance < CRITICAL_THRESHOLD;
  const isEmpty = balance === 0;
  
  const deductCredits = useCallback(async (amount: number) => {
    const newBalance = Math.max(0, balance - amount);
    setBalance(newBalance);

    if (user) {
      await supabase
        .from('profiles')
        .update({ credits_balance: newBalance })
        .eq('user_id', user.id);
    }
  }, [balance, user]);
  
  const addCredits = useCallback(async (amount: number) => {
    const newBalance = balance + amount;
    setBalance(newBalance);

    if (user) {
      await supabase
        .from('profiles')
        .update({ credits_balance: newBalance })
        .eq('user_id', user.id);
    }
  }, [balance, user]);
  
  const openBuyModal = useCallback(() => setBuyModalOpen(true), []);
  const closeBuyModal = useCallback(() => setBuyModalOpen(false), []);
  
  const calculateCost = useCallback((settings: { count: number; quality: ImageQuality; mode: GenerationMode }) => {
    const { count, quality, mode } = settings;
    if (mode === 'virtual-try-on') {
      return count * 3;
    }
    return count * (quality === 'high' ? 2 : 1);
  }, []);
  
  return (
    <CreditContext.Provider
      value={{
        balance,
        isLow,
        isCritical,
        isEmpty,
        isLoading,
        deductCredits,
        addCredits,
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
