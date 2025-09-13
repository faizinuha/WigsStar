import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemeCard } from "@/components/posts/MemeCard";
import { Navigation } from "@/components/layout/Navigation";
import { Loader2 } from "lucide-react";

interface Meme {
  id: string;
  user_id: string;
  caption: string;
  media_url: string;
  media_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const Memes = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: memes = [], isLoading } = useQuery({
    queryKey: ["memes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memes")
        .select(`
          *,
          profiles!memes_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data as any) || [];
    },
  });

  const loadMore = () => {
    // Simple pagination - will implement infinite scroll later
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
        !isLoading
      ) {
        // For now, just log - can implement infinite scroll later
        console.log("Near bottom of page");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="md:ml-72 min-h-screen pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Memes 😂
            </h1>
            <p className="text-muted-foreground mt-2">
              The funniest content from our community
            </p>
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