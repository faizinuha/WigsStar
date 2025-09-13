import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, MessageCircle, UserPlus, Loader2 } from "lucide-react";

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  is_read: boolean;
  created_at: string;
  from_user: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  post?: {
    id: string;
    media_url?: string;
  };
  meme?: {
    id: string;
    media_url: string;
  };
}

export const Notifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          from_user:profiles!notifications_from_user_id_fkey (
            username,
            display_name,
            avatar_url
          ),
          post:posts (
            id,
            post_media (
              media_url
            )
          ),
          meme:memes (
            id,
            media_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform data to match our interface - handle potential null values
      return (data as any[]).map(notification => ({
        ...notification,
        from_user: notification.from_user || { username: '', display_name: '', avatar_url: '' },
        post: notification.post ? {
          id: notification.post.id,
          media_url: notification.post.post_media?.[0]?.media_url
        } : undefined,
        meme: notification.meme || undefined
      })) as Notification[];
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else if (diffInMinutes < 10080) {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } else {
      return `${Math.floor(diffInMinutes / 10080)}w ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const displayName = notification.from_user.display_name || notification.from_user.username;
    
    switch (notification.type) {
      case 'like':
        return `${displayName} liked your ${notification.post ? 'post' : 'meme'}`;
      case 'comment':
        return `${displayName} commented on your ${notification.post ? 'post' : 'meme'}`;
      case 'follow':
        return `${displayName} started following you`;
      default:
        return '';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="md:ml-72 min-h-screen pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground mt-2">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-secondary/50 ${
                  !notification.is_read ? 'bg-secondary/30 border-primary/20' : ''
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsReadMutation.mutate(notification.id);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.from_user.avatar_url} />
                    <AvatarFallback>
                      {notification.from_user.display_name?.[0] || notification.from_user.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <p className="text-sm font-medium truncate">
                        {getNotificationText(notification)}
                      </p>
                      {!notification.is_read && (
                        <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                  
                  {(notification.post?.media_url || notification.meme?.media_url) && (
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img
                        src={notification.post?.media_url || notification.meme?.media_url}
                        alt="Post content"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {notifications.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                When someone likes or comments on your posts, you'll see it here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};