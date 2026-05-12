"use client";
import { useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const LOW_THRESHOLD = 6;
const HIGH_THRESHOLD = 9;

export default function FeedbackPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [score, setScore] = useState<number | null>(null);
  const [step, setStep] = useState<"nps" | "detail" | "done">("nps");
  const [detail, setDetail] = useState({ name: session?.user?.name || "", email: session?.user?.email || "", phone: "", comment: "" });
  const [loading, setLoading] = useState(false);

  async function submitNPS(npsScore: number) {
    setScore(npsScore);

    if (npsScore >= HIGH_THRESHOLD) {
      // Submit and redirect to Google Reviews
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, npsScore }),
      });
      const res = await fetch("/api/settings");
      const settings = await res.json();
      window.location.href = settings.googleReviewUrl || "https://google.com";
      return;
    }

    if (npsScore <= LOW_THRESHOLD) {
      setStep("detail");
    } else {
      // Passive (7-8): just submit
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, npsScore }),
      });
      setStep("done");
    }
  }

  async function submitDetail() {
    setLoading(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, npsScore: score, detail }),
    });
    setLoading(false);
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">💙</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">¡Gracias por tu opinión!</h1>
          <p className="text-stone-500 mb-6">Tus comentarios nos ayudan a mejorar.</p>
          <button onClick={() => router.push("/")} className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (step === "detail") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 w-full max-w-md">
          <h1 className="text-xl font-bold text-stone-800 mb-2">Cuéntanos más</h1>
          <p className="text-stone-500 text-sm mb-6">Queremos mejorar tu experiencia. ¿Qué podemos hacer mejor?</p>

          <div className="space-y-4">
            {[
              { label: "Nombre", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Teléfono (opcional)", key: "phone", type: "tel" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={detail[key as keyof typeof detail]}
                  onChange={(e) => setDetail((d) => ({ ...d, [key]: e.target.value }))}
                  required={key !== "phone"}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Comentarios</label>
              <textarea
                rows={4}
                required
                value={detail.comment}
                onChange={(e) => setDetail((d) => ({ ...d, comment: e.target.value }))}
                placeholder="¿Qué podemos mejorar?"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <button
              onClick={submitDetail}
              disabled={loading || !detail.name || !detail.email || !detail.comment}
              className="w-full bg-rose-600 text-white py-2 rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar comentarios"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 w-full max-w-md text-center">
        <div className="text-4xl mb-4">🌸</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">¿Cómo fue tu experiencia?</h1>
        <p className="text-stone-500 text-sm mb-8">
          Del 0 al 10, ¿qué tan probable es que recomiendes nuestro spa a un amigo o familiar?
        </p>

        <div className="flex justify-between gap-1 mb-3">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              onClick={() => submitNPS(i)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${
                i <= 6
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : i <= 8
                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  : "bg-green-50 text-green-600 hover:bg-green-100"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-stone-400">
          <span>Muy poco probable</span>
          <span>Extremadamente probable</span>
        </div>
      </div>
    </div>
  );
}
