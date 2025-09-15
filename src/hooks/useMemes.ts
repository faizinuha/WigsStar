import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/lib/supabase.ts";
import { useAuth } from "@/contexts/AuthContext";

export interface Meme {
  id: string;
  user_id: string;
  caption: string;
  media_url: string;
  media_type: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  isLiked: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
}

export function useAllMemes() {
  return useQuery({
    queryKey: ["allMemes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memes")
        .select(`
          id, 
          caption,
          media_url,
          media_type,
          created_at, 
          likes_count, 
          comments_count,
          profiles!memes_user_id_fkey (
            user_id, 
            username, 
            display_name, 
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((meme: any) => ({
        id: meme.id,
        user_id: meme.profiles?.user_id,
        caption: meme.caption || '',
        media_url: meme.media_url,
        media_type: meme.media_type,
        created_at: meme.created_at,
        likes_count: meme.likes_count || 0,
        comments_count: meme.comments_count || 0,
        isLiked: false,
        user: {
          id: meme.profiles?.user_id,
          username: meme.profiles?.username || '',
          displayName: meme.profiles?.display_name || meme.profiles?.username || '',
          avatar: meme.profiles?.avatar_url || '',
        },
      })) as Meme[];
    },
  });
}

export function useUserMemes(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["userMemes", targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error("No user ID provided");

      const { data, error } = await supabase
        .from("memes")
        .select(`
          id, 
          caption,
          media_url,
          media_type,
          created_at, 
          likes_count, 
          comments_count,
          profiles!memes_user_id_fkey (
            user_id, 
            username, 
            display_name, 
            avatar_url
          )
        `)
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((meme: any) => ({
        id: meme.id,
        user_id: meme.profiles?.user_id,
        caption: meme.caption || '',
        media_url: meme.media_url,
        media_type: meme.media_type,
        created_at: meme.created_at,
        likes_count: meme.likes_count || 0,
        comments_count: meme.comments_count || 0,
        isLiked: false,
        user: {
          id: meme.profiles?.user_id,
          username: meme.profiles?.username || '',
          displayName: meme.profiles?.display_name || meme.profiles?.username || '',
          avatar: meme.profiles?.avatar_url || '',
        },
      })) as Meme[];
    },
    enabled: !!targetUserId,
  });
}