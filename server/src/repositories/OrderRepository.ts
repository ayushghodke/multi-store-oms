import { prisma } from '../lib/db';
import { CreateOrderInput } from '../schemas/OrderSchema';

export class OrderRepository {
  async createOrderWithItems(data: CreateOrderInput) {
    // Implementing a Prisma $transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          store_id: data.store_id,
          total_amount: data.total_amount,
          status: 'pending',
          order_items: {
            create: data.items.map(item => ({
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          order_items: true
        }
      });
      return order;
    });
  }

  async getOrdersByStore(storeId?: number) {
    return prisma.orders.findMany({
      where: storeId ? { store_id: storeId } : undefined,
      include: {
        order_items: true,
        stores: true
      },
      orderBy: { created_at: 'desc' }
    });
  }
  async updateOrderStatus(id: number, status: string) {
    return prisma.orders.update({
      where: { id },
      data: { status },
      include: { order_items: true }
    });
  }

  async getDashboardStats(storeId?: number) {
    const where = storeId ? { store_id: storeId } : {};
    
    // Aggregate total revenue and order count
    const aggregations = await prisma.orders.aggregate({
      where,
      _sum: { total_amount: true },
      _count: { id: true }
    });

    // Get status breakdown
    const statusBreakdown = await prisma.orders.groupBy({
      by: ['status'],
      where,
      _count: { id: true }
    });

    return {
      totalRevenue: aggregations._sum.total_amount || 0,
      totalOrders: aggregations._count.id || 0,
      statusBreakdown: statusBreakdown.map(s => ({
        status: s.status,
        count: s._count.id
      }))
    };
  }
}
