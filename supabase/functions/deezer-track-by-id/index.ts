import { serve } from "https://deno.land/std/http/server.ts";
serve(async (req)=>{
  // Handle OPTIONS request (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });
  }
  try {
    const { trackId } = await req.json();
    const res = await fetch(`https://api.deezer.com/track/${trackId}`);
    const t = await res.json();
    const track = {
      id: t.id.toString(),
      name: t.title,
      artist: t.artist.name,
      album_title: t.album.title,
      image_url: t.album.cover_xl
    };
    return new Response(JSON.stringify({
      track
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
