
import { useState, useEffect } from 'react';
import  supabase  from '@/lib/supabase';
import { useProfile } from './useProfile';

export interface Conversation {
  description: string;
  id: string; // This will be group_id or other user's profile_id
  is_group: boolean;
  name: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export const useConversations = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const fetchConversations = async (profileId: string) => {
    if (!profileId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_conversations', { 
        current_user_id: profileId 
      });

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }
      
      setConversations(data as Conversation[]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchConversations(profile.id);
    }
  }, [profile, isProfileLoading]);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchConversations(profile.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return { conversations, loading: loading || isProfileLoading, error, totalUnread };
};
