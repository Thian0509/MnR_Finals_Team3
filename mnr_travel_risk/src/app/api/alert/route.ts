import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/alert - Get all new alerts for a user since the last alert's creation time
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    // Change parameter name to be more descriptive of its purpose
    const lastCreatedAt = searchParams.get('lastCreatedAt'); 

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prisma query for new alerts
    const alerts = await prisma.routineAlert.findMany({
      where: {
        trip: {
          userId: userId,
        },
        // Now we filter by the `createdAt` timestamp, which is a chronologically increasing value
        ...(lastCreatedAt && { createdAt: { gt: new Date(lastCreatedAt) } }),
      },
      // Explicitly select all required fields, including message and createdAt
      select: {
          id: true,
          message: true,
          createdAt: true,
          trip: {
            select: {
              id: true,
              startCoordinates: true,
              endCoordinates: true,
              travelTime: true,
              travelDistance: true,
              travelMode: true,
              travelType: true,
            },
          },
      },
      orderBy: {
        // Order by creation time ascending to process new alerts chronologically
        createdAt: 'asc',
      },
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
    const { tripId, arrivalTime, cronString, message } = body;

    if (!tripId || !arrivalTime || !cronString || !message) {
      return NextResponse.json(
        { error: 'tripId, arrivalTime, cronString, and message are required' },
        { status: 400 }
      );
    }

    // Verify the trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
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
        cronString,
        message, // Save the message
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
            travelType: true,
          },
        },
      },
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
