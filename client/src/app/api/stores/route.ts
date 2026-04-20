import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const stores = await prisma.stores.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json({ success: true, data: stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, location } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Store name is required' },
        { status: 400 }
      );
    }

    const newStore = await prisma.stores.create({
      data: { name, location },
    });

    return NextResponse.json({ success: true, data: newStore }, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
