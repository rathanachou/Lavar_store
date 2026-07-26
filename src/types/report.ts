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
  paymentMethodBreakdown: Record<string, number>;
}

/** Response shape for GET /reports/daily-sales */
export interface IDailySalesReport {
  success: boolean;
  date: string;
  summary: IDailySalesSummary;
  transactions: IReportTransaction[];
}
