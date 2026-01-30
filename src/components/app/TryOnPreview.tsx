import { Text, Icon } from '@shopify/polaris';
import { PlusIcon, ArrowRightIcon } from '@shopify/polaris-icons';
import type { Product, ModelProfile, TryOnPose, ScratchUpload } from '@/types';
import { Card } from '@/components/ui/card';

interface TryOnPreviewProps {
  product?: Product | null;
  scratchUpload?: ScratchUpload | null;
  model: ModelProfile | null;
  pose: TryOnPose | null;
  creditCost?: number;
}

export function TryOnPreview({
  product,
  scratchUpload,
  model,
  pose,
  creditCost = 0,
}: TryOnPreviewProps) {
  // Get product info from either source
  const productImageUrl = product?.images[0]?.url || scratchUpload?.previewUrl;
  const productTitle = product?.title || scratchUpload?.productInfo.title || '';
  const hasProduct = !!(product || scratchUpload);
  
  const hasAllSelections = hasProduct && model && pose;
  const description = hasAllSelections
    ? `${model.name} in ${pose.name} wearing ${productTitle}`
    : 'Complete your selections to see preview';

  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-br from-surface-subdued to-muted/30 border-2 border-dashed border-border">
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Text as="h3" variant="headingSm" fontWeight="bold">
            Preview
          </Text>
          {creditCost > 0 && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-shopify-green/10 text-shopify-green">
              {creditCost} credits
            </span>
          )}
        </div>

        {/* Visual Composite - Responsive layout */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {/* Product Thumbnail */}
          <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 flex-shrink-0 ${
            hasProduct ? 'border-primary bg-white' : 'border-dashed border-muted-foreground/30 bg-muted'
          }`}>
            {productImageUrl ? (
              <img
                src={productImageUrl}
                alt={productTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[8px] sm:text-[10px] text-muted-foreground text-center px-1">Product</span>
              </div>
            )}
          </div>

          {/* Plus Icon */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Icon source={PlusIcon} tone="subdued" />
          </div>

          {/* Model Thumbnail */}
          <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 flex-shrink-0 ${
            model ? 'border-primary' : 'border-dashed border-muted-foreground/30 bg-muted'
          }`}>
            {model ? (
              <img
                src={model.previewUrl}
                alt={model.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[8px] sm:text-[10px] text-muted-foreground text-center px-1">Model</span>
              </div>
            )}
          </div>

          {/* Plus Icon */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Icon source={PlusIcon} tone="subdued" />
          </div>

          {/* Pose Thumbnail */}
          <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 flex-shrink-0 ${
            pose ? 'border-primary' : 'border-dashed border-muted-foreground/30 bg-muted'
          }`}>
            {pose ? (
              <img
                src={pose.previewUrl}
                alt={pose.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[8px] sm:text-[10px] text-muted-foreground text-center px-1">Pose</span>
              </div>
            )}
          </div>

          {/* Arrow to Result - Only on larger screens or when all selected */}
          {hasAllSelections && (
            <>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-shopify-green/10 flex items-center justify-center flex-shrink-0">
                <Icon source={ArrowRightIcon} tone="success" />
              </div>
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl border-2 border-shopify-green bg-shopify-green/5 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] sm:text-[10px] text-shopify-green font-medium text-center px-1">AI Generated</span>
              </div>
            </>
          )}
        </div>

        {/* Description - Hidden on very small screens when incomplete */}
        <div className="text-center">
          <Text as="p" variant="bodySm" tone={hasAllSelections ? undefined : 'subdued'}>
            {hasAllSelections ? (
              <span className="font-medium text-xs sm:text-sm">"{description}"</span>
            ) : (
              <span className="text-xs sm:text-sm">{description}</span>
            )}
          </Text>
        </div>

        {/* Selection Status */}
        <div className="flex justify-center gap-3 sm:gap-4 pt-2 border-t border-border">
          <StatusPill label="Product" completed={hasProduct} />
          <StatusPill label="Model" completed={!!model} />
          <StatusPill label="Pose" completed={!!pose} />
        </div>
      </div>
    </Card>
  );
}

function StatusPill({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${completed ? 'bg-shopify-green' : 'bg-muted-foreground/30'}`} />
      <span className={`text-xs ${completed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
