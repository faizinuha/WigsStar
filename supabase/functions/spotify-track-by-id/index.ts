import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * Fetches a Spotify access token using the client credentials flow.
 * Logs errors for better debugging in Supabase logs.
 * It requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to be set as environment variables.
 */
async function getSpotifyAccessToken() {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.error('Spotify environment variables not set.');
    throw new Error('Spotify client ID or secret is not set in environment variables.');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + ),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Spotify token fetch failed: ${response.status} ${errorText}`);
    throw new Error(`Failed to get Spotify token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Function invoked. Processing request.');
    const { trackId } = await req.json();
    if (!trackId) {
      return new Response(JSON.stringify({ error: 'trackId is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Fetching access token for trackId: ${trackId}`);
    const accessToken = await getSpotifyAccessToken();

    const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!trackResponse.ok) {
      const errorBody = await trackResponse.text();
      console.error(`Spotify API error for trackId ${trackId}: ${trackResponse.status} - ${errorBody}`);
      throw new Error(`Spotify API error: ${trackResponse.statusText}`);
    }

    const spotifyTrack = await trackResponse.json();
    console.log('Successfully fetched track from Spotify.');

    // Format the data to match the 'Track' interface in your frontend
    const formattedTrack = {
      id: spotifyTrack.id,
      name: spotifyTrack.name,
      artist: spotifyTrack.artists.map((artist: any) => artist.name).join(', '),
      album_title: spotifyTrack.album.name,
      image_url: spotifyTrack.album.images[0]?.url || '',
    };

    return new Response(JSON.stringify({ track: formattedTrack }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('An unhandled error occurred:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});