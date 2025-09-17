import { useAllMemesWithBadges } from "@/hooks/useMemes";
import { MemeCard } from "@/components/posts/MemeCard";
import { Navigation } from "@/components/layout/Navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Memes = () => {
  const { data: memes = [], isLoading, refetch } = useAllMemesWithBadges();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="md:ml-72 min-h-screen pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Halaman Memes 😂
              </h1>
              <p className="text-muted-foreground mt-2">
                Selamat datang! Lihat, bagikan, dan tambahkan lencana ke meme terlucu dari komunitas kami.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="space-y-8">
            {memes.map((meme) => (
              <MemeCard key={meme.id} meme={meme} />
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {memes.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤷‍♀️</div>
              <h3 className="text-lg font-semibold mb-2">No memes yet</h3>
              <p className="text-muted-foreground">
                Be the first to share a meme with the community!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};