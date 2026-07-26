export interface IProduct {
  id: number;
  name: string;
  price: number;
  qty: number;
  categoryId: number | undefined;
  isActive: boolean;
  barcode?: string;
  sku?: string;
  category: {
    id: number;
    name: string;
  };
  productImages?: IProductImage[];
}

export interface IProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  fileName: string;
}

export interface IPagination {
  total: number;
  limit: number;
  currentPage: number;
  prevPage: number | null;
  nextPage: number | null;
}

export interface IProductResponse {
  success: boolean;        
  message: string;         
  data: IProduct[];
  pagination: IPagination;
}
export interface IOrderDetail {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productPrice: number;
  qty: number;
  amount: number;
}

export interface IOrder {
  id: number;
  orderNumber: string;
  total: number;
  discount: number;
  orderDate: string;
  customerId: number;
  location: string;
  createdAt: string;
  orderDetails?: IOrderDetail[];
}

export interface IOrderResponse {
  success: boolean;
  message: string;
  data: IOrder[];
  pagination: IPagination;
}


export interface IDashboardSummary {
  today: {
    totalSales: number;
    totalOrders: number;
  };
  weekly: {
    totalSales: number;
    totalOrders: number;
  };
  monthly: {
    totalSales: number;
    totalOrders: number;
  };
  totalProducts: number;
  totalCustomers: number;
  lowStock: IProduct[];
  topProducts: ITopProduct[];
}

export interface ITopProduct {
  productName: string;
  totalQty: number;
  totalAmount: number;
}


export interface IPayment {
  id: number;
  method: "cash" | "card" | "aba_khqr";
  status: "PENDING" | "PAID" | "CANCELLED";
  amount: number;
  paidAt: string | null;
  remark: string | null;
  orderId: number;
  paywayTranId: string | null;
}


export interface ICategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategoryResponse {
  success: boolean;
  message: string;
  data: ICategory[];
}


export interface IUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "cashier";
  createdAt?: string;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: IUser;
}