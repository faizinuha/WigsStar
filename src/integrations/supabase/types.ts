export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number | null
          meme_id: string | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          meme_id?: string | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          meme_id?: string | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_meme_id_fkey"
            columns: ["meme_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          name: string
          posts_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          posts_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          posts_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          meme_id: string | null
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          meme_id?: string | null
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          meme_id?: string | null
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_meme_id_fkey"
            columns: ["meme_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      memes: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string
          id: string
          likes_count: number | null
          media_type: string
          media_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          id?: string
          likes_count?: number | null
          media_type: string
          media_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          id?: string
          likes_count?: number | null
          media_type?: string
          media_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          comment_id: string | null
          created_at: string
          from_user_id: string
          id: string
          is_read: boolean | null
          meme_id: string | null
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          is_read?: boolean | null
          meme_id?: string | null
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          is_read?: boolean | null
          meme_id?: string | null
          post_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_meme_id_fkey"
            columns: ["meme_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          created_at: string
          hashtag_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          hashtag_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          hashtag_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string
          id: string
          media_type: string
          media_url: string
          order_index: number | null
          post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          media_url: string
          order_index?: number | null
          post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          order_index?: number | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string
          id: string
          is_repost: boolean | null
          likes_count: number | null
          location: string | null
          original_post_id: string | null
          reposted_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          id?: string
          is_repost?: boolean | null
          likes_count?: number | null
          location?: string | null
          original_post_id?: string | null
          reposted_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          id?: string
          is_repost?: boolean | null
          likes_count?: number | null
          location?: string | null
          original_post_id?: string | null
          reposted_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_private: boolean | null
          posts_count: number | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_private?: boolean | null
          posts_count?: number | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_private?: boolean | null
          posts_count?: number | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          id: string
          media_type: string
          media_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          media_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          comment_notifications: boolean | null
          created_at: string
          follow_notifications: boolean | null
          id: string
          like_notifications: boolean | null
          notifications_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_notifications?: boolean | null
          created_at?: string
          follow_notifications?: boolean | null
          id?: string
          like_notifications?: boolean | null
          notifications_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_notifications?: boolean | null
          created_at?: string
          follow_notifications?: boolean | null
          id?: string
          like_notifications?: boolean | null
          notifications_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_followers_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      decrement_following_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      decrement_likes_count: {
        Args: { post_id: string }
        Returns: undefined
      }
      delete_post: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      delete_user_data: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      extract_and_store_hashtags: {
        Args: { post_content: string; post_id: string }
        Returns: undefined
      }
      get_all_posts: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          caption: string
          comments_count: number
          created_at: string
          display_name: string
          id: string
          likes_count: number
          location: string
          media: Json
          user_id: string
          username: string
        }[]
      }
      get_trending_hashtags: {
        Args: { limit_count: number }
        Returns: {
          hashtag: string
          post_count: number
        }[]
      }
      get_user_posts: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          caption: string
          comments_count: number
          created_at: string
          display_name: string
          id: string
          likes_count: number
          location: string
          media: Json
          user_id: string
          username: string
        }[]
      }
      increment_followers_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_following_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_likes_count: {
        Args: { post_id: string }
        Returns: undefined
      }
      toggle_like: {
        Args: {
          p_comment_id?: string
          p_meme_id?: string
          p_post_id?: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
