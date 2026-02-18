import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Globe, FileSpreadsheet, Smartphone } from 'lucide-react';
import { ManualProductTab } from './ManualProductTab';
import { StoreImportTab } from './StoreImportTab';
import { CsvImportTab } from './CsvImportTab';
import { MobileUploadTab } from './MobileUploadTab';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl p-0">
        <div className="px-8 pt-8 pb-3 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
        </div>

        {editingProduct ? (
          <div className="px-8 pb-8 overflow-y-auto flex-1 min-h-0">
            <ManualProductTab
              onProductAdded={onProductAdded}
              onClose={handleClose}
              editingProduct={editingProduct}
            />
          </div>
        ) : (
          <Tabs defaultValue="manual" className="w-full flex flex-col flex-1 min-h-0">
            <div className="px-8 shrink-0">
              <TabsList className="w-full bg-transparent p-0 h-auto gap-2 border-b border-border rounded-none justify-start">
                <TabsTrigger
                  value="manual"
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="store"
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Product URL
                </TabsTrigger>
                <TabsTrigger
                  value="csv"
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  CSV
                </TabsTrigger>
                <TabsTrigger
                  value="mobile"
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-8 pb-8 pt-5 overflow-y-auto flex-1 min-h-0">
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
        )}
      </DialogContent>
    </Dialog>
  );
}
