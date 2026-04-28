import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ChatContactFormProps {
  onSent?: (email: string) => void;
  variant?: 'compact' | 'spacious';
}

type FormState = 'idle' | 'sending' | 'sent' | 'error';

export function ChatContactForm({ onSent, variant = 'compact' }: ChatContactFormProps) {
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
        onSent?.(trimEmail);
      }, 10000);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const isValid = name.trim() && email.trim() && message.trim();

  if (variant === 'spacious') {
    if (state === 'sent') {
      return (
        <div className="flex items-start gap-3 py-6 animate-in fade-in duration-500">
          <span className="relative flex h-2.5 w-2.5 mt-2 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div>
            <p className="text-[15px] font-medium text-foreground">Message sent</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll reply to <span className="text-foreground">{email}</span> within a few hours.
            </p>
          </div>
        </div>
      );
    }

    const fieldClass = "w-full h-11 rounded-xl bg-background border border-border px-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-ring/20 transition-colors disabled:opacity-50";
    const labelClass = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2";

    return (
      <div className="space-y-5">
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className={fieldClass}
            disabled={state === 'sending'}
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            className={fieldClass}
            disabled={state === 'sending'}
          />
        </div>

        <div>
          <label className={labelClass}>Message</label>
          <textarea
            placeholder="Tell us what's on your mind…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            rows={5}
            className="w-full rounded-xl bg-background border border-border px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-ring/20 transition-colors resize-none disabled:opacity-50"
            disabled={state === 'sending'}
          />
        </div>

        {state === 'error' && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSubmit}
            disabled={state === 'sending' || !isValid}
            className={cn(
              "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-all",
              isValid && state !== 'sending'
                ? "bg-foreground text-background hover:opacity-90 active:scale-[0.99] shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {state === 'sending' ? (
              'Sending…'
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send message
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ----- compact (existing chat widget) -----
  if (state === 'sent') {
    return (
      <div className="flex items-center gap-2 py-2 rounded-lg bg-emerald-500/10 animate-in fade-in duration-300">
        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <p className="text-xs text-foreground">
          Message sent! We'll get back to you within 24 hours at <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  const inputClass = "w-full bg-muted/40 border border-border rounded-lg px-3 py-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-foreground">Send a message to our team</p>

      <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className={inputClass} disabled={state === 'sending'} />
      <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className={inputClass} disabled={state === 'sending'} />
      <textarea placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={3} className={cn(inputClass, "resize-none")} disabled={state === 'sending'} />

      {state === 'error' && (
        <div className="flex items-center gap-1.5 text-destructive">
          <AlertCircle className="w-3 h-3" />
          <span className="text-[11px]">{errorMsg}</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={state === 'sending' || !isValid}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
      >
        <Send className="w-3 h-3" />
        {state === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  );
}
