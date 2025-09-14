-- Function to delete a post
CREATE OR REPLACE FUNCTION public.delete_post(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM posts WHERE id = p_post_id;
END;
$$;
