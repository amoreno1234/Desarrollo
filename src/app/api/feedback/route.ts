import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const feedbackSchema = z.object({
  appointmentId: z.string().cuid(),
  npsScore: z.number().int().min(0).max(10),
  detail: z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      comment: z.string().min(10),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { appointmentId, npsScore, detail } = parsed.data;
  const clientId = (session.user as { id?: string }).id!;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { feedback: true },
  });

  if (!appointment || appointment.clientId !== clientId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (appointment.feedback) {
    return NextResponse.json({ error: "Feedback ya enviado" }, { status: 409 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      appointmentId,
      clientId,
      npsScore,
      ...(detail && npsScore <= 6
        ? { feedbackDetail: { create: detail } }
        : {}),
    },
    include: { feedbackDetail: true },
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json(feedback, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const feedback = await prisma.feedback.findMany({
    include: {
      client: { select: { name: true, email: true } },
      appointment: { include: { service: true } },
      feedbackDetail: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(feedback);
}
