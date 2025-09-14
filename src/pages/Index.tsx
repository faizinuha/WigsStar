import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Navigation } from "@/components/layout/Navigation";
import { PostCard } from "@/components/posts/PostCard";
import { CreatePost } from "@/components/posts/CreatePost";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/hooks/useProfile";

const Index = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          caption,
          created_at,
          likes_count,
          comments_count,
          location,
          user:profiles!user_id(username, display_name, avatar_url),
          post_media(media_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((post: any) => ({
        id: post.id,
        user_id: post.user_id,
        content: post.caption || '',
        image: post.post_media[0]?.media_url || '',
        image_url: post.post_media[0]?.media_url || '',
        created_at: post.created_at,
        timestamp: formatDistanceToNow(parseISO(post.created_at), { addSuffix: true }),
        likes: post.likes_count,
        likes_count: post.likes_count,
        comments: post.comments_count,
        comments_count: post.comments_count,
        location: post.location,
        user: { 
          id: post.user.user_id,
          username: post.user.username,
          displayName: post.user.display_name || post.user.username,
          avatar: post.user.avatar_url,
        },
        isLiked: false,
        isBookmarked: false,
        is_liked: false,
        is_bookmarked: false,
      })) as Post[];
    },
  });

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
            
            {posts?.slice(0, 7).map((post) => (
              <div key={post.id} className="flex flex-col items-center space-y-2 min-w-[70px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                  <Avatar className="w-full h-full border-2 border-background">
                    <AvatarImage src={post.user.avatar || ''} />
                    <AvatarFallback>{post.user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-muted-foreground truncate w-16 text-center" title={post.user.username}>
                  {post.user.username}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Feed Posts */}
        <div className="space-y-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        {!isLoading && posts && posts.length > 0 && (
          <div className="flex justify-center py-8">
            <Button variant="outline" className="rounded-full px-8">
              Load More Posts
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;