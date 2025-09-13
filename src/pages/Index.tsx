import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { PostCard } from "@/components/posts/PostCard";
import { CreatePost } from "@/components/posts/CreatePost";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";

// Mock data for the feed
const mockPosts = [
  {
    id: "1",
    user: {
      id: "1",
      username: "alex_photo",
      displayName: "Alex Photography",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    content: "Golden hour magic in the city! 🌅 The way light dances through the streets never gets old.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
    timestamp: "2 hours ago",
    likes: 1234,
    comments: 89,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: "2", 
    user: {
      id: "2",
      username: "maria_travels",
      displayName: "Maria Adventures",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face"
    },
    content: "Found this hidden gem in Tokyo! The architecture here tells stories of centuries past and future dreams. ✨🏯",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=800&fit=crop",
    timestamp: "6 hours ago",
    likes: 892,
    comments: 45,
    isLiked: true,
    isBookmarked: true
  },
  {
    id: "3",
    user: {
      id: "3", 
      username: "david_chef",
      displayName: "David Culinary",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    content: "Homemade pasta with truffle cream sauce. Sometimes the simplest ingredients create the most extraordinary experiences. 🍝👨‍🍳",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=800&fit=crop",
    timestamp: "1 day ago",
    likes: 567,
    comments: 23,
    isLiked: false,
    isBookmarked: false
  }
];

const Index = () => {
  const [posts] = useState(mockPosts);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create Post Section */}
        <CreatePost />
        
        {/* Stories Section */}
        <Card className="p-4">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <div className="flex flex-col items-center space-y-2 min-w-[70px]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                <Avatar className="w-full h-full border-2 border-background">
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-muted-foreground">Your Story</span>
            </div>
            
            {mockPosts.map((post) => (
              <div key={post.id} className="flex flex-col items-center space-y-2 min-w-[70px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                  <Avatar className="w-full h-full border-2 border-background">
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-muted-foreground truncate w-16 text-center">
                  {post.user.username}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Feed Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center py-8">
          <Button variant="outline" className="rounded-full px-8">
            Load More Posts
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;