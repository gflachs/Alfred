import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sendSMS = async (message: string, phoneNumber: string) => {
  const { error } = await supabase.functions.invoke("send-message", {
    body: {
      textMessage: message,
      toMobile: phoneNumber,
    },
  });

  if (error) {
    return {
      success: false,
      error: "Fehler beim Senden der SMS: " + error.message,
    };
  }

  return { success: true, error: null };
};

export { supabase, sendSMS };
