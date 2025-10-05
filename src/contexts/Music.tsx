import { useEffect, useState } from "react";
// Import fungsi getRecommendations dan type Track dari Supabase
import { getRecommendations, Track } from "../lib/spotify"; 

export default function MusicPage() {
  // State menggunakan tipe data Track[]
  const [tracks, setTracks] = useState<Track[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null); 
        
        // Panggilan yang type-safe
        const data: Track[] = await getRecommendations(); 
        
        setTracks(data); 

      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Gagal memuat rekomendasi dari database');
        setTracks([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    // Struktur UI (JSX) Anda SAMA PERSIS dengan sebelumnya, 
    // hanya variabel yang dipanggil di dalam map yang disesuaikan.
    <div className="bg-[#121212] min-h-screen text-white p-8">
      <header className="flex items-center gap-3 mb-8">
        <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
        <h1 className="text-2xl font-bold">🎵 MyMusic - Recommendations</h1>
      </header>

      {loading && <p className="text-center">Loading recommendations...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {tracks.map((track) => (
          // UI Item (JSX)
          <div key={track.id} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition">
            
            {/* Menggunakan kolom dari Supabase: image_url */}
            <img 
              src={track.image_url} 
              alt={track.name} 
              className="rounded-lg mb-3" 
            />
            
            <p className="font-medium truncate">{track.name}</p>
            
            {/* Menggunakan kolom dari Supabase: artist dan album_title */}
            <p className="text-sm text-gray-400 truncate">
              {track.artist} - {track.album_title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}