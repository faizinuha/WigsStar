import supabase from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { useProfile } from './useProfile';

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string; // uuid from DB
  profiles: {
    // sender profile
    username: string;
    avatar_url: string;
  } | null;
  reply_to: string | null;
  replied_to_message?: {
    content: string;
    profiles: {
        username: string;
    } | null;
  } | null;
}

export interface ConversationInfo {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface UseMessagesProps {
  conversationId: string;
  isGroup: boolean;
}

export const useMessages = ({ conversationId, isGroup }: UseMessagesProps) => {
  const { data: currentUserProfile, isLoading: isProfileLoading } =
    useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [info, setInfo] = useState<ConversationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const markMessagesAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!currentUserProfile || messageIds.length === 0) return;
      const receipts = messageIds.map((id) => ({
        message_id: id,
        user_id: currentUserProfile.id,
      }));
      await supabase
        .from('read_receipts')
        .upsert(receipts, { onConflict: 'message_id,user_id' });
    },
    [currentUserProfile]
  );

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !currentUserProfile) return;

    const query = `
      *,
      profiles:messages_sender_id_fkey(username, avatar_url),
      replied_to_message:messages!reply_to(content, profiles:messages_sender_id_fkey(username))
    `;

    setLoading(true);
    try {
      let messageQuery;
      if (isGroup) {
        messageQuery = supabase
          .from('messages')
          .select(query)
          .eq('group_id', conversationId);
      } else {
        const otherUserId = conversationId;
        messageQuery = supabase
          .from('messages')
          .select(query)
          .or(
            `(sender_id.eq.${currentUserProfile.id},receiver_id.eq.${otherUserId}),(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserProfile.id})`
          );
      }

      const { data: messagesData, error: messagesError } =
        await messageQuery.order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData as any[] as Message[]);

      // Mark fetched messages as read
      const unreadMessageIds = messagesData
        .filter((msg) => msg.sender_id !== currentUserProfile.id) // Only mark messages from others
        .map((msg) => msg.id);
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(unreadMessageIds);
      }

      // Fetch conversation info
      let infoQuery;
      if (isGroup) {
        infoQuery = supabase
          .from('groups')
          .select('id, name')
          .eq('id', conversationId)
          .single();
      } else {
        infoQuery = supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', conversationId)
          .single();
      }
      const { data: infoData, error: infoError } = await infoQuery;
      if (infoError) throw infoError;

      setInfo({
        id: infoData.id,
        name: isGroup ? infoData.name : infoData.username,
        avatar_url: isGroup ? null : infoData.avatar_url,
      });
    } catch (err) {
      setError(err);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, isGroup, currentUserProfile, markMessagesAsRead]);

  useEffect(() => {
    if (!isProfileLoading) {
      fetchMessages();
    }
  }, [isProfileLoading, fetchMessages]);

  useEffect(() => {
    if (!conversationId || !currentUserProfile) return;

    const handleNewMessage = (payload: any) => {
      // Check if the message belongs to the current conversation
      const newMessage = payload.new;
      const isForThisConversation = isGroup
        ? newMessage.group_id === conversationId
        : (newMessage.sender_id === currentUserProfile.id &&
            newMessage.receiver_id === conversationId) ||
          (newMessage.sender_id === conversationId &&
            newMessage.receiver_id === currentUserProfile.id);

      if (isForThisConversation) {
        // Since the subscription doesn't fetch the nested reply, we might need to refetch
        // or handle this more gracefully later. For now, just add the new message.
        fetchMessages(); // Simple solution: refetch all messages to get reply info
      }
    };

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        handleNewMessage
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, isGroup, currentUserProfile, markMessagesAsRead, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, replyToId?: string) => {
      if (!content.trim() || !currentUserProfile || !conversationId) return;

      const messageData: any = {
        sender_id: currentUserProfile.id,
        content: content.trim(),
        reply_to: replyToId || null,
      };

      if (isGroup) {
        messageData.group_id = conversationId;
      } else {
        messageData.receiver_id = conversationId;
      }

      const { error } = await supabase.from('messages').insert(messageData);

      if (error) {
        console.error('Error sending message:', error);
      }
    },
    [conversationId, isGroup, currentUserProfile]
  );

  return {
    messages,
    info,
    loading: loading || isProfileLoading,
    error,
    sendMessage,
    currentUserProfile,
  };
};