import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import PushNotificationSetup from "@/components/layout/PushNotificationSetup";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spa & Beauty — Reserva tu tratamiento",
  description: "Reserva tus tratamientos de belleza y spa en línea",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#d4a0b0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-800">
        <SessionProvider>
          {children}
          <PushNotificationSetup />
        </SessionProvider>
      </body>
    </html>
  );
}
