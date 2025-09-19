import { Navigation } from '@/components/layout/Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  Bell,
  BellRing,
  CheckCheck,
  Clock,
  Heart,
  Loader2,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import supabase from '@/lib/supabase';

export const Notifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 🔹 Fetch notifications dari Supabase
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          created_at,
          is_read,
          from_user:from_user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  // 🔹 Mark all as read
  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // 🔹 Icons
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // 🔹 Messages
  const getNotificationMessage = (type: string, fromUser: any) => {
    const displayName =
      fromUser?.display_name || fromUser?.username || 'Someone';

    switch (type) {
      case 'like':
        return `${displayName} liked your post`;
      case 'comment':
        return `${displayName} commented on your post`;
      case 'follow':
        return `${displayName} started following you`;
      default:
        return `${displayName} sent you a notification`;
    }
  };

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
              <p className="text-muted-foreground mt-2">
                Stay updated with your latest activities
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              {markAllRead.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Mark All Read
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div className="space-y-4">
            {notifications?.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  !notification.is_read ? 'border-primary/20 bg-primary/5' : ''
                }`}
              >
                <Link
                  to={`/profile/${notification.from_user?.username}`}
                  className="flex items-start gap-4"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={notification.from_user?.avatar_url || undefined}
                    />
                    <AvatarFallback>
                      {notification.from_user?.display_name?.charAt(0) || notification.from_user?.username?.charAt(0) ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      <p className="text-sm">
                        {getNotificationMessage(
                          notification.type,
                          notification.from_user
                        )}
                      </p>
                      {!notification.is_read && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(
                          parseISO(notification.created_at),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs self-center"
                  >
                    View
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {notifications?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BellRing className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No notifications yet
              </h3>
              <p className="text-muted-foreground">
                When someone likes, comments, or follows you, you'll see it here
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
