import { useCallback, useState } from 'react';
import {
  BlockStack,
  InlineStack,
  Text,
  Button,
  TextField,
  Select,
  Banner,
  Icon,
} from '@shopify/polaris';
import {
  UploadIcon,
  XIcon,
  ImageIcon,
} from '@shopify/polaris-icons';
import type { ScratchUpload } from '@/types';

interface UploadSourceCardProps {
  scratchUpload: ScratchUpload | null;
  onUpload: (upload: ScratchUpload) => void;
  onRemove: () => void;
  onUpdateProductInfo: (info: ScratchUpload['productInfo']) => void;
  isUploading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const productTypeOptions = [
  { label: 'Select type...', value: '' },
  { label: 'Leggings', value: 'Leggings' },
  { label: 'Hoodie', value: 'Hoodie' },
  { label: 'T-Shirt', value: 'T-Shirt' },
  { label: 'Sports Bra', value: 'Sports Bra' },
  { label: 'Jacket', value: 'Jacket' },
  { label: 'Tank Top', value: 'Tank Top' },
  { label: 'Joggers', value: 'Joggers' },
  { label: 'Shorts', value: 'Shorts' },
  { label: 'Dress', value: 'Dress' },
  { label: 'Sweater', value: 'Sweater' },
  { label: 'Other', value: 'Other' },
];

export function UploadSourceCard({
  scratchUpload,
  onUpload,
  onRemove,
  onUpdateProductInfo,
  isUploading = false,
}: UploadSourceCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, or WEBP image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be under 10MB.';
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    const previewUrl = URL.createObjectURL(file);
    
    onUpload({
      file,
      previewUrl,
      productInfo: {
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        productType: '',
        description: '',
      },
    });
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  // Uploaded state with preview
  if (scratchUpload) {
    return (
      <BlockStack gap="300">
        {/* Image Preview - Responsive sizing */}
        <div className="relative">
          <div className="aspect-square max-w-[200px] sm:max-w-xs rounded-lg overflow-hidden border border-border bg-surface">
            <img
              src={scratchUpload.previewUrl}
              alt="Uploaded product"
              className="w-full h-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 sm:p-1.5 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border"
          >
            <Icon source={XIcon} />
          </button>
        </div>

        {/* Product Details Form */}
        <BlockStack gap="300">
          <Text as="h4" variant="headingSm">
            Product Details
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Add details to help the AI generate better images.
          </Text>
          
          <TextField
            label="Product Title"
            value={scratchUpload.productInfo.title}
            onChange={(value) => onUpdateProductInfo({
              ...scratchUpload.productInfo,
              title: value,
            })}
            autoComplete="off"
            placeholder="e.g., High-Waist Yoga Leggings"
          />
          
          <Select
            label="Product Type"
            options={productTypeOptions}
            value={scratchUpload.productInfo.productType}
            onChange={(value) => onUpdateProductInfo({
              ...scratchUpload.productInfo,
              productType: value,
            })}
          />
          
          <TextField
            label="Description (optional)"
            value={scratchUpload.productInfo.description}
            onChange={(value) => onUpdateProductInfo({
              ...scratchUpload.productInfo,
              description: value,
            })}
            autoComplete="off"
            multiline={3}
            placeholder="e.g., Black seamless leggings with high waistband and subtle logo"
          />
        </BlockStack>

        {isUploading && (
          <Banner tone="info">
            <Text as="p" variant="bodySm">
              Uploading image to storage...
            </Text>
          </Banner>
        )}
      </BlockStack>
    );
  }

  // Upload zone
  return (
    <BlockStack gap="300">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-surface-hovered'
          }
        `}
      >
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <BlockStack gap="300" inlineAlign="center">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${dragOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
          `}>
            <Icon source={dragOver ? ImageIcon : UploadIcon} />
          </div>
          
          <BlockStack gap="100" inlineAlign="center">
            <Text as="p" variant="bodyLg" fontWeight="semibold">
              {dragOver ? 'Drop your image here' : 'Drag & drop or click to upload'}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Supports JPG, PNG, WEBP • Max 10MB
            </Text>
          </BlockStack>
          
          <Button variant="secondary" disabled={dragOver}>
            Choose File
          </Button>
        </BlockStack>
      </div>

      {error && (
        <Banner tone="critical" onDismiss={() => setError(null)}>
          <Text as="p" variant="bodySm">{error}</Text>
        </Banner>
      )}
    </BlockStack>
  );
}
