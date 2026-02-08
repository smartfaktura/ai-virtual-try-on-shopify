import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { BrandProfileCard } from '@/components/app/BrandProfileCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
    <PageHeader
      title="Brand Profiles"
      subtitle="Define your brand's visual identity for consistent image generation."
    >
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={() => navigate('/app/brand-profiles/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Profile
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <EmptyStateCard
            heading="No brand profiles yet"
            description="Create your first Brand Profile to ensure every generated image matches your brand's visual identity."
            action={{ content: 'Create Brand Profile', onAction: () => navigate('/app/brand-profiles/new') }}
            icon={<Palette className="w-10 h-10 text-muted-foreground" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </PageHeader>
  );
}
