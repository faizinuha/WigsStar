import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

type LikeableEntity = 'post' | 'comment' | 'meme';

export function useLikes(entity: LikeableEntity, entityId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLikeUpdate = useCallback(
    (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      if (eventType === 'INSERT') {
        setLikesCount((prev) => prev + 1);
        if (user && newRecord.user_id === user.id) {
          setIsLiked(true);
        }
      } else if (eventType === 'DELETE') {
        setLikesCount((prev) => Math.max(0, prev - 1));
        if (user && oldRecord.user_id === user.id) {
          setIsLiked(false);
        }
      }
    },
    [user]
  );

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

      if (!entityId) {
        // Defensive: do not attempt to like without an entity id
        throw new Error(`Invalid ${entity} id: ${String(entityId)}`);
      }

      // Basic UUID validation to prevent sending empty strings or incorrect ids
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(entityId)) {
        throw new Error(`Invalid ${entity} id format: ${entityId}`);
      }

      const currentlyLiked = isLiked;
      const column = `${entity}_id`;

      // Optimistic update
      setIsLiked(!currentlyLiked);
      setLikesCount((prev) =>
        currentlyLiked ? Math.max(0, prev - 1) : prev + 1
      );

      try {
        if (currentlyLiked) {
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq(column, entityId);

          if (error) throw error;
        } else {
          const payload: Record<string, string | null> = {
            user_id: user.id,
            post_id: null,
            comment_id: null,
            meme_id: null,
            [column]: entityId,
          };
          const { data, error } = await supabase
            .from('likes')
            .insert(payload)
            .select()
            .single();

          if (error) {
            // Log the payload to help debug DB constraint failures
            console.error(
              'Like insert failed. Payload:',
              payload,
              'Error:',
              error
            );
            throw error;
          }
        }
      } catch (err) {
        // Revert optimistic update
        setIsLiked(currentlyLiked);
        setLikesCount((prev) =>
          currentlyLiked ? prev + 1 : Math.max(0, prev - 1)
        );
        console.error('Error toggling like:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity, 'list'] });
      queryClient.invalidateQueries({ queryKey: [entity, entityId] });
    },
  });

  return { likesCount, isLiked, toggleLike, loading };
}
