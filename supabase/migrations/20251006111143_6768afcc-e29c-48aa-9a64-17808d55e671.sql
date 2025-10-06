-- Fix chat RLS policies to prevent infinite recursion

-- Drop problematic policies on conversation_members
DROP POLICY IF EXISTS "Members can view conversation membership" ON conversation_members;

-- Create simple policy for conversation_members without recursion
CREATE POLICY "Users can view their own memberships"
ON conversation_members
FOR SELECT
USING (auth.uid() = user_id);

-- Update conversations policy to use EXISTS instead of function
DROP POLICY IF EXISTS "Members can view their conversations" ON conversations;

CREATE POLICY "Members can view their conversations"
ON conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_members.conversation_id = conversations.id
    AND conversation_members.user_id = auth.uid()
  )
);

-- Update messages policy
DROP POLICY IF EXISTS "Members can view conversation messages" ON messages;

CREATE POLICY "Members can view conversation messages"
ON messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_members.conversation_id = messages.conversation_id
    AND conversation_members.user_id = auth.uid()
  )
);