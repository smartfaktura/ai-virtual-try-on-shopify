import { useState, useEffect } from 'react';
import { X, MessageSquarePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { Check } from 'lucide-react';

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

  const dismissKey = `${DISMISS_PREFIX}${workflow}${resultId ? `_${resultId}` : ''}`;

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
    // Freestyle: only show on the 3rd generation, then never again
    if (workflow === 'freestyle') {
      const countKey = `vovv_fb_gen_count_freestyle`;
      const count = parseInt(sessionStorage.getItem(countKey) || '0', 10) + 1;
      sessionStorage.setItem(countKey, String(count));
      if (count !== 3) {
        setStep('dismissed');
        return;
      }
    }
    const t = setTimeout(() => setStep('step1'), 2000);
    return () => clearTimeout(t);
  }, [dismissKey, workflow]);

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

  const bannerClass = 'bg-primary/5 border border-primary/20 rounded-xl px-4 py-3';

  // Success state
  if (step === 'success') {
    return (
      <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
        <div className={cn(bannerClass, 'flex items-center gap-3')}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Thanks! We read every submission.</p>
            <p className="text-xs text-muted-foreground">Your feedback helps us make VOVV.AI better.</p>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Banner bar
  if (step === 'step1') {
    return (
      <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
        <div className={cn(bannerClass, 'flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-3 md:px-4 md:py-3')}>
          {/* Row 1: icon + badge + dismiss */}
          <div className="flex items-center justify-between md:justify-start md:gap-2.5 md:min-w-0 md:flex-1">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 shrink-0 text-primary" />
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold uppercase tracking-wider shrink-0">Survey</Badge>
              {/* Desktop: question inline */}
              <p className="hidden md:block text-sm text-muted-foreground">{questionText}</p>
            </div>
            <button
              onClick={dismiss}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0 md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2 (mobile only): question text */}
          <p className="text-sm text-muted-foreground md:hidden">{questionText}</p>

          {/* Row 3: answer buttons */}
          <div className="flex items-center gap-2">
            {(['yes', 'almost', 'no'] as const).map(key => (
              <button
                key={key}
                onClick={() => handleAnswer(key)}
                className="flex-1 md:flex-initial inline-flex items-center justify-center rounded-full border border-input bg-background px-4 min-h-[44px] md:min-h-0 md:h-8 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.97] transition-all"
              >
                {buttonLabels[key]}
              </button>
            ))}
            {/* Desktop dismiss */}
            <button
              onClick={dismiss}
              className="hidden md:block ml-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Expanded panel
  return (
    <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
      <div className={cn(bannerClass, 'space-y-3.5 px-4 py-4 md:space-y-3 md:px-4 md:py-3')}>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 shrink-0 text-primary" />
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold uppercase tracking-wider shrink-0">Survey</Badge>
            </div>
            <button onClick={dismiss} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">What could be better?</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {reasonChips.map(chip => (
            <Badge
              key={chip}
              variant={selectedReasons.has(chip) ? 'default' : 'outline'}
              className={cn(
                'text-[11px] cursor-pointer transition-colors select-none min-h-[36px] px-3 py-1.5 md:min-h-0 md:px-2.5 md:py-0.5',
                selectedReasons.has(chip)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent',
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
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm md:text-xs md:py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
        <div className="flex items-center justify-center md:justify-end gap-2">
          <button
            onClick={handleSkip}
            className="inline-flex items-center justify-center min-h-[44px] md:min-h-0 text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-1"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-6 min-h-[44px] md:min-h-0 md:h-8 md:px-5 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
          >
            Send feedback
          </button>
        </div>
      </div>
    </div>
  );
}
