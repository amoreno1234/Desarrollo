import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalClients, totalAppointments, todayAppointments, pendingFeedback, avgNPS] =
    await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.appointment.count({ where: { status: { notIn: ["CANCELLED"] } } }),
      prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow }, status: { notIn: ["CANCELLED"] } } }),
      prisma.feedback.count({ where: { feedbackDetail: { isNot: null } } }),
      prisma.feedback.aggregate({ _avg: { npsScore: true } }),
    ]);

  const stats = [
    { label: "Clientes registrados", value: totalClients, href: "/admin/clientes" },
    { label: "Citas totales", value: totalAppointments, href: "/admin/reservas" },
    { label: "Citas hoy", value: todayAppointments, href: "/admin/reservas" },
    { label: "NPS promedio", value: avgNPS._avg.npsScore?.toFixed(1) ?? "—", href: "/admin/feedback" },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">Panel de administración</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-rose-700 mb-1">{s.value}</p>
              <p className="text-stone-500 text-sm">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: "Catálogo de servicios", desc: "Alta, edición y desactivación de tratamientos", href: "/admin/servicios" },
            { title: "Reservas", desc: "Ver y gestionar todas las citas agendadas", href: "/admin/reservas" },
            { title: "Clientes", desc: "Directorio de clientes registrados", href: "/admin/clientes" },
            { title: "Feedback & NPS", desc: "Resultados de encuestas y comentarios", href: "/admin/feedback" },
            { title: "Configuración", desc: "Datos del spa y enlace de reseñas de Google", href: "/admin/configuracion" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:shadow-md hover:border-rose-200 transition-all">
              <h2 className="font-semibold text-stone-800 mb-1">{item.title}</h2>
              <p className="text-stone-500 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
