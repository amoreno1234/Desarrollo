import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import { formatDate } from "@/lib/utils";

function NPSBadge({ score }: { score: number }) {
  const color = score <= 6 ? "bg-red-50 text-red-600" : score <= 8 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700";
  const label = score <= 6 ? "Detractor" : score <= 8 ? "Pasivo" : "Promotor";
  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-bold px-2 py-0.5 rounded ${color}`}>{score}</span>
      <span className={`text-xs ${color} rounded-full px-2 py-0.5`}>{label}</span>
    </div>
  );
}

export default async function AdminFeedbackPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") redirect("/login");

  const feedback = await prisma.feedback.findMany({
    include: {
      client: { select: { name: true, email: true } },
      appointment: { include: { service: { select: { name: true } } } },
      feedbackDetail: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const avg = feedback.length
    ? feedback.reduce((sum, f) => sum + f.npsScore, 0) / feedback.length
    : null;

  const promoters = feedback.filter((f) => f.npsScore >= 9).length;
  const detractors = feedback.filter((f) => f.npsScore <= 6).length;
  const nps = feedback.length ? Math.round(((promoters - detractors) / feedback.length) * 100) : null;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Feedback & NPS</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-rose-700">{avg?.toFixed(1) ?? "—"}</p>
            <p className="text-stone-500 text-sm">NPS promedio</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-rose-700">{nps !== null ? `${nps}` : "—"}</p>
            <p className="text-stone-500 text-sm">Score NPS</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-rose-700">{feedback.length}</p>
            <p className="text-stone-500 text-sm">Evaluaciones</p>
          </div>
        </div>

        <div className="space-y-4">
          {feedback.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-stone-800">{f.client.name}</p>
                  <p className="text-stone-400 text-xs">{f.appointment.service.name} · {formatDate(f.createdAt)}</p>
                </div>
                <NPSBadge score={f.npsScore} />
              </div>
              {f.feedbackDetail && (
                <div className="bg-red-50 rounded-xl p-4 text-sm">
                  <p className="font-medium text-stone-700 mb-1">{f.feedbackDetail.name} — {f.feedbackDetail.email}</p>
                  {f.feedbackDetail.phone && <p className="text-stone-500 text-xs mb-2">{f.feedbackDetail.phone}</p>}
                  <p className="text-stone-600">"{f.feedbackDetail.comment}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
