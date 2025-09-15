-- Fix function search path issues by setting proper search paths

-- Fix get_trending_hashtags function
CREATE OR REPLACE FUNCTION public.get_trending_hashtags(limit_count integer)
RETURNS TABLE(hashtag text, post_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    '#' || name as hashtag,
    posts_count::bigint as post_count
  FROM hashtags
  WHERE posts_count > 0
  ORDER BY posts_count DESC, updated_at DESC
  LIMIT limit_count;
$$;

-- Fix extract_and_store_hashtags function  
CREATE OR REPLACE FUNCTION public.extract_and_store_hashtags(post_content TEXT, post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Fix handle_post_hashtags function
CREATE OR REPLACE FUNCTION public.handle_post_hashtags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.caption IS DISTINCT FROM NEW.caption) THEN
    PERFORM extract_and_store_hashtags(COALESCE(NEW.caption, ''), NEW.id);
  END IF;
  RETURN NEW;
END;
$$;