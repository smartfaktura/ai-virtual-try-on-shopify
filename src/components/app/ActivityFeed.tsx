import { useQuery } from '@tanstack/react-query';
import { Image, Package, Palette, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import type { LucideIcon } from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  text: string;
  time: string;
  sortDate: Date;
}

export function ActivityFeed() {
  const { user } = useAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ['activity-feed', user?.id],
    queryFn: async () => {
      const items: ActivityItem[] = [];

      // Recent completed jobs
      const { data: jobs } = await supabase
        .from('generation_jobs')
        .select('id, created_at, status, requested_count, workflows(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      for (const job of jobs ?? []) {
        const status = job.status === 'completed' ? 'completed' : job.status === 'failed' ? 'failed' : 'started';
        const wfName = job.workflows?.name || 'Generation';
        items.push({
          id: `job-${job.id}`,
          icon: Image,
          text: `${wfName} ${status} — ${job.requested_count} image${job.requested_count > 1 ? 's' : ''}`,
          time: formatDistanceToNow(new Date(job.created_at), { addSuffix: true }),
          sortDate: new Date(job.created_at),
        });
      }

      // Recent products
      const { data: products } = await supabase
        .from('user_products')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      for (const p of products ?? []) {
        items.push({
          id: `product-${p.id}`,
          icon: Package,
          text: `Product "${p.title}" uploaded`,
          time: formatDistanceToNow(new Date(p.created_at), { addSuffix: true }),
          sortDate: new Date(p.created_at),
        });
      }

      // Recent brand profiles
      const { data: brands } = await supabase
        .from('brand_profiles')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      for (const b of brands ?? []) {
        items.push({
          id: `brand-${b.id}`,
          icon: Palette,
          text: `Brand profile "${b.name}" created`,
          time: formatDistanceToNow(new Date(b.created_at), { addSuffix: true }),
          sortDate: new Date(b.created_at),
        });
      }

      // Sort by date descending
      items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
      return items.slice(0, 6);
    },
    enabled: !!user,
  });

  if (activities.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Activity</h2>
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground flex-1 min-w-0 truncate">{activity.text}</p>
                <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
