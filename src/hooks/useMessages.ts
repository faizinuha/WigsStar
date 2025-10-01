import supabase from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { useProfile } from './useProfile';

// Exporting for use in components
export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  group_id?: string;
  receiver_id?: string;
  profiles: {
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

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !currentUserProfile) return;

    const query = `
      id, content, created_at, sender_id, group_id, receiver_id, reply_to,
      profiles:sender_id(username, avatar_url),
      replied_to_message:reply_to(content, profiles:sender_id(username))
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
        messageQuery = supabase
          .from('messages')
          .select(query)
          .or(
            `and(sender_id.eq.${currentUserProfile.id},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${currentUserProfile.id})`
          )
          .is('group_id', null);
      }

      const { data: messagesData, error: messagesError } =
        await messageQuery.order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData as Message[]);

      // Fetch conversation info
      let infoData: any = null;
      if (isGroup) {
        const { data } = await supabase.from('groups').select('id, name').eq('id', conversationId).single();
        infoData = data;
      } else {
        const { data } = await supabase.from('profiles').select('user_id, username, avatar_url').eq('user_id', conversationId).single();
        if(data) infoData = { id: data.user_id, name: data.username, avatar_url: data.avatar_url };
      }

      if (infoData) {
        setInfo(infoData);
      }

    } catch (err) {
      setError(err);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, isGroup, currentUserProfile]);

  useEffect(() => {
    if (!isProfileLoading) {
      fetchMessages();
    }
  }, [isProfileLoading, fetchMessages]);

  // Real-time subscriptions
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (payload: any) => {
      // Simple refetch to get all relations correctly
      fetchMessages();
    };

    const handleUpdatedMessage = (payload: any) => {
        const updatedMessage = payload.new as Message;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === updatedMessage.id ? { ...msg, content: updatedMessage.content, /* any other editable fields */ } : msg
          )
        );
    };

    const handleDeletedMessage = (payload: any) => {
        const deletedMessage = payload.old;
        setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== deletedMessage.id));
    };

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, handleUpdatedMessage)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, handleDeletedMessage)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

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
      if (error) console.error('Error sending message:', error);
    },
    [conversationId, isGroup, currentUserProfile]
  );

  const editMessage = useCallback(async (messageId: string, content: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', messageId);
    if (error) console.error('Error editing message:', error);
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!window.confirm('Yakin ingin menghapus pesan ini?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) console.error('Error deleting message:', error);
  }, []);

  return {
    messages,
    info,
    loading: loading || isProfileLoading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    currentUserProfile,
  };
};
