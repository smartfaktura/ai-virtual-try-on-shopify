import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react';

type State = 'loading' | 'ready' | 'success' | 'invalid' | 'already' | 'error';

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const token = params.get('token') || '';
  const [state, setState] = useState<State>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    void validate();
  }, []);

  async function validate() {
    if (!email || !token) { setState('invalid'); return; }
    const { data, error } = await supabase
      .from('email_unsubscribe_tokens')
      .select('email, used_at')
      .eq('token', token)
      .maybeSingle();
    if (error || !data) { setState('invalid'); return; }
    if (data.email.toLowerCase() !== email.toLowerCase()) { setState('invalid'); return; }
    if (data.used_at) { setState('already'); return; }
    setState('ready');
  }

  async function confirm() {
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('handle-marketing-unsubscribe', {
        body: { email, token },
      });
      if (error) throw error;
      setState('success');
    } catch (e: any) {
      setErrMsg(e.message || 'Something went wrong');
      setState('error');
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          {state === 'success' ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> :
           state === 'invalid' || state === 'error' ? <AlertCircle className="w-10 h-10 text-red-500" /> :
           <Mail className="w-10 h-10 text-muted-foreground" />}
        </div>

        {state === 'loading' && <p className="text-sm text-muted-foreground">Verifying…</p>}

        {state === 'ready' && (
          <>
            <h1 className="text-xl font-semibold mb-2">Unsubscribe from emails</h1>
            <p className="text-sm text-muted-foreground mb-6">
              You're about to stop marketing emails to <span className="font-medium text-foreground">{email}</span>.
              Account and transactional emails will still be sent.
            </p>
            <Button onClick={confirm} disabled={submitting} className="w-full">
              {submitting ? 'Unsubscribing…' : 'Confirm unsubscribe'}
            </Button>
          </>
        )}

        {state === 'success' && (
          <>
            <h1 className="text-xl font-semibold mb-2">You're unsubscribed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {email} won't receive any more marketing emails from VOVV.AI
            </p>
            <Link to="/"><Button variant="outline">Back to home</Button></Link>
          </>
        )}

        {state === 'already' && (
          <>
            <h1 className="text-xl font-semibold mb-2">Already unsubscribed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This email is already opted out of marketing messages
            </p>
            <Link to="/"><Button variant="outline">Back to home</Button></Link>
          </>
        )}

        {state === 'invalid' && (
          <>
            <h1 className="text-xl font-semibold mb-2">Invalid link</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This unsubscribe link is invalid or has expired
            </p>
            <Link to="/"><Button variant="outline">Back to home</Button></Link>
          </>
        )}

        {state === 'error' && (
          <>
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">{errMsg}</p>
            <Button onClick={() => { setState('ready'); setErrMsg(''); }}>Try again</Button>
          </>
        )}
      </Card>
    </div>
  );
}
