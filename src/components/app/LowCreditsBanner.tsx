import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';

export function LowCreditsBanner() {
  const { balance, isLow, isCritical, isEmpty, openBuyModal } = useCredits();
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed || (!isLow && !isCritical && !isEmpty)) {
    return null;
  }
  
  const title = isEmpty 
    ? "You're out of credits" 
    : isCritical 
      ? 'Almost out of credits'
      : 'Running low on credits';
  const message = isEmpty
    ? 'Purchase credits to continue generating professional product images.'
    : isCritical
      ? `Only ${balance} credits left! You may not complete your next generation.`
      : `You have ${balance} credits remaining. Top up to continue generating.`;
  
  return (
    <Alert variant={isEmpty || isCritical ? 'destructive' : 'default'} className="mb-4">
      {isEmpty || isCritical ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      <AlertTitle className="flex items-center justify-between">
        {title}
        {!isEmpty && (
          <button onClick={() => setDismissed(true)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        )}
      </AlertTitle>
      <AlertDescription className="flex items-center gap-3 mt-1">
        <span>{message}</span>
        <Button size="sm" onClick={() => openBuyModal()}>Buy Credits</Button>
      </AlertDescription>
    </Alert>
  );
}
