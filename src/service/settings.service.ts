import api from "./libs/axios";

export interface ExchangeRateResponse {
  usd_to_khr: number;
}

// Paths are relative to baseURL, which already includes /api/v1

/** GET /settings/exchange-rate */
export const fetchExchangeRate = async (): Promise<ExchangeRateResponse> =>
  api.get("/settings/exchange-rate");
