"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { DURATION_LABELS, formatCurrency } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: "THIRTY_MIN" | "ONE_HOUR" | "TWO_HOURS";
  price: number;
  active: boolean;
};

const EMPTY_FORM = { name: "", description: "", duration: "ONE_HOUR" as "THIRTY_MIN" | "ONE_HOUR" | "TWO_HOURS", price: "" };

export default function AdminServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session.user as { role?: string }).role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/services?all=1").then((r) => r.json()).then(setServices);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const method = editId ? "PATCH" : "POST";
    const url = editId ? `/api/services/${editId}` : "/api/services";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    });
    const saved = await res.json();
    if (editId) {
      setServices((prev) => prev.map((s) => (s.id === editId ? saved : s)));
    } else {
      setServices((prev) => [...prev, saved]);
    }
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setLoading(false);
  }

  async function toggleActive(s: Service) {
    await fetch(`/api/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    setServices((prev) => prev.map((sv) => (sv.id === s.id ? { ...sv, active: !sv.active } : sv)));
  }

  function startEdit(s: Service) {
    setForm({ name: s.name, description: s.description || "", duration: s.duration, price: String(s.price) });
    setEditId(s.id);
    setShowForm(true);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-stone-800">Catálogo de servicios</h1>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700"
          >
            + Nuevo servicio
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
            <h2 className="font-semibold text-stone-800 mb-4">{editId ? "Editar servicio" : "Nuevo servicio"}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Duración</label>
                <select required value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value as typeof form.duration }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400">
                  <option value="THIRTY_MIN">30 minutos</option>
                  <option value="ONE_HOUR">1 hora</option>
                  <option value="TWO_HOURS">2 horas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Precio (MXN)</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={loading}
                  className="bg-rose-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50">
                  {loading ? "Guardando..." : "Guardar"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="border border-stone-200 px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-50">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                {["Servicio", "Duración", "Precio", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {services.map((s) => (
                <tr key={s.id} className={s.active ? "" : "opacity-50"}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{s.name}</p>
                    {s.description && <p className="text-stone-400 text-xs">{s.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{DURATION_LABELS[s.duration]}</td>
                  <td className="px-4 py-3 text-rose-700 font-medium">{formatCurrency(s.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.active ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {s.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => startEdit(s)} className="text-xs text-rose-600 hover:underline">Editar</button>
                    <button onClick={() => toggleActive(s)} className="text-xs text-stone-500 hover:underline">
                      {s.active ? "Desactivar" : "Activar"}
                    </button>
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
