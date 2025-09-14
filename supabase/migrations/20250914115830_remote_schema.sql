drop extension if exists "pg_net";

drop policy "Allow authenticated users to view posts" on "public"."posts";

drop policy "Allow users to create their own posts" on "public"."posts";

drop policy "Allow users to delete their own posts" on "public"."posts";

drop policy "Allow users to update their own posts" on "public"."posts";

drop policy "Allow authenticated users to view profiles" on "public"."profiles";

drop policy "Allow users to update their own profile" on "public"."profiles";

revoke delete on table "public"."comments" from "anon";

revoke insert on table "public"."comments" from "anon";

revoke references on table "public"."comments" from "anon";

revoke select on table "public"."comments" from "anon";

revoke trigger on table "public"."comments" from "anon";

revoke truncate on table "public"."comments" from "anon";

revoke update on table "public"."comments" from "anon";

revoke delete on table "public"."comments" from "authenticated";

revoke insert on table "public"."comments" from "authenticated";

revoke references on table "public"."comments" from "authenticated";

revoke select on table "public"."comments" from "authenticated";

revoke trigger on table "public"."comments" from "authenticated";

revoke truncate on table "public"."comments" from "authenticated";

revoke update on table "public"."comments" from "authenticated";

revoke delete on table "public"."comments" from "service_role";

revoke insert on table "public"."comments" from "service_role";

revoke references on table "public"."comments" from "service_role";

revoke select on table "public"."comments" from "service_role";

revoke trigger on table "public"."comments" from "service_role";

revoke truncate on table "public"."comments" from "service_role";

revoke update on table "public"."comments" from "service_role";

revoke delete on table "public"."followers" from "anon";

revoke insert on table "public"."followers" from "anon";

revoke references on table "public"."followers" from "anon";

revoke select on table "public"."followers" from "anon";

revoke trigger on table "public"."followers" from "anon";

revoke truncate on table "public"."followers" from "anon";

revoke update on table "public"."followers" from "anon";

revoke delete on table "public"."followers" from "authenticated";

revoke insert on table "public"."followers" from "authenticated";

revoke references on table "public"."followers" from "authenticated";

revoke select on table "public"."followers" from "authenticated";

revoke trigger on table "public"."followers" from "authenticated";

revoke truncate on table "public"."followers" from "authenticated";

revoke update on table "public"."followers" from "authenticated";

revoke delete on table "public"."followers" from "service_role";

revoke insert on table "public"."followers" from "service_role";

revoke references on table "public"."followers" from "service_role";

revoke select on table "public"."followers" from "service_role";

revoke trigger on table "public"."followers" from "service_role";

revoke truncate on table "public"."followers" from "service_role";

revoke update on table "public"."followers" from "service_role";

revoke delete on table "public"."likes" from "anon";

revoke insert on table "public"."likes" from "anon";

revoke references on table "public"."likes" from "anon";

revoke select on table "public"."likes" from "anon";

revoke trigger on table "public"."likes" from "anon";

revoke truncate on table "public"."likes" from "anon";

revoke update on table "public"."likes" from "anon";

revoke delete on table "public"."likes" from "authenticated";

revoke insert on table "public"."likes" from "authenticated";

revoke references on table "public"."likes" from "authenticated";

revoke select on table "public"."likes" from "authenticated";

revoke trigger on table "public"."likes" from "authenticated";

revoke truncate on table "public"."likes" from "authenticated";

revoke update on table "public"."likes" from "authenticated";

revoke delete on table "public"."likes" from "service_role";

revoke insert on table "public"."likes" from "service_role";

revoke references on table "public"."likes" from "service_role";

revoke select on table "public"."likes" from "service_role";

revoke trigger on table "public"."likes" from "service_role";

revoke truncate on table "public"."likes" from "service_role";

revoke update on table "public"."likes" from "service_role";

revoke delete on table "public"."memes" from "anon";

revoke insert on table "public"."memes" from "anon";

revoke references on table "public"."memes" from "anon";

revoke select on table "public"."memes" from "anon";

revoke trigger on table "public"."memes" from "anon";

revoke truncate on table "public"."memes" from "anon";

revoke update on table "public"."memes" from "anon";

revoke delete on table "public"."memes" from "authenticated";

revoke insert on table "public"."memes" from "authenticated";

revoke references on table "public"."memes" from "authenticated";

revoke select on table "public"."memes" from "authenticated";

revoke trigger on table "public"."memes" from "authenticated";

revoke truncate on table "public"."memes" from "authenticated";

revoke update on table "public"."memes" from "authenticated";

revoke delete on table "public"."memes" from "service_role";

revoke insert on table "public"."memes" from "service_role";

revoke references on table "public"."memes" from "service_role";

revoke select on table "public"."memes" from "service_role";

revoke trigger on table "public"."memes" from "service_role";

revoke truncate on table "public"."memes" from "service_role";

revoke update on table "public"."memes" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."notifications" from "service_role";

revoke insert on table "public"."notifications" from "service_role";

revoke references on table "public"."notifications" from "service_role";

revoke select on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

revoke update on table "public"."notifications" from "service_role";

revoke delete on table "public"."post_media" from "anon";

revoke insert on table "public"."post_media" from "anon";

revoke references on table "public"."post_media" from "anon";

revoke select on table "public"."post_media" from "anon";

revoke trigger on table "public"."post_media" from "anon";

revoke truncate on table "public"."post_media" from "anon";

revoke update on table "public"."post_media" from "anon";

revoke delete on table "public"."post_media" from "authenticated";

revoke insert on table "public"."post_media" from "authenticated";

revoke references on table "public"."post_media" from "authenticated";

revoke select on table "public"."post_media" from "authenticated";

revoke trigger on table "public"."post_media" from "authenticated";

revoke truncate on table "public"."post_media" from "authenticated";

revoke update on table "public"."post_media" from "authenticated";

revoke delete on table "public"."post_media" from "service_role";

revoke insert on table "public"."post_media" from "service_role";

revoke references on table "public"."post_media" from "service_role";

revoke select on table "public"."post_media" from "service_role";

revoke trigger on table "public"."post_media" from "service_role";

revoke truncate on table "public"."post_media" from "service_role";

revoke update on table "public"."post_media" from "service_role";

revoke delete on table "public"."posts" from "anon";

revoke insert on table "public"."posts" from "anon";

revoke references on table "public"."posts" from "anon";

revoke select on table "public"."posts" from "anon";

revoke trigger on table "public"."posts" from "anon";

revoke truncate on table "public"."posts" from "anon";

revoke update on table "public"."posts" from "anon";

revoke delete on table "public"."posts" from "authenticated";

revoke insert on table "public"."posts" from "authenticated";

revoke references on table "public"."posts" from "authenticated";

revoke select on table "public"."posts" from "authenticated";

revoke trigger on table "public"."posts" from "authenticated";

revoke truncate on table "public"."posts" from "authenticated";

revoke update on table "public"."posts" from "authenticated";

revoke delete on table "public"."posts" from "service_role";

revoke insert on table "public"."posts" from "service_role";

revoke references on table "public"."posts" from "service_role";

revoke select on table "public"."posts" from "service_role";

revoke trigger on table "public"."posts" from "service_role";

revoke truncate on table "public"."posts" from "service_role";

revoke update on table "public"."posts" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."stories" from "anon";

revoke insert on table "public"."stories" from "anon";

revoke references on table "public"."stories" from "anon";

revoke select on table "public"."stories" from "anon";

revoke trigger on table "public"."stories" from "anon";

revoke truncate on table "public"."stories" from "anon";

revoke update on table "public"."stories" from "anon";

revoke delete on table "public"."stories" from "authenticated";

revoke insert on table "public"."stories" from "authenticated";

revoke references on table "public"."stories" from "authenticated";

revoke select on table "public"."stories" from "authenticated";

revoke trigger on table "public"."stories" from "authenticated";

revoke truncate on table "public"."stories" from "authenticated";

revoke update on table "public"."stories" from "authenticated";

revoke delete on table "public"."stories" from "service_role";

revoke insert on table "public"."stories" from "service_role";

revoke references on table "public"."stories" from "service_role";

revoke select on table "public"."stories" from "service_role";

revoke trigger on table "public"."stories" from "service_role";

revoke truncate on table "public"."stories" from "service_role";

revoke update on table "public"."stories" from "service_role";

revoke delete on table "public"."user_settings" from "anon";

revoke insert on table "public"."user_settings" from "anon";

revoke references on table "public"."user_settings" from "anon";

revoke select on table "public"."user_settings" from "anon";

revoke trigger on table "public"."user_settings" from "anon";

revoke truncate on table "public"."user_settings" from "anon";

revoke update on table "public"."user_settings" from "anon";

revoke delete on table "public"."user_settings" from "authenticated";

revoke insert on table "public"."user_settings" from "authenticated";

revoke references on table "public"."user_settings" from "authenticated";

revoke select on table "public"."user_settings" from "authenticated";

revoke trigger on table "public"."user_settings" from "authenticated";

revoke truncate on table "public"."user_settings" from "authenticated";

revoke update on table "public"."user_settings" from "authenticated";

revoke delete on table "public"."user_settings" from "service_role";

revoke insert on table "public"."user_settings" from "service_role";

revoke references on table "public"."user_settings" from "service_role";

revoke select on table "public"."user_settings" from "service_role";

revoke trigger on table "public"."user_settings" from "service_role";

revoke truncate on table "public"."user_settings" from "service_role";

revoke update on table "public"."user_settings" from "service_role";

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
 SET search_path TO 'public'
AS $function$
  select
    unnest(regexp_matches(caption, '#\w+', 'g')) as hashtag,
    count(*) as post_count
  from posts
  where created_at > now() - interval '7 days'
  group by hashtag
  order by post_count desc
  limit limit_count;
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


  create policy "Enable insert for authenticated users only"
  on "public"."post_media"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."post_media"
  as permissive
  for select
  to public
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."posts"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."posts"
  as permissive
  for select
  to public
using (true);



