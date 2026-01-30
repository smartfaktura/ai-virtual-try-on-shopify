import { Text } from '@shopify/polaris';
import type { ModelProfile, TryOnPose } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PopularCombination {
  id: string;
  model: ModelProfile;
  pose: TryOnPose;
  label: string;
  bestFor: string;
}

interface PopularCombinationsProps {
  combinations: PopularCombination[];
  onSelect: (model: ModelProfile, pose: TryOnPose) => void;
}

export function PopularCombinations({
  combinations,
  onSelect,
}: PopularCombinationsProps) {
  if (combinations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Text as="h3" variant="headingSm" fontWeight="bold">
          Quick Start
        </Text>
        <Badge variant="secondary" className="text-[10px]">
          Popular Looks
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {combinations.map((combo) => (
          <Card
            key={combo.id}
            onClick={() => onSelect(combo.model, combo.pose)}
            className="p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 group"
          >
            <div className="flex items-center gap-3">
              {/* Combined Preview */}
              <div className="relative">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                  <img
                    src={combo.model.previewUrl}
                    alt={combo.model.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-md overflow-hidden border-2 border-background shadow-sm">
                  <img
                    src={combo.pose.previewUrl}
                    alt={combo.pose.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  {combo.label}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {combo.model.name} • {combo.pose.name}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  <span className="text-[10px]">{combo.bestFor}</span>
                </Text>
              </div>

              {/* Select indicator */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium text-primary">Select →</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper to create popular combinations from models and poses
export function createPopularCombinations(
  models: ModelProfile[],
  poses: TryOnPose[]
): PopularCombination[] {
  const combinations: PopularCombination[] = [];

  // Find specific models and poses for curated combinations
  const yuki = models.find(m => m.name === 'Yuki');
  const amara = models.find(m => m.name === 'Amara');
  const marcus = models.find(m => m.name === 'Marcus');
  const isabella = models.find(m => m.name === 'Isabella');

  const studioFront = poses.find(p => p.category === 'studio' && p.name.includes('Front'));
  const lifestyle = poses.find(p => p.category === 'lifestyle');
  const streetwear = poses.find(p => p.category === 'streetwear');
  const editorial = poses.find(p => p.category === 'editorial');

  if (yuki && studioFront) {
    combinations.push({
      id: 'combo_1',
      model: yuki,
      pose: studioFront,
      label: 'Classic Lookbook',
      bestFor: 'E-commerce product pages',
    });
  }

  if (amara && lifestyle) {
    combinations.push({
      id: 'combo_2',
      model: amara,
      pose: lifestyle,
      label: 'Lifestyle Casual',
      bestFor: 'Social media & ads',
    });
  }

  if (marcus && streetwear) {
    combinations.push({
      id: 'combo_3',
      model: marcus,
      pose: streetwear,
      label: 'Urban Street',
      bestFor: 'Streetwear brands',
    });
  }

  if (isabella && editorial) {
    combinations.push({
      id: 'combo_4',
      model: isabella,
      pose: editorial,
      label: 'Editorial Plus',
      bestFor: 'Inclusive campaigns',
    });
  }

  return combinations;
}
