ALTER TABLE public.posts
ADD COLUMN is_repost BOOLEAN DEFAULT false,
ADD COLUMN reposted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN original_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
