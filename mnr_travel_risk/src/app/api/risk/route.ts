import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/risk - Get all risks with optional filtering
export async function GET(request: NextRequest) {
  try {
    // take coordinates and risk level from both risks and risk reports
    const risks = await prisma.risk.findMany();

    return NextResponse.json(risks, { status: 200 });
  } catch (error) {
    console.error('Error fetching risks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risks' },
      { status: 500 }
    );
  }
}

// POST /api/risk - Create a new risk
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

    const risk = await prisma.risk.create({
      data: {
        id: crypto.randomUUID(),
        coordinates,
        riskLevel,
        riskDescription: riskDescription || null
      }
    });

    return NextResponse.json(risk, { status: 201 });
  } catch (error) {
    console.error('Error creating risk:', error);
    return NextResponse.json(
      { error: 'Failed to create risk' },
      { status: 500 }
    );
  }
}
