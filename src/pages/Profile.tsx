import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MoreHorizontal,
  Grid3X3,
  Bookmark,
  Heart,
  MessageCircle,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Lock,
} from "lucide-react";
import { useProfile, useUserPosts, useDeletePost, Post, useTogglePostLike } from "@/hooks/useProfile";
import { useFollowStatus, useToggleFollow } from "@/hooks/useFollow";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PostCard = ({ post, authUser }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const { mutate: deletePost } = useDeletePost();
  const { mutate: toggleLike } = useTogglePostLike();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwnPost = authUser?.id === post.user_id;

  const handleLike = () => {
    toggleLike({ postId: post.id, isLiked });
    setIsLiked(!isLiked);
  };

  return (
    <Card className="p-4 md:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
          <AvatarFallback className="text-2xl">{post.user.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold">{post.user.displayName}</h4>
          <p className="text-sm text-muted-foreground">@{post.user.username} · {post.timestamp}</p>
        </div>
        {isOwnPost ? (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 focus:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => deletePost(post.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div>
        {post.content && (
          <p className="text-foreground leading-relaxed whitespace-pre-line mb-4">
            {post.content}
          </p>
        )}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full h-auto object-cover rounded-lg"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className="flex items-center space-x-1"
          >
            <Heart fill={isLiked ? "currentColor" : "none"} className={`h-4 w-4 transition-colors ${isLiked ? "text-red-500" : ""}`} />
            <span>{post.likes}</span>
          </button>
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </div>
        </div>
        <button onClick={() => setIsBookmarked(!isBookmarked)}>
          <Bookmark fill={isBookmarked ? "currentColor" : "none"} className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
};

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user: authUser } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(userId);
  const { data: posts, isLoading: postsLoading, error: postsError } = useUserPosts(userId);
  const { data: isFollowing = false, isLoading: followLoading } = useFollowStatus(userId || '');
  const { mutate: toggleFollow } = useToggleFollow();
  const { mutate: toggleLike } = useTogglePostLike();

  const loading = profileLoading || postsLoading || followLoading;
  const error = profileError || postsError;

  const userPosts: (Post & { timestamp: string })[] = posts
    ? posts.map((post) => ({
      ...post,
      timestamp: format(new Date(post.created_at), "PP"),
    }))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <p className="text-xl font-semibold text-red-500">Error</p>
        <p className="text-muted-foreground">{error?.message || "Profile not found."}</p>
      </div>
    );
  }

  const isOwnProfile = !userId || authUser?.id === profile.user_id;
  const targetUserId = userId || authUser?.id;

  // Handle privacy settings - hide content if private and not following
  const showContent = !profile.is_private || isOwnProfile || isFollowing;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden animate-fade-in">
          {/* Cover Image */}
          <div className="h-48 md:h-64 relative overflow-hidden">
            <img
              src={profile.avatar_url || '/placeholder-cover.jpg'}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 md:-mt-16">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profile.avatar_url || '/placeholder-avatar.jpg'} alt={profile.display_name} />
                  <AvatarFallback className="text-2xl">{profile.display_name?.charAt(0) || profile.username.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="mt-4 md:mt-0 md:mb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{profile.display_name || profile.username}</h1>
                    {profile.is_verified && (
                      <Badge className="starmar-gradient text-white border-0">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg">@{profile.username}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                {isOwnProfile ? (
                  <Button variant="outline" onClick={() => { /* Navigate to edit profile */ }}>
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      className={!isFollowing ? "gradient-button" : ""}
                      onClick={() => toggleFollow({ userId: targetUserId!, isFollowing })}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Link to={`/messages/${profile.username}`}>
                      <Button variant="outline" size="icon">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bio & Details */}
            <div className="mt-6 space-y-4">
              <p className="text-foreground whitespace-pre-line leading-relaxed">
                {profile.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="h-4 w-4" />
                    <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(profile.join_date || profile.created_at), "MMMM yyyy")}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="text-center">
                  <p className="font-bold text-lg">{profile.posts_count}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <p className="font-bold text-lg">{profile.followers_count.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <p className="font-bold text-lg">{profile.following_count.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96 mx-auto">
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <Grid3X3 className="h-4 w-4" />
              <span>Posts</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <span>Saved</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Liked</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {!showContent ? (
              <div className="text-center py-12">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">This account is private</h3>
                <p className="text-muted-foreground">
                  Follow this account to see their posts.
                </p>
              </div>
            ) : userPosts.length > 0 ? (
              userPosts.map((post: Post) => (
                <PostCard key={post.id} post={post} authUser={authUser} />
              ))
            ) : (
              <div className="text-center py-12">
                <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum ada post</h3>
                <p className="text-muted-foreground">
                  Pengguna ini belum membuat postingan apa pun.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved posts yet</h3>
              <p className="text-muted-foreground">
                Posts you save will appear here for easy access later.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="liked" className="space-y-6">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No liked posts yet</h3>
              <p className="text-muted-foreground">
                Posts you like will appear here so you can find them again.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;