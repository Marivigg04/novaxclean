import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.10.0";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Fetching BCV rate from API...");
    
    // 1. Fetch BCV Rate using DolarApi to avoid BCV's invalid SSL certificate issues in Deno
    const response = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");

    if (!response.ok) {
      throw new Error(`Failed to fetch API: ${response.status}`);
    }

    const json = await response.json();
    
    // 2. Extract rate
    const rate = json.promedio;

    if (!rate || isNaN(rate)) {
       throw new Error("Parsed rate is invalid from API: " + JSON.stringify(json));
    }
    
    console.log(`Parsed rate: ${rate}`);

    // 3. Update Supabase
    // Using service role key to bypass RLS for writing to exchange_rates table
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseKey) {
       throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('exchange_rates')
      .upsert({ currency: 'VES', rate: rate, updated_at: new Date().toISOString() })
      .select();

    if (error) {
       throw error;
    }

    return new Response(JSON.stringify({ success: true, rate, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error updating BCV rate:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
