import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.10.0'

console.log("log-session function booting up");

interface UserSession {
  user_id: string;
  device?: string;
  ip_address?: string;
  user_agent?: string;
  refresh_token: string;
}

interface UserLog {
  user_id: string;
  action: 'login';
  ip_address?: string;
  user_agent?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function logUserSession(supabaseClient: SupabaseClient, session: UserSession, log: UserLog) {
  console.log("Attempting to log session for user:", session.user_id);
  const { error: sessionError } = await supabaseClient.from('user_sessions').insert(session);
  if (sessionError) {
    console.error("Error logging session:", sessionError);
    throw new Error(`Failed to log session: ${sessionError.message}`);
  }
  console.log("Session logged successfully.");

  console.log("Attempting to log action:", log.action);
  const { error: logError } = await supabaseClient.from('user_logs').insert(log);
  if (logError) {
    console.error("Error logging action:", logError);
    throw new Error(`Failed to log action: ${logError.message}`);
  }
  console.log("Action logged successfully.");
}

serve(async (req: { method: string; headers: { get: (arg0: string) => string; }; json: () => any; }) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY are not set in environment variables");
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found for the provided token");

    const body = await req.json();
    const { refreshToken, device } = body;
    if (!refreshToken) throw new Error("Request body must include a refreshToken");

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const userAgent = req.headers.get('user-agent');

    const sessionData: UserSession = {
      user_id: user.id,
      refresh_token: refreshToken,
      device: device || 'Browser',
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    const logData: UserLog = {
      user_id: user.id,
      action: 'login',
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    await logUserSession(supabaseClient, sessionData, logData);

    return new Response(JSON.stringify({ message: "Session logged successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("An error occurred:", error instanceof Error ? error.message : error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})