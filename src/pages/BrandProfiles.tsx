import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Palette, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { BrandProfileCard } from '@/components/app/BrandProfileCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

export interface BrandProfile {
  id: string;
  user_id: string;
  name: string;
  brand_description: string;
  tone: string;
  lighting_style: string;
  background_style: string;
  color_temperature: string;
  composition_bias: string;
  do_not_rules: string[];
  color_palette: string[];
  brand_keywords: string[];
  preferred_scenes: string[];
  target_audience: string;
  photography_reference: string;
  created_at: string;
  updated_at: string;
}

export type BrandProfileInsert = Omit<BrandProfile, 'id' | 'created_at' | 'updated_at'>;

/* ── Brand Models CTA Banner ── */
function BrandModelsBanner() {
  const navigate = useNavigate();
  const sophia = TEAM_MEMBERS[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6">
        {/* Top row on mobile: avatar + CTA */}
        <div className="flex items-center gap-4 sm:contents">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-border shadow-sm">
              <img
                src={getOptimizedUrl(sophia.avatar, { quality: 70 })}
                alt={sophia.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Copy — on mobile sits next to avatar */}
          <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {sophia.name} · {sophia.expertiseTag}
            </p>
            <p className="text-sm sm:text-base font-semibold text-foreground leading-snug tracking-[-0.01em]">
              Complete your brand identity with <span className="text-primary">Brand Models</span>
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              Create custom AI models that represent your brand — consistent faces across every campaign.
            </p>
          </div>
        </div>

        {/* CTA — full width on mobile */}
        <Button
          size="sm"
          className="shrink-0 gap-1.5 w-full sm:w-auto rounded-full h-10 px-5 shadow-md shadow-primary/20"
          onClick={() => navigate('/app/models')}
        >
          Create Brand Model
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default function BrandProfiles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['brand-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as BrandProfile[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brand_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-profiles'] });
      toast.success('Brand profile deleted');
    },
    onError: () => toast.error('Failed to delete brand profile'),
  });

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Brand Profiles"
        subtitle="Define your brand's visual identity for consistent image generation"
        actions={
          <Button
            onClick={() => navigate('/app/brand-profiles/new')}
            size="pill"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Profile
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Content */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <EmptyStateCard
              heading="No brand profiles yet"
              description="Create your first Brand Profile to ensure every generated image matches your brand's visual identity"
              action={{ content: 'Create Brand Profile', onAction: () => navigate('/app/brand-profiles/new') }}
              icon={<Palette className="w-10 h-10 text-muted-foreground" />}
            />
          ) : (
            <div className="space-y-3">
              {profiles.map(profile => (
                <BrandProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={() => navigate(`/app/brand-profiles/${profile.id}/edit`)}
                  onDelete={() => deleteMutation.mutate(profile.id)}
                />
              ))}
            </div>
          )}

          {/* Brand Models CTA Banner — after profiles */}
          <BrandModelsBanner />
        </div>
      </PageHeader>
    </div>
  );
}
