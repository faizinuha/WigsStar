-- Create hashtags table to store hashtags properly
CREATE TABLE public.hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hashtags table
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;

-- Create policies for hashtags
CREATE POLICY "Hashtags are viewable by everyone"
ON public.hashtags
FOR SELECT
USING (true);

CREATE POLICY "System can create hashtags"
ON public.hashtags
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update hashtag counts"
ON public.hashtags
FOR UPDATE
USING (true);

-- Create junction table for post_hashtags
CREATE TABLE public.post_hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, hashtag_id)
);

-- Enable RLS on post_hashtags
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- Create policies for post_hashtags
CREATE POLICY "Post hashtags are viewable by everyone"
ON public.post_hashtags
FOR SELECT
USING (true);

CREATE POLICY "System can create post hashtags"
ON public.post_hashtags
FOR INSERT
WITH CHECK (true);

-- Function to extract and store hashtags from post content
CREATE OR REPLACE FUNCTION public.extract_and_store_hashtags(post_content TEXT, post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hashtag_match TEXT;
  hashtag_name TEXT;
  hashtag_record RECORD;
BEGIN
  -- Clear existing hashtags for this post
  DELETE FROM post_hashtags WHERE post_hashtags.post_id = extract_and_store_hashtags.post_id;
  
  -- Extract hashtags from content
  FOR hashtag_match IN 
    SELECT unnest(regexp_matches(post_content, '#(\w+)', 'g'))
  LOOP
    hashtag_name := lower(hashtag_match);
    
    -- Insert or get existing hashtag
    INSERT INTO hashtags (name, posts_count)
    VALUES (hashtag_name, 1)
    ON CONFLICT (name) 
    DO UPDATE SET 
      posts_count = hashtags.posts_count + 1,
      updated_at = now()
    RETURNING * INTO hashtag_record;
    
    -- If we didn't get a record from INSERT, get it from SELECT
    IF hashtag_record.id IS NULL THEN
      SELECT * INTO hashtag_record FROM hashtags WHERE name = hashtag_name;
      UPDATE hashtags SET posts_count = posts_count + 1, updated_at = now() WHERE id = hashtag_record.id;
    END IF;
    
    -- Link hashtag to post
    INSERT INTO post_hashtags (post_id, hashtag_id)
    VALUES (extract_and_store_hashtags.post_id, hashtag_record.id)
    ON CONFLICT (post_id, hashtag_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Function to get trending hashtags (update existing)
CREATE OR REPLACE FUNCTION public.get_trending_hashtags(limit_count integer)
RETURNS TABLE(hashtag text, post_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    '#' || name as hashtag,
    posts_count::bigint as post_count
  FROM hashtags
  WHERE posts_count > 0
  ORDER BY posts_count DESC, updated_at DESC
  LIMIT limit_count;
$$;

-- Trigger to automatically extract hashtags when posts are created/updated
CREATE OR REPLACE FUNCTION public.handle_post_hashtags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.caption IS DISTINCT FROM NEW.caption) THEN
    PERFORM extract_and_store_hashtags(COALESCE(NEW.caption, ''), NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for posts
CREATE TRIGGER extract_hashtags_trigger
  AFTER INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_hashtags();

-- Create trigger for memes as well
CREATE TRIGGER extract_hashtags_memes_trigger
  AFTER INSERT OR UPDATE ON public.memes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_hashtags();

-- Add indexes for better performance
CREATE INDEX idx_hashtags_name ON public.hashtags(name);
CREATE INDEX idx_hashtags_posts_count ON public.hashtags(posts_count DESC);
CREATE INDEX idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag_id ON public.post_hashtags(hashtag_id);

-- Update updated_at trigger for hashtags
CREATE TRIGGER update_hashtags_updated_at
  BEFORE UPDATE ON public.hashtags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();