-- Create user roles system
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create maintenance_mode table
CREATE TABLE IF NOT EXISTS public.maintenance_mode (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL UNIQUE,
  is_active boolean DEFAULT false,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'warning' CHECK (type IN ('info', 'warning', 'maintenance', 'blocked')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.maintenance_mode ENABLE ROW LEVEL SECURITY;

-- Policies for maintenance_mode
CREATE POLICY "Anyone can view maintenance status"
ON public.maintenance_mode
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage maintenance"
ON public.maintenance_mode
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_maintenance_mode_updated_at
BEFORE UPDATE ON public.maintenance_mode
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();