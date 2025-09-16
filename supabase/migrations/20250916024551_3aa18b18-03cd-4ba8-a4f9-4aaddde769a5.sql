-- Create functions to manage follower/following counts
CREATE OR REPLACE FUNCTION public.increment_followers_count(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.profiles
  SET followers_count = followers_count + 1
  WHERE profiles.user_id = increment_followers_count.user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_followers_count(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.profiles
  SET followers_count = GREATEST(0, followers_count - 1)
  WHERE profiles.user_id = decrement_followers_count.user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_following_count(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.profiles
  SET following_count = following_count + 1
  WHERE profiles.user_id = increment_following_count.user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_following_count(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.profiles
  SET following_count = GREATEST(0, following_count - 1)
  WHERE profiles.user_id = decrement_following_count.user_id;
END;
$function$;

-- Fix the handle_user_deletion function to actually work with user_id parameter
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  -- Delete from profiles table
  delete from public.profiles where user_id = old.id;
  
  -- Delete from posts table  
  delete from public.posts where user_id = old.id;
  
  -- Delete from comments table
  delete from public.comments where user_id = old.id;
  
  -- Delete from likes table
  delete from public.likes where user_id = old.id;
  
  -- Delete from user_settings table
  delete from public.user_settings where user_id = old.id;
  
  -- Delete from followers table (both as follower and following)
  delete from public.followers where follower_id = old.id OR following_id = old.id;
  
  -- Delete from notifications table
  delete from public.notifications where user_id = old.id OR from_user_id = old.id;
  delete from public.user_notifications where user_id = old.id;
  
  -- Delete from stories table
  delete from public.stories where user_id = old.id;
  
  -- Delete from memes table
  delete from public.memes where user_id = old.id;
  
  -- Delete storage files
  delete from storage.objects where owner = old.id::text;
  
  return old;
end;
$function$;

-- Create a separate function for edge functions to call
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  -- Delete from profiles table
  delete from public.profiles where user_id = target_user_id;
  
  -- Delete from posts table  
  delete from public.posts where user_id = target_user_id;
  
  -- Delete from comments table
  delete from public.comments where user_id = target_user_id;
  
  -- Delete from likes table
  delete from public.likes where user_id = target_user_id;
  
  -- Delete from user_settings table
  delete from public.user_settings where user_id = target_user_id;
  
  -- Delete from followers table (both as follower and following)
  delete from public.followers where follower_id = target_user_id OR following_id = target_user_id;
  
  -- Delete from notifications table
  delete from public.notifications where user_id = target_user_id OR from_user_id = target_user_id;
  delete from public.user_notifications where user_id = target_user_id;
  
  -- Delete from stories table
  delete from public.stories where user_id = target_user_id;
  
  -- Delete from memes table
  delete from public.memes where user_id = target_user_id;
  
  -- Delete storage files
  delete from storage.objects where owner = target_user_id::text;
end;
$function$;