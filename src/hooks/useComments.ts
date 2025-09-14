import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Comment {
  id: string;
  user_id: string;
  post_id?: string;
  meme_id?: string;
  parent_comment_id?: string;
  content: string;
  created_at: string;
  likes_count: number;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ["comments", "post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          likes_count,
          parent_comment_id,
          profiles!comments_user_id_fkey (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((comment: any) => ({
        id: comment.id,
        user_id: comment.profiles?.user_id,
        post_id: postId,
        content: comment.content,
        created_at: comment.created_at,
        likes_count: comment.likes_count || 0,
        parent_comment_id: comment.parent_comment_id,
        user: {
          id: comment.profiles?.user_id,
          username: comment.profiles?.username || '',
          displayName: comment.profiles?.display_name || comment.profiles?.username || '',
          avatar: comment.profiles?.avatar_url || '',
        },
      })) as Comment[];
    },
    enabled: !!postId,
  });
}

export function useMemeComments(memeId: string) {
  return useQuery({
    queryKey: ["comments", "meme", memeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          likes_count,
          parent_comment_id,
          profiles!comments_user_id_fkey (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("meme_id", memeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((comment: any) => ({
        id: comment.id,
        user_id: comment.profiles?.user_id,
        meme_id: memeId,
        content: comment.content,
        created_at: comment.created_at,
        likes_count: comment.likes_count || 0,
        parent_comment_id: comment.parent_comment_id,
        user: {
          id: comment.profiles?.user_id,
          username: comment.profiles?.username || '',
          displayName: comment.profiles?.display_name || comment.profiles?.username || '',
          avatar: comment.profiles?.avatar_url || '',
        },
      })) as Comment[];
    },
    enabled: !!memeId,
  });
}

export function useCreateComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      content, 
      postId, 
      memeId, 
      parentCommentId 
    }: { 
      content: string;
      postId?: string;
      memeId?: string;
      parentCommentId?: string;
    }) => {
      if (!user) throw new Error("User must be authenticated");

      const { data, error } = await supabase
        .from("comments")
        .insert({
          content,
          user_id: user.id,
          post_id: postId,
          meme_id: memeId,
          parent_comment_id: parentCommentId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.post_id) {
        queryClient.invalidateQueries({ queryKey: ["comments", "post", data.post_id] });
      }
      if (data.meme_id) {
        queryClient.invalidateQueries({ queryKey: ["comments", "meme", data.meme_id] });
      }
    },
  });
}