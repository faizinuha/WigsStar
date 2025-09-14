import { Navigation } from "@/components/layout/Navigation";
import { PostCard } from "@/components/posts/PostCard";
import { CreatePost } from "@/components/posts/CreatePost";
import { StoriesSection } from "@/components/posts/StoriesSection";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAllPosts } from "@/hooks/useProfile";

const Index = () => {
  const { data: posts, isLoading } = useAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create Post Section */}
        <CreatePost />
        
        {/* Stories Section */}
        <StoriesSection />

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

        {/* Empty State */}
        {!isLoading && posts && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Create the first one!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;