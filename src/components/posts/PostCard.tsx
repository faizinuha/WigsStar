import { useState, useRef } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  MapPin,
  Maximize,
  Repeat,
  Laugh
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useDeletePost, useTogglePostLike } from "@/hooks/useProfile"; // Import useTogglePostLike
import { useToast } from "@/components/ui/use-toast";
import { CommentSection } from "./CommentSection"; // Import CommentSection

// Interface disesuaikan dengan data dari Supabase
interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string; // Menggunakan created_at dari Supabase
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
  repost_by?: {
    username: string;
    displayName: string;
  };
}

interface PostCardProps {
  post: Post;
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d`;
  }
};

const RepostCard = ({ repost_by, children }) => (
  <div className="bg-muted/20 rounded-lg p-4 mt-2">
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
      <Repeat className="h-4 w-4" />
      <span>Reposted by {repost_by.displayName}</span>
    </div>
    {children}
  </div>
);

export const PostCard = ({ post }: PostCardProps) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const deletePostMutation = useDeletePost();
  const toggleLikeMutation = useTogglePostLike(); // Initialize useTogglePostLike

  const initialContent = post?.content ?? "";

  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showComments, setShowComments] = useState(false); // New state for comments

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "You need to be logged in to like posts.",
        variant: "destructive",
      });
      return;
    }
    toggleLikeMutation.mutateAsync({ postId: post.id, isLiked: post.isLiked });
  };

  const handleBookmark = () => {
    // TODO: Logic to update Supabase
  };

  const handleDelete = async () => {
    await deletePostMutation.mutateAsync(post.id);
    toast({ title: "Post deleted successfully" });
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({ title: "Link copied to clipboard" });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by @${post.user.username}`,
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard!",
      });
    }
  };

  const isLongCaption = initialContent.length > 150;
  const displayContent = showFullCaption || !isLongCaption 
    ? initialContent
    : `${initialContent.substring(0, 150)}...`;

  if (!post || !post.user) {
    return null;
  }

  const isOwnPost = currentUser?.id === post.user_id;

  const PostContent = () => (
    <Card className="post-card bg-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
            <AvatarFallback>{post.user.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{post.user.displayName}</p>
              <Laugh className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>@{post.user.username}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost ? (
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">Delete Post</DropdownMenuItem>
            ) : (
              <DropdownMenuItem>Follow @{post.user.username}</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyLink}>Copy link</DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>Share to...</DropdownMenuItem>
            <DropdownMenuItem>Repost</DropdownMenuItem>
            {!isOwnPost && <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="aspect-square overflow-hidden bg-black">
          <img
            src={post.image_url}
            alt="Post content"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLike}
            >
              <Heart 
                className={`h-6 w-6 transition-all duration-200 ${
                  post.isLiked
                    ? 'fill-red-500 text-red-500 animate-heart-beat'
                    : 'hover:text-red-500'
                }`}
              />
            </Button>

            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setShowComments(true)}>
              <MessageCircle className="h-6 w-6 hover:text-blue-500 transition-colors" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Share className="h-6 w-6 hover:text-green-500 transition-colors" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={handleBookmark}
          >
            <Bookmark 
              className={`h-6 w-6 transition-colors ${
                post.isBookmarked
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'hover:text-yellow-500'
              }`}
            />
          </Button>
        </div>

        {/* Likes Count */}
        <div className="text-sm font-semibold">
          {post.likes.toLocaleString()} likes
        </div>

        {/* Caption */}
        <div className="text-sm space-y-1">
          <span className="font-semibold">@{post.user.username}</span>{" "}
          <span className="whitespace-pre-wrap">{displayContent}</span>
          {isLongCaption && !showFullCaption && (
            <button
              className="text-muted-foreground hover:text-foreground ml-1"
              onClick={() => setShowFullCaption(true)}
            >
              more
            </button>
          )}
        </div>

        {/* Comments Link */}
        {post.comments > 0 && (
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowComments(true)}
          >
            View all {post.comments} comments
          </button>
        )}
      </div>
    </Card>
  );

  if (post.repost_by) {
    return (
      <RepostCard repost_by={post.repost_by}>
        <PostContent />
      </RepostCard>
    );
  }

  return (
    <>
      <PostContent />
      {post.id && (
        <CommentSection
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          postId={post.id}
        />
      )}
    </>
  );
};