
-- Create product_images table for multi-image support
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.user_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_user_id ON public.product_images(user_id);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only CRUD their own images
CREATE POLICY "Users can view their own product images"
ON public.product_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product images"
ON public.product_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product images"
ON public.product_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product images"
ON public.product_images FOR DELETE
USING (auth.uid() = user_id);
