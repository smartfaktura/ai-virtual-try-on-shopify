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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        {editingProduct ? (
          <ManualProductTab
            onProductAdded={onProductAdded}
            onClose={handleClose}
            editingProduct={editingProduct}
          />
        ) : (
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manual" className="text-xs gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="store" className="text-xs gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Store URL</span>
              </TabsTrigger>
              <TabsTrigger value="csv" className="text-xs gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="text-xs gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <ManualProductTab onProductAdded={onProductAdded} onClose={handleClose} />
            </TabsContent>

            <TabsContent value="store">
              <StoreImportTab onProductAdded={onProductAdded} onClose={handleClose} />
            </TabsContent>

            <TabsContent value="csv">
              <CsvImportTab onProductAdded={onProductAdded} onClose={handleClose} />
            </TabsContent>

            <TabsContent value="mobile">
              <MobileUploadTab onProductAdded={onProductAdded} onClose={handleClose} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
