import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CommentUser {
  username: string;
  displayName: string;
  avatar: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id?: string;
  meme_id?: string;
  parent_comment_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  isLiked: boolean;
  user: CommentUser;
}

export function usePostComments(postId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["comments", "post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          user_id,
          post_id,
          parent_comment_id,
          likes_count,
          created_at,
          updated_at,
          profiles!comments_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const comments: Comment[] = data.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        user_id: comment.user_id,
        post_id: comment.post_id,
        parent_comment_id: comment.parent_comment_id,
        likes_count: comment.likes_count || 0,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        isLiked: false,
        user: {
          username: comment.profiles?.username || '',
          displayName: comment.profiles?.display_name || comment.profiles?.username || '',
          avatar: comment.profiles?.avatar_url || '',
        },
      }));

      return comments;
    },
    enabled: !!postId,
  });
}

export function useMemeComments(memeId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["comments", "meme", memeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          user_id,
          meme_id,
          parent_comment_id,
          likes_count,
          created_at,
          updated_at,
          profiles!comments_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("meme_id", memeId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const comments: Comment[] = data.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        user_id: comment.user_id,
        meme_id: comment.meme_id,
        parent_comment_id: comment.parent_comment_id,
        likes_count: comment.likes_count || 0,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        isLiked: false,
        user: {
          username: comment.profiles?.username || '',
          displayName: comment.profiles?.display_name || comment.profiles?.username || '',
          avatar: comment.profiles?.avatar_url || '',
        },
      }));

      return comments;
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
      if (!user) throw new Error("User not authenticated");

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
    onSuccess: (_, variables) => {
      if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: ["comments", "post", variables.postId] });
      }
      if (variables.memeId) {
        queryClient.invalidateQueries({ queryKey: ["comments", "meme", variables.memeId] });
      }
    },
  });
}

export function useToggleCommentLike() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      if (!user) throw new Error("User not authenticated");

      if (isLiked) {
        // Remove like
        const result = await (supabase as any)
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId);

        if (result.error) throw result.error;
      } else {
        // Add like
        const result = await (supabase as any)
          .from("likes")
          .insert({
            user_id: user.id,
            comment_id: commentId,
          });

        if (result.error) throw result.error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}