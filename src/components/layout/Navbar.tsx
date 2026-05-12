"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  return (
    <nav className="bg-white border-b border-rose-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-rose-700 tracking-tight">
          🌸 Spa & Beauty
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/servicios" className="text-stone-600 hover:text-rose-700">Servicios</Link>
          <Link href="/reservar" className="text-stone-600 hover:text-rose-700">Reservar</Link>
          {session ? (
            <>
              <Link href="/cuenta" className="text-stone-600 hover:text-rose-700">Mi cuenta</Link>
              {role === "ADMIN" && (
                <Link href="/admin" className="text-stone-600 hover:text-rose-700">Admin</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-stone-500 hover:text-red-600"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-600 hover:text-rose-700">Iniciar sesión</Link>
              <Link
                href="/registro"
                className="bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
