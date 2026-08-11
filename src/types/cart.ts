export interface ICart {
  id: number;
  name: string;
  category: string;
  price: number;
  /** Unit price before any near-expiry discount — used to compute savings on the receipt */
  originalPrice: number;
  imageUrl: string;
  stock: number;
  qty: number;
}


export interface ICartSummary {
  items: ICart[];
  totalItems: number;
  totalPrice: number;
  discount: number;
  netTotal: number;
}