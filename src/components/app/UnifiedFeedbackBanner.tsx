import { useState } from 'react';
import { Loader2, Check, MessageSquarePlus, Bug, Lightbulb, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { useLocation } from 'react-router-dom';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';

const AVATARS = TEAM_MEMBERS.slice(0, 4);

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'feature', label: 'Feature', icon: Lightbulb },
  { value: 'general', label: 'General', icon: MessageCircle },
] as const;

export type UnifiedBannerCategory = 'workflow' | 'scene' | 'model' | 'general';
export type UnifiedBannerMode = 'request' | 'feedback';
export type UnifiedBannerDensity = 'default' | 'compact';

export interface UnifiedFeedbackBannerProps {
  category: UnifiedBannerCategory | string;
  mode?: UnifiedBannerMode;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  ctaLabel?: string;
  submitLabel?: string;
  successTitle?: string;
  successSubtitle?: string;
  showImageLinkField?: boolean;
  showAvatars?: boolean;
  density?: UnifiedBannerDensity;
  className?: string;
}

export function UnifiedFeedbackBanner({
  category,
  mode = 'request',
  title,
  subtitle,
  placeholder,
  ctaLabel,
  submitLabel,
  successTitle,
  successSubtitle,
  showImageLinkField = false,
  showAvatars = true,
  density = 'default',
  className,
}: UnifiedFeedbackBannerProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [feedbackType, setFeedbackType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  const isCompact = density === 'compact';
  const isFeedbackMode = mode === 'feedback';
  const showAvatarStack = showAvatars && !isCompact;

  const resolvedCta = ctaLabel ?? (isFeedbackMode ? 'Share feedback' : 'Share Request');
  const resolvedSubmit = submitLabel ?? (isFeedbackMode ? 'Send Feedback' : 'Send Request');
  const resolvedTitle = title ?? (isFeedbackMode ? 'Help us improve VOVV.AI' : `Missing a ${category}?`);
  const resolvedSubtitle = subtitle ?? (isFeedbackMode
    ? 'Bugs, feature ideas, anything — we read every one.'
    : "Tell us what you need — we'll create it in 1–2 business days.");
  const resolvedPlaceholder = placeholder ?? (isFeedbackMode
    ? 'Tell us more…'
    : `Describe the ${category} you'd like us to create…`);
  const resolvedSuccessTitle = successTitle ?? (isFeedbackMode
    ? 'Thanks! We read every submission.'
    : "Thanks! We'll review your request shortly.");
  const resolvedSuccessSubtitle = successSubtitle ?? (isFeedbackMode
    ? 'Your feedback helps us make VOVV.AI better.'
    : 'Our team reads every submission.');

  const canSubmit = !!message.trim() && (!isFeedbackMode || !!feedbackType);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const trimmed = message.trim();
    const trimmedUrl = referenceUrl.trim();
    let finalMessage = isFeedbackMode ? trimmed : `[${category}-request] ${trimmed}`;
    if (trimmedUrl) finalMessage += `\n\nReference: ${trimmedUrl}`;
    const insertType = isFeedbackMode ? (feedbackType || 'general') : 'feature';
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      type: insertType,
      message: finalMessage,
      page_url: location.pathname,
      email: user.email,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Failed to send');
      return;
    }
    setSubmitted(true);
    setMessage('');
    setReferenceUrl('');
    setFeedbackType(null);
  };

  const handleCancel = () => {
    setExpanded(false);
    setMessage('');
    setReferenceUrl('');
    setFeedbackType(null);
  };

  const containerClass = cn(
    'rounded-2xl border border-primary/20 bg-primary/[0.04]',
    isCompact ? 'rounded-xl p-3' : 'p-5 sm:p-6',
    className,
  );

  if (submitted) {
    return (
      <div className={containerClass}>
        <div className="flex items-center gap-3 py-1">
          <div className={cn(
            'rounded-full bg-primary/10 flex items-center justify-center shrink-0',
            isCompact ? 'w-7 h-7' : 'w-9 h-9',
          )}>
            <Check className={cn('text-primary', isCompact ? 'w-3.5 h-3.5' : 'w-5 h-5')} />
          </div>
          <div className="min-w-0">
            <p className={cn('font-semibold text-foreground', isCompact ? 'text-xs' : 'text-sm')}>
              {resolvedSuccessTitle}
            </p>
            {!isCompact && (
              <p className="text-xs text-muted-foreground">{resolvedSuccessSubtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {!expanded ? (
        <div className={cn(
          'flex gap-3 sm:gap-4',
          isCompact ? 'items-center' : 'flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        )}>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {showAvatarStack && (
              <>
                <div className="hidden sm:flex -space-x-2.5 shrink-0">
                  {AVATARS.map((member) => (
                    <Avatar key={member.name} className="w-9 h-9 border-2 border-background ring-1 ring-primary/10">
                      <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex sm:hidden -space-x-2 shrink-0">
                  {AVATARS.slice(0, 3).map((member) => (
                    <Avatar key={member.name} className="w-7 h-7 border-2 border-background ring-1 ring-primary/10">
                      <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </>
            )}
            {isCompact && (
              <MessageSquarePlus className="w-4 h-4 text-primary shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className={cn(
                'font-semibold text-foreground leading-snug',
                isCompact ? 'text-xs' : 'text-sm',
              )}>
                {resolvedTitle}
              </p>
              {!isCompact && resolvedSubtitle && (
                <p className="text-xs text-muted-foreground mt-1">{resolvedSubtitle}</p>
              )}
            </div>
          </div>
          <Button
            size={isCompact ? 'sm' : undefined}
            className={cn(
              'rounded-full font-semibold gap-1.5 shrink-0',
              isCompact ? 'h-8 px-3 text-xs' : 'text-sm px-5 h-10 w-full sm:w-auto',
            )}
            onClick={() => setExpanded(true)}
          >
            <MessageSquarePlus className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            <span>{resolvedCta}</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {showAvatarStack && (
              <div className="flex -space-x-2 shrink-0">
                {AVATARS.slice(0, 3).map((member) => (
                  <Avatar key={member.name} className="w-7 h-7 border-2 border-background">
                    <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                      {member.name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
            <p className={cn('font-semibold text-foreground', isCompact ? 'text-xs' : 'text-sm')}>
              {resolvedTitle}
            </p>
          </div>

          {isFeedbackMode && (
            <div className="flex gap-2 flex-wrap">
              {FEEDBACK_TYPES.map(t => {
                const Icon = t.icon;
                const active = feedbackType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFeedbackType(active ? null : t.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary/40',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}

          <Textarea
            placeholder={resolvedPlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={cn('bg-background', isCompact ? 'min-h-[64px] text-xs' : 'min-h-[80px] text-sm')}
            maxLength={1000}
            autoFocus
          />

          {showImageLinkField && (
            <Input
              type="url"
              placeholder="Optional: link to a reference image"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className={cn('bg-background', isCompact ? 'h-9 text-xs' : 'h-10 text-sm')}
              maxLength={500}
            />
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="rounded-full font-semibold px-5"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : resolvedSubmit}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
