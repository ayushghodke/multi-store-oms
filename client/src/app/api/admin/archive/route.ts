import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    // Find all completed orders older than 30 days
    const ordersToArchive = await prisma.orders.findMany({
      where: {
        created_at: {
          lt: cutoffDate,
        },
        status: 'completed',
      },
      include: {
        order_items: true,
      },
    });

    if (ordersToArchive.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders eligible for archival.',
        archived: 0,
      });
    }

    // Perform the archive in a single transaction
    await prisma.$transaction(async (tx) => {
      // Insert into order_archive with items snapshot
      await tx.order_archive.createMany({
        data: ordersToArchive.map((order) => ({
          original_id: order.id,
          store_id: order.store_id,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          items_snapshot: order.order_items.map((item) => ({
            id: item.id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
        })),
      });

      // Delete from orders (cascade will delete order_items)
      await tx.orders.deleteMany({
        where: {
          id: {
            in: ordersToArchive.map((o) => o.id),
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully archived ${ordersToArchive.length} orders.`,
      archived: ordersToArchive.length,
    });
  } catch (error) {
    console.error('Error archiving orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during archival.' },
      { status: 500 }
    );
  }
}
