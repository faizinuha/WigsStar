-- Function to get all posts with profile information
CREATE OR REPLACE FUNCTION public.get_all_posts()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  caption text,
  location text,
  likes_count integer,
  comments_count integer,
  created_at timestamp with time zone,
  username text,
  display_name text,
  avatar_url text,
  media jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.caption,
    p.location,
    p.likes_count,
    p.comments_count,
    p.created_at,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'media_url', pm.media_url,
          'media_type', pm.media_type
        )
      )
      FROM post_media pm
      WHERE pm.post_id = p.id
    ) as media
  FROM posts p
  JOIN profiles pr ON p.user_id = pr.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to get all posts for a specific user with profile information
CREATE OR REPLACE FUNCTION public.get_user_posts(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  caption text,
  location text,
  likes_count integer,
  comments_count integer,
  created_at timestamp with time zone,
  username text,
  display_name text,
  avatar_url text,
  media jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.caption,
    p.location,
    p.likes_count,
    p.comments_count,
    p.created_at,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'media_url', pm.media_url,
          'media_type', pm.media_type
        )
      )
      FROM post_media pm
      WHERE pm.post_id = p.id
    ) as media
  FROM posts p
  JOIN profiles pr ON p.user_id = pr.user_id
  WHERE p.user_id = p_user_id
  ORDER BY p.created_at DESC;
END;
$$;
