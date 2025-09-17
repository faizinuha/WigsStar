
CREATE TABLE public.badges (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.badges IS 'Stores available badges for memes.';

CREATE TABLE public.meme_badges (
  meme_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  badge_id BIGINT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (meme_id, badge_id)
);

COMMENT ON TABLE public.meme_badges IS 'Associates memes with badges.';

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meme_badges ENABLE ROW LEVEL SECURITY;

-- Policies for badges
CREATE POLICY "Badges are viewable by everyone." ON public.badges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create new badges." ON public.badges FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for meme_badges
CREATE POLICY "Meme-badge links are viewable by everyone." ON public.meme_badges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add badges to memes." ON public.meme_badges FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can''t delete badge connections." ON public.meme_badges FOR DELETE USING (false);


-- Pre-populate some badges
INSERT INTO public.badges (name) VALUES
('Funny'),
('Dark'),
('Cringe'),
('Relatable'),
('Wholesome'),
('OC'),
('Wow'),
('Keren');

-- Add a function to get memes with badges
CREATE OR REPLACE FUNCTION get_memes_with_badges()
RETURNS TABLE(
    id uuid,
    user_id uuid,
    caption text,
    media_url text,
    media_type text,
    created_at timestamptz,
    likes_count integer,
    comments_count integer,
    "user" json,
    badges json[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.user_id,
        m.caption,
        m.media_url,
        m.media_type,
        m.created_at,
        m.likes_count,
        m.comments_count,
        json_build_object(
            'id', p.user_id,
            'username', p.username,
            'displayName', p.display_name,
            'avatar', p.avatar_url
        ) as "user",
        ARRAY(
            SELECT json_build_object('id', b.id, 'name', b.name)
            FROM public.meme_badges mb
            JOIN public.badges b ON mb.badge_id = b.id
            WHERE mb.meme_id = m.id
        ) as badges
    FROM
        public.memes m
    JOIN
        public.profiles p ON m.user_id = p.user_id
    ORDER BY
        m.created_at DESC;
END;
$$;
