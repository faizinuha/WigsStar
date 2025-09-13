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
  avatar?: string;
  cover_image?: string;
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
  content?: string;
  image_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  user: {
    id: string;
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
          id, content, created_at, likes_count, comments_count,
          user:profiles!user_id (user_id, username, display_name, avatar_url),
          post_media (media_url, media_type)
        `)
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map the data to match the expected Post interface
      return data.map((post: any) => ({
        ...post,
        image_url: post.post_media?.[0]?.media_url, // Use the first media item as the primary image
        user: {
          id: post.user?.user_id,
          username: post.user?.username,
          displayName: post.user.display_name || post.user.username,
          avatar: post.user.avatar_url,
        },
      })) as unknown as Post[];
    },
    enabled: !!targetUserId,
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
