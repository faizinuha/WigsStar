import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrackById, Track } from '../lib/spotify';

export default function PlayPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrack = async () => {
      if (!trackId) {
        setError('Track ID tidak ditemukan.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getTrackById(trackId);
        setTrack(data);
      } catch (err: any) {
        console.error('Error fetching track details:', err);
        setError(err.message || 'Gagal memuat detail lagu.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [trackId]);

  return (
    <div className="bg-[#121212] min-h-screen text-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <Link to="/" className="text-gray-400 hover:text-white transition mb-4 inline-block">
            &larr; Kembali ke Rekomendasi
          </Link>
          <h1 className="text-3xl font-bold">Now Playing</h1>
        </header>

        {loading && <p className="text-center">Loading track...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {track && (
          <div className="bg-[#181818] p-6 rounded-xl text-center">
            <img
              src={track.image_url}
              alt={track.name}
              className="rounded-lg mb-4 w-full mx-auto"
            />
            <p className="text-2xl font-bold truncate">{track.name}</p>
            <p className="text-lg text-gray-300 truncate">{track.artist}</p>
            <p className="text-md text-gray-400 truncate mb-6">{track.album_title}</p>

            <a
              href={`https://open.spotify.com/track/${track.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition inline-flex items-center"
            >
              Dengarkan di Spotify
            </a>
          </div>
        )}
      </div>
    </div>
  );
}