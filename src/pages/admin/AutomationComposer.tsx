import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { toast } from 'sonner';

const TRIGGER_EVENTS = [
  { value: 'user.signup', label: 'User signed up' },
  { value: 'checkout.started', label: 'Checkout started' },
  { value: 'checkout.abandoned', label: 'Checkout abandoned' },
  { value: 'credits.low', label: 'Credits running low' },
  { value: 'subscription.cancelled', label: 'Subscription cancelled' },
  { value: 'subscription.renewed', label: 'Subscription renewed' },
  { value: 'inactive.user', label: 'User became inactive' },
];

export default function AutomationComposer() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('user.signup');
  const [delayValue, setDelayValue] = useState(0);
  const [delayUnit, setDelayUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [frequencyCap, setFrequencyCap] = useState(1);

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) { navigate('/app'); return; }
    if (!isNew) void load();
  }, [isAdmin, adminLoading, id]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('email_automations').select('*').eq('id', id!).maybeSingle();
    if (error || !data) { toast.error('Automation not found'); navigate('/app/admin/campaigns'); return; }
    setName(data.name);
    setDescription(data.description || '');
    setTriggerEvent(data.trigger_event);
    const dm = data.delay_minutes;
    if (dm % 1440 === 0 && dm > 0) { setDelayValue(dm / 1440); setDelayUnit('days'); }
    else if (dm % 60 === 0 && dm > 0) { setDelayValue(dm / 60); setDelayUnit('hours'); }
    else { setDelayValue(dm); setDelayUnit('minutes'); }
    setSubject(data.subject);
    setBodyHtml(data.body_html);
    setCtaLabel(data.cta_label || '');
    setCtaUrl(data.cta_url || '');
    setIsActive(data.is_active);
    setFrequencyCap(data.frequency_cap);
    setLoading(false);
  }

  function delayMinutes(): number {
    const v = Math.max(0, Number(delayValue) || 0);
    if (delayUnit === 'days') return v * 1440;
    if (delayUnit === 'hours') return v * 60;
    return v;
  }

  async function save(activate?: boolean) {
    if (!name.trim() || !subject.trim() || !bodyHtml.trim()) {
      toast.error('Name, subject, and body are required');
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      trigger_event: triggerEvent,
      delay_minutes: delayMinutes(),
      subject: subject.trim(),
      body_html: bodyHtml,
      cta_label: ctaLabel.trim() || null,
      cta_url: ctaUrl.trim() || null,
      is_active: activate !== undefined ? activate : isActive,
      frequency_cap: Math.max(1, Number(frequencyCap) || 1),
    };
    if (isNew) {
      const { data, error } = await supabase.from('email_automations').insert(payload).select('id').maybeSingle();
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Automation created');
      navigate(`/app/admin/campaigns/automations/${data!.id}`);
    } else {
      const { error } = await supabase.from('email_automations').update(payload).eq('id', id!);
      if (error) { toast.error(error.message); setSaving(false); return; }
      if (activate !== undefined) setIsActive(activate);
      toast.success('Saved');
    }
    setSaving(false);
  }

  async function sendTest() {
    if (!testEmail.trim()) { toast.error('Enter a test email'); return; }
    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('send-campaign', {
        body: {
          test: { email: testEmail.trim() },
          inline: {
            subject: subject.trim(),
            body_html: bodyHtml,
            cta_label: ctaLabel.trim() || null,
            cta_url: ctaUrl.trim() || null,
          },
        },
      });
      if (error) throw error;
      toast.success(`Test sent to ${testEmail}`);
    } catch (e: any) {
      toast.error(e.message || 'Test send failed');
    }
    setSendingTest(false);
  }

  if (adminLoading || !isAdmin || loading) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pt-20 lg:pt-8">
      <button onClick={() => navigate('/app/admin/campaigns')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </button>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? 'New automation' : 'Edit automation'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trigger an email when something happens
          </p>
        </div>
        {!isNew && (
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={(v) => void save(v)} />
            <span className="text-sm text-muted-foreground">{isActive ? 'On' : 'Off'}</span>
          </div>
        )}
      </div>

      <Card className="p-6 space-y-5">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Welcome email" />
        </div>

        <div>
          <Label>Description (internal)</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="What this automation does" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Trigger</Label>
            <Select value={triggerEvent} onValueChange={setTriggerEvent}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRIGGER_EVENTS.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Frequency cap (max sends per user)</Label>
            <Input type="number" min={1} value={frequencyCap}
              onChange={e => setFrequencyCap(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <Label>Delay after trigger</Label>
          <div className="flex gap-2">
            <Input type="number" min={0} value={delayValue}
              onChange={e => setDelayValue(Number(e.target.value))} className="w-32" />
            <Select value={delayUnit} onValueChange={(v: any) => setDelayUnit(v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-1">0 = send immediately</p>
        </div>

        <div>
          <Label>Subject</Label>
          <Input value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Welcome to VOVV.AI" />
        </div>

        <div>
          <Label>Body (HTML)</Label>
          <Textarea value={bodyHtml} onChange={e => setBodyHtml(e.target.value)}
            rows={10} placeholder="<p>Hi {{name}},</p><p>Welcome aboard.</p>"
            className="font-mono text-xs" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>CTA label (optional)</Label>
            <Input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)}
              placeholder="Open Visual Studio" />
          </div>
          <div>
            <Label>CTA URL (optional)</Label>
            <Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)}
              placeholder="https://vovv.ai/app" />
          </div>
        </div>
      </Card>

      <Card className="p-6 mt-4 space-y-3">
        <Label>Send test</Label>
        <div className="flex gap-2">
          <Input value={testEmail} onChange={e => setTestEmail(e.target.value)}
            placeholder="you@example.com" />
          <Button variant="outline" onClick={sendTest} disabled={sendingTest || !subject || !bodyHtml}>
            <Send className="w-4 h-4 mr-2" />
            {sendingTest ? 'Sending…' : 'Send test'}
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => navigate('/app/admin/campaigns')}>Cancel</Button>
        <Button onClick={() => void save()} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
