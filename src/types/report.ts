/** Single transaction in a daily sales report */
export interface IReportTransaction {
  id: number;
  orderNumber: string;
  time: string;
  itemsCount: number;
  total: number;
  paymentMethod: string;
}

/** Summary aggregations for a daily sales report */
export interface IDailySalesSummary {
  totalRevenue: number;
  totalTransactions: number;
  totalItemsSold: number;
  /** Total Riel (៛) collected that day, from orders charged in KHR. 0 when none. */
  rielKhr?: number;
  /** Exchange rate used (KHR per 1 USD) — for the Riel → USD equivalent. */
  usdToKhrRate?: number;
  paymentMethodBreakdown: Record<string, number>;
}

/** Response shape for GET /reports/daily-sales */
export interface IDailySalesReport {
  success: boolean;
  date: string;
  summary: IDailySalesSummary;
  transactions: IReportTransaction[];
}
