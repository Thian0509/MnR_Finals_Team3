import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/report - Get all risk reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const reports = await prisma.riskReport.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.riskReport.count();

    return NextResponse.json({
      reports,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST /api/report - Create a new risk report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coordinates, riskLevel, riskDescription } = body;

    if (!coordinates || riskLevel === undefined) {
      return NextResponse.json(
        { error: 'coordinates and riskLevel are required' },
        { status: 400 }
      );
    }

    if (riskLevel < 1 || riskLevel > 5) {
      return NextResponse.json(
        { error: 'riskLevel must be between 1 and 5' },
        { status: 400 }
      );
    }

    const report = await prisma.riskReport.create({
      data: {
        id: crypto.randomUUID(),
        coordinates,
        riskLevel,
        riskDescription: riskDescription || null
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
