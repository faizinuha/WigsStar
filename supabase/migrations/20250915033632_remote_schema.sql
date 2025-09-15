revoke delete on table "public"."hashtags" from "anon";

revoke insert on table "public"."hashtags" from "anon";

revoke references on table "public"."hashtags" from "anon";

revoke select on table "public"."hashtags" from "anon";

revoke trigger on table "public"."hashtags" from "anon";

revoke truncate on table "public"."hashtags" from "anon";

revoke update on table "public"."hashtags" from "anon";

revoke delete on table "public"."hashtags" from "authenticated";

revoke insert on table "public"."hashtags" from "authenticated";

revoke references on table "public"."hashtags" from "authenticated";

revoke select on table "public"."hashtags" from "authenticated";

revoke trigger on table "public"."hashtags" from "authenticated";

revoke truncate on table "public"."hashtags" from "authenticated";

revoke update on table "public"."hashtags" from "authenticated";

revoke delete on table "public"."hashtags" from "service_role";

revoke insert on table "public"."hashtags" from "service_role";

revoke references on table "public"."hashtags" from "service_role";

revoke select on table "public"."hashtags" from "service_role";

revoke trigger on table "public"."hashtags" from "service_role";

revoke truncate on table "public"."hashtags" from "service_role";

revoke update on table "public"."hashtags" from "service_role";

revoke delete on table "public"."post_hashtags" from "anon";

revoke insert on table "public"."post_hashtags" from "anon";

revoke references on table "public"."post_hashtags" from "anon";

revoke select on table "public"."post_hashtags" from "anon";

revoke trigger on table "public"."post_hashtags" from "anon";

revoke truncate on table "public"."post_hashtags" from "anon";

revoke update on table "public"."post_hashtags" from "anon";

revoke delete on table "public"."post_hashtags" from "authenticated";

revoke insert on table "public"."post_hashtags" from "authenticated";

revoke references on table "public"."post_hashtags" from "authenticated";

revoke select on table "public"."post_hashtags" from "authenticated";

revoke trigger on table "public"."post_hashtags" from "authenticated";

revoke truncate on table "public"."post_hashtags" from "authenticated";

revoke update on table "public"."post_hashtags" from "authenticated";

revoke delete on table "public"."post_hashtags" from "service_role";

revoke insert on table "public"."post_hashtags" from "service_role";

revoke references on table "public"."post_hashtags" from "service_role";

revoke select on table "public"."post_hashtags" from "service_role";

revoke trigger on table "public"."post_hashtags" from "service_role";

revoke truncate on table "public"."post_hashtags" from "service_role";

revoke update on table "public"."post_hashtags" from "service_role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_post(p_post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  DELETE FROM posts WHERE id = p_post_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.extract_and_store_hashtags(post_content text, post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_posts()
 RETURNS TABLE(id uuid, user_id uuid, caption text, location text, likes_count integer, comments_count integer, created_at timestamp with time zone, username text, display_name text, avatar_url text, media jsonb)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_trending_hashtags(limit_count integer)
 RETURNS TABLE(hashtag text, post_count bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    '#' || name as hashtag,
    posts_count::bigint as post_count
  FROM hashtags
  WHERE posts_count > 0
  ORDER BY posts_count DESC, updated_at DESC
  LIMIT limit_count;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_posts(p_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, caption text, location text, likes_count integer, comments_count integer, created_at timestamp with time zone, username text, display_name text, avatar_url text, media jsonb)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_post_hashtags()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.caption IS DISTINCT FROM NEW.caption) THEN
    PERFORM extract_and_store_hashtags(COALESCE(NEW.caption, ''), NEW.id);
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;


