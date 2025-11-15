import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrackById, Track } from '../lib/api/mymusic';

export default function PlayPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

        const source = data.preview || data.audio || data.music_url;
        if (source) {
          // Pastikan audioRef.current ada sebelum mengaksesnya
          if (!audioRef.current) {
            audioRef.current = new Audio(source);
          } else {
            audioRef.current.src = source;
          }

          const audio = audioRef.current;

          const handlePlaying = () => setIsPlaying(true);
          const handlePause = () => setIsPlaying(false);

          audio.addEventListener('playing', handlePlaying);
          audio.addEventListener('pause', handlePause);
          audio.addEventListener('ended', handlePause); // Juga berhenti saat lagu selesai

          // Cleanup listeners saat komponen di-unmount atau trackId berubah
          return () => {
            audio.pause();
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handlePause);
          };
        }
      } catch (err: any) {
        console.error('Error fetching track details:', err);
        setError(err.message || 'Gagal memuat detail lagu.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [trackId]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Play bisa gagal jika user belum berinteraksi dengan halaman
      audioRef.current.play().catch(err => {
        console.error("Gagal memulai pemutaran:", err);
        setIsPlaying(false); // Pastikan state kembali ke false jika play gagal
      });
    }
  };

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

            <button
              onClick={togglePlay}
              className="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition inline-flex items-center"
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
