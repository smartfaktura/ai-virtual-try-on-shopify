import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { mockShop } from '@/data/mockData';
import type { ImageQuality, GenerationMode } from '@/types';

const LOW_CREDIT_THRESHOLD = 50;
const CRITICAL_THRESHOLD = 10;

interface CreditContextValue {
  balance: number;
  isLow: boolean;
  isCritical: boolean;
  isEmpty: boolean;
  
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  
  buyModalOpen: boolean;
  openBuyModal: () => void;
  closeBuyModal: () => void;
  
  calculateCost: (settings: { count: number; quality: ImageQuality; mode: GenerationMode }) => number;
}

const CreditContext = createContext<CreditContextValue | undefined>(undefined);

interface CreditProviderProps {
  children: ReactNode;
}

export function CreditProvider({ children }: CreditProviderProps) {
  const [balance, setBalance] = useState(mockShop.creditsBalance);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  
  const isLow = balance > 0 && balance < LOW_CREDIT_THRESHOLD;
  const isCritical = balance > 0 && balance < CRITICAL_THRESHOLD;
  const isEmpty = balance === 0;
  
  const deductCredits = useCallback((amount: number) => {
    setBalance(prev => Math.max(0, prev - amount));
  }, []);
  
  const addCredits = useCallback((amount: number) => {
    setBalance(prev => prev + amount);
  }, []);
  
  const openBuyModal = useCallback(() => setBuyModalOpen(true), []);
  const closeBuyModal = useCallback(() => setBuyModalOpen(false), []);
  
  const calculateCost = useCallback((settings: { count: number; quality: ImageQuality; mode: GenerationMode }) => {
    const { count, quality, mode } = settings;
    if (mode === 'virtual-try-on') {
      return count * 3; // Virtual try-on always costs 3 credits per image
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
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}
