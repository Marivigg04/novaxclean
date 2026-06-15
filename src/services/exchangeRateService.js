import { supabase } from '../lib/supabase';

const FALLBACK_RATE = 36.50; // Fallback in case everything fails

export const getExchangeRate = async () => {
  try {
    // 1. Get current rate from database
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('currency', 'VES')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
      console.error('Error fetching exchange rate from DB:', error);
    }

    let rate = data?.rate || FALLBACK_RATE;
    let lastUpdated = data?.updated_at ? new Date(data.updated_at) : new Date(0);

    // 2. Check if rate is older than 12 hours
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    const now = new Date();

    if (now - lastUpdated > twelveHoursInMs) {
      // Trigger lazy update in the background. 
      // We don't await this to avoid blocking the UI, except if there's no data at all.
      const updatePromise = supabase.functions.invoke('update-bcv-rate');
      
      if (!data) {
        // If we had no data at all, we wait for the update to finish
        try {
          const { data: updateData, error: updateError } = await updatePromise;
          if (!updateError && updateData && updateData.rate) {
             rate = updateData.rate;
          }
        } catch (e) {
          console.error('Error in initial edge function call:', e);
        }
      } else {
        // Just let it run in background to update the DB for the next request
        updatePromise.catch(e => console.error('Error in background edge function call:', e));
      }
    }

    return rate;
  } catch (error) {
    console.error('Unexpected error in getExchangeRate:', error);
    return FALLBACK_RATE;
  }
};
