//Period Sales
export interface IPeriodSales {
  totalSales: number;
  totalOrders: number;
}

//  Low Stock 
export interface ILowStockProduct {
  id: number;
  name: string;
  qty: number;
  price: number;
}

// Top Product 
export interface ITopProduct {
  productName: string;
  totalQty: number;
  totalAmount: number;
}

//Dashboard Summary 
export interface IDashboardSummary {
  today: IPeriodSales;
  weekly: IPeriodSales;
  monthly: IPeriodSales;
  totalProducts: number;
  totalCustomers: number;
  lowStock: ILowStockProduct[];
  topProducts: ITopProduct[];
}

//  Monthly Sales 
export interface IMonthlySale {
  month: string;
  totalSales: number;
  totalOrders: number;
}

// Category Sales 
export interface ICategorySale {
  category: string;
  categoryName: string; // Pie Chart
  totalSales: number;
  totalOrders: number;
}

//  Daily Sales 
export interface IDailySummary {
  totalOrders: number;
  totalSales: string;
  totalDiscount: string;
  netSales: string;
}

export interface IOrderDetailItem {
  id: number;
  productName: string;
  productPrice: number;
  qty: number;
  amount: number;
}

export interface IOrderWithDetails {
  id: number;
  orderNumber: string;
  total: number;
  discount: number;
  orderDate: string;
  createdAt: string;
  orderDetails: IOrderDetailItem[];
}

export interface IDailySales {
  success: boolean;
  date: string;
  summary: IDailySummary;
  data: IOrderWithDetails[];
}