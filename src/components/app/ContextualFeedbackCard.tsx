import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';

type Answer = 'yes' | 'almost' | 'no';
type Step = 'idle' | 'step1' | 'step2' | 'success' | 'dismissed';

interface ContextualFeedbackCardProps {
  workflow: string;
  questionText: string;
  buttonLabels: { yes: string; almost: string; no: string };
  reasonChips: string[];
  textPlaceholder: string;
  resultId?: string;
  imageUrl?: string;
  triggerType?: string;
  className?: string;
}

const DISMISS_PREFIX = 'vovv_fb_dismiss_';

export function ContextualFeedbackCard({
  workflow,
  questionText,
  buttonLabels,
  reasonChips,
  textPlaceholder,
  resultId,
  imageUrl,
  triggerType = 'result_ready',
  className,
}: ContextualFeedbackCardProps) {
  const { user } = useAuth();
  const { plan } = useCredits();
  const isFreeUser = plan === 'free';

  const dismissKey = `${DISMISS_PREFIX}${workflow}`;

  const [step, setStep] = useState<Step>('idle');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());
  const [textNote, setTextNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Show after 2s delay if not dismissed
  useEffect(() => {
    if (sessionStorage.getItem(dismissKey)) {
      setStep('dismissed');
      return;
    }
    const t = setTimeout(() => setStep('step1'), 2000);
    return () => clearTimeout(t);
  }, [dismissKey]);

  const dismiss = () => {
    sessionStorage.setItem(dismissKey, '1');
    setStep('dismissed');
  };

  const handleAnswer = async (a: Answer) => {
    setAnswer(a);
    if (a === 'yes' || isFreeUser) {
      // Submit immediately for "yes" or free users
      await submitFeedback(a, [], '');
      setStep('success');
      setTimeout(dismiss, 3000);
    } else {
      setStep('step2');
    }
  };

  const toggleReason = (r: string) => {
    setSelectedReasons(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  };

  const submitFeedback = async (
    primaryAnswer: Answer,
    reasons: string[],
    note: string,
  ) => {
    if (!user) return;
    try {
      await supabase.from('feedback').insert({
        user_id: user.id,
        type: 'survey',
        message: note || `Survey: ${primaryAnswer}`,
        page_url: window.location.href,
        email: user.email,
        workflow,
        trigger_type: triggerType,
        primary_answer: primaryAnswer,
        reasons,
        question_key: questionText,
        result_id: resultId || null,
        image_url: imageUrl || null,
        user_plan: plan,
      } as any);
    } catch (err) {
      console.error('Feedback submit error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!answer) return;
    setSubmitting(true);
    await submitFeedback(answer, Array.from(selectedReasons), textNote);
    setSubmitting(false);
    setStep('success');
    setTimeout(dismiss, 3000);
  };

  const handleSkip = async () => {
    if (answer) {
      setSubmitting(true);
      await submitFeedback(answer, [], '');
      setSubmitting(false);
    }
    setStep('success');
    setTimeout(dismiss, 3000);
  };

  if (step === 'idle' || step === 'dismissed') return null;

  return (
    <div className={cn(
      'relative border border-border rounded-xl bg-card p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
      className,
    )}>
      {/* Dismiss X */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {step === 'success' ? (
        <p className="text-sm text-muted-foreground pr-6">
          Thanks — this helps us improve your results
        </p>
      ) : (
        <>
          {/* Header */}
          <div className="pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Help us improve</span>
            </div>
            <p className="text-sm font-medium">{questionText}</p>
          </div>

          {step === 'step1' && (
            <div className="flex flex-wrap gap-2">
              {(['yes', 'almost', 'no'] as const).map(key => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'rounded-full text-xs h-8',
                    key === 'yes' && 'hover:border-emerald-500/50 hover:text-emerald-600',
                    key === 'almost' && 'hover:border-amber-500/50 hover:text-amber-600',
                    key === 'no' && 'hover:border-destructive/50 hover:text-destructive',
                  )}
                  onClick={() => handleAnswer(key)}
                >
                  {buttonLabels[key]}
                </Button>
              ))}
            </div>
          )}

          {step === 'step2' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {reasonChips.map(chip => (
                  <Badge
                    key={chip}
                    variant={selectedReasons.has(chip) ? 'default' : 'outline'}
                    className={cn(
                      'text-[11px] cursor-pointer transition-colors select-none',
                      selectedReasons.has(chip)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted',
                    )}
                    onClick={() => toggleReason(chip)}
                  >
                    {chip}
                  </Badge>
                ))}
              </div>
              <textarea
                value={textNote}
                onChange={e => setTextNote(e.target.value.slice(0, 160))}
                placeholder={textPlaceholder}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={handleSkip}>
                  Skip
                </Button>
                <Button size="sm" className="text-xs h-8 rounded-full" onClick={handleSubmit} disabled={submitting}>
                  Send feedback
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
