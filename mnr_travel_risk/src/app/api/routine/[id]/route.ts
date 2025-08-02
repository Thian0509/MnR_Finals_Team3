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
            where: { id },
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
            description,
            startCoordinates,
            endCoordinates,
            scheduleType,
            isActive
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
        if (name) {
            updateData.name = name;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (startCoordinates) {
            updateData.startCoordinates = startCoordinates;
        }
        if (endCoordinates) {
            updateData.endCoordinates = endCoordinates;
        }
        if (scheduleType) {
            updateData.scheduleType = scheduleType;
        }
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        const routine = await prisma.routine.update({
            where: { id },
            data: updateData,
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

        // Delete the routine (cascade will handle routine alerts)
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