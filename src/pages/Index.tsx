import { useState } from "react";
import { PostCard } from "@/components/posts/PostCard";
import { PostGrid } from "@/components/posts/PostGrid";
import { PostDetailModal } from "@/components/posts/PostDetailModal";
import { SuggestedFriends } from "@/components/posts/SuggestedFriends";
import { StoriesSection } from "@/components/posts/StoriesSection";
import { CreatePost } from "@/components/posts/CreatePost";
import { Navigation } from "@/components/layout/Navigation";
import { TrendingTags } from "@/components/posts/TrendingTags";
import { useAllPosts, Post } from "@/hooks/usePosts";
import { Loader2, Grid3X3, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: posts = [], isLoading } = useAllPosts();
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Posts</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'feed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('feed')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Feed
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                </div>
              </div>
              {/* Content based on view mode */}
              {viewMode === 'feed' ? (
                <div className="space-y-8">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <PostGrid
                  posts={posts}
                  onPostClick={(post) => setSelectedPost(post)}
                />
              )}
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
              <div className="sticky top-8 space-y-6">
                <SuggestedFriends />
                <TrendingTags />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};

export default Index;