-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all profiles
CREATE POLICY "Allow authenticated users to view profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all posts
CREATE POLICY "Allow authenticated users to view posts"
ON public.posts FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow users to create their own posts
CREATE POLICY "Allow users to create their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Allow users to update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);
