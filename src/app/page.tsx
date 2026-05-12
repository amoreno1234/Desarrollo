import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/db";
import { DURATION_LABELS, formatCurrency } from "@/lib/utils";

export default async function Home() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { duration: "asc" },
    take: 6,
  });

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-rose-50 to-pink-100 py-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-rose-800 mb-4">
            Tu momento de bienestar
          </h1>
          <p className="text-lg text-rose-700 mb-8 max-w-xl mx-auto">
            Reserva tu tratamiento favorito en minutos. Expertos en belleza y relajación.
          </p>
          <Link
            href="/reservar"
            className="bg-rose-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-rose-700 transition-colors shadow-md"
          >
            Reservar ahora
          </Link>
        </section>

        {/* Services preview */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">Nuestros tratamientos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 hover:shadow-md transition-shadow">
                <span className="inline-block bg-rose-50 text-rose-700 text-xs font-medium px-2 py-1 rounded-full mb-3">
                  {DURATION_LABELS[s.duration]}
                </span>
                <h3 className="font-semibold text-stone-800 mb-2">{s.name}</h3>
                <p className="text-stone-500 text-sm mb-4">{s.description}</p>
                <p className="text-rose-700 font-bold text-lg">{formatCurrency(s.price)}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/servicios" className="text-rose-600 hover:underline font-medium">
              Ver todos los servicios →
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-rose-50 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-stone-800 mb-10">¿Cómo funciona?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Elige tu servicio", desc: "Navega nuestro catálogo y selecciona el tratamiento ideal para ti" },
                { step: "2", title: "Selecciona fecha y hora", desc: "Elige el día y horario disponible que más te convenga" },
                { step: "3", title: "Confirma y relájate", desc: "Recibirás recordatorios antes de tu cita. ¡Solo preséntate!" },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-stone-800">{item.title}</h3>
                  <p className="text-stone-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-stone-100 py-6 text-center text-stone-400 text-sm">
        © {new Date().getFullYear()} Spa & Beauty — Todos los derechos reservados
      </footer>
    </>
  );
}
