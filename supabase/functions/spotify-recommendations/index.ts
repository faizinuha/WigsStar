
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Spotify API credentials from Supabase environment variables/secrets
const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

// Function to get Spotify Access Token
async function getSpotifyAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error fetching Spotify token:', data);
    throw new Error('Failed to fetch Spotify access token');
  }
  return data.access_token;
}

serve(async (_req: { method: string; }) => {
  // Add CORS headers to allow requests from your web app
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  });

  // Handle CORS preflight requests
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    const accessToken = await getSpotifyAccessToken();

    // Fetch new releases from Spotify as an example
    const spotifyResponse = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=20', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const spotifyData = await spotifyResponse.json();
    if (!spotifyResponse.ok) {
        console.error('Error fetching from Spotify API:', spotifyData);
        throw new Error('Failed to fetch data from Spotify');
    }

    // Transform the data to a simpler format for our frontend
    const tracks = spotifyData.albums.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      artist: item.artists.map((artist: any) => artist.name).join(', '),
      album_title: item.name, // For new releases, album name is the item name
      image_url: item.images[0]?.url || '', // Use the first image
    }));

    return new Response(JSON.stringify({ tracks }), {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers,
      status: 500,
    });
  }
});
