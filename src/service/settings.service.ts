import api from "./libs/axios";

export interface ExchangeRateResponse {
  usd_to_khr: number;
}

/** GET /api/v1/settings/exchange-rate */
export const fetchExchangeRate = async (): Promise<ExchangeRateResponse> =>
  api.get("/api/v1/settings/exchange-rate");
