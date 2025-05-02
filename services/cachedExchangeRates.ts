import * as SecureStore from "expo-secure-store";
import {
  fetchExchangeRatesFromFirestore,
  getDefaultRates,
} from "./exchangeRatesFirestore";
import {ExchangeRate} from "./exchangeRates";

// --- Constants ---
const CACHED_RATES_KEY = "cachedExchangeRatesData";
const LAST_UPDATE_TIMESTAMP_KEY = "lastRatesUpdateTime";

// --- Interfaces ---
interface CachedData {
  rates: ExchangeRate[];
  timestamp: number; // Store as milliseconds since epoch (Date.now())
}

// --- Helper Functions ---

/**
 * Reads rates and timestamp from SecureStore.
 * Returns null if data doesn't exist or fails to parse.
 */
async function _readFromCache(): Promise<CachedData | null> {
  try {
    const ratesJson = await SecureStore.getItemAsync(CACHED_RATES_KEY);
    const timestampStr = await SecureStore.getItemAsync(
      LAST_UPDATE_TIMESTAMP_KEY
    );

    if (ratesJson && timestampStr) {
      const rates: ExchangeRate[] = JSON.parse(ratesJson);
      const timestamp = parseInt(timestampStr, 10);
      // Basic validation
      if (Array.isArray(rates) && !isNaN(timestamp)) {
        return {rates, timestamp};
      }
    }
    console.log("No valid cache data found in SecureStore.");
    return null;
  } catch (error) {
    console.error("Error reading from SecureStore:", error);
    // Consider deleting corrupted keys if parsing fails
    // await SecureStore.deleteItemAsync(CACHED_RATES_KEY);
    // await SecureStore.deleteItemAsync(LAST_UPDATE_TIMESTAMP_KEY);
    return null;
  }
}

/**
 * Writes rates and current timestamp to SecureStore.
 */
async function _writeToCache(rates: ExchangeRate[]): Promise<void> {
  try {
    const timestamp = Date.now();
    await SecureStore.setItemAsync(CACHED_RATES_KEY, JSON.stringify(rates));
    await SecureStore.setItemAsync(
      LAST_UPDATE_TIMESTAMP_KEY,
      timestamp.toString()
    );
    console.log("Rates successfully saved to SecureStore cache.");
  } catch (error) {
    console.error("Error writing to SecureStore:", error);
  }
}

/**
 * Determines if the cache needs to be updated based on time rules.
 */
function _needsUpdate(lastUpdateTimestamp: number | null): boolean {
  if (lastUpdateTimestamp === null) {
    console.log("Cache update needed: No previous timestamp.");
    return true; // No data cached yet
  }

  const now = new Date();
  const lastUpdateDate = new Date(lastUpdateTimestamp);

  // --- Define target update times for TODAY ---
  const today8AM = new Date(now);
  today8AM.setHours(8, 0, 0, 0);

  const today1PM = new Date(now);
  today1PM.setHours(13, 0, 0, 0);

  // --- Logic ---
  // 1. Is it a different day than the last update?
  const isNewDay = now.toDateString() !== lastUpdateDate.toDateString();

  if (isNewDay) {
    // If it's a new day, update if the current time is past 8 AM
    const shouldUpdate = now >= today8AM;
    console.log(
      `Cache update needed (new day, past 8 AM? ${
        now >= today8AM
      }): ${shouldUpdate}`
    );
    return shouldUpdate;
  } else {
    // It's the same day as the last update
    const updatedBefore8AM = lastUpdateDate < today8AM;
    const updatedBefore1PM = lastUpdateDate < today1PM;

    // 2. Need update if current time is past 8 AM AND last update was before 8 AM?
    if (now >= today8AM && updatedBefore8AM) {
      console.log(
        "Cache update needed: Same day, past 8 AM, last update was before 8 AM."
      );
      return true;
    }

    // 3. Need update if current time is past 1 PM AND last update was before 1 PM?
    if (now >= today1PM && updatedBefore1PM) {
      console.log(
        "Cache update needed: Same day, past 1 PM, last update was before 1 PM."
      );
      return true;
    }
  }

  console.log("Cache update not needed based on time rules.");
  return false; // No update needed
}

/**
 * Helper to determine if the rates returned are default/fallback rates
 */
function _isDefaultRates(rates: ExchangeRate[]): boolean {
  // Compare with the actual default rates from the getDefaultRates function
  const defaultRates = getDefaultRates();

  // Check if rates have the same values as default rates
  if (rates.length !== defaultRates.length) return false;

  // Check if each rate matches a default rate
  return rates.every((rate) => {
    return defaultRates.some(
      (defaultRate) =>
        defaultRate.name === rate.name && defaultRate.rate === rate.rate
    );
  });
}

// --- Public API ---

/**
 * Fetches exchange rates, utilizing SecureStore cache with time-based updates.
 * Fetches from Firestore if cache is missing, stale, or invalid.
 * Falls back to cached rates or default rates if Firestore fetch fails.
 */
export async function getRatesUsingCache(): Promise<ExchangeRate[]> {
  const cachedData = await _readFromCache();
  const lastTimestamp = cachedData ? cachedData.timestamp : null;

  if (_needsUpdate(lastTimestamp)) {
    console.log("Attempting to fetch fresh rates from Firestore...");
    try {
      const firestoreRates = await fetchExchangeRatesFromFirestore();

      // Only update cache if we got actual Firestore data, not default rates
      if (firestoreRates.length > 0 && !_isDefaultRates(firestoreRates)) {
        console.log("Firestore fetch successful, updating cache.");
        await _writeToCache(firestoreRates);
        return firestoreRates;
      } else {
        console.warn(
          "Firestore fetch returned empty or default data. Using stale cache (if available) or defaults."
        );
        return cachedData ? cachedData.rates : firestoreRates;
      }
    } catch (fetchError) {
      console.error("Error fetching from Firestore:", fetchError);
      // Firestore fetch failed, fallback to cache if available
      if (cachedData) {
        console.log("Using stale cache due to Firestore fetch error.");
        return cachedData.rates;
      } else {
        console.warn(
          "No cache available and Firestore fetch failed. Using default rates."
        );
        return getDefaultRates();
      }
    }
  } else {
    // Cache is valid and doesn't need update
    console.log("Using valid cache from SecureStore.");
    return cachedData!.rates;
  }
}
