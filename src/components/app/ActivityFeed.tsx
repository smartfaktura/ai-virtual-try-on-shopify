import { useQuery } from '@tanstack/react-query';
import { Image, Package, Palette, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import type { LucideIcon } from 'lucide-react';

import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 50 });

const FREESTYLE_AVATARS = [
  { file: 'avatar-yuki.jpg', name: 'Yuki' },
  { file: 'avatar-luna.jpg', name: 'Luna' },
  { file: 'avatar-amara.jpg', name: 'Amara' },
  { file: 'avatar-kenji.jpg', name: 'Kenji' },
];

const getTeamAvatar = (activityId: string) => {
  if (activityId.startsWith('job-')) return { src: teamAvatar('avatar-sophia.jpg'), name: 'Sophia' };
  if (activityId.startsWith('product-')) return { src: teamAvatar('avatar-max.jpg'), name: 'Max' };
  if (activityId.startsWith('brand-')) return { src: teamAvatar('avatar-sienna.jpg'), name: 'Sienna' };
  if (activityId.startsWith('freestyle-')) {
    const hash = activityId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const pick = FREESTYLE_AVATARS[hash % FREESTYLE_AVATARS.length];
    return { src: teamAvatar(pick.file), name: pick.name };
  }
  return null;
};

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

      // Recent freestyle generations
      const { data: freestyles } = await supabase
        .from('freestyle_generations')
        .select('id, prompt, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      for (const f of freestyles ?? []) {
        const truncated = f.prompt.length > 30 ? f.prompt.slice(0, 30) + '…' : f.prompt;
        items.push({
          id: `freestyle-${f.id}`,
          icon: Sparkles,
          text: `Freestyle "${truncated}" generated`,
          time: formatDistanceToNow(new Date(f.created_at), { addSuffix: true }),
          sortDate: new Date(f.created_at),
        });
      }

      // Sort by date descending
      items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
      return items.slice(0, 8);
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
                {(() => {
                  const team = getTeamAvatar(activity.id);
                  return team ? (
                    <img src={team.src} alt={team.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-border" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  );
                })()}
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
