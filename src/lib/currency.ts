const EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest";

export type Currency = "GBP" | "MYR";

export interface ExchangeRates {
  base: Currency;
  rates: Record<Currency, number>;
  date: string;
}

let cachedRates: ExchangeRates | null = null;
let cacheExpiry: Date | null = null;

export async function fetchExchangeRates(base: Currency = "GBP"): Promise<ExchangeRates> {
  const now = new Date();

  if (cachedRates && cacheExpiry && cacheExpiry > now) {
    return cachedRates;
  }

  try {
    const response = await fetch(`${EXCHANGE_RATE_API_URL}/${base}`);
    const data = await response.json();

    cachedRates = {
      base,
      rates: {
        GBP: data.rates.GBP || 1,
        MYR: data.rates.MYR || 5.5,
      },
      date: data.date,
    };

    cacheExpiry = new Date(now.getTime() + 60 * 60 * 1000);

    return cachedRates;
  } catch {
    return {
      base,
      rates: { GBP: 1, MYR: 5.5 },
      date: now.toISOString().split("T")[0],
    };
  }
}

export async function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): Promise<{ converted: number; rate: number }> {
  if (from === to) {
    return { converted: amount, rate: 1 };
  }

  const rates = await fetchExchangeRates(from);
  const rate = rates.rates[to];
  const converted = amount * rate;

  return { converted, rate };
}

export function formatCurrencySymbol(currency: Currency): string {
  return currency === "GBP" ? "£" : "RM";
}

export function getCurrencyLocale(currency: Currency): string {
  return currency === "GBP" ? "en-GB" : "ms-MY";
}
