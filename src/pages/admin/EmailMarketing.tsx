import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, Mail, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EventRow {
  id: string;
  email: string;
  event_type: string;
  status: string;
  created_at: string;
  payload: any;
}

export default function EmailMarketing() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [stats, setStats] = useState({ contacts: 0, unsubscribes: 0, recentEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState(false);

  const audienceId = import.meta.env.VITE_LOVABLE_CONNECTOR_RESEND_AUDIENCE_ID || "";
  const resendDashboardUrl = audienceId
    ? `https://resend.com/audiences/${audienceId}`
    : "https://resend.com/audiences";

  const load = async () => {
    setLoading(true);
    const [{ data: evts }, { count: contacts }, { count: unsub }] = await Promise.all([
      supabase
        .from("resend_event_log")
        .select("id, email, event_type, status, created_at, payload")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("user_id", { count: "exact", head: true }).eq("marketing_emails_opted_in", true),
      supabase.from("marketing_unsubscribes").select("id", { count: "exact", head: true }),
    ]);

    setEvents((evts as EventRow[]) ?? []);
    setStats({
      contacts: contacts ?? 0,
      unsubscribes: unsub ?? 0,
      recentEvents: evts?.length ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleResync = async () => {
    setResyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("resync-resend-audience");
      if (error) throw error;
      toast.success(`Resync complete: ${data.added} added, ${data.updated} updated, ${data.failed} failed`);
      await load();
    } catch (e) {
      toast.error(`Resync failed: ${(e as Error).message}`);
    } finally {
      setResyncing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight">Email Marketing</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Compose broadcasts, build automations, and view campaign analytics in your Resend dashboard.
          We sync contacts and event triggers to Resend automatically — you focus on the messages
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Contacts synced</span>
          </div>
          <p className="text-3xl font-light">{stats.contacts.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Unsubscribes</span>
          </div>
          <p className="text-3xl font-light">{stats.unsubscribes.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Recent events</span>
          </div>
          <p className="text-3xl font-light">{stats.recentEvents}</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-medium">Manage in Resend</h2>
          <p className="text-sm text-muted-foreground mt-1">
            All broadcasts, automations, and segments live in Resend. Use the buttons below
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={resendDashboardUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open audience in Resend
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="https://resend.com/broadcasts" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Broadcasts
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="https://resend.com/automations" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Automations
            </a>
          </Button>
          <Button onClick={handleResync} disabled={resyncing} variant="ghost">
            <RefreshCw className={`w-4 h-4 mr-2 ${resyncing ? "animate-spin" : ""}`} />
            {resyncing ? "Resyncing…" : "Resync all contacts"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent events sent to Resend</h2>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{e.email}</td>
                    <td className="py-2 pr-4">
                      <code className="text-xs">{e.event_type}</code>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={e.status === "ok" ? "secondary" : "destructive"}>
                        {e.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-muted/30">
        <h3 className="text-sm font-medium mb-2">How it works</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>New signups are added to your Resend audience automatically</li>
          <li>Plan changes update the contact's attributes in Resend</li>
          <li>Events (first generation, low credits, subscription changes) are forwarded so Resend automations can trigger</li>
          <li>Unsubscribes from any email mark the contact unsubscribed in Resend immediately</li>
          <li>Compose all broadcasts and build all automations directly in Resend's dashboard</li>
        </ul>
      </Card>
    </div>
  );
}
