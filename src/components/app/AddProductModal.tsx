import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Globe, FileSpreadsheet, Smartphone, ShoppingBag, ChevronRight, ChevronLeft, LayoutGrid } from 'lucide-react';
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
  /** When true (and not editing), hides the method rail and shows only the active workflow with a contextual header. */
  compact?: boolean;
  /** Called when user clicks "Switch method" in compact mode — parent should set compact=false. */
  onSwitchMethod?: () => void;
}

const METHOD_META: Record<AddProductTab, { label: string; sub: string; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  manual:  { label: 'Upload images',  sub: 'Drag, drop, or browse files',     title: 'Upload images',     subtitle: 'Drag, drop, or browse to upload product photos.', icon: Upload },
  store:   { label: 'Product URL',    sub: 'Import from any product page',    title: 'Import from URL',   subtitle: 'Paste a product page link to import images and details.', icon: Globe },
  csv:     { label: 'CSV import',     sub: 'Bulk-add from a spreadsheet',     title: 'CSV import',        subtitle: 'Bulk-add products from a spreadsheet.', icon: FileSpreadsheet },
  mobile:  { label: 'Mobile upload',  sub: 'Snap photos from your phone',     title: 'Mobile upload',     subtitle: 'Snap product photos directly from your phone.', icon: Smartphone },
  shopify: { label: 'Shopify import', sub: 'Sync your Shopify catalog',       title: 'Shopify import',    subtitle: 'Sync products straight from your Shopify catalog.', icon: ShoppingBag },
};

const METHOD_ORDER: AddProductTab[] = ['manual', 'store', 'csv', 'mobile', 'shopify'];
const MOBILE_METHOD_ORDER: AddProductTab[] = ['manual', 'store'];

export function AddProductModal({ open, onOpenChange, onProductAdded, editingProduct, initialTab, initialFiles, compact = false, onSwitchMethod }: AddProductModalProps) {
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

  const meta = METHOD_META[activeTab];
  const isEdit = !!editingProduct;
  // compact only when not editing AND parent requested it
  const isCompact = !isEdit && compact;

  const headerTitle = isEdit
    ? 'Edit Product'
    : isCompact
      ? meta.title
      : 'Add Products';
  const subtitle = isEdit
    ? 'Update your product details and images.'
    : isCompact
      ? meta.subtitle
      : 'Upload images or import products in seconds.';

  const editContent = (
    <ManualProductTab
      onProductAdded={onProductAdded}
      onClose={handleClose}
      editingProduct={editingProduct}
    />
  );

  // Active method body — used in both compact and full modes
  const activeBody = (
    <>
      {activeTab === 'manual'  && <ManualProductTab onProductAdded={onProductAdded} onClose={handleClose} initialFiles={pendingFiles} />}
      {activeTab === 'store'   && <StoreImportTab onProductAdded={onProductAdded} onClose={handleClose} onSwitchToUpload={() => setActiveTab('manual')} />}
      {activeTab === 'csv'     && <CsvImportTab onProductAdded={onProductAdded} onClose={handleClose} />}
      {activeTab === 'mobile'  && <MobileUploadTab onProductAdded={onProductAdded} onClose={handleClose} />}
      {activeTab === 'shopify' && <ShopifyImportTab onProductAdded={onProductAdded} onClose={handleClose} />}
    </>
  );

  const compactBody = (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto pr-1 -mr-1">
        {activeBody}
      </div>
      {onSwitchMethod && (
        <div className="mt-auto pt-6 flex items-center justify-start">
          <button
            type="button"
            onClick={onSwitchMethod}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Switch method
          </button>
        </div>
      )}
    </div>
  );

  const fullBody = (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AddProductTab)} className="w-full flex flex-col flex-1 min-h-0">
      {/* Mobile: keep compact pill row */}
      {isMobile ? (
        <div className="shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {MOBILE_METHOD_ORDER.map((id, idx) => {
              const { label, sub, icon: Icon } = METHOD_META[id];
              const active = activeTab === id;
              const isLastOdd = idx === MOBILE_METHOD_ORDER.length - 1 && MOBILE_METHOD_ORDER.length % 2 === 1;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors',
                    isLastOdd && 'col-span-2',
                    active
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border bg-background/50 hover:bg-muted/40',
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
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2 px-1">Method</p>
          <div className="rounded-xl border bg-background/50 divide-y">
            {METHOD_ORDER.map((id) => {
              const { label, sub, icon: Icon } = METHOD_META[id];
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
          <ManualProductTab onProductAdded={onProductAdded} onClose={handleClose} initialFiles={activeTab === 'manual' ? pendingFiles : undefined} />
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

  const tabsContent = isCompact ? compactBody : fullBody;

  // Mobile: bottom Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[88vh] flex flex-col">
          <DrawerHeader className="px-5 pt-3 pb-2 text-left shrink-0">
            <DrawerTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              {isCompact && onSwitchMethod && (
                <button
                  type="button"
                  onClick={onSwitchMethod}
                  aria-label="Back to methods"
                  className="inline-flex items-center justify-center w-7 h-7 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {headerTitle}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">{subtitle}</DrawerDescription>
          </DrawerHeader>
          <div className="px-5 pb-5 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
            {isEdit ? editContent : tabsContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: right-side Sheet — wider for breathing room
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[720px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-7 pt-7 pb-4 shrink-0 space-y-1.5">
          <SheetTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
            {isCompact && onSwitchMethod && (
              <button
                type="button"
                onClick={onSwitchMethod}
                aria-label="Back to methods"
                className="inline-flex items-center justify-center w-7 h-7 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {headerTitle}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">{subtitle}</SheetDescription>
        </SheetHeader>

        {isEdit ? (
          <div className="px-7 pb-7 overflow-y-auto overflow-x-hidden flex-1 min-h-0">{editContent}</div>
        ) : (
          <div className="px-7 pb-7 flex flex-col flex-1 min-h-0 overflow-x-hidden">{tabsContent}</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
