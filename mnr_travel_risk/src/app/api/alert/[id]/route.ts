import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/alert/[id] - Get a specific alert
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const alert = await prisma.routineAlert.findUnique({
      where: { id },
      include: {
        trip: {
          select: {
            id: true,
            startCoordinates: true,
            endCoordinates: true,
            travelTime: true,
            travelDistance: true,
            travelMode: true,
            travelType: true
          }
        }
      }
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    );
  }
}

// PUT /api/alert/[id] - Update a specific alert
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { arrivalTime, cronString } = body;

    // Check if alert exists
    const existingAlert = await prisma.routineAlert.findUnique({
      where: { id }
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (arrivalTime) {
      updateData.arrivalTime = new Date(arrivalTime);
    }
    if (cronString) {
      updateData.cronString = cronString;
    }

    const alert = await prisma.routineAlert.update({
      where: { id },
      data: updateData,
      include: {
        trip: {
          select: {
            id: true,
            startCoordinates: true,
            endCoordinates: true,
            travelTime: true,
            travelDistance: true,
            travelMode: true,
            travelType: true
          }
        }
      }
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

// DELETE /api/alert/[id] - Delete a specific alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if alert exists
    const existingAlert = await prisma.routineAlert.findUnique({
      where: { id }
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    await prisma.routineAlert.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Alert deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
} 