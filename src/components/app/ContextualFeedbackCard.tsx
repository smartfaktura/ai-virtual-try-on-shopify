import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
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

  const handleAnswer = async (a: Answer) => {
    setAnswer(a);
    if (a === 'yes' || isFreeUser) {
      await submitFeedback(a, [], '');
      setStep('success');
      setTimeout(dismiss, 2500);
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

  const handleSubmit = async () => {
    if (!answer) return;
    setSubmitting(true);
    await submitFeedback(answer, Array.from(selectedReasons), textNote);
    setSubmitting(false);
    setStep('success');
    setTimeout(dismiss, 2500);
  };

  const handleSkip = async () => {
    if (answer) {
      setSubmitting(true);
      await submitFeedback(answer, [], '');
      setSubmitting(false);
    }
    setStep('success');
    setTimeout(dismiss, 2500);
  };

  if (step === 'idle' || step === 'dismissed') return null;

  // Success pill
  if (step === 'success') {
    return (
      <div className={cn('flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 text-muted-foreground shadow-sm text-xs font-medium">
          <MessageSquare className="w-3.5 h-3.5" />
          Thanks — this helps us improve
        </div>
      </div>
    );
  }

  // Step 1: Compact pill
  if (step === 'step1') {
    return (
      <div className={cn('flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 shadow-sm">
          <MessageSquare className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
          <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">{questionText}</span>
          <div className="flex items-center gap-1">
            {(['yes', 'almost', 'no'] as const).map(key => (
              <button
                key={key}
                onClick={() => handleAnswer(key)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-border text-foreground/60 hover:bg-background hover:text-foreground transition-colors"
              >
                {buttonLabels[key]}
              </button>
            ))}
          </div>
          <button
            onClick={dismiss}
            className="ml-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-opacity shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Expanded panel
  return (
    <div className={cn('flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
      <div className="w-full max-w-md rounded-xl bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">What could be better?</span>
          </div>
          <button onClick={dismiss} className="opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
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
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleSkip}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="text-[11px] font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Send feedback
          </button>
        </div>
      </div>
    </div>
  );
}
