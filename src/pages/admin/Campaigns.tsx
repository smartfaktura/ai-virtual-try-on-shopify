import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mail, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

interface Automation {
  id: string;
  name: string;
  trigger_event: string;
  delay_minutes: number;
  is_active: boolean;
  sent_count: number;
}

export default function AdminCampaigns() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) { navigate('/app'); return; }
    void load();
  }, [isAdmin, adminLoading]);

  async function load() {
    setLoading(true);
    const [c, a] = await Promise.all([
      supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('email_automations').select('*').order('created_at', { ascending: false }),
    ]);
    if (c.data) setCampaigns(c.data as Campaign[]);
    if (a.data) setAutomations(a.data as Automation[]);
    setLoading(false);
  }

  async function toggleAutomation(id: string, active: boolean) {
    const { error } = await supabase.from('email_automations').update({ is_active: active }).eq('id', id);
    if (error) toast.error(error.message); else { toast.success(active ? 'Automation on' : 'Automation off'); void load(); }
  }

  if (adminLoading || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-20 lg:pt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Email Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Send broadcasts and configure automations</p>
        </div>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns"><Mail className="w-4 h-4 mr-2" />Campaigns</TabsTrigger>
          <TabsTrigger value="automations"><Zap className="w-4 h-4 mr-2" />Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => navigate('/app/admin/campaigns/new')}>
              <Plus className="w-4 h-4 mr-2" />New campaign
            </Button>
          </div>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
            campaigns.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No campaigns yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {campaigns.map(c => (
                  <Card key={c.id} className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/admin/campaigns/${c.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{c.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            c.status === 'sent' ? 'bg-emerald-500/10 text-emerald-600' :
                            c.status === 'sending' ? 'bg-blue-500/10 text-blue-600' :
                            c.status === 'scheduled' ? 'bg-amber-500/10 text-amber-600' :
                            c.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                            'bg-muted text-muted-foreground'
                          }`}>{c.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{c.subject}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground shrink-0 ml-4">
                        {c.status === 'sent' && (
                          <p>{c.sent_count}/{c.recipient_count} sent</p>
                        )}
                        <p className="text-xs mt-0.5">
                          {c.sent_at ? new Date(c.sent_at).toLocaleDateString() :
                           c.scheduled_at ? `Scheduled ${new Date(c.scheduled_at).toLocaleDateString()}` :
                           new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          }
        </TabsContent>

        <TabsContent value="automations" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => navigate('/app/admin/campaigns/automations/new')}>
              <Plus className="w-4 h-4 mr-2" />New automation
            </Button>
          </div>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
            automations.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No automations configured</p>
                <p className="text-xs mt-2">Examples: welcome email, abandoned checkout reminder, re-engage inactive users</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {automations.map(a => (
                  <Card key={a.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => navigate(`/app/admin/campaigns/automations/${a.id}`)}>
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{a.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {a.trigger_event}
                          </span>
                          {a.delay_minutes > 0 && (
                            <span className="text-xs text-muted-foreground">
                              · {a.delay_minutes >= 60 ? `${Math.round(a.delay_minutes / 60)}h` : `${a.delay_minutes}m`} delay
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.sent_count} sent</p>
                      </div>
                      <Button
                        variant={a.is_active ? 'default' : 'outline'}
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); void toggleAutomation(a.id, !a.is_active); }}
                      >
                        {a.is_active ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}
