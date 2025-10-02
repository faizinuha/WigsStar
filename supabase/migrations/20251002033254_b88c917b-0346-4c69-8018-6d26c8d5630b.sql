-- Drop all policies that depend on is_member_of_group function first
DROP POLICY IF EXISTS "Allow members to view their groups" ON public.groups CASCADE;
DROP POLICY IF EXISTS "Allow members to view other members in their groups" ON public.group_members CASCADE;
DROP POLICY IF EXISTS "Allow members to view group messages and their direct messages" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Allow members to insert messages" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Users can view memberships of groups they are in." ON public.group_members CASCADE;
DROP POLICY IF EXISTS "View My Memberships" ON public.group_members CASCADE;
DROP POLICY IF EXISTS "Group members can view their groups." ON public.groups CASCADE;
DROP POLICY IF EXISTS "View Joined Groups" ON public.groups CASCADE;
DROP POLICY IF EXISTS "Read Messages in My Groups" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Send Message to My Group" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Messages insert by owner" ON public.messages CASCADE;
DROP POLICY IF EXISTS "Users can view their own messages." ON public.messages CASCADE;
DROP POLICY IF EXISTS "Users can send messages." ON public.messages CASCADE;

-- Now drop the function
DROP FUNCTION IF EXISTS public.is_member_of_group(uuid) CASCADE;

-- Create a security definer function to check group membership
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_member_of_group(_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = auth.uid()
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;

-- Create simpler, non-recursive policies for group_members
CREATE POLICY "Users can view their own memberships"
ON public.group_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view other members in same groups"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT gm.group_id 
    FROM public.group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);

-- Create groups policies
CREATE POLICY "Members can view their groups"
ON public.groups
FOR SELECT
TO authenticated
USING (
  auth.uid() = creator_id OR
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
  )
);

-- Create messages policies
CREATE POLICY "Users can view messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() OR
  receiver_id = auth.uid() OR
  (group_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND (
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = messages.group_id
        AND group_members.user_id = auth.uid()
    )) OR
    (group_id IS NULL AND receiver_id IS NOT NULL)
  )
);