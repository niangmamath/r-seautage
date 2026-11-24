import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { EvenementCard } from "@/components/EvenementCard";
import { HandshakeIcon } from "@/components/icons";
import { getEvenementsNouveautes } from "@/lib/categories";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Nouveautés — derniers événements networking au Maroc",
  description:
    "Les événements networking détectés ces 7 derniers jours au Maroc : meetups, conférences, forums, workshops. Nouveaux ajouts chaque jour.",
  alternates: { canonical: "/nouveautes" },
  openGraph: {
    title: "Nouveaux événements networking au Maroc",
    description: "Événements détectés ces 7 derniers jours.",
    url: "/nouveautes",
  },
};

export default async function NouveautesPage() {
  await connection();
  const evenements = await getEvenementsNouveautes(7);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Nouveaux événements networking au Maroc",
    itemListElement: evenements.slice(0, 50).map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/evenement/${e.slug}`,
      name: e.titre,
    })),
  };

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      {evenements.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      ) : null}
      <header className="bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="text-xs font-medium text-rose-100 hover:text-white"
          >
            ← Accueil
          </Link>
          <h1 className="mt-3 flex items-center gap-2 text-2xl font-extrabold text-white sm:text-3xl">
            <HandshakeIcon className="h-6 w-6 shrink-0" />
            Nouveautés — 7 derniers jours
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-rose-50">
            {evenements.length} événement{evenements.length > 1 ? "s" : ""}{" "}
            détecté{evenements.length > 1 ? "s" : ""} récemment.
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        {evenements.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            Aucun nouvel événement détecté ces 7 derniers jours.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {evenements.map((e) => (
              <li key={e.slug}>
                <EvenementCard e={e} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-gray-400 sm:px-6 space-y-2">
          <p>
            <Link href="/feed.xml" className="hover:text-gray-600">
              Flux RSS
            </Link>
            {" · "}
            <Link href="/" className="hover:text-gray-600">
              Tous les événements
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
