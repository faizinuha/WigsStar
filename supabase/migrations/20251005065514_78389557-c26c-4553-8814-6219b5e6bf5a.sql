-- Fix infinite recursion in conversation_members RLS policies
-- Create security definer function to check conversation membership

CREATE OR REPLACE FUNCTION public.is_conversation_member(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_members
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
  );
$$;

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view members of their conversations" ON conversation_members;
DROP POLICY IF EXISTS "Users can view their membership" ON conversation_members;
DROP POLICY IF EXISTS "Allow authenticated user to see their own membership" ON conversation_members;

-- Create new policies using security definer function
CREATE POLICY "Members can view conversation membership"
ON conversation_members
FOR SELECT
USING (public.is_conversation_member(conversation_id, auth.uid()));

-- Fix conversations policies
DROP POLICY IF EXISTS "Users can view conversations they are members of" ON conversations;

CREATE POLICY "Members can view their conversations"
ON conversations
FOR SELECT
USING (public.is_conversation_member(id, auth.uid()));

-- Fix messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow authenticated users to see messages in their conversation" ON messages;

CREATE POLICY "Members can view conversation messages"
ON messages
FOR SELECT
USING (public.is_conversation_member(conversation_id, auth.uid()));

-- Add attachment support to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat attachments
CREATE POLICY "Users can upload to their conversations"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Members can view conversation attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-attachments'
  AND public.is_conversation_member(
    ((storage.foldername(name))[2])::uuid,
    auth.uid()
  )
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);