import { OrderRepository } from '../repositories/OrderRepository';
import { CreateOrderInput } from '../schemas/OrderSchema';

export class OrderService {
  private repository: OrderRepository;

  constructor() {
    this.repository = new OrderRepository();
  }

  async createOrder(data: CreateOrderInput) {
    // Additional business logic/calculations would happen here
    // Currently, we simply delegate to the repository transaction
    return await this.repository.createOrderWithItems(data);
  }

  async fetchOrders(storeId?: number) {
    return await this.repository.getOrdersByStore(storeId);
  }

  async updateOrderStatus(id: number, status: string) {
    return await this.repository.updateOrderStatus(id, status);
  }

  async getAnalytics(storeId?: number) {
    return await this.repository.getDashboardStats(storeId);
  }
}
