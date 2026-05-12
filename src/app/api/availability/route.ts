import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";
import { Duration } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const duration = searchParams.get("duration") as Duration;

  if (!date || !duration) {
    return NextResponse.json({ error: "date and duration required" }, { status: 400 });
  }

  const validDurations: Duration[] = ["THIRTY_MIN", "ONE_HOUR", "TWO_HOURS"];
  if (!validDurations.includes(duration)) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  const slots = await getAvailableSlots(new Date(date), duration);
  return NextResponse.json({ slots });
}
