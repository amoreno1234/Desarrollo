import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import { DURATION_LABELS, formatCurrency, formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  COMPLETED: "bg-stone-50 text-stone-600",
};

export default async function AdminReservasPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") redirect("/login");

  const appointments = await prisma.appointment.findMany({
    include: {
      client: { select: { name: true, email: true, phone: true } },
      service: true,
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">Reservas</h1>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                {["Cliente", "Servicio", "Fecha", "Hora", "Precio", "Estado"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{a.client.name}</p>
                    <p className="text-stone-400 text-xs">{a.client.email}</p>
                    {a.client.phone && <p className="text-stone-400 text-xs">{a.client.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-stone-800">{a.service.name}</p>
                    <p className="text-stone-400 text-xs">{DURATION_LABELS[a.service.duration]}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(a.date)}</td>
                  <td className="px-4 py-3 text-stone-600">{a.startTime} – {a.endTime}</td>
                  <td className="px-4 py-3 text-rose-700 font-medium">{formatCurrency(a.service.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
