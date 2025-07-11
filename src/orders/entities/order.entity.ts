import { OrderStatus } from '@prisma/client';

export class OrderItem {
  productName: string;
  productId: number;
  quantity: number;
  price: number;
}

export class Order {
  OrderItem: OrderItem[];
  id: string;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  isPaid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
