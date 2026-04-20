import { Request, Response } from 'express';
import { prisma } from '../lib/db';

export class StoreController {
  static async getStores(req: Request, res: Response) {
    try {
      const stores = await prisma.stores.findMany();
      res.status(200).json({
        success: true,
        data: stores
      });
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  static async createStore(req: Request, res: Response) {
    try {
      const { name, location } = req.body;
      const newStore = await prisma.stores.create({
        data: { name, location }
      });
      res.status(201).json({
        success: true,
        data: newStore
      });
    } catch (error: any) {
      console.error('Error creating store:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
