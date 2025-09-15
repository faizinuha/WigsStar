import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  avatar_url: string;
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  join_date?: string;
  is_verified?: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  location?: string;
  user: {
    username: string;
    displayName: string;
    avatar: string;
  };
}

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error("No user ID provided");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!targetUserId,
  });
}

export function useUserPosts(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["userPosts", targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error("No user ID provided");

      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          caption,
          location,
          created_at,
          likes_count,
          comments_count,
          profiles!posts_user_id_fkey (
            username,
            display_name,
            avatar_url
          ),
          post_media (
            media_url,
            media_type
          )
        `)
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((post: any) => ({
        id: post.id,
        content: post.caption || '',
        location: post.location,
        created_at: post.created_at,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        isLiked: false,
        isBookmarked: false,
        image_url: post.post_media?.[0]?.media_url,
        user: {
          username: post.profiles?.username || '',
          displayName: post.profiles?.display_name || post.profiles?.username || '',
          avatar: post.profiles?.avatar_url || '',
        },
        user_id: targetUserId,
      })) as Post[];
    },
    enabled: !!targetUserId,
  });
}

export function useAllPosts() {
  return useQuery({
    queryKey: ["allPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          user_id,
          caption,
          location,
          created_at,
          likes_count,
          comments_count,
          profiles!posts_user_id_fkey (
            username,
            display_name,
            avatar_url
          ),
          post_media (
            media_url,
            media_type
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((post: any) => ({
        id: post.id,
        content: post.caption || '',
        location: post.location,
        created_at: post.created_at,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        isLiked: false,
        isBookmarked: false,
        image_url: post.post_media?.[0]?.media_url,
        user: {
          username: post.profiles?.username || '',
          displayName: post.profiles?.display_name || post.profiles?.username || '',
          avatar: post.profiles?.avatar_url || '',
        },
        user_id: post.user_id,
      })) as Post[];
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
}