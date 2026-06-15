import { useState, useEffect } from 'react';
import { getExchangeRate } from '../services/exchangeRateService';

// We can cache it in memory so we don't spam the DB if multiple components use this hook
let cachedRate = null;
let fetchPromise = null;

export function useExchangeRate() {
  const [rate, setRate] = useState(cachedRate || 36.50);
  const [loading, setLoading] = useState(cachedRate === null);

  useEffect(() => {
    if (cachedRate !== null) {
      setRate(cachedRate);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = getExchangeRate();
    }

    fetchPromise.then(newRate => {
      cachedRate = newRate;
      setRate(newRate);
      setLoading(false);
    }).catch(() => {
      // Fallback already handled in service, but just in case
      setLoading(false);
    });
  }, []);

  return { rate, loading };
}
