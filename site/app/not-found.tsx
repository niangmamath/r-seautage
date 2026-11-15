import Link from "next/link";
import { HandshakeIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_10%,white,transparent_30%),radial-gradient(circle_at_85%_0%,white,transparent_25%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          >
            <HandshakeIcon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            Networking au Maroc
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl flex-1 px-4 py-20 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-600 mb-8">
          Cet événement n&apos;existe pas (ou plus).
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
    </div>
  );
}
