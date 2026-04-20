import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CreateOrderSchema } from '@/lib/schemas';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeIdParam = searchParams.get('store_id');
    const storeId =
      storeIdParam && !isNaN(parseInt(storeIdParam))
        ? parseInt(storeIdParam, 10)
        : undefined;

    const orders = await prisma.orders.findMany({
      where: storeId ? { store_id: storeId } : undefined,
      include: {
        order_items: true,
        stores: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateOrderSchema.parse(body);

    const order = await prisma.$transaction(async (tx) => {
      return tx.orders.create({
        data: {
          store_id: validatedData.store_id,
          total_amount: validatedData.total_amount,
          status: 'pending',
          order_items: {
            create: validatedData.items.map((item) => ({
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { order_items: true },
      });
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
