-- Drop all problematic policies on group_members that cause recursion
DROP POLICY IF EXISTS "Users can view other members in same groups" ON public.group_members;
DROP POLICY IF EXISTS "Allow Self-Insert" ON public.group_members;
DROP POLICY IF EXISTS "Allow Self-Delete" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can add members." ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups." ON public.group_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.group_members;

-- Create simple, non-recursive policies for group_members
CREATE POLICY "Users can view their own memberships"
ON public.group_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Group creators can add members"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_members.group_id 
    AND groups.creator_id = auth.uid()
  )
);

-- Create security definer function to get user's groups safely
CREATE OR REPLACE FUNCTION public.get_user_groups(p_user_id uuid)
RETURNS TABLE(group_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id
  FROM public.group_members
  WHERE user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_groups(uuid) TO authenticated;

-- Drop and recreate get_conversations with new signature
DROP FUNCTION IF EXISTS public.get_conversations(uuid);

CREATE OR REPLACE FUNCTION public.get_conversations(current_user_id uuid)
RETURNS TABLE(
  id text,
  is_group boolean,
  name text,
  avatar_url text,
  last_message text,
  last_message_at timestamp with time zone,
  unread_count bigint,
  description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_groups AS (
    SELECT group_id FROM public.get_user_groups(current_user_id)
  ),
  last_messages AS (
    SELECT
      m.id as message_id,
      m.content,
      m.created_at,
      m.group_id,
      m.sender_id,
      m.receiver_id,
      CASE
        WHEN m.group_id IS NULL THEN
          CASE
            WHEN m.sender_id = current_user_id THEN m.receiver_id
            ELSE m.sender_id
          END
        ELSE NULL
      END as dm_partner_id,
      ROW_NUMBER() OVER(
        PARTITION BY
          CASE
            WHEN m.group_id IS NOT NULL THEN m.group_id::text
            ELSE LEAST(m.sender_id, m.receiver_id)::text || GREATEST(m.sender_id, m.receiver_id)::text
          END
        ORDER BY m.created_at DESC
      ) as rn
    FROM messages m
    WHERE m.sender_id = current_user_id
       OR m.receiver_id = current_user_id
       OR m.group_id IN (SELECT group_id FROM user_groups)
  )
  SELECT
    g.id::text,
    true as is_group,
    g.name,
    null::text as avatar_url,
    lm.content as last_message,
    lm.created_at as last_message_at,
    COALESCE((
      SELECT COUNT(*)::bigint
      FROM messages m
      LEFT JOIN read_receipts rr ON m.id = rr.message_id AND rr.user_id = current_user_id
      WHERE m.group_id = g.id AND m.sender_id != current_user_id AND rr.message_id IS NULL
    ), 0) as unread_count,
    g.description
  FROM user_groups ug
  JOIN groups g ON ug.group_id = g.id
  LEFT JOIN last_messages lm ON lm.group_id = g.id AND lm.rn = 1

  UNION ALL

  SELECT
    p.user_id::text,
    false as is_group,
    p.username as name,
    p.avatar_url,
    lm.content as last_message,
    lm.created_at as last_message_at,
    COALESCE((
      SELECT COUNT(*)::bigint
      FROM messages m
      LEFT JOIN read_receipts rr ON m.id = rr.message_id AND rr.user_id = current_user_id
      WHERE m.sender_id = p.user_id AND m.receiver_id = current_user_id AND rr.message_id IS NULL
    ), 0) as unread_count,
    null::text as description
  FROM (
    SELECT DISTINCT other_user_id
    FROM (
      SELECT receiver_id as other_user_id FROM messages WHERE sender_id = current_user_id AND group_id IS NULL
      UNION
      SELECT sender_id as other_user_id FROM messages WHERE receiver_id = current_user_id AND group_id IS NULL
    ) as partners
  ) AS conversation_partners
  JOIN profiles p ON p.user_id = conversation_partners.other_user_id
  LEFT JOIN last_messages lm ON lm.dm_partner_id = p.user_id AND lm.rn = 1
  ORDER BY last_message_at DESC NULLS LAST;
END;
$$;