
ALTER TABLE public.product_image_scenes
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER update_product_image_scenes_updated_at
BEFORE UPDATE ON public.product_image_scenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
