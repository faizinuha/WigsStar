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

// Kita akan menyesuaikan interface agar sesuai dengan data yang diformat dari index.jsx
interface PostUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  location?: string;
  // Menambahkan properti user yang sudah diratakan
  user: {
    username: string;
    displayName: string;
    avatar: string;
  };
}

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  // Gunakan optional chaining untuk memastikan properti ada
  const initialLikes = post?.likes ?? 0;
  const initialIsLiked = post?.isLiked ?? false;
  const initialIsBookmarked = post?.isBookmarked ?? false;
  const initialContent = post?.content ?? "";

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [showFullCaption, setShowFullCaption] = useState(false);

  // Fungsi interaksi tetap sama
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    // TODO: Tambahkan logika untuk mengirim update ke Supabase
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Tambahkan logika untuk mengirim update ke Supabase
  };

  const isLongCaption = initialContent.length > 150;
  const displayContent = showFullCaption || !isLongCaption 
    ? initialContent
    : initialContent.substring(0, 150) + "...";

  // Pastikan properti user dan image ada sebelum dirender
  if (!post || !post.user) {
    return null;
  }

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
              {/* Menggunakan `post.timestamp` yang datang dari data mock.
              Jika dari Supabase, gunakan `created_at` dan format dengan `date-fns` */}
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