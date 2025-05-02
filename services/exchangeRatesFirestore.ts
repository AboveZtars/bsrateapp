import {collection, getDocs} from "firebase/firestore/lite";
import {firestore} from "./firebase";
import {ExchangeRate, FirestoreRateDocument} from "./exchangeRates";

export const fetchExchangeRatesFromFirestore = async (): Promise<
  ExchangeRate[]
> => {
  try {
    // Reference to the collection
    const ratesCollection = collection(firestore, "rates");

    // Get the documents
    const querySnapshot = await getDocs(ratesCollection);
    // Extract the specific rates we need
    let bcvRate: number | null = null;
    let paraleloRate: number | null = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreRateDocument;

      if (doc.id === "current_bcv" && data.currencies && data.currencies.USD) {
        bcvRate = data.currencies.USD.rate;
      }

      if (
        doc.id === "current_paralelo" &&
        data.currencies &&
        data.currencies.EnParaleloVzla
      ) {
        paraleloRate = data.currencies.EnParaleloVzla.rate;
      }
    });

    // Prepare the rates array
    const rates: ExchangeRate[] = [];

    // Add BCV rate if found
    if (bcvRate !== null) {
      rates.push({
        name: "BCV (Oficial) 🏦",
        rate: bcvRate,
      });
    }

    // Add Paralelo rate if found
    if (paraleloRate !== null) {
      rates.push({
        name: "Paralelo 💱",
        rate: paraleloRate,
      });
    }

    return rates.length > 0 ? rates : getDefaultRates();
  } catch (error) {
    console.error("Error fetching exchange rates from Firestore:", error);
    return getDefaultRates();
  }
};

// Default rates in case of error or empty collection
// Exported so it can be used by other modules
export const getDefaultRates = (): ExchangeRate[] => {
  return [
    {name: "BCV (Oficial) 🏦", rate: 35.88},
    {name: "Paralelo 💱", rate: 37.5},
    {name: "Promedio 📊", rate: 36.69},
  ];
};
