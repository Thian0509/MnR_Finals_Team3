import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/alert - Get all alerts for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const alerts = await prisma.routineAlert.findMany({
      where: {
        trip: {
          userId: userId
        }
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST /api/alert - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, arrivalTime, cronString } = body;

    if (!tripId || !arrivalTime || !cronString) {
      return NextResponse.json(
        { error: 'tripId, arrivalTime, and cronString are required' },
        { status: 400 }
      );
    }

    // Verify the trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const alert = await prisma.routineAlert.create({
      data: {
        id: crypto.randomUUID(),
        tripId,
        arrivalTime: new Date(arrivalTime),
        cronString
      },
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

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
