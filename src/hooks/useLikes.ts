
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type LikeableEntity = 'post' | 'comment' | 'meme';

export function useLikes(entity: LikeableEntity, entityId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLikeUpdate = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT') {
      setLikesCount(prev => prev + 1);
      if (user && newRecord.user_id === user.id) {
        setIsLiked(true);
      }
    } else if (eventType === 'DELETE') {
      setLikesCount(prev => Math.max(0, prev - 1));
      if (user && oldRecord.user_id === user.id) {
        setIsLiked(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!entityId) return;

    const fetchInitialState = async () => {
      setLoading(true);
      
      const { count, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq(`${entity}_id`, entityId);

      if (countError) {
        console.error('Error fetching likes count:', countError);
      } else {
        setLikesCount(count ?? 0);
      }

      if (user) {
        const { data: likeData, error: likeError } = await supabase
          .from('likes')
          .select('id')
          .eq(`${entity}_id`, entityId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (likeError) {
          console.error('Error fetching like status:', likeError);
        } else {
          setIsLiked(!!likeData);
        }
      }
      setLoading(false);
    };

    fetchInitialState();

    const subscription = supabase
      .channel(`likes:${entity}:${entityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `${entity}_id=eq.${entityId}`,
        },
        handleLikeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [entity, entityId, user, handleLikeUpdate]);

  const { mutate: toggleLike } = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('You must be logged in to like.');
      }

      const currentlyLiked = isLiked;
      const column = `${entity}_id`;

      // Optimistic update
      setIsLiked(!currentlyLiked);
      setLikesCount(prev => currentlyLiked ? Math.max(0, prev - 1) : prev + 1);

      if (currentlyLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq(column, entityId);

        if (error) {
          // Revert optimistic update
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
          console.error('Error unliking:', error);
        }
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, [column]: entityId });

        if (error) {
          // Revert optimistic update
          setIsLiked(false);
          setLikesCount(prev => prev - 1);
          console.error('Error liking:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity, 'list'] });
      queryClient.invalidateQueries({ queryKey: [entity, entityId] });
    }
  });

  return { likesCount, isLiked, toggleLike, loading };
}
