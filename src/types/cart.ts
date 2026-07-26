export interface ICart {
  id: number;
  name: string;
  category: string;
  price: number;
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