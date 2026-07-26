import { useQuery } from "@tanstack/react-query";
import { fetchExchangeRate } from "@/service/settings.service";

export const useExchangeRate = () =>
  useQuery({
    queryKey: ["settings", "exchange-rate"],
    queryFn: fetchExchangeRate,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
