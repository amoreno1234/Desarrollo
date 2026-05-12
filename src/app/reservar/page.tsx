"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { DURATION_LABELS, formatCurrency, formatDate } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: "THIRTY_MIN" | "ONE_HOUR" | "TWO_HOURS";
  price: number;
};

type Step = "service" | "datetime" | "confirm" | "success";

function BookingFlow() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("serviceId");

  const [step, setStep] = useState<Step>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then(setServices);
  }, []);

  useEffect(() => {
    if (preselected && services.length) {
      const s = services.find((sv) => sv.id === preselected);
      if (s) { setSelected(s); setStep("datetime"); }
    }
  }, [preselected, services]);

  useEffect(() => {
    if (!selected || !date) return;
    setSlotsLoading(true);
    fetch(`/api/availability?date=${date}&duration=${selected.duration}`)
      .then((r) => r.json())
      .then((d) => { setSlots(d.slots || []); setSlot(""); })
      .finally(() => setSlotsLoading(false));
  }, [selected, date]);

  if (status === "unauthenticated") {
    router.push("/login?next=/reservar");
    return null;
  }

  async function handleBook() {
    setLoading(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: selected!.id, date, startTime: slot, notes }),
    });
    if (res.ok) {
      const data = await res.json();
      setAppointmentId(data.id);
      setStep("success");
    }
    setLoading(false);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {(["service", "datetime", "confirm"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? "bg-rose-600 text-white" :
                ["service","datetime","confirm","success"].indexOf(step) > i ? "bg-rose-200 text-rose-700" : "bg-stone-200 text-stone-500"
              }`}>{i + 1}</div>
              {i < 2 && <div className="flex-1 h-0.5 bg-stone-200" />}
            </div>
          ))}
        </div>

        {step === "service" && (
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-6">Elige tu tratamiento</h1>
            <div className="space-y-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelected(s); setStep("datetime"); }}
                  className="w-full text-left bg-white border border-stone-200 rounded-xl p-4 hover:border-rose-400 hover:shadow-sm transition-all flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-stone-800">{s.name}</p>
                    <p className="text-sm text-stone-400">{DURATION_LABELS[s.duration]}</p>
                  </div>
                  <p className="text-rose-700 font-bold">{formatCurrency(s.price)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "datetime" && selected && (
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">Selecciona fecha y hora</h1>
            <p className="text-stone-500 mb-6">{selected.name} — {DURATION_LABELS[selected.duration]}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-2">Fecha</label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {date && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">Horario disponible</label>
                {slotsLoading ? (
                  <p className="text-stone-400 text-sm">Consultando disponibilidad...</p>
                ) : slots.length === 0 ? (
                  <p className="text-amber-600 text-sm">No hay horarios disponibles para esta fecha. Elige otro día.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSlot(s)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          slot === s
                            ? "bg-rose-600 text-white border-rose-600"
                            : "bg-white text-stone-700 border-stone-200 hover:border-rose-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep("service")} className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50">
                Atrás
              </button>
              <button
                onClick={() => setStep("confirm")}
                disabled={!date || !slot}
                className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && selected && (
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-6">Confirmar reserva</h1>
            <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6 space-y-3">
              <Row label="Tratamiento" value={selected.name} />
              <Row label="Duración" value={DURATION_LABELS[selected.duration]} />
              <Row label="Fecha" value={formatDate(date)} />
              <Row label="Hora" value={slot} />
              <Row label="Precio" value={formatCurrency(selected.price)} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-1">Notas adicionales (opcional)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alergias, preferencias, etc."
                className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("datetime")} className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50">
                Atrás
              </button>
              <button
                onClick={handleBook}
                disabled={loading}
                className="px-8 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50"
              >
                {loading ? "Reservando..." : "Confirmar cita"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌸</div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">¡Cita confirmada!</h1>
            <p className="text-stone-500 mb-8">Recibirás un recordatorio antes de tu cita.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/cuenta")} className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                Ver mis citas
              </button>
              <button onClick={() => { setStep("service"); setSelected(null); setDate(""); setSlot(""); }}
                className="px-6 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50">
                Otra reserva
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-stone-500 text-sm">{label}</span>
      <span className="font-medium text-stone-800">{value}</span>
    </div>
  );
}

export default function ReservarPage() {
  return (
    <Suspense>
      <BookingFlow />
    </Suspense>
  );
}
