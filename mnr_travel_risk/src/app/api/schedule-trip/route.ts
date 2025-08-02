import { NextRequest, NextResponse } from "next/server";
import { CronJob } from "cron";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// This is a placeholder function. In a real-world application,
// you would use a service like Google Maps API to get this data.
async function getTravelTimeInMinutes(from: string, to: string): Promise<number> {
  // Simulating a network call and returning a value
  // Let's say it takes 30 minutes for this example
  return 30; 
}

export async function POST(req: NextRequest) {
  const { from, to, date, time, userId } = await req.json();

  if (!from || !to || !date || !time || !userId) {
    return NextResponse.json(
      { error: "from, to, date, time, and userId are required" },
      { status: 400 }
    );
  }

  try {
    // Get the estimated travel time from your external service
    const travelTimeInMinutes = await getTravelTimeInMinutes(from, to);

    // Parse the arrival date and time
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const arrivalDate = new Date(year, month - 1, day, hour, minute); // Month is 0-indexed

    // Calculate the departure time by subtracting the travel time
    const departureDate = new Date(arrivalDate.getTime() - travelTimeInMinutes * 60000);

    // Format the departure time into a cron expression
    const departureMinute = departureDate.getMinutes();
    const departureHour = departureDate.getHours();
    const departureDay = departureDate.getDate();
    const departureMonth = departureDate.getMonth() + 1; // Month is 0-indexed

    const cronExpression = `${departureMinute} ${departureHour} ${departureDay} ${departureMonth} *`;

    // Create the alert message
    const alertMessage = `It's time to leave for your trip from ${from} to ${to}. Travel time is estimated to be ${travelTimeInMinutes} minutes.`;

    // Schedule the CronJob to create the `Alert` record
    const job = new CronJob(
      cronExpression,
      async () => {
        console.log(`[CRON FIRED] Alert for trip from ${from} to ${to} is being created.`);
        await prisma.alert.create({
          data: {
            userId,
            message: alertMessage,
          },
        });
        console.log("Alert created successfully.");
        // Stop the cron job after it runs once
        job.stop();
      }
    );
    job.start();
    
    // Respond to the client immediately after scheduling the cron job
    return NextResponse.json({ 
      success: true,
      message: "Trip scheduled successfully. An alert will be created at the departure time."
    }, { status: 201 });

  } catch (error) {
    console.error("Error scheduling trip and alert:", error);
    return NextResponse.json(
      { error: "Failed to schedule trip and alert" },
      { status: 500 }
    );
  }
}