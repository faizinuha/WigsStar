import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  MessageCircle,
  User,
  Menu,
  Settings,
  Laugh,
  Music,
  Bell,
  UserPlus,
  Info,
  Clock,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useConversations } from '@/hooks/useConversations';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type Tables } from '@/integrations/supabase/types';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { AccountSwitcher } from './AccountSwitcher';
import { NavigationSkeleton } from '@/components/skeletons/NavigationSkeleton';

type Profile = Tables<'profiles'>;
type NotificationFromDb = Tables<'notifications'>;
type UserNotificationFromDb = Tables<'user_notifications'>;

type CombinedNotification = (
  | (NotificationFromDb & { from_user: Profile | null; title?: never; message?: never; post_id: string | null; post_media_url?: string | null; })
  | (UserNotificationFromDb & { from_user?: null; from_user_id?: never })
) & {
  id: string;
  created_at: string;
  is_read: boolean;
  type: string;
};

export const Navigation = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { totalUnread } = useConversations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifPopoverOpen, setIsNotifPopoverOpen] = useState(false);
  const popoverTimeoutRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications } = useQuery<CombinedNotification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .rpc('get_all_notifications_for_user', { p_user_id: user.id });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return data.map((n: any) => ({
        ...n,
        from_user: n.from_user_id ? {
          user_id: n.from_user_id,
          username: n.username,
          display_name: n.display_name,
          avatar_url: n.avatar_url,
        } : null,
      }));
    },
    enabled: !!user,
  });

  const unreadNotificationsCount = useMemo(() => {
    return notifications?.filter((n) => !n.is_read).length || 0;
  }, [notifications]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    if (!notifications) return {};

    return notifications.reduce((acc, notification) => {
      const date = parseISO(notification.created_at);
      let groupKey: string;

      if (isToday(date)) groupKey = 'Today';
      else if (isYesterday(date)) groupKey = 'Yesterday';
      else groupKey = format(date, 'MMMM d, yyyy');

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(notification);
      return acc;
    }, {} as Record<string, CombinedNotification[]>);
  }, [notifications]);

  // Mark a single notification as read
  const markAsRead = useMutation({
    mutationFn: async (notification: CombinedNotification) => {
      if (!user || notification.is_read) return;
      const tableName = 'from_user_id' in notification ? 'notifications' : 'user_notifications';
      const { error } = await supabase
        .from(tableName)
        .update({ is_read: true })
        .eq('id', notification.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const handleNotificationClick = (notification: CombinedNotification) => {
    markAsRead.mutate(notification);
    if ('post_id' in notification && notification.post_id) {
      // For now, navigate to home, but ideally this opens a post modal
      // You already have PostDetailModal, but we need a global way to trigger it.
      navigate('/');
    } else if ('from_user_id' in notification && notification.from_user_id && notification.from_user) {
      navigate(`/profile/${notification.from_user_id}`);
    } else {
      navigate('/notifications');
    }
  };

  // Handlers for hover-based popover
  const handlePopoverOpen = () => {
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
    }
    setIsNotifPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    popoverTimeoutRef.current = window.setTimeout(() => {
      setIsNotifPopoverOpen(false);
    }, 100); // Mengurangi delay menjadi 100ms agar lebih cepat
  };
  // Redirect to auth if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !user && location.pathname !== '/auth' && location.pathname !== '/auth/callback') {
      navigate('/auth');
    }
  }, [user, authLoading, navigate, location.pathname]);

  // Show skeleton while auth is loading or if we're checking authentication
  if (authLoading || (profileLoading && user)) {
    return <NavigationSkeleton />;
  }

  // Helper functions for rendering notifications in popover
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationMessage = (notification: CombinedNotification) => {
    if (notification.title) return notification.title;

    const displayName =
      notification.from_user?.display_name || notification.from_user?.username || 'Someone';

    switch (notification.type) {
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

  const navItems = [
    { icon: Home, label: 'Home', path: '/', active: location.pathname === '/' },
    {
      icon: Search,
      label: 'Explore',
      path: '/explore',
      active: location.pathname === '/explore',
    },
    {
      icon: PlusSquare,
      label: 'Create',
      path: '#',
      active: false,
      onClick: () => setShowCreateModal(true),
    },
    {
      icon: Laugh,
      label: 'Memes',
      path: '/memes',
      active: location.pathname === '/memes',
    },
    {
      icon: MessageCircle,
      label: 'Chat',
      path: '/chat',
      badge: totalUnread > 0 ? totalUnread : null,
      active: location.pathname.startsWith('/chat'),
    },
    {
      icon: Heart,
      label: 'Notifications',
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      active: location.pathname === '/notifications',
    },
    {
      icon: Music,
      label: 'Spotify',
      path: '/spotify/music',
      active: location.pathname === '/spotify/music',
    }
  ];

  // Don't render navigation if user is not authenticated
  if (!user) {
    return null;
  }

  const handleNavigation = (path: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (path !== '#') {
      navigate(path);
    }
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-card border-r border-border p-6 flex-col justify-between z-40">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/assets/Logo/StarMar.png"
              alt="StarMar"
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StarMar
            </span>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              if (item.label === 'Notifications') {
                return (
                  <Popover key={index} open={isNotifPopoverOpen} onOpenChange={setIsNotifPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={item.active ? 'secondary' : 'ghost'}
                        className="w-full justify-start space-x-3 h-12 text-base"
                        // Desktop: hover to open, click to navigate
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                        // Mobile: click to navigate
                        onClick={() => {
                          // Toggle popover on click for desktop-like feel
                          setIsNotifPopoverOpen((prev) => !prev);
                        }}
                      >
                        <div className="relative">
                          <Icon className="h-6 w-6" />
                          {item.badge && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs starmar-gradient border-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <span>{item.label}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 p-0"
                      side="right"
                      align="start"
                      onMouseEnter={handlePopoverOpen}
                      onMouseLeave={handlePopoverClose}>
                      <div className="p-4">
                        <h4 className="font-medium leading-none">Notifications</h4>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications && notifications.length > 0 ? (
                          Object.entries(groupedNotifications).map(([date, notifs]) => (
                            <div key={date}>
                              <h5 className="text-sm font-semibold px-4 py-2 text-muted-foreground">{date}</h5>
                              {notifs.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!notification.is_read ? 'bg-primary/5' : ''}`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <div className="flex items-center gap-3">
                                    {notification.from_user ? (
                                      <Link to={`/profile/${notification.from_user.user_id}`} onClick={(e) => e.stopPropagation()}>
                                        <Avatar className="h-10 w-10">
                                          <AvatarImage src={notification.from_user.avatar_url || undefined} />
                                          <AvatarFallback>{notification.from_user.display_name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                      </Link>
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        {getNotificationIcon(notification.type)}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0 text-sm">
                                      <p>
                                        <span className="font-semibold">{notification.from_user?.display_name || notification.from_user?.username || ''}</span>
                                        {' '}{getNotificationMessage(notification).replace(notification.from_user?.display_name || notification.from_user?.username || 'Someone', '').trim()}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                                      </p>
                                    </div>
                                    {'post_media_url' in notification && notification.post_media_url && (
                                      <img src={notification.post_media_url} alt="Post preview" className="h-10 w-10 object-cover rounded-sm" />
                                    )}
                                    {!notification.is_read && <div className="h-2 w-2 rounded-full bg-primary self-center ml-2" />}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                        ) : (
                          <p className="p-4 text-sm text-muted-foreground text-center">No new notifications.</p>
                        )}
                      </div>
                      <div className="border-t p-2 text-center">
                        <Button
                          variant="link"
                          className="text-sm w-full"
                          onClick={() => {
                            navigate('/notifications');
                            setIsNotifPopoverOpen(false);
                          }}
                        >
                          View All Notifications
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }
              return (
                <Button
                  key={index}
                  variant={item.active ? 'secondary' : 'ghost'}
                  className="w-full justify-start space-x-3 h-12 text-base"
                  onClick={() => handleNavigation(item.path, item.onClick)}
                >
                  <div className="relative">
                    <Icon className="h-6 w-6" />
                    {item.badge && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs starmar-gradient border-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span>{item.label}</span>
                </Button>
              );
            })}
            {profile?.role === 'admin' && (
              <Button
                variant={location.pathname === '/admin' ? 'secondary' : 'ghost'}
                className="w-full justify-start space-x-3 h-12 text-base"
                onClick={() => navigate('/Admin_Dashbord')}
              >
                <Home className="h-6 w-6" />
                <span>Dashbaord Admin</span>
              </Button>
            )}
          </div>
        </div>

        {/* User Profile & Account Switcher */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 h-12"
            onClick={handleSettingsClick}
          >
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </Button>

          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-secondary">
            <div
              className="flex-1 min-w-0 flex items-center space-x-3 cursor-pointer"
              onClick={handleProfileClick}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {profile?.display_name || profile?.username}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  @{profile?.username}
                </p>
              </div>
            </div>
            <AccountSwitcher />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Top Bar */}
        <header className="fixed top-0 left-0 right-0 bg-card border-b border-border p-4 flex items-center justify-between z-50">
          <div className="flex items-center space-x-3">
            <img
              src="/assets/Logo/StarMar.png"
              alt="StarMar"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StarMar
            </span>
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>

              <div className="mt-8 space-y-6">
                {/* Profile Section & Account Switcher */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary">
                  <div
                    className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                    onClick={handleProfileClick}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile?.avatar_url || '/assets/placeholder/cewek.png'} />
                      <AvatarFallback>{user?.user_metadata?.display_name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user?.user_metadata?.display_name || user?.email?.split('@')[0] || "yourname"}</p>
                      <p className="text-sm text-muted-foreground truncate">@{user?.user_metadata?.username || user?.email?.split('@')[0] || "yourname"}</p>
                    </div>
                  </div>
                  <AccountSwitcher />
                </div>

                {profile?.role === 'admin' && (
                  <Button
                    variant={location.pathname === '/admin' ? 'secondary' : 'ghost'}
                    className="w-full justify-start space-x-3 h-12 text-base"
                    onClick={() => navigate('/Admin_Dashbord')}
                  >
                    <Home className="h-6 w-6" />
                    <span>Dashbaord Admin</span>
                  </Button>
                )}

                <div className="space-y-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={index}
                        variant={item.active ? 'secondary' : 'ghost'}
                        className="w-full justify-start space-x-3 h-12"
                        onClick={() =>
                          handleNavigation(item.path, item.onClick)
                        }
                      >
                        <div className="relative">
                          <Icon className="h-6 w-6" />
                          {item.badge && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs starmar-gradient border-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <hr className="border-border" />

                {/* Settings & Logout are now in AccountSwitcher */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around z-40">
          {navItems.slice(0, 5).map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="h-12 w-12 relative"
                onClick={() => handleNavigation(item.path, item.onClick)}
              >
                <Icon
                  className={`h-6 w-6 ${item.active ? 'text-primary' : ''}`}
                />
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs starmar-gradient border-0">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Spacer for fixed navigation */}
      <div className="hidden md:block w-72" />
      <div className="md:hidden h-16" />
      <div className="md:hidden h-16" />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
};
