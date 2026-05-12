import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST /api/admin/seed — one-time setup to create admin user and sample services
export async function POST() {
  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    return NextResponse.json({ message: "Admin already exists" }, { status: 200 });
  }

  const password = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@spa.com",
      password,
      role: "ADMIN",
    },
  });

  await prisma.service.createMany({
    data: [
      { name: "Masaje Relajante", description: "Masaje corporal de relajación profunda", duration: "ONE_HOUR", price: 850 },
      { name: "Masaje de Tejido Profundo", description: "Tratamiento intensivo para músculos tensos", duration: "ONE_HOUR", price: 950 },
      { name: "Facial Hidratante", description: "Limpieza facial e hidratación profunda", duration: "THIRTY_MIN", price: 550 },
      { name: "Exfoliación Corporal", description: "Exfoliación con sales minerales", duration: "THIRTY_MIN", price: 450 },
      { name: "Ritual Completo Spa", description: "Masaje + facial + aromaterapia", duration: "TWO_HOURS", price: 1800 },
      { name: "Tratamiento Anti-estrés Premium", description: "Ritual completo de relajación y rejuvenecimiento", duration: "TWO_HOURS", price: 2200 },
    ],
  });

  await prisma.spaSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      spaName: "Spa & Beauty",
      googleReviewUrl: process.env.GOOGLE_REVIEW_URL || "",
    },
  });

  return NextResponse.json({ message: "Setup complete. admin@spa.com / admin123" });
}
