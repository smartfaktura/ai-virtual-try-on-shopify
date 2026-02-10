
-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS on user_roles
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Custom scenes table
CREATE TABLE public.custom_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'lifestyle',
  image_url text NOT NULL,
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active scenes"
  ON public.custom_scenes FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert scenes"
  ON public.custom_scenes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update scenes"
  ON public.custom_scenes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scenes"
  ON public.custom_scenes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Custom models table
CREATE TABLE public.custom_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL DEFAULT '',
  body_type text NOT NULL DEFAULT '',
  ethnicity text NOT NULL DEFAULT '',
  age_range text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active models"
  ON public.custom_models FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert models"
  ON public.custom_models FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update models"
  ON public.custom_models FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete models"
  ON public.custom_models FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Featured items table
CREATE TABLE public.featured_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,
  item_id text NOT NULL,
  featured_by uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_type, item_id)
);
ALTER TABLE public.featured_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view featured items"
  ON public.featured_items FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert featured items"
  ON public.featured_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete featured items"
  ON public.featured_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
