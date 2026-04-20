import { z } from 'zod';

export const OrderItemSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
});

export const CreateOrderSchema = z.object({
  store_id: z.number().int().positive('Valid Store ID is required'),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
