import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/posts/PostCard";
import { Loader2 } from "lucide-react";
import supabase from "@/lib/supabase";
import { type PostgrestError } from "@supabase/supabase-js";
import { type Tables } from "@/integrations/supabase/types";

// Definisikan tipe data yang lebih spesifik untuk post
type VideoPost = Tables<'posts'> & {
    profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'>;
    post_media: { media_url: string; media_type: string }[];
    // Tambahkan properti lain yang dibutuhkan oleh PostCard
};

const Reelms = () => {
    // Ambil data video langsung dari Supabase, bukan dari useAllPosts
    const { data: videoPosts = [], isLoading, error } = useQuery<VideoPost[], PostgrestError>({
        queryKey: ['video_posts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('posts_with_media') // Asumsi Anda punya view/RPC untuk ini
                .select('*, profiles(username, display_name, avatar_url), post_media(media_url, media_type)')
                .eq('post_media.media_type', 'video'); // Filter di level database
            if (error) throw error;
            // @ts-ignore - Supabase type inference might need adjustment for views
            return data.filter(post => post.post_media.some(media => media.media_type === 'video'));
        }
    });

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-6">Reelms - Video Posts</h2>
            {isLoading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {error && (
                <div className="text-center py-12 text-red-500">
                    <p>Failed to load videos: {error.message}</p>
                </div>
            )}
            {videoPosts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-lg font-semibold mb-2">No video posts yet</h3>
                    <p className="text-muted-foreground">
                        Be the first to share a video with the community!
                    </p>
                </div>
            )}
            <div className="space-y-8">
                {videoPosts.map((post) => (
                    <div key={post.id} className="rounded-lg overflow-hidden bg-card">
                        <div className="aspect-video bg-black flex items-center justify-center">
                            <video
                                // Ambil URL video dari relasi post_media
                                src={post.post_media.find(m => m.media_type === 'video')?.media_url}
                                controls
                                className="w-full h-full object-contain"
                            // Anda bisa menambahkan field thumbnail_url di tabel post_media
                            />
                        </div>
                        <PostCard post={post as any} /> {/* Cast as any for now if PostCard expects a different type */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reelms;
