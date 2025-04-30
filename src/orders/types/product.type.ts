export type Product = {
  id: number;
  price: number;
  name: string;
};

export type ProductDict = {
  [id: number]: Product;
};
