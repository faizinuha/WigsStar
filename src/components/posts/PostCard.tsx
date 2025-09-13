import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  MapPin 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface Post {
  id: string;
  user: PostUser;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  location?: string;
}

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const isLongCaption = post.content.length > 150;
  const displayContent = showFullCaption || !isLongCaption 
    ? post.content 
    : post.content.substring(0, 150) + "...";

  return (
    <Card className="post-card bg-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
            <AvatarFallback>{post.user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.user.displayName}</p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>@{post.user.username}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
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
            <DropdownMenuItem>Follow @{post.user.username}</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Share to...</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image */}
      {post.image && (
        <div className="aspect-square overflow-hidden">
          <img 
            src={post.image} 
            alt="Post content"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
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
};