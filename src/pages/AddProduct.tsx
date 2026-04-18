import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Globe, FileSpreadsheet, Smartphone, ShoppingBag } from 'lucide-react';
import { ManualProductTab } from '@/components/app/ManualProductTab';
import { StoreImportTab } from '@/components/app/StoreImportTab';
import { CsvImportTab } from '@/components/app/CsvImportTab';
import { MobileUploadTab } from '@/components/app/MobileUploadTab';
import { ShopifyImportTab } from '@/components/app/ShopifyImportTab';
import { ProductUploadTips } from '@/components/app/ProductUploadTips';
import { PageHeader } from '@/components/app/PageHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [activeTab, setActiveTab] = useState('manual');

  const { data: editingProduct } = useQuery({
    queryKey: ['user-product', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as UserProduct;
    },
    enabled: !!id && !!user,
  });

  const handleDone = () => {
    queryClient.invalidateQueries({ queryKey: ['user-products'] });
    queryClient.invalidateQueries({ queryKey: ['product-image-counts'] });
    navigate('/app/products');
  };

  return (
    <PageHeader
      title={isEditing ? 'Edit Product' : 'Add Products'}
      subtitle={
        isEditing
          ? 'Update your product details and images.'
          : 'Add your product images to start generating visuals.'
      }
      backAction={{ content: 'Products', onAction: handleDone }}
    >
      <div className="hidden sm:block">
        <ProductUploadTips />
      </div>

      {isEditing ? (
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          {editingProduct && (
            <ManualProductTab
              onProductAdded={handleDone}
              onClose={handleDone}
              editingProduct={editingProduct}
            />
          )}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/60 rounded-xl p-1 h-auto inline-flex gap-1 w-auto overflow-x-auto flex-nowrap max-w-full">
            <TabsTrigger
              value="manual"
              className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="store"
              className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5 shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Product </span>URL
            </TabsTrigger>
            <TabsTrigger
              value="csv"
              className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5 shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              CSV
            </TabsTrigger>
            {!isMobile && (
              <TabsTrigger
                value="mobile"
                className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5 shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </TabsTrigger>
            )}
            <TabsTrigger
              value="shopify"
              className="rounded-lg px-3 sm:px-4 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm bg-transparent text-muted-foreground hover:text-foreground transition-all gap-1.5 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Shopify
            </TabsTrigger>
          </TabsList>

          <div className="pt-6 rounded-2xl border bg-card p-4 sm:p-6 mt-4">
            <TabsContent value="manual" className="mt-0">
              <ManualProductTab onProductAdded={handleDone} onClose={handleDone} />
            </TabsContent>
            <TabsContent value="store" className="mt-0">
              <StoreImportTab onProductAdded={handleDone} onClose={handleDone} onSwitchToUpload={() => setActiveTab('manual')} />
            </TabsContent>
            <TabsContent value="csv" className="mt-0">
              <CsvImportTab onProductAdded={handleDone} onClose={handleDone} />
            </TabsContent>
            {!isMobile && (
              <TabsContent value="mobile" className="mt-0">
                <MobileUploadTab onProductAdded={handleDone} onClose={handleDone} />
              </TabsContent>
            )}
            <TabsContent value="shopify" className="mt-0">
              <ShopifyImportTab onProductAdded={handleDone} onClose={handleDone} />
            </TabsContent>
          </div>
          <div className="sm:hidden mt-6">
            <ProductUploadTips />
          </div>
        </Tabs>
      )}
    </PageHeader>
  );
}