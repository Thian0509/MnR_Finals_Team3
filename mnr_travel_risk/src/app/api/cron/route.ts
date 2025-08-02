import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function can be secured with a secret cron token to prevent unauthorized access
export async function GET() {
  try {
    const now = new Date();
    // Look for trips scheduled to depart in the next minute that haven't been notified yet
    const upcomingTrips = await prisma.trip.findMany({
      where: {
        notified: false,
        departureTime: {
          lte: now,
        },
      },
    });

    if (upcomingTrips.length === 0) {
      return NextResponse.json({ message: 'No upcoming trips to notify.' });
    }

    // Create alerts for each upcoming trip
    for (const trip of upcomingTrips) {
      await prisma.alert.create({
        data: {
          userId: trip.userId,
          message: `Time to depart for your trip from ${trip.from} to ${trip.to}!`,
        },
      });
    }

    // Mark these trips as notified to avoid sending duplicate alerts
    await prisma.trip.updateMany({
      where: {
        id: {
          in: upcomingTrips.map((trip) => trip.id),
        },
      },
      data: {
        notified: true,
      },
    });
    
    console.log(`[CRON JOB] Created ${upcomingTrips.length} departure alerts.`);
    return NextResponse.json({ success: true, alerted: upcomingTrips.length });

  } catch (error) {
    console.error('[CRON JOB] Error:', error);
    return NextResponse.json({ error: 'Failed to process trips' }, { status: 500 });
  }
}