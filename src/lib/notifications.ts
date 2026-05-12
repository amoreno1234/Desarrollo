import webpush from "web-push";
import { prisma } from "./db";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:admin@spa.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url?: string
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const payload = JSON.stringify({ title, body, url });

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );
}

export async function sendEmailReminder(
  to: string,
  name: string,
  serviceName: string,
  date: string,
  time: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@spa.com",
    to,
    subject: `Recordatorio: Tu cita en el Spa - ${date}`,
    html: `
      <h2>Hola ${name},</h2>
      <p>Te recordamos que tienes una cita para <strong>${serviceName}</strong>.</p>
      <p><strong>Fecha:</strong> ${date}</p>
      <p><strong>Hora:</strong> ${time}</p>
      <p>¡Te esperamos!</p>
    `,
  });
}

export async function sendWhatsAppReminder(
  phone: string,
  name: string,
  serviceName: string,
  date: string,
  time: string
) {
  if (!process.env.TWILIO_ACCOUNT_SID) return;

  const twilio = (await import("twilio")).default;
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `Hola ${name}! 🌸 Te recordamos tu cita de *${serviceName}* el ${date} a las ${time}. ¡Te esperamos en el Spa!`,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${phone}`,
  });
}
