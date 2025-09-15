import { PostCard } from "@/components/posts/PostCard";
import { StoriesSection } from "@/components/posts/StoriesSection";
import { CreatePost } from "@/components/posts/CreatePost";
import { Navigation } from "@/components/layout/Navigation";
import { TrendingTags } from "@/components/posts/TrendingTags";
import { useAllPosts } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: posts = [], isLoading } = useAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="md:ml-72 min-h-screen pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <StoriesSection />
              <CreatePost />
              
              <div className="space-y-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {posts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share something with the community!
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <TrendingTags className="sticky top-8" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;