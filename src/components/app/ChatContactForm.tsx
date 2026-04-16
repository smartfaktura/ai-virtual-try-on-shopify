import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ChatContactFormProps {
  onSent?: (email: string) => void;
}

type FormState = 'idle' | 'sending' | 'sent' | 'error';

export function ChatContactForm({ onSent }: ChatContactFormProps) {
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

  const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-2.5 p-3 rounded-xl bg-muted/50 border border-border">
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
        disabled={state === 'sending' || !name.trim() || !email.trim() || !message.trim()}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
      >
        <Send className="w-3 h-3" />
        {state === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  );
}
