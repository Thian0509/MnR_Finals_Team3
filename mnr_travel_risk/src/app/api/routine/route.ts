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
        });

        const total = await prisma.routine.count({
            where: { userId }
        });

        return NextResponse.json({
            routines,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
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
            description,
            startCoordinates,
            endCoordinates,
            scheduleType,
            isActive
        } = body;

        if (!userId || !name || !startCoordinates || !endCoordinates || !scheduleType) {
            return NextResponse.json(
                { error: 'userId, name, startCoordinates, endCoordinates, and scheduleType are required' },
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

        const routine = await prisma.routine.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                startCoordinates,
                endCoordinates,
                scheduleType,
                isActive: isActive !== undefined ? isActive : true
            },
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