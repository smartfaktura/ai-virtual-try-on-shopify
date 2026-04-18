import { useState } from 'react';
import { MessageSquarePlus, Bug, Lightbulb, MessageCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { useLocation } from 'react-router-dom';

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb },
  { value: 'general', label: 'General', icon: MessageCircle },
] as const;

export function FeedbackBanner() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!message.trim() || !selectedType) return;
    setSubmitting(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      type: selectedType,
      message: message.trim(),
      page_url: location.pathname,
      email: user.email,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send — try again?");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setSelectedType(null);
    setMessage('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
      setSubmitted(false);
    }
  };

  const isExpanded = !!selectedType;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <MessageSquarePlus className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">Help us improve VOVV.AI</p>
      </div>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="pill" className="font-semibold">
            Share feedback
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-80 p-4 space-y-3">
          {submitted ? (
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Thanks! We read every submission.</p>
                <p className="text-xs text-muted-foreground">Your feedback helps us make VOVV.AI better.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4 shrink-0 text-primary" />
                <p className="font-semibold text-sm text-foreground">Share feedback</p>
              </div>

              {/* Type chips */}
              <div className="flex gap-2 flex-wrap">
                {FEEDBACK_TYPES.map(t => {
                  const Icon = t.icon;
                  const active = selectedType === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(active ? null : t.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Animated expand for textarea */}
              <div
                className="grid transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="space-y-2 pt-0.5">
                    <Textarea
                      placeholder="Tell us more…"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="min-h-[72px] text-sm bg-background"
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{message.length}/1000</span>
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!message.trim() || submitting}
                        className="rounded-full font-semibold px-5"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Feedback'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
