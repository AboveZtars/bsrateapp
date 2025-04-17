import axios from "axios";

export interface ExchangeRate {
  name: string;
  rate: number;
}

export interface CurrencyData {
  code: string;
  rate: number;
}

export interface FirestoreRateDocument {
  currencies: {
    [currencyKey: string]: CurrencyData;
  };
  lastUpdated: {
    seconds: number;
    nanoseconds: number;
  };
  lastUpdatedUTC: string;
  provider: string;
  source: string;
}

export const fetchExchangeRates = async (): Promise<ExchangeRate[]> => {
  try {
    // Using a free exchange rate API
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const rates = response.data.rates;

    // Convert the rates to our format
    return [
      {name: "BCV (Oficial) 🏦", rate: rates.VES || 80},
      {name: "Paralelo 💱", rate: rates.VES || 100},
      {name: "Monitor Dólar 📊", rate: rates.VES || 37.25},
      {name: "DolarToday 📈", rate: rates.VES || 37.45},
    ];
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Return default rates in case of error
    return [
      {name: "BCV (Oficial) 🏦", rate: 35.88},
      {name: "Paralelo 💱", rate: 37.5},
      {name: "Monitor Dólar 📊", rate: 37.25},
      {name: "DolarToday 📈", rate: 37.45},
    ];
  }
};
