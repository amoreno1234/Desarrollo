import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/db";
import { DURATION_LABELS, formatCurrency } from "@/lib/utils";
import { Duration } from "@prisma/client";

const DURATION_ORDER: Duration[] = ["THIRTY_MIN", "ONE_HOUR", "TWO_HOURS"];

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ duration: "asc" }, { price: "asc" }],
  });

  const grouped = DURATION_ORDER.reduce((acc, dur) => {
    acc[dur] = services.filter((s) => s.duration === dur);
    return acc;
  }, {} as Record<Duration, typeof services>);

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Nuestros tratamientos</h1>
        <p className="text-stone-500 mb-10">Elige el servicio que mejor se adapte a tu tiempo y necesidades</p>

        {DURATION_ORDER.map((dur) => (
          grouped[dur].length > 0 && (
            <section key={dur} className="mb-12">
              <h2 className="text-xl font-semibold text-rose-700 mb-4 flex items-center gap-2">
                <span className="bg-rose-100 px-3 py-1 rounded-full text-sm">{DURATION_LABELS[dur]}</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {grouped[dur].map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col">
                    <h3 className="font-semibold text-stone-800 mb-2">{s.name}</h3>
                    {s.description && <p className="text-stone-500 text-sm flex-1 mb-4">{s.description}</p>}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-rose-700 font-bold text-lg">{formatCurrency(s.price)}</span>
                      <Link
                        href={`/reservar?serviceId=${s.id}`}
                        className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-rose-700 transition-colors"
                      >
                        Reservar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        ))}
      </main>
    </>
  );
}
