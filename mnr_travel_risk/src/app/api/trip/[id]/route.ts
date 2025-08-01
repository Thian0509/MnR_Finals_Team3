import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/trip/[id] - Get a specific trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        routineAlerts: {
          select: {
            id: true,
            arrivalTime: true,
            cronString: true,
            createdAt: true
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT /api/trip/[id] - Update a specific trip
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      startCoordinates, 
      endCoordinates, 
      travelTime, 
      travelDistance, 
      travelMode, 
      travelType 
    } = body;

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id }
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (startCoordinates) {
      updateData.startCoordinates = startCoordinates;
    }
    if (endCoordinates) {
      updateData.endCoordinates = endCoordinates;
    }
    if (travelTime !== undefined) {
      updateData.travelTime = travelTime;
    }
    if (travelDistance !== undefined) {
      updateData.travelDistance = travelDistance;
    }
    if (travelMode) {
      updateData.travelMode = travelMode;
    }
    if (travelType) {
      updateData.travelType = travelType;
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        routineAlerts: {
          select: {
            id: true,
            arrivalTime: true,
            cronString: true,
            createdAt: true
          }
        }
      }
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trip/[id] - Delete a specific trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id }
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Delete the trip (cascade will handle routine alerts)
    await prisma.trip.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Trip deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
} 