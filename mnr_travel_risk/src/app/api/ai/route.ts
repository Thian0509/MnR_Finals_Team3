"use server"
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fromLocation = searchParams.get('from');
        const toLocation = searchParams.get('to');
        const weather = searchParams.get('weather') || 'sunny';

        if (!fromLocation || !toLocation) {
            return NextResponse.json(
                { error: 'Missing required parameters: from and to locations' },
                { status: 400 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `Describe in 1 sentence what the drive between ${fromLocation} and ${toLocation} is like when the weather is ${weather}. Don't use more than 20 words.`
                }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const description = response.choices[0]?.message?.content || "Unable to generate description.";
        
        return NextResponse.json({
            success: true,
            description,
            from: fromLocation,
            to: toLocation,
            weather
        });

    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI description' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fromLocation, toLocation, weather = 'sunny' } = body;

        if (!fromLocation || !toLocation) {
            return NextResponse.json(
                { error: 'Missing required fields: fromLocation and toLocation' },
                { status: 400 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `Describe in 3 sentences what the drive between ${fromLocation} and ${toLocation} is like when the weather is ${weather}.`
                }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const description = response.choices[0]?.message?.content || "Unable to generate description.";

        return NextResponse.json({
            success: true,
            description,
            from: fromLocation,
            to: toLocation,
            weather
        });

    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI description' },
            { status: 500 }
        );
    }
}