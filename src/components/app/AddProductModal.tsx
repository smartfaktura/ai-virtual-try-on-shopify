import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Globe, FileSpreadsheet, Smartphone, ShoppingBag, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ManualProductTab } from './ManualProductTab';
import { StoreImportTab } from './StoreImportTab';
import { CsvImportTab } from './CsvImportTab';
import { MobileUploadTab } from './MobileUploadTab';
import { ShopifyImportTab } from './ShopifyImportTab';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  product_type: string;
  image_url: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  back_image_url?: string | null;
  side_image_url?: string | null;
  packaging_image_url?: string | null;
  inside_image_url?: string | null;
  texture_image_url?: string | null;
  extra_image_urls?: string[];
  weight?: string | null;
  materials?: string | null;
  color?: string | null;
  sku?: string | null;
}

export type AddProductTab = 'manual' | 'store' | 'csv' | 'mobile' | 'shopify';

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: () => void;
  editingProduct?: UserProduct | null;
  initialTab?: AddProductTab;
  initialFiles?: File[];
}

export function AddProductModal({ open, onOpenChange, onProductAdded, editingProduct, initialTab, initialFiles }: AddProductModalProps) {
  const handleClose = () => onOpenChange(false);
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<AddProductTab>(initialTab ?? 'manual');
  const [pendingFiles, setPendingFiles] = useState<File[] | undefined>(initialFiles);

  // Sync tab + files whenever the drawer (re)opens with new initial values
  useEffect(() => {
    if (open) {
      if (initialTab) setActiveTab(initialTab);
      setPendingFiles(initialFiles && initialFiles.length ? initialFiles : undefined);
    }
  }, [open, initialTab, initialFiles]);

  const headerTitle = editingProduct ? 'Edit Product' : 'Add Products';
  const subtitle = editingProduct
    ? 'Update your product details and images.'
    : 'Upload images or import products in seconds.';

  const editContent = (
    <ManualProductTab
      onProductAdded={onProductAdded}
      onClose={handleClose}
      editingProduct={editingProduct}
    />
  );

  const METHODS: { id: AddProductTab; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'manual', label: 'Upload images', sub: 'Drag, drop, or browse files', icon: Upload },
    { id: 'store', label: 'Product URL', sub: 'Import from any product page', icon: Globe },
    { id: 'csv', label: 'CSV import', sub: 'Bulk-add from a spreadsheet', icon: FileSpreadsheet },
    { id: 'mobile', label: 'Mobile upload', sub: 'Snap photos from your phone', icon: Smartphone },
    { id: 'shopify', label: 'Shopify import', sub: 'Sync your Shopify catalog', icon: ShoppingBag },
  ];

  const tabsContent = (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AddProductTab)} className="w-full flex flex-col flex-1 min-h-0">
      {/* Mobile: keep compact pill row */}
      {isMobile ? (
        <div className="shrink-0">
          <TabsList className="bg-muted/60 rounded-xl p-1 h-auto inline-flex gap-1 w-auto overflow-x-auto max-w-full">
            {METHODS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5 whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5" />
                {label.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      ) : (
        /* Desktop: vertical method rail matching empty-state aesthetic */
        <div className="shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2 px-1">Method</p>
          <div className="rounded-xl border bg-background/50 divide-y">
            {METHODS.map(({ id, label, sub, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl group',
                    active ? 'bg-muted/70' : 'hover:bg-muted/50',
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    active ? 'bg-primary/10' : 'bg-muted',
                  )}>
                    <Icon className={cn('w-4 h-4', active ? 'text-primary' : 'text-foreground/70')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
                  </div>
                  <ChevronRight className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-foreground',
                  )} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-5 overflow-y-auto flex-1 min-h-0">
        <TabsContent value="manual" className="mt-0">
          <ManualProductTab
            onProductAdded={onProductAdded}
            onClose={handleClose}
            initialFiles={activeTab === 'manual' ? pendingFiles : undefined}
          />
        </TabsContent>
        <TabsContent value="store" className="mt-0">
          <StoreImportTab onProductAdded={onProductAdded} onClose={handleClose} onSwitchToUpload={() => setActiveTab('manual')} />
        </TabsContent>
        <TabsContent value="csv" className="mt-0">
          <CsvImportTab onProductAdded={onProductAdded} onClose={handleClose} />
        </TabsContent>
        <TabsContent value="mobile" className="mt-0">
          <MobileUploadTab onProductAdded={onProductAdded} onClose={handleClose} />
        </TabsContent>
        <TabsContent value="shopify" className="mt-0">
          <ShopifyImportTab onProductAdded={onProductAdded} onClose={handleClose} />
        </TabsContent>
      </div>
    </Tabs>
  );

  // Mobile: bottom Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] flex flex-col">
          <DrawerHeader className="px-5 pt-4 pb-3 text-left shrink-0">
            <DrawerTitle className="text-lg font-semibold tracking-tight">{headerTitle}</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">{subtitle}</DrawerDescription>
          </DrawerHeader>
          <div className="px-5 pb-5 overflow-y-auto flex-1 min-h-0">
            {editingProduct ? editContent : tabsContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: right-side Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[600px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-7 pt-7 pb-4 shrink-0 space-y-1.5">
          <SheetTitle className="text-xl font-semibold tracking-tight">{headerTitle}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">{subtitle}</SheetDescription>
        </SheetHeader>

        {editingProduct ? (
          <div className="px-7 pb-7 overflow-y-auto flex-1 min-h-0">{editContent}</div>
        ) : (
          <div className="px-7 pb-7 flex flex-col flex-1 min-h-0">{tabsContent}</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
