// /pages/music/index.tsx
import { useEffect, useState } from "react";

export default function MusicPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/spotify")
      .then((res) => {
        if (!res.ok) {
          // Try to parse the error message from the API route
          return res.json().then(err => { throw new Error(err.error || 'Failed to fetch recommendations') });
        }
        return res.json();
      })
      .then((data) => {
        setTracks(data.tracks);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#121212] min-h-screen text-white p-8">
      <header className="flex items-center gap-3 mb-8">
        <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
        <h1 className="text-2xl font-bold">🎵 MyMusic - Recommendations</h1>
      </header>

      {loading && <p className="text-center">Loading recommendations...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {tracks && tracks.map((track) => (
          <div key={track.id} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition">
            <img src={track.album.images[0]?.url} alt={track.name} className="rounded-lg mb-3" />
            <p className="font-medium truncate">{track.name}</p>
            <p className="text-sm text-gray-400 truncate">{track.artists.map(artist => artist.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
