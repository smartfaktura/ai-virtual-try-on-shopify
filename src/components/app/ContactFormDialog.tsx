import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const avatarSophia = getOptimizedUrl(getLandingAssetUrl('team/avatar-sophia.jpg'), { quality: 60 });
const avatarKenji = getOptimizedUrl(getLandingAssetUrl('team/avatar-kenji.jpg'), { quality: 60 });
const avatarZara = getOptimizedUrl(getLandingAssetUrl('team/avatar-zara.jpg'), { quality: 60 });

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden w-[calc(100%-2rem)] sm:w-full">
        {state === 'sent' ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">Message sent!</h3>
              <p className="text-sm text-muted-foreground">
                We'll get back to you within 24 hours at <strong className="text-foreground">{email}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 pt-6 pb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <Avatar className="w-9 h-9 ring-2 ring-background">
                    <AvatarImage src={avatarSophia} alt="Sophia" />
                    <AvatarFallback className="text-xs">SC</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-9 h-9 ring-2 ring-background">
                    <AvatarImage src={avatarKenji} alt="Kenji" />
                    <AvatarFallback className="text-xs">KN</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-9 h-9 ring-2 ring-background">
                    <AvatarImage src={avatarZara} alt="Zara" />
                    <AvatarFallback className="text-xs">ZW</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <DialogHeader className="space-y-0 text-left">
                    <DialogTitle className="text-base">Message Our Team</DialogTitle>
                    <DialogDescription className="text-xs">We typically respond within 24 hours</DialogDescription>
                  </DialogHeader>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} disabled={state === 'sending'} className="w-full h-10 bg-muted/50 border border-border rounded-lg px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors disabled:opacity-50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} disabled={state === 'sending'} className="w-full h-10 bg-muted/50 border border-border rounded-lg px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors disabled:opacity-50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Message</label>
                <textarea placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={4} disabled={state === 'sending'} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none disabled:opacity-50" />
              </div>

              {state === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-destructive">{errorMsg}</span>
                </div>
              )}

              <button onClick={handleSubmit} disabled={state === 'sending' || !name.trim() || !email.trim() || !message.trim()} className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors">
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
