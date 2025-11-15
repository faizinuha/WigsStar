import { serve } from "https://deno.land/std/http/server.ts";
serve(async (req)=>{
  // Handle CORS preflight
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
    const res = await fetch("https://api.deezer.com/chart/0/tracks");
    const json = await res.json();
    const tracks = json.data.map((t)=>({
        id: t.id.toString(),
        name: t.title,
        artist: t.artist.name,
        album_title: t.album.title,
        image_url: t.album.cover_big
      }));
    return new Response(JSON.stringify({
      tracks
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
