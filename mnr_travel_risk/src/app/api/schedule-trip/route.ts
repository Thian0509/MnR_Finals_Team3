import { NextRequest, NextResponse } from "next/server";
import { CronJob } from "cron";

export async function POST(req: NextRequest) {
  const { from, to, date, time } = await req.json();

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const cronExpression = `${minute} ${hour} ${day} ${month} *`;

  const job = new CronJob(
    cronExpression,
    () => {
      console.log(`[CRON FIRED] Trip from ${from} to ${to} at ${date} ${time}`);
      // You can also write to a file or send an email here for more visibility
    }
  );
  job.start();

  return NextResponse.json({ success: true });
}