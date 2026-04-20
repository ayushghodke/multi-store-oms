import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();

router.post('/orders', OrderController.createOrder);
router.get('/orders', OrderController.getOrders);
router.patch('/orders/:id/status', OrderController.updateStatus);

router.get('/analytics', AnalyticsController.getSummary);

export { router as orderRoutes };
