-- Add missing foreign key relationships (checking if not exists)

-- Add foreign keys for posts table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'posts_user_id_fkey' AND table_name = 'posts') THEN
        ALTER TABLE public.posts 
        ADD CONSTRAINT posts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign keys for comments table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'comments_user_id_fkey' AND table_name = 'comments') THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'comments_post_id_fkey' AND table_name = 'comments') THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'comments_meme_id_fkey' AND table_name = 'comments') THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_meme_id_fkey 
        FOREIGN KEY (meme_id) REFERENCES public.memes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign keys for likes table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'likes_user_id_fkey' AND table_name = 'likes') THEN
        ALTER TABLE public.likes 
        ADD CONSTRAINT likes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'likes_post_id_fkey' AND table_name = 'likes') THEN
        ALTER TABLE public.likes 
        ADD CONSTRAINT likes_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign keys for memes table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'memes_user_id_fkey' AND table_name = 'memes') THEN
        ALTER TABLE public.memes 
        ADD CONSTRAINT memes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign keys for stories table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'stories_user_id_fkey' AND table_name = 'stories') THEN
        ALTER TABLE public.stories 
        ADD CONSTRAINT stories_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_user_id') THEN
        CREATE INDEX idx_posts_user_id ON public.posts(user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_post_id') THEN
        CREATE INDEX idx_comments_post_id ON public.comments(post_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_user_id') THEN
        CREATE INDEX idx_comments_user_id ON public.comments(user_id);
    END IF;
END $$;