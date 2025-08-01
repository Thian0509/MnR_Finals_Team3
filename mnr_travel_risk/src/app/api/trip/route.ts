import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/trip - Get all trips for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { userId };

    const trips = await prisma.trip.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      include: {
        routineAlerts: {
          select: {
            id: true,
            arrivalTime: true,
            cronString: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.trip.count({
      where: whereClause
    });

    return NextResponse.json({
      trips,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST /api/trip - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      startCoordinates, 
      endCoordinates, 
      travelTime, 
      travelDistance, 
      travelMode, 
      travelType 
    } = body;

    if (!userId || !startCoordinates || !endCoordinates || 
        travelTime === undefined || travelDistance === undefined || 
        !travelMode || !travelType) {
      return NextResponse.json(
        { error: 'All fields are required: userId, startCoordinates, endCoordinates, travelTime, travelDistance, travelMode, travelType' },
        { status: 400 }
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        startCoordinates,
        endCoordinates,
        travelTime,
        travelDistance,
        travelMode,
        travelType
      },
      include: {
        routineAlerts: {
          select: {
            id: true,
            arrivalTime: true,
            cronString: true
          }
        }
      }
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
