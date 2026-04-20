import { Request, Response } from 'express';
import { CreateOrderSchema, UpdateOrderStatusSchema } from '../schemas/OrderSchema';
import { OrderService } from '../services/OrderService';

const orderService = new OrderService();

export class OrderController {
  
  static async createOrder(req: Request, res: Response) {
    try {
      // Validate the request body using Zod
      const validatedData = CreateOrderSchema.parse(req.body);
      
      const newOrder = await orderService.createOrder(validatedData);
      
      res.status(201).json({
        success: true,
        data: newOrder
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
         res.status(400).json({ success: false, errors: error.errors });
         return;
      }
      console.error('Error creating order:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getOrders(req: Request, res: Response) {
    try {
      const storeId = req.query.store_id ? parseInt(req.query.store_id as string, 10) : undefined;
      
      const orders = await orderService.fetchOrders(storeId && !isNaN(storeId) ? storeId : undefined);
      
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const { status } = UpdateOrderStatusSchema.parse(req.body);
      
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid order ID' });
        return;
      }

      const updatedOrder = await orderService.updateOrderStatus(id, status);
      
      res.status(200).json({
        success: true,
        data: updatedOrder
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
         res.status(400).json({ success: false, errors: error.errors });
         return;
      }
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
