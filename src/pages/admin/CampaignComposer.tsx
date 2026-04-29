import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Send, Save, TestTube } from 'lucide-react';
import { toast } from 'sonner';

const PLANS = ['free', 'starter', 'growth', 'pro', 'enterprise'];

export default function CampaignComposer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useIsAdmin();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('<p>Hi {{name}},</p>\n<p>Write your message here.</p>');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [planFilter, setPlanFilter] = useState<string[]>(['all']);
  const [activeDays, setActiveDays] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(id || null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) { navigate('/app'); return; }
    if (id) void loadCampaign(id);
  }, [id, isAdmin, isLoading]);

  async function loadCampaign(cid: string) {
    const { data } = await supabase.from('email_campaigns').select('*').eq('id', cid).maybeSingle();
    if (!data) return;
    setName(data.name);
    setSubject(data.subject);
    setBodyHtml(data.body_html);
    setCtaLabel(data.cta_label || '');
    setCtaUrl(data.cta_url || '');
    const f = data.audience_filter as any;
    setPlanFilter(f?.plans || ['all']);
    setActiveDays(f?.active_days?.toString() || '');
    setScheduleAt(data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '');
  }

  function buildAudienceFilter() {
    const f: any = { plans: planFilter };
    if (activeDays) f.active_days = parseInt(activeDays);
    return f;
  }

  async function saveDraft() {
    if (!name || !subject || !bodyHtml) return toast.error('Name, subject, and body are required');
    setSaving(true);
    const payload = {
      name, subject, body_html: bodyHtml,
      cta_label: ctaLabel || null, cta_url: ctaUrl || null,
      audience_filter: buildAudienceFilter(),
      scheduled_at: scheduleAt ? new Date(scheduleAt).toISOString() : null,
      status: scheduleAt ? 'scheduled' : 'draft',
    };
    const res = campaignId
      ? await supabase.from('email_campaigns').update(payload).eq('id', campaignId).select().single()
      : await supabase.from('email_campaigns').insert(payload).select().single();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success('Saved');
    if (!campaignId) setCampaignId(res.data.id);
  }

  async function sendTest() {
    if (!testEmail) return toast.error('Enter a test email');
    if (!campaignId) { await saveDraft(); if (!campaignId) return; }
    const { data, error } = await supabase.functions.invoke('send-campaign', {
      body: { campaign_id: campaignId, test: { email: testEmail } },
    });
    if (error || data?.error) return toast.error(error?.message || data?.error);
    toast.success('Test sent');
  }

  async function sendNow() {
    if (!campaignId) { await saveDraft(); }
    const cid = campaignId;
    if (!cid) return;
    if (!confirm('Send this campaign to all matching users?')) return;
    const { data, error } = await supabase.functions.invoke('send-campaign', { body: { campaign_id: cid } });
    if (error || data?.error) return toast.error(error?.message || data?.error);
    toast.success(`Sent to ${data?.sent ?? 0} recipients`);
    navigate('/app/admin/campaigns');
  }

  if (isLoading || !isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-20 lg:pt-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/admin/campaigns')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        {campaignId ? 'Edit campaign' : 'New campaign'}
      </h1>

      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <Label>Campaign name (internal)</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. November feature drop" />
          </div>
          <div>
            <Label>Subject line</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="What recipients see in their inbox" />
          </div>
          <div>
            <Label>Body (HTML supported, use {'{{name}}'} for personalization)</Label>
            <Textarea value={bodyHtml} onChange={e => setBodyHtml(e.target.value)} rows={10} className="font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CTA button label (optional)</Label>
              <Input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder="Try it now" />
            </div>
            <div>
              <Label>CTA URL</Label>
              <Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="https://vovv.ai/app" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Audience</h3>
          <div>
            <Label className="mb-2 block">Plans</Label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={planFilter.includes('all')}
                  onCheckedChange={(v) => setPlanFilter(v ? ['all'] : [])}
                />
                All users
              </label>
              {PLANS.map(p => (
                <label key={p} className="flex items-center gap-2 text-sm capitalize">
                  <Checkbox
                    checked={planFilter.includes(p)}
                    onCheckedChange={(v) => {
                      if (v) setPlanFilter([...planFilter.filter(x => x !== 'all'), p]);
                      else setPlanFilter(planFilter.filter(x => x !== p));
                    }}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Only active in last N days (optional)</Label>
            <Input value={activeDays} onChange={e => setActiveDays(e.target.value)} type="number" placeholder="e.g. 30" className="max-w-[200px]" />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Schedule (optional)</h3>
          <Input value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} type="datetime-local" className="max-w-sm" />
          <p className="text-xs text-muted-foreground">Leave empty to save as draft. Scheduled campaigns send automatically within 5 minutes of the chosen time.</p>
        </Card>

        <Card className="p-6 space-y-3">
          <h3 className="font-semibold">Test send</h3>
          <div className="flex gap-2">
            <Input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your@email.com" type="email" />
            <Button variant="outline" onClick={sendTest}>
              <TestTube className="w-4 h-4 mr-2" />Send test
            </Button>
          </div>
        </Card>

        <div className="flex justify-between gap-2 sticky bottom-4 bg-background/80 backdrop-blur p-3 rounded-lg border">
          <Button variant="outline" onClick={saveDraft} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />Save draft
          </Button>
          <Button onClick={sendNow} disabled={saving}>
            <Send className="w-4 h-4 mr-2" />Send now
          </Button>
        </div>
      </div>
    </div>
  );
}
