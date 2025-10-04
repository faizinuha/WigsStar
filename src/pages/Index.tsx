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
import { useAuth } from "@/contexts/AuthContext";
import { Grid3X3, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCardSkeleton } from "@/components/skeletons/PostCardSkeleton";
import { PostGridSkeleton } from "@/components/skeletons/PostGridSkeleton";
import { SuggestedFriendsSkeleton } from "@/components/skeletons/SuggestedFriendsSkeleton";
import { StoriesSkeleton } from "@/components/skeletons/StoriesSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  const { loading: authLoading } = useAuth();
  const { data: posts = [], isLoading, error } = useAllPosts();
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Show loading skeleton while auth or posts are loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="md:ml-72 min-h-screen pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Skeleton */}
              <div className="lg:col-span-2 space-y-8">
                <StoriesSkeleton />
                <div className="bg-card rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 bg-muted rounded-full h-10 animate-pulse" />
                  </div>
                </div>
                {/* Posts Skeleton */}
                <div className="space-y-8">
                  {Array.from({ length: 3 }, (_, i) => (
                    <PostCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Sidebar Skeleton */}
              <div className="hidden lg:block lg:col-span-1 space-y-6">
                <div className="sticky top-8 space-y-6">
                  <SuggestedFriendsSkeleton />
                  <div className="bg-card rounded-lg p-4 space-y-3">
                    <div className="h-5 bg-muted rounded animate-pulse" />
                    <div className="space-y-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="md:ml-72 min-h-screen pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😞</div>
              <h3 className="text-lg font-semibold mb-2">Failed to load posts</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the content. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="md:ml-72 min-h-screen pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <ErrorBoundary>
                <StoriesSection />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <CreatePost />
              </ErrorBoundary>
              
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
              <ErrorBoundary>
                {viewMode === 'feed' ? (
                  <div className="space-y-8">
                    {posts.map((post) => (
                      <ErrorBoundary key={post.id}>
                        <PostCard post={post} />
                      </ErrorBoundary>
                    ))}
                  </div>
                ) : (
                  <PostGrid
                    posts={posts}
                    onPostClick={(post) => setSelectedPost(post)}
                  />
                )}
              </ErrorBoundary>
              
              {posts.length === 0 && (
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
                <ErrorBoundary>
                  <SuggestedFriends />
                </ErrorBoundary>
                <ErrorBoundary>
                  <TrendingTags />
                </ErrorBoundary>
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