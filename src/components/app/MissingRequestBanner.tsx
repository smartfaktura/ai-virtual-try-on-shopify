import { useState } from 'react';
import { MessageSquarePlus, Loader2, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { useLocation } from 'react-router-dom';

interface MissingRequestBannerProps {
  /** e.g. "model", "scene", "workflow" */
  category: string;
  /** Main text shown to the user */
  title?: string;
  /** Placeholder for textarea */
  placeholder?: string;
  /** Compact mode for use inside popovers */
  compact?: boolean;
}

export function MissingRequestBanner({
  category,
  title,
  placeholder,
  compact = false,
}: MissingRequestBannerProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  const defaultTitle =
    category === 'workflow'
      ? 'Missing a feature or Visual Type? Let us know what you need.'
      : `Missing a ${category}? Tell us, we'll create it in 1–2 business days.`;

  const defaultPlaceholder =
    category === 'workflow'
      ? 'Describe the Visual Type or feature you need…'
      : `Describe the ${category} you'd like us to create…`;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      type: 'feature',
      message: `[${category}-request] ${message.trim()}`,
      page_url: location.pathname,
      email: user.email,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Failed to send request');
      return;
    }
    setSubmitted(true);
    setMessage('');
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'px-2 py-2' : 'px-4 py-3'} rounded-lg bg-primary/5 border border-primary/20`}>
        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
        <p className="text-[11px] text-primary font-medium">Thanks! We'll review your request shortly.</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-lg transition-colors',
      compact && !expanded
        ? 'border border-primary/20 bg-primary/[0.06] hover:bg-primary/[0.12] cursor-pointer p-2.5'
        : compact
          ? 'border border-primary/20 bg-primary/[0.06] p-2.5'
          : 'border border-dashed border-border/60 bg-muted/30 p-3 sm:p-4'
    )}>
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center justify-between gap-2 w-full text-left group"
        >
          <div className="flex items-center gap-2">
            <MessageSquarePlus className={cn(
              'shrink-0 transition-colors',
              compact ? 'w-3.5 h-3.5 text-primary/60 group-hover:text-primary' : 'w-4 h-4 text-muted-foreground/60 group-hover:text-primary'
            )} />
            <p className={cn(
              'transition-colors leading-snug',
              compact ? 'text-[11px] font-medium text-primary/70 group-hover:text-primary' : 'text-xs text-muted-foreground group-hover:text-foreground'
            )}>
              {title || defaultTitle}
            </p>
          </div>
          {compact && <ChevronRight className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary/70 shrink-0 transition-colors" />}
        </button>
      ) : (
        <div className="space-y-2">
          <p className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-foreground`}>
            {title || defaultTitle}
          </p>
          <Textarea
            placeholder={placeholder || defaultPlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${compact ? 'min-h-[56px] text-[11px]' : 'min-h-[64px] text-xs'} bg-background`}
            maxLength={500}
            autoFocus
          />
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => { setExpanded(false); setMessage(''); }}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!message.trim() || submitting}
              className="rounded-full text-[11px] h-7 px-4 font-semibold"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Request'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
