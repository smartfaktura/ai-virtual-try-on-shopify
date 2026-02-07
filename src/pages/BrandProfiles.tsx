import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { BrandProfileCard } from '@/components/app/BrandProfileCard';
import { BrandProfileForm } from '@/components/app/BrandProfileForm';
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
  created_at: string;
  updated_at: string;
}

export type BrandProfileInsert = Omit<BrandProfile, 'id' | 'created_at' | 'updated_at'>;

export default function BrandProfiles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BrandProfile | null>(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['brand-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BrandProfile[];
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

  const handleEdit = (profile: BrandProfile) => {
    setEditingProfile(profile);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingProfile(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProfile(null);
  };

  return (
    <PageHeader
      title="Brand Profiles"
      subtitle="Define your brand's visual identity for consistent image generation."
    >
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={handleCreate}>
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
            action={{ content: 'Create Brand Profile', onAction: handleCreate }}
            icon={<Palette className="w-10 h-10 text-muted-foreground" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map(profile => (
              <BrandProfileCard
                key={profile.id}
                profile={profile}
                onEdit={() => handleEdit(profile)}
                onDelete={() => deleteMutation.mutate(profile.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <BrandProfileForm
        open={formOpen}
        onClose={handleFormClose}
        profile={editingProfile}
      />
    </PageHeader>
  );
}
