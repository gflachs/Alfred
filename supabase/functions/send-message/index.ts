import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

import { TwilioSms } from "./helpers/twilio-sms.ts";

import { corsHeaders } from "../_shared/cors.ts";

import { createClient } from "jsr:@supabase/supabase-js@2";

console.log(`Function "browser-with-cors" up and running!`);

const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
const authToken = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
const fromMobile = Deno.env.get("TWILIO_PHONE_NUMBER") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  // Get the session or user object
  const authHeader = req.headers.get("Authorization")!;
  console.log({ authHeader });
  const token = authHeader.replace("Bearer ", "");
  console.log({ token });
  const { data, error } = await supabaseClient.auth.getUser(token);

  if (error || !data.user) {
    console.log("Unauthorized request", { error, user: data.user });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  console.log("User gefunden:", data.user);

  const { textMessage, toMobile } = await req.json();

  const twilioClient = new TwilioSms(accountSid, authToken);

  const message = await twilioClient.sendSms({
    Body: textMessage,
    From: fromMobile,
    To: toMobile,
  });

  console.log({ message });

  const sucessData = {
    isSuccess: false,
  };

  if (message.status === "queued") {
    sucessData.isSuccess = true;
  }

  return new Response(JSON.stringify(sucessData), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
