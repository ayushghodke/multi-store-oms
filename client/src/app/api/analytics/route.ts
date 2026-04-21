import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeIdParam = searchParams.get('store_id');
    const storeId =
      storeIdParam && !isNaN(parseInt(storeIdParam))
        ? parseInt(storeIdParam, 10)
        : undefined;

    const where = storeId ? { store_id: storeId } : {};

    const [aggregations, statusBreakdown, ordersPerDay, revenuePerStore, archiveCount] =
      await Promise.all([
        // Overall totals
        prisma.orders.aggregate({
          where,
          _sum: { total_amount: true },
          _count: { id: true },
        }),

        // Breakdown by status
        prisma.orders.groupBy({
          by: ['status'],
          where,
          _count: { id: true },
        }),

        // Orders per day (last 30 days)
        prisma.orders.groupBy({
          by: ['created_at'],
          where: {
            ...where,
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          _count: { id: true },
          orderBy: { created_at: 'asc' },
        }),

        // Revenue per store
        prisma.orders.groupBy({
          by: ['store_id'],
          _sum: { total_amount: true },
          _count: { id: true },
          orderBy: { _sum: { total_amount: 'desc' } },
        }),

        // Count of orders eligible for archival (completed + older than 30 days)
        prisma.orders.count({
          where: {
            status: 'completed',
            created_at: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    // Top 5 selling products via raw SQL (groupBy across relations not supported in Prisma)
    const topProducts = await prisma.$queryRaw<
      { product_name: string; total_quantity: bigint; total_revenue: number }[]
    >`
      SELECT 
        product_name,
        SUM(quantity) as total_quantity,
        SUM(CAST(price AS NUMERIC) * quantity) as total_revenue
      FROM order_items
      GROUP BY product_name
      ORDER BY total_quantity DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: aggregations._sum.total_amount || 0,
        totalOrders: aggregations._count.id || 0,
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        ordersPerDay: ordersPerDay.map((d) => ({
          date: d.created_at,
          count: d._count.id,
        })),
        revenuePerStore: revenuePerStore.map((s) => ({
          store_id: s.store_id,
          totalRevenue: s._sum.total_amount || 0,
          orderCount: s._count.id,
        })),
        topProducts: topProducts.map((p) => ({
          product_name: p.product_name,
          total_quantity: Number(p.total_quantity),
          total_revenue: Number(p.total_revenue),
        })),
        eligibleForArchival: archiveCount,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
