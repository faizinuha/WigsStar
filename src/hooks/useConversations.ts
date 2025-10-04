<<<<<<< HEAD
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
=======
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33
import { useEffect } from 'react';

export interface ConversationMember {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  last_message_at: string;
  last_message: string | null;
  last_message_sender: string | null;
  members: ConversationMember[];
  unread_count: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
<<<<<<< HEAD
        .select(
          `
=======
        .select(`
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33
          *,
          conversation_members!inner(
            user_id,
            last_read_at
          ),
          messages(
            content,
            sender_id,
            created_at
          )
<<<<<<< HEAD
        `
        )
        .order('last_message_at', { ascending: false })
        .order('created_at', { foreignTable: 'messages', ascending: false })
        .limit(1, { foreignTable: 'messages' });
=======
        `)
        .order('last_message_at', { ascending: false });
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33

      if (error) throw error;

      // Transform data to include members and unread count
      const conversationsWithMembers = await Promise.all(
        data.map(async (conv: any) => {
          // Get all members' profiles
<<<<<<< HEAD
          const memberIds = conv.conversation_members.map(
            (m: any) => m.user_id
          );
=======
          const memberIds = conv.conversation_members.map((m: any) => m.user_id);
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, display_name, avatar_url')
            .in('user_id', memberIds);

          // Get last message
          const lastMessage = conv.messages?.[0];
<<<<<<< HEAD

          // Calculate unread count
          const userMember = conv.conversation_members.find(
            (m: any) => m.user_id === user.id
          );
=======
          
          // Calculate unread count
          const userMember = conv.conversation_members.find((m: any) => m.user_id === user.id);
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
<<<<<<< HEAD
            .gt(
              'created_at',
              userMember?.last_read_at || new Date(0).toISOString()
            );
=======
            .gt('created_at', userMember?.last_read_at || new Date(0).toISOString());
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33

          return {
            id: conv.id,
            name: conv.name,
            is_group: conv.is_group,
            created_at: conv.created_at,
            last_message_at: conv.last_message_at,
            last_message: lastMessage?.content || null,
            last_message_sender: lastMessage?.sender_id || null,
            members: profiles || [],
            unread_count: unreadCount || 0,
          };
        })
      );

      return conversationsWithMembers as Conversation[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
<<<<<<< HEAD
          queryClient.invalidateQueries({
            queryKey: ['conversations', user.id],
          });
=======
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
<<<<<<< HEAD
          queryClient.invalidateQueries({
            queryKey: ['conversations', user.id],
          });
=======
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

<<<<<<< HEAD
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unread_count,
    0
  );
=======
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33

  return {
    conversations,
    isLoading,
    totalUnread,
  };
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ otherUserId }: { otherUserId: string }) => {
<<<<<<< HEAD
      const { data, error } = await supabase.rpc(
        'get_or_create_direct_conversation',
        {
          other_user_id: otherUserId,
        }
      );
=======
      const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
        other_user_id: otherUserId,
      });
>>>>>>> 4744c4c0234a3c41c0259ca9c5733743a2409a33

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
