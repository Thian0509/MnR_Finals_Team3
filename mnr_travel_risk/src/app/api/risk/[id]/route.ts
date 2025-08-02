import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/risk/[id] - Get a specific risk
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const risk = await prisma.risk.findUnique({
      where: { id }
    });

    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Error fetching risk:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk' },
      { status: 500 }
    );
  }
}

// PUT /api/risk/[id] - Update a specific risk
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { coordinates, risklevel, riskDescription } = body;

    // Check if risk exists
    const existingRisk = await prisma.risk.findUnique({
      where: { id }
    });

    if (!existingRisk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (coordinates) {
      updateData.coordinates = coordinates;
    }
    if (risklevel !== undefined) {
      if (risklevel < 1 || risklevel > 5) {
        return NextResponse.json(
          { error: 'risklevel must be between 1 and 5' },
          { status: 400 }
        );
      }
      updateData.risklevel = risklevel;
    }
    if (riskDescription !== undefined) {
      updateData.riskDescription = riskDescription;
    }

    const risk = await prisma.risk.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Error updating risk:', error);
    return NextResponse.json(
      { error: 'Failed to update risk' },
      { status: 500 }
    );
  }
}

// DELETE /api/risk/[id] - Delete a specific risk
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if risk exists
    const existingRisk = await prisma.risk.findUnique({
      where: { id }
    });

    if (!existingRisk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    await prisma.risk.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Risk deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting risk:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk' },
      { status: 500 }
    );
  }
} 