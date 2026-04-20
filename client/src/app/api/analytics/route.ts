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

    const [aggregations, statusBreakdown] = await Promise.all([
      prisma.orders.aggregate({
        where,
        _sum: { total_amount: true },
        _count: { id: true },
      }),
      prisma.orders.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: aggregations._sum.total_amount || 0,
        totalOrders: aggregations._count.id || 0,
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
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
