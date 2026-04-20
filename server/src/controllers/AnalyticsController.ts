import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';

const orderService = new OrderService();

export class AnalyticsController {
  static async getSummary(req: Request, res: Response) {
    try {
      const storeId = req.query.store_id ? parseInt(req.query.store_id as string, 10) : undefined;
      
      const stats = await orderService.getAnalytics(storeId && !isNaN(storeId) ? storeId : undefined);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
