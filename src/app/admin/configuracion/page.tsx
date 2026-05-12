"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

type Settings = {
  spaName: string;
  spaPhone: string;
  spaEmail: string;
  spaAddress: string;
  googleReviewUrl: string;
};

const EMPTY: Settings = {
  spaName: "",
  spaPhone: "",
  spaEmail: "",
  spaAddress: "",
  googleReviewUrl: "",
};

export default function AdminConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<Settings>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session.user as { role?: string }).role !== "ADMIN")
      router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setForm({ ...EMPTY, ...d }));
  }, []);

  function set(key: keyof Settings) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const fields: { label: string; key: keyof Settings; placeholder: string; hint?: string }[] = [
    { label: "Nombre del Spa", key: "spaName", placeholder: "Spa & Beauty" },
    { label: "Teléfono", key: "spaPhone", placeholder: "+52 55 1234 5678" },
    { label: "Email de contacto", key: "spaEmail", placeholder: "contacto@tuspa.com" },
    { label: "Dirección", key: "spaAddress", placeholder: "Calle Principal 123, Ciudad" },
    {
      label: "URL de reseñas de Google",
      key: "googleReviewUrl",
      placeholder: "https://g.page/r/TU_PLACE_ID/review",
      hint: 'Clientes con NPS 9–10 serán redirigidos aquí. Encuéntrala en Google Business Profile → "Obtener enlace de reseña".',
    },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">Configuración del Spa</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-5">
          {fields.map(({ label, key, placeholder, hint }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
              <input
                type={key === "spaEmail" ? "email" : key === "googleReviewUrl" ? "url" : "text"}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
            </div>
          ))}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-rose-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            {saved && (
              <span className="text-green-600 text-sm font-medium">✓ Cambios guardados</span>
            )}
          </div>
        </form>

        <div className="mt-6 bg-rose-50 rounded-xl p-4 text-sm text-stone-600">
          <p className="font-medium text-stone-700 mb-1">¿Cómo obtener el enlace de Google Reviews?</p>
          <ol className="list-decimal list-inside space-y-1 text-stone-500">
            <li>Abre <strong>Google Business Profile</strong> (business.google.com)</li>
            <li>Selecciona tu negocio</li>
            <li>Ve a <strong>Inicio</strong> → sección "Obtén más reseñas"</li>
            <li>Copia el enlace y pégalo aquí</li>
          </ol>
        </div>
      </main>
    </>
  );
}
