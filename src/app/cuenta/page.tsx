"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { DURATION_LABELS, formatCurrency, formatDate } from "@/lib/utils";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  service: { name: string; duration: string; price: number };
  feedback: null | { id: string };
};

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

export default function CuentaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?next=/cuenta");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/appointments")
      .then((r) => r.json())
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, [status]);

  async function cancelAppointment(id: string) {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
    );
  }

  const upcoming = appointments.filter((a) =>
    ["PENDING", "CONFIRMED"].includes(a.status) && new Date(a.date) >= new Date(new Date().toDateString())
  );
  const past = appointments.filter((a) => !upcoming.includes(a));

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-96">
          <p className="text-stone-400">Cargando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Mis citas</h1>
            <p className="text-stone-500 text-sm">Bienvenida, {session?.user?.name}</p>
          </div>
          <Link href="/reservar" className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 text-sm font-medium">
            + Nueva cita
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">Próximas citas</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center text-stone-400">
              No tienes citas próximas.{" "}
              <Link href="/reservar" className="text-rose-600 hover:underline">Reserva ahora</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onCancel={() => cancelAppointment(a.id)}
                />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-4">Historial</h2>
            <div className="space-y-3">
              {past.map((a) => (
                <AppointmentCard key={a.id} appointment={a} past />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function AppointmentCard({
  appointment: a,
  onCancel,
  past,
}: {
  appointment: Appointment;
  onCancel?: () => void;
  past?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-stone-800">{a.service.name}</p>
          <p className="text-stone-500 text-sm">
            {formatDate(a.date)} · {a.startTime} – {a.endTime}
          </p>
          <p className="text-stone-400 text-sm">{DURATION_LABELS[a.service.duration as "THIRTY_MIN" | "ONE_HOUR" | "TWO_HOURS"]} · {formatCurrency(a.service.price)}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[a.status]}`}>
          {STATUS_LABELS[a.status]}
        </span>
      </div>
      <div className="flex gap-2 mt-4">
        {!past && a.status !== "CANCELLED" && (
          <button
            onClick={onCancel}
            className="text-xs text-red-500 hover:underline"
          >
            Cancelar cita
          </button>
        )}
        {a.status === "COMPLETED" && !a.feedback && (
          <Link
            href={`/feedback/${a.id}`}
            className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full hover:bg-rose-100"
          >
            Dejar opinión
          </Link>
        )}
      </div>
    </div>
  );
}
