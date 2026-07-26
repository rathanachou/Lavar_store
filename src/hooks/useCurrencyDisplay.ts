import { useEffect, useState } from "react";
import { useExchangeRate } from "./useExchangeRate";

export type DisplayCurrency = "USD" | "KHR";
const STORAGE_KEY = "pos-currency";

export function useCurrencyDisplay() {
  const { data, isError, isLoading } = useExchangeRate();
  const rate =
    isError || !data || !data.usd_to_khr || data.usd_to_khr <= 0
      ? null
      : data.usd_to_khr;

  const [currency, setCurrency] = useState<DisplayCurrency>(() => {
    if (typeof window === "undefined") return "USD";
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "KHR" || stored === "USD" ? stored : "USD";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const khrAvailable = rate !== null;

  useEffect(() => {
    if (!khrAvailable && currency === "KHR") setCurrency("USD");
  }, [khrAvailable, currency]);

  const format = (usdAmount: number): string => {
    const v = Number(usdAmount) || 0;
    if (currency === "KHR" && rate !== null) {
      const khr = Math.round(v * rate);
      return `${khr.toLocaleString("en-US")}៛`;
    }
    return `$${v.toFixed(2)}`;
  };

  return {
    currency,
    setCurrency,
    toggle: () => setCurrency((c) => (c === "USD" ? "KHR" : "USD")),
    format,
    khrAvailable,
    isLoading,
  };
}
