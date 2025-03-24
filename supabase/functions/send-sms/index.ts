import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import twilio from "https://esm.sh/twilio";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS-Header
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // ⚠️ Environment-Variablen werden innerhalb von serve() geladen
    const twilioClient = twilio(
      Deno.env.get("TWILIO_ACCOUNT_SID"),
      Deno.env.get("TWILIO_AUTH_TOKEN")
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Authorization prüfen
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Kein Authorization-Header vorhanden." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Ungültiger oder abgelaufener Token." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Payload parsen
    const payload = await req.json();
    const { phoneNumber, firstName, lastName } = payload;

    if (!phoneNumber || !firstName || !lastName) {
      return new Response(
        JSON.stringify({
          error: "Fehlende Daten: Telefonnummer, Vorname oder Nachname fehlt.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Twilio SMS senden
    const message = await twilioClient.messages.create({
      body: `Hallo ${firstName} ${lastName}, Sie wurden als Notfallkontakt hinzugefügt.`,
      from: Deno.env.get("TWILIO_PHONE_NUMBER"), // Deine Twilio-Nummer
      to: phoneNumber,
    });

    return new Response(
      JSON.stringify({ success: true, messageSid: message.sid }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Fehler in der Edge Function:", error);
    return new Response(
      JSON.stringify({ error: "Fehler beim Senden der SMS: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
