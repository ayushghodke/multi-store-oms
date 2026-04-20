import express from 'express';
import cors from 'cors';
import { orderRoutes } from './routes/orderRoutes';
import { StoreController } from './controllers/StoreController';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use('/api', orderRoutes);
app.get('/api/stores', StoreController.getStores);
app.post('/api/stores', StoreController.createStore);

export { app };
