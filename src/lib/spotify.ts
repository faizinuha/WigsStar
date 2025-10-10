import { supabase } from '@/integrations/supabase/client';

/**
 * Interface for the track data structure from the Spotify API.
 */
export interface Track {
  id: string;
  name: string;
  artist: string;
  album_title: string;
  image_url: string;
}

/**
 * Invokes a Supabase Edge Function to get music recommendations from the Spotify API.
 */
export async function getRecommendations(): Promise<Track[]> {
  const { data, error } = await supabase.functions.invoke('spotify-recommendations');

  if (error) {
    console.error('Error invoking Supabase function:', error);
    throw new Error(`Failed to fetch recommendations: ${error.message}`);
  }

  // The edge function returns an object with a 'tracks' property
  return data.tracks as Track[];
}

/**
 * Invokes a Supabase Edge Function to get a single track by its ID from the Spotify API.
 * @param trackId The ID of the Spotify track.
 */
export async function getTrackById(trackId: string): Promise<Track> {
  const { data, error } = await supabase.functions.invoke('spotify-track-by-id', {
    body: { trackId },
  });

  if (error) {
    throw new Error(`Failed to fetch track ${trackId}: ${error.message}`);
  }

  return data.track as Track;
}