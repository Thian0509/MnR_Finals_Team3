import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/alert - Get all UNREAD alerts for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Query for alerts that are not read
    const alerts = await prisma.alert.findMany({
      where: {
        userId: userId,
        isRead: false,
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// DELETE /api/alert - Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    await prisma.alert.delete({
      where: {
        id: alertId,
      },
    });

    return NextResponse.json({ message: 'Alert deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
