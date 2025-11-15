import { supabase } from "@/integrations/supabase/client";

export interface Track {
  music_url: any;
  audio: any;
  preview: any;
  id: string;
  name: string;
  artist: string;
  album_title: string;
  image_url: string;
}

export async function getRecommendations(): Promise<Track[]> {
  const { data, error } = await supabase.functions.invoke("deezer-recommendations");

  if (error) {
    throw new Error(error.message);
  }

  return data.tracks as Track[];
}

export async function getTrackById(trackId: string): Promise<Track> {
  const { data, error } = await supabase.functions.invoke("deezer-track-by-id", {
    body: { trackId },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.track as Track;
}
