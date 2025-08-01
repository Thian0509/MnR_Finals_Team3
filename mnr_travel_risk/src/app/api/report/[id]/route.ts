import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/report/[id] - Get a specific risk report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const report = await prisma.riskReport.findUnique({
      where: { id }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// PUT /api/report/[id] - Update a specific risk report
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { coordinates, riskLevel, riskDescription } = body;

    // Check if report exists
    const existingReport = await prisma.riskReport.findUnique({
      where: { id }
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (coordinates) {
      updateData.coordinates = coordinates;
    }
    if (riskLevel !== undefined) {
      if (riskLevel < 1 || riskLevel > 5) {
        return NextResponse.json(
          { error: 'riskLevel must be between 1 and 5' },
          { status: 400 }
        );
      }
      updateData.riskLevel = riskLevel;
    }
    if (riskDescription !== undefined) {
      updateData.riskDescription = riskDescription;
    }

    const report = await prisma.riskReport.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// DELETE /api/report/[id] - Delete a specific risk report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if report exists
    const existingReport = await prisma.riskReport.findUnique({
      where: { id }
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    await prisma.riskReport.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Report deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
} 