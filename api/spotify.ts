// api/spotify.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const client_id = '6eacc2472f984eaa8033bb187b012d78';
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// This function gets an access token from Spotify
const getAccessToken = async () => {
  if (!client_secret) {
    throw new Error('Spotify client secret not set in environment variables.');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Error fetching token", data);
    throw new Error('Failed to fetch access token from Spotify');
  }
  return data.access_token;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getAccessToken();

    // Fetch recommendations from Spotify using the new token
    const recommendationsUrl = 'https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA';
    
    const response = await fetch(recommendationsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Spotify API Error:', text);
      return res.status(response.status).json({ error: 'Gagal mengambil data dari Spotify.' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Server error:', err);
    const message = err.message || 'An error occurred on the server.';
    return res.status(500).json({ error: message });
  }
}
