import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/routine/[id] - Get a specific routine
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const routine = await prisma.routine.findUnique({
            where: { id }
        });

        if (!routine) {
            return NextResponse.json(
                { error: 'Routine not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(routine);
    } catch (error) {
        console.error('Error fetching routine:', error);
        return NextResponse.json(
            { error: 'Failed to fetch routine' },
            { status: 500 }
        );
    }
}

// PUT /api/routine/[id] - Update a specific routine
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const {
            name,
            startLocation,
            startCoordinates,
            endLocation,
            endCoordinates,
            startTime,
            repeatDays
        } = body;

        // Check if routine exists
        const existingRoutine = await prisma.routine.findUnique({
            where: { id }
        });

        if (!existingRoutine) {
            return NextResponse.json(
                { error: 'Routine not found' },
                { status: 404 }
            );
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (startLocation) updateData.startLocation = startLocation;
        if (startCoordinates) updateData.startCoordinates = startCoordinates;
        if (endLocation) updateData.endLocation = endLocation;
        if (endCoordinates) updateData.endCoordinates = endCoordinates;

        if (startTime) {
            // Validate startTime format (HH:MM)
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(startTime)) {
                return NextResponse.json(
                    { error: 'startTime must be in HH:MM format' },
                    { status: 400 }
                );
            }
            updateData.startTime = startTime;
        }

        if (repeatDays) {
            // Validate repeatDays array
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            if (!Array.isArray(repeatDays) || !repeatDays.every(day => validDays.includes(day.toLowerCase()))) {
                return NextResponse.json(
                    { error: 'repeatDays must be an array of valid day names' },
                    { status: 400 }
                );
            }
            updateData.repeatDays = repeatDays;
        }

        const routine = await prisma.routine.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(routine);
    } catch (error) {
        console.error('Error updating routine:', error);
        return NextResponse.json(
            { error: 'Failed to update routine' },
            { status: 500 }
        );
    }
}

// DELETE /api/routine/[id] - Delete a specific routine
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if routine exists
        const existingRoutine = await prisma.routine.findUnique({
            where: { id }
        });

        if (!existingRoutine) {
            return NextResponse.json(
                { error: 'Routine not found' },
                { status: 404 }
            );
        }

        // Delete the routine
        await prisma.routine.delete({
            where: { id }
        });

        return NextResponse.json(
            { message: 'Routine deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting routine:', error);
        return NextResponse.json(
            { error: 'Failed to delete routine' },
            { status: 500 }
        );
    }
}