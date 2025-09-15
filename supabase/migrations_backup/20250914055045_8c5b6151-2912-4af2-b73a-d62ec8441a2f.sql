-- Add missing foreign key relationships between tables

-- Add foreign keys for posts table
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign keys for comments table
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE public.comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_meme_id_fkey;
ALTER TABLE public.comments 
ADD CONSTRAINT comments_meme_id_fkey 
FOREIGN KEY (meme_id) REFERENCES public.memes(id) ON DELETE CASCADE;

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey;
ALTER TABLE public.comments 
ADD CONSTRAINT comments_parent_comment_id_fkey 
FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;

-- Add foreign keys for likes table
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.likes 
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_post_id_fkey;
ALTER TABLE public.likes 
ADD CONSTRAINT likes_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_meme_id_fkey;
ALTER TABLE public.likes 
ADD CONSTRAINT likes_meme_id_fkey 
FOREIGN KEY (meme_id) REFERENCES public.memes(id) ON DELETE CASCADE;

-- Add foreign keys for memes table
ALTER TABLE public.memes DROP CONSTRAINT IF EXISTS memes_user_id_fkey;
ALTER TABLE public.memes 
ADD CONSTRAINT memes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign keys for notifications table
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_from_user_id_fkey;
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_from_user_id_fkey 
FOREIGN KEY (from_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_post_id_fkey;
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_meme_id_fkey;
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_meme_id_fkey 
FOREIGN KEY (meme_id) REFERENCES public.memes(id) ON DELETE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_comment_id_fkey;
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_comment_id_fkey 
FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;

-- Add foreign keys for post_media table
ALTER TABLE public.post_media DROP CONSTRAINT IF EXISTS post_media_post_id_fkey;
ALTER TABLE public.post_media 
ADD CONSTRAINT post_media_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- Add foreign keys for stories table
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;
ALTER TABLE public.stories 
ADD CONSTRAINT stories_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign keys for user_settings table
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
ALTER TABLE public.user_settings 
ADD CONSTRAINT user_settings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign keys for followers table
ALTER TABLE public.followers DROP CONSTRAINT IF EXISTS followers_follower_id_fkey;
ALTER TABLE public.followers 
ADD CONSTRAINT followers_follower_id_fkey 
FOREIGN KEY (follower_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.followers DROP CONSTRAINT IF EXISTS followers_following_id_fkey;
ALTER TABLE public.followers 
ADD CONSTRAINT followers_following_id_fkey 
FOREIGN KEY (following_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add unique constraint to avoid duplicate follows
ALTER TABLE public.followers DROP CONSTRAINT IF EXISTS unique_follower_following;
ALTER TABLE public.followers 
ADD CONSTRAINT unique_follower_following 
UNIQUE (follower_id, following_id);

-- Add unique constraint to avoid duplicate likes
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS unique_user_post_like;
ALTER TABLE public.likes 
ADD CONSTRAINT unique_user_post_like 
UNIQUE (user_id, post_id);

ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS unique_user_meme_like;
ALTER TABLE public.likes 
ADD CONSTRAINT unique_user_meme_like 
UNIQUE (user_id, meme_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers(following_id);
