import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Globe, FileSpreadsheet, Smartphone } from 'lucide-react';
import { ManualProductTab } from './ManualProductTab';
import { StoreImportTab } from './StoreImportTab';
import { CsvImportTab } from './CsvImportTab';
import { MobileUploadTab } from './MobileUploadTab';
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
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: () => void;
  editingProduct?: UserProduct | null;
}

export function AddProductModal({ open, onOpenChange, onProductAdded, editingProduct }: AddProductModalProps) {
  const handleClose = () => onOpenChange(false);
  const isMobile = useIsMobile();

  const header = (
    <>
      {editingProduct ? 'Edit Product' : 'Add Product'}
    </>
  );

  const subtitle = editingProduct
    ? 'Update your product details and images.'
    : 'Upload images, import from a URL, or bulk-add via CSV.';

  const editContent = (
    <ManualProductTab
      onProductAdded={onProductAdded}
      onClose={handleClose}
      editingProduct={editingProduct}
    />
  );

  const tabsContent = (
    <Tabs defaultValue="manual" className="w-full flex flex-col flex-1 min-h-0">
      <div className="shrink-0">
        <TabsList className="bg-muted/60 rounded-xl p-1 h-auto inline-flex gap-1 w-auto">
          <TabsTrigger
            value="manual"
            className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </TabsTrigger>
          <TabsTrigger
            value="store"
            className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Product </span>URL
          </TabsTrigger>
          <TabsTrigger
            value="csv"
            className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV
          </TabsTrigger>
          <TabsTrigger
            value="mobile"
            className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="pt-5 overflow-y-auto flex-1 min-h-0">
        <TabsContent value="manual" className="mt-0">
          <ManualProductTab onProductAdded={onProductAdded} onClose={handleClose} />
        </TabsContent>
        <TabsContent value="store" className="mt-0">
          <StoreImportTab onProductAdded={onProductAdded} onClose={handleClose} />
        </TabsContent>
        <TabsContent value="csv" className="mt-0">
          <CsvImportTab onProductAdded={onProductAdded} onClose={handleClose} />
        </TabsContent>
        <TabsContent value="mobile" className="mt-0">
          <MobileUploadTab onProductAdded={onProductAdded} onClose={handleClose} />
        </TabsContent>
      </div>
    </Tabs>
  );

  // Mobile: use Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] flex flex-col">
          <DrawerHeader className="px-5 pt-4 pb-3 text-left shrink-0">
            <DrawerTitle className="text-lg font-semibold tracking-tight">
              {header}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              {subtitle}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-5 pb-5 overflow-y-auto flex-1 min-h-0">
            {editingProduct ? editContent : tabsContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl p-0 gap-0">
        <div className="px-8 pt-8 pb-4 shrink-0">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {header}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {subtitle}
            </DialogDescription>
          </DialogHeader>
        </div>

        {editingProduct ? (
          <div className="px-8 pb-8 overflow-y-auto flex-1 min-h-0">
            {editContent}
          </div>
        ) : (
          <div className="px-8 pb-8 flex flex-col flex-1 min-h-0">
            {tabsContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
