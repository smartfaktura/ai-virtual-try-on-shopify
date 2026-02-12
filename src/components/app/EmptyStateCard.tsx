import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackageOpen } from 'lucide-react';
import { getLandingAssetUrl } from '@/lib/landingAssets';

const imgFashion = getLandingAssetUrl('showcase/fashion-blazer-golden.jpg');
const imgSkincare = getLandingAssetUrl('showcase/skincare-serum-marble.jpg');
const imgFood = getLandingAssetUrl('showcase/food-coffee-artisan.jpg');

interface EmptyStateCardProps {
  heading: string;
  description: string;
  action?: {
    content: string;
    onAction: () => void;
  };
  image?: string;
  icon?: React.ReactNode;
  /** Show a collage of showcase images instead of the icon */
  showCollage?: boolean;
}

export function EmptyStateCard({ heading, description, action, icon, showCollage }: EmptyStateCardProps) {
  return (
    <Card>
      <CardContent className="py-10 flex flex-col items-center text-center space-y-4">
        {showCollage ? (
          <div className="flex gap-2 -space-x-3">
            {[imgFashion, imgSkincare, imgFood].map((img, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-xl overflow-hidden border-2 border-background shadow-sm"
                style={{ zIndex: 3 - i }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            {icon || <PackageOpen className="w-8 h-8 text-muted-foreground" />}
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{heading}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onAction}>{action.content}</Button>
        )}
      </CardContent>
    </Card>
  );
}
