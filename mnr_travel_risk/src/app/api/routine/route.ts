import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/routine - Get all routines for a user
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

        const routines = await prisma.routine.findMany({
            where: { userId },
            take: limit,
            skip: offset,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const total = await prisma.routine.count({
            where: { userId }
        });

        return NextResponse.json({
            routines,
            total,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error fetching routines:', error);
        return NextResponse.json(
            { error: 'Failed to fetch routines' },
            { status: 500 }
        );
    }
}

// POST /api/routine - Create a new routine
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            name,
            startLocation,
            startCoordinates,
            endLocation,
            endCoordinates,
            startTime,
            repeatDays
        } = body;

        if (!userId || !name || !startLocation || !startCoordinates ||
            !endLocation || !endCoordinates || !startTime || !repeatDays) {
            return NextResponse.json(
                { error: 'All fields are required: userId, name, startLocation, startCoordinates, endLocation, endCoordinates, startTime, repeatDays' },
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

        // Validate repeatDays array
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (!Array.isArray(repeatDays) || !repeatDays.every(day => validDays.includes(day.toLowerCase()))) {
            return NextResponse.json(
                { error: 'repeatDays must be an array of valid day names' },
                { status: 400 }
            );
        }

        // Validate startTime format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime)) {
            return NextResponse.json(
                { error: 'startTime must be in HH:MM format' },
                { status: 400 }
            );
        }

        const routine = await prisma.routine.create({
            data: {
                userId,
                name,
                startLocation,
                startCoordinates,
                endLocation,
                endCoordinates,
                startTime,
                repeatDays
            }
        });

        return NextResponse.json(routine, { status: 201 });
    } catch (error) {
        console.error('Error creating routine:', error);
        return NextResponse.json(
            { error: 'Failed to create routine' },
            { status: 500 }
        );
    }
}