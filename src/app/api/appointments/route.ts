import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/availability";
import { durationToMinutes, minutesToTime, timeToMinutes } from "@/lib/availability";
import { z } from "zod";

const bookingSchema = z.object({
  serviceId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = (session.user as { id?: string }).id;
  const role = (session.user as { role?: string }).role;

  const where =
    role === "ADMIN"
      ? searchParams.get("clientId")
        ? { clientId: searchParams.get("clientId")! }
        : {}
      : { clientId };

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: true, client: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { serviceId, date, startTime, notes } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  const availableSlots = await getAvailableSlots(new Date(date), service.duration);
  if (!availableSlots.includes(startTime)) {
    return NextResponse.json({ error: "Horario no disponible" }, { status: 409 });
  }

  const endMinutes = timeToMinutes(startTime) + durationToMinutes(service.duration);
  const endTime = minutesToTime(endMinutes);

  const appointment = await prisma.appointment.create({
    data: {
      clientId: (session.user as { id?: string }).id!,
      serviceId,
      date: new Date(date),
      startTime,
      endTime,
      notes,
      status: "CONFIRMED",
    },
    include: { service: true },
  });

  return NextResponse.json(appointment, { status: 201 });
}
