import { useState, useRef } from "react";
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
  Repeat
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useDeletePost } from "@/hooks/useProfile";
import { useToast } from "@/components/ui/use-toast";

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

  const initialLikes = post?.likes ?? 0;
  const initialIsLiked = post?.isLiked ?? false;
  const initialIsBookmarked = post?.isBookmarked ?? false;
  const initialContent = post?.content ?? "";

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLongImage, setIsLongImage] = useState(false);

  const checkImageRatio = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalHeight > naturalWidth * 1.5) {
      setIsLongImage(true);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    // TODO: Logic to update Supabase
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
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
        title: `Post by ${post.user.displayName}`,
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`,
      });
    } else {
      toast({ title: "Share not supported on this browser" });
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
            <p className="font-semibold text-sm">{post.user.displayName}</p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>@{post.user.username}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{post.location}</span>
                  </div>
                </>
              )}
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
        <div className={`relative group ${isExpanded ? '' : 'aspect-square'} overflow-hidden`}>
          <img
            src={post.image_url}
            alt="Post content"
            className={`w-full h-full object-cover transition-all duration-500 ${isExpanded ? '' : 'group-hover:scale-105'}`}
            onLoad={checkImageRatio}
          />
          {isLongImage && !isExpanded && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full bg-black/50 text-white hover:bg-black/75 h-8 px-3"
                onClick={() => setIsExpanded(true)}
              >
                <Maximize className="h-4 w-4 mr-1.5" />
                Show More
              </Button>
            </div>
          )}
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
                  isLiked 
                    ? 'fill-red-500 text-red-500 animate-heart-beat' 
                    : 'hover:text-red-500'
                }`}
              />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-10 w-10">
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
                isBookmarked 
                  ? 'fill-yellow-500 text-yellow-500' 
                  : 'hover:text-yellow-500'
              }`}
            />
          </Button>
        </div>

        {/* Likes Count */}
        <div className="text-sm font-semibold">
          {likesCount.toLocaleString()} likes
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
          <button className="text-sm text-muted-foreground hover:text-foreground">
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

  return <PostContent />;
};