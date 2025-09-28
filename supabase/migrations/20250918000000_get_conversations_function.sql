CREATE OR REPLACE FUNCTION get_conversations(current_user_id bigint)
RETURNS TABLE (
  id text,
  is_group boolean,
  name text,
  avatar_url text,
  last_message text,
  last_message_at timestamptz,
  unread_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH last_messages AS (
    -- Get the last message for each conversation (group and direct)
    SELECT
      conversation_key,
      content,
      created_at,
      message_id,
      ROW_NUMBER() OVER(PARTITION BY conversation_key ORDER BY created_at DESC) as rn
    FROM (
      -- Group messages
      SELECT
        group_id::text as conversation_key,
        content,
        created_at,
        messages.id as message_id
      FROM messages
      WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = current_user_id)

      UNION ALL

      -- Direct messages
      SELECT
        LEAST(sender_id, receiver_id)::text || ':' || GREATEST(sender_id, receiver_id)::text as conversation_key,
        content,
        created_at,
        messages.id as message_id
      FROM messages
      WHERE (sender_id = current_user_id OR receiver_id = current_user_id) AND group_id IS NULL
    ) AS all_messages
  )
  -- Fetch Group Conversations
  SELECT
    g.id::text as id,
    true as is_group,
    g.name,
    null as avatar_url, -- groups table has no avatar_url
    lm.content as last_message,
    lm.created_at as last_message_at,
    (SELECT COUNT(*) FROM messages m WHERE m.group_id = g.id AND m.id NOT IN (SELECT message_id FROM read_receipts WHERE user_id = current_user_id)) as unread_count
  FROM groups g
  JOIN group_members gm ON g.id = gm.group_id
  LEFT JOIN last_messages lm ON lm.conversation_key = g.id::text AND lm.rn = 1
  WHERE gm.user_id = current_user_id

  UNION ALL

  -- Fetch 1-on-1 Conversations
  SELECT
    p.id::text as id, -- The other user's ID will serve as the conversation ID on the client
    false as is_group,
    p.username as name, -- Assuming profiles has a username column
    p.avatar_url,
    lm.content as last_message,
    lm.created_at as last_message_at,
    (SELECT COUNT(*) FROM messages m WHERE m.sender_id = p.id AND m.receiver_id = current_user_id AND m.id NOT IN (SELECT message_id FROM read_receipts WHERE user_id = current_user_id)) as unread_count
  FROM (
    -- Find all unique users the current user has chatted with
    SELECT DISTINCT other_user FROM (
      SELECT receiver_id as other_user FROM messages WHERE sender_id = current_user_id AND group_id IS NULL
      UNION
      SELECT sender_id as other_user FROM messages WHERE receiver_id = current_user_id AND group_id IS NULL
    ) as user_list
  ) AS other_users
  JOIN profiles p ON p.id = other_users.other_user
  LEFT JOIN last_messages lm ON lm.conversation_key = (LEAST(current_user_id, p.id)::text || ':' || GREATEST(current_user_id, p.id)::text) AND lm.rn = 1
  ORDER BY last_message_at DESC;

END;
$$ LANGUAGE plpgsql;