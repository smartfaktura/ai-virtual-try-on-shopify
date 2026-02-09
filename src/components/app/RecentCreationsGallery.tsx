import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Image, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import imgShowcase1 from '@/assets/showcase/fashion-blazer-golden.jpg';
import imgShowcase2 from '@/assets/showcase/skincare-serum-marble.jpg';
import imgShowcase3 from '@/assets/showcase/food-coffee-artisan.jpg';
import imgShowcase4 from '@/assets/showcase/home-candle-evening.jpg';
import imgShowcase5 from '@/assets/showcase/fashion-activewear-studio.jpg';
import imgShowcase6 from '@/assets/showcase/skincare-cream-botanical.jpg';

const PLACEHOLDER_IMAGES = [imgShowcase1, imgShowcase2, imgShowcase3, imgShowcase4, imgShowcase5, imgShowcase6];

interface CreationItem {
  id: string;
  imageUrl: string;
  label: string;
  date: string;
}

export function RecentCreationsGallery() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: creations = [] } = useQuery({
    queryKey: ['recent-creations', user?.id],
    queryFn: async () => {
      const items: CreationItem[] = [];

      // Fetch generation jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('generation_jobs')
        .select('id, results, created_at, workflows(name), user_products(title, image_url)')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(12);
      if (jobsError) throw jobsError;

      for (const job of jobs ?? []) {
        const results = job.results as any;
        if (Array.isArray(results) && results.length > 0) {
          for (const r of results.slice(0, 2)) {
            const url = typeof r === 'string' ? r : r?.url || r?.image_url;
            if (url) {
              items.push({
                id: job.id,
                imageUrl: url,
                label: (job.workflows as any)?.name || 'Generated',
                date: new Date(job.created_at).toLocaleDateString(),
              });
            }
          }
        } else if ((job.user_products as any)?.image_url) {
          items.push({
            id: job.id,
            imageUrl: (job.user_products as any).image_url,
            label: (job.workflows as any)?.name || 'Generated',
            date: new Date(job.created_at).toLocaleDateString(),
          });
        }
      }

      // Fetch freestyle generations
      const { data: freestyle, error: freestyleError } = await supabase
        .from('freestyle_generations')
        .select('id, image_url, prompt, created_at')
        .order('created_at', { ascending: false })
        .limit(8);
      if (freestyleError) throw freestyleError;

      for (const f of freestyle ?? []) {
        items.push({
          id: f.id,
          imageUrl: f.image_url,
          label: 'Freestyle',
          date: new Date(f.created_at).toLocaleDateString(),
        });
      }

      // Sort by date descending and take first 10
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return items.slice(0, 10);
    },
    enabled: !!user,
  });

  // Use placeholder images when no real creations exist
  const displayItems: CreationItem[] = creations.length > 0
    ? creations
    : PLACEHOLDER_IMAGES.map((img, i) => ({
        id: `placeholder-${i}`,
        imageUrl: img,
        label: ['Product Shot', 'Lifestyle', 'Ad Creative', 'Editorial', 'On-Model', 'Campaign'][i],
        date: 'Sample',
      }));

  const isPlaceholder = creations.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {isPlaceholder ? 'What You Can Create' : 'Recent Creations'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isPlaceholder ? 'AI-generated product photography examples.' : 'Your latest generated visuals.'}
          </p>
        </div>
        {!isPlaceholder && (
          <Button variant="link" className="text-sm font-medium gap-1" onClick={() => navigate('/app/library')}>
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          className="flex gap-4 overflow-x-auto pb-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayItems.map((item, i) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[180px] group cursor-pointer"
              onClick={() => !isPlaceholder && navigate('/app/library')}
            >
              <div className="aspect-[4/5] rounded-xl overflow-hidden border border-border relative shadow-sm">
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[10px] text-white/70">{item.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
