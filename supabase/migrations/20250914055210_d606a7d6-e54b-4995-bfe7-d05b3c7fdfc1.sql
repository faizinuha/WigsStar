-- Fix security warnings for functions

-- Fix search path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
$function$;

-- Fix search path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix search path for get_trending_hashtags function
CREATE OR REPLACE FUNCTION public.get_trending_hashtags(limit_count integer)
RETURNS TABLE(hashtag text, post_count bigint)
LANGUAGE sql
SET search_path = 'public'
AS $function$
  select
    unnest(regexp_matches(caption, '#\w+', 'g')) as hashtag,
    count(*) as post_count
  from posts
  where created_at > now() - interval '7 days'
  group by hashtag
  order by post_count desc
  limit limit_count;
$function$;