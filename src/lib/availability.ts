import { Duration } from "@prisma/client";
import { prisma } from "./db";

const HOUR_START = 10;
const HOUR_END = 19;

export function durationToMinutes(duration: Duration): number {
  switch (duration) {
    case "THIRTY_MIN":
      return 30;
    case "ONE_HOUR":
      return 60;
    case "TWO_HOURS":
      return 120;
  }
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
}

/**
 * Returns available start times for a given date and duration.
 *
 * Rules:
 * - TWO_HOURS: max 1 per day; must not overlap existing bookings.
 *   Available window: 10:00–17:00 so the session ends by 19:00.
 * - ONE_HOUR / THIRTY_MIN: 10:00–19:00, must not overlap existing bookings.
 *   Slot increments: every 30 minutes.
 */
export async function getAvailableSlots(
  date: Date,
  duration: Duration
): Promise<string[]> {
  const durationMinutes = durationToMinutes(duration);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  const nextDay = new Date(dateOnly);
  nextDay.setDate(nextDay.getDate() + 1);

  const existing = await prisma.appointment.findMany({
    where: {
      date: { gte: dateOnly, lt: nextDay },
      status: { notIn: ["CANCELLED"] },
    },
    select: { startTime: true, endTime: true, service: { select: { duration: true } } },
  });

  // Block whole day for 2h sessions if one already exists
  if (duration === "TWO_HOURS") {
    const hasTwoHour = existing.some((a) => a.service.duration === "TWO_HOURS");
    if (hasTwoHour) return [];
  }

  const windowStart = HOUR_START * 60;
  const windowEnd = HOUR_END * 60;
  const slots: string[] = [];

  for (
    let start = windowStart;
    start + durationMinutes <= windowEnd;
    start += 30
  ) {
    const end = start + durationMinutes;
    const startStr = minutesToTime(start);
    const endStr = minutesToTime(end);

    const hasConflict = existing.some((a) =>
      timesOverlap(startStr, endStr, a.startTime, a.endTime)
    );

    if (!hasConflict) {
      slots.push(startStr);
    }
  }

  return slots;
}
