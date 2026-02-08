import { PageLayout } from '@/components/landing/PageLayout';
import { Activity, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    name: 'Platform',
    description: 'Dashboard, product management, and user interface',
    status: 'operational' as const,
    uptime: '99.98%',
  },
  {
    name: 'Generation API',
    description: 'Image and video generation pipeline',
    status: 'operational' as const,
    uptime: '99.95%',
  },
  {
    name: 'CDN & Storage',
    description: 'Image delivery and file storage',
    status: 'operational' as const,
    uptime: '99.99%',
  },
  {
    name: 'Generation Engine',
    description: 'AI model inference and rendering',
    status: 'operational' as const,
    uptime: '99.90%',
  },
  {
    name: 'Authentication',
    description: 'Login, signup, and session management',
    status: 'operational' as const,
    uptime: '99.99%',
  },
  {
    name: 'Webhooks & Integrations',
    description: 'Third-party integrations and event delivery',
    status: 'operational' as const,
    uptime: '99.97%',
  },
];

const recentIncidents = [
  {
    date: 'February 3, 2026',
    title: 'Increased generation latency',
    description: 'Some users experienced slower than normal generation times due to increased demand. Resolved by scaling up inference capacity.',
    duration: '~45 minutes',
    resolved: true,
  },
  {
    date: 'January 18, 2026',
    title: 'Scheduled maintenance — Database upgrade',
    description: 'Planned 15-minute maintenance window to upgrade database infrastructure. No data loss.',
    duration: '15 minutes',
    resolved: true,
  },
  {
    date: 'January 5, 2026',
    title: 'CDN intermittent errors',
    description: 'A subset of generated images returned 503 errors from our CDN provider. Issue was on the provider side and resolved.',
    duration: '~30 minutes',
    resolved: true,
  },
];

const statusColor = {
  operational: 'bg-emerald-500',
  degraded: 'bg-yellow-500',
  outage: 'bg-red-500',
};

const statusLabel = {
  operational: 'Operational',
  degraded: 'Degraded Performance',
  outage: 'Major Outage',
};

export default function Status() {
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Activity className="w-4 h-4" />
            System Status
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            {allOperational ? 'All Systems Operational' : 'System Status'}
          </h1>
          {allOperational && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Everything is running smoothly
            </div>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {services.map((service) => (
              <Card key={service.name} className="bg-card border-border">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{service.name}</h3>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:inline">{service.uptime} uptime</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${statusColor[service.status]}`} />
                      <span className="text-xs font-medium text-foreground">
                        {statusLabel[service.status]}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Recent Incidents</h2>
          <div className="space-y-6">
            {recentIncidents.map((incident) => (
              <div key={incident.title} className="border-l-2 border-border pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">{incident.date}</span>
                  {incident.resolved && (
                    <span className="text-xs font-medium text-emerald-600">Resolved</span>
                  )}
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1">{incident.title}</h3>
                <p className="text-xs text-muted-foreground">{incident.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Duration: {incident.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
