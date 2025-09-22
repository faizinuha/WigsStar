-- Enable RLS on the likes table.
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read likes.
CREATE POLICY "Likes are viewable by everyone."
  ON public.likes FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own likes.
CREATE POLICY "Users can insert their own likes."
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes (un-liking).
CREATE POLICY "Users can delete their own likes."
  ON public.likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
