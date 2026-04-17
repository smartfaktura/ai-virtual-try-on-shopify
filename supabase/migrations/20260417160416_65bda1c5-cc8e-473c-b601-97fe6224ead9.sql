-- Create dedicated public bucket for shared demo product assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('demo-products', 'demo-products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read for demo-products
DROP POLICY IF EXISTS "Demo products are publicly readable" ON storage.objects;
CREATE POLICY "Demo products are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'demo-products');

-- Only admins can write to demo-products
DROP POLICY IF EXISTS "Admins can manage demo products" ON storage.objects;
CREATE POLICY "Admins can manage demo products"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'demo-products' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'demo-products' AND has_role(auth.uid(), 'admin'::app_role));