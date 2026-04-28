import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import founderTomas from '@/assets/founder-tomas.jpg';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (email: string) => void;
}

type FormState = 'idle' | 'sending' | 'sent' | 'error';

export function ContactFormDialog({ open, onOpenChange, onSuccess }: ContactFormDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    const trimName = name.trim();
    const trimEmail = email.trim();
    const trimMessage = message.trim();

    if (!trimName || !trimEmail || !trimMessage) return;
    if (trimName.length > 100 || trimEmail.length > 255 || trimMessage.length > 2000) return;
    if (!trimEmail.includes('@')) return;

    setState('sending');
    setErrorMsg('');

    try {
      const { data, error } = await supabase.functions.invoke('send-contact', {
        body: { name: trimName, email: trimEmail, message: trimMessage },
      });

      if (error || data?.error) {
        throw new Error(data?.error || 'Failed to send');
      }

      setState('sent');
      setTimeout(() => {
        onSuccess?.(trimEmail);
        onOpenChange(false);
        setTimeout(() => {
          setState('idle');
          setMessage('');
        }, 300);
      }, 2500);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && state !== 'sending') {
      onOpenChange(false);
      if (state === 'sent') {
        setTimeout(() => {
          setState('idle');
          setMessage('');
        }, 300);
      }
    }
  };

  const inputClass =
    "w-full h-11 bg-muted/40 border border-border/60 rounded-2xl px-4 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:bg-background focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10 transition-colors disabled:opacity-50";

  const labelClass = "text-[11px] tracking-[0.12em] uppercase text-muted-foreground/80 font-medium";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden w-[calc(100%-2rem)] sm:w-full rounded-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {state === 'sent' ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">Message sent</h3>
              <p className="text-sm text-muted-foreground">
                We'll get back to you within 24 hours at <strong className="text-foreground">{email}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 pt-6 pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-11 h-11 ring-2 ring-background shadow-sm">
                  <AvatarImage src={founderTomas} alt="Tomas, founder of VOVV.AI" />
                  <AvatarFallback className="text-xs">TS</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <DialogHeader className="space-y-0.5 text-left">
                    <DialogTitle className="text-base font-semibold">Message our team</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Tomas and the team — usually a few hours on weekdays
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3.5">
              <div className="space-y-1.5">
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  disabled={state === 'sending'}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  disabled={state === 'sending'}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Message</label>
                <textarea
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  disabled={state === 'sending'}
                  className="w-full min-h-[112px] bg-muted/40 border border-border/60 rounded-2xl px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:bg-background focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10 transition-colors resize-none disabled:opacity-50"
                />
              </div>

              {state === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-destructive">{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={state === 'sending' || !name.trim() || !email.trim() || !message.trim()}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                {state === 'sending' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
