import Link from "next/link";
import type { Evenement } from "@/lib/db";
import { EvenementCard } from "./EvenementCard";
import { HandshakeIcon } from "./icons";
import { siteUrl } from "@/lib/site-url";
import CategorieFAQ from "./CategorieFAQ";

type Crumb = { nom: string; url: string };
type Contexte =
  | { type: "categorie"; nom: string }
  | { type: "ville"; nom: string }
  | { type: "en-ligne" };

export default function CategorieLanding({
  h1,
  titre,
  canonicalPath,
  breadcrumb,
  intro,
  evenements,
  contexteFAQ,
}: {
  h1: string;
  titre: string;
  canonicalPath: string;
  breadcrumb: Crumb[];
  intro: React.ReactNode;
  evenements: Evenement[];
  contexteFAQ: Contexte;
}) {
  const url = `${siteUrl}${canonicalPath}`;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.nom,
      item: c.url.startsWith("http") ? c.url : `${siteUrl}${c.url}`,
    })),
  };
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: titre,
    url,
    itemListElement: evenements.slice(0, 50).map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/evenement/${e.slug}`,
      name: e.titre,
    })),
  };

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {evenements.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      ) : null}

      <header className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 px-4 py-10 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_10%,white,transparent_30%),radial-gradient(circle_at_85%_0%,white,transparent_25%)]"
        />
        <div className="relative mx-auto w-full max-w-4xl">
          <nav
            aria-label="Fil d'Ariane"
            className="flex items-center gap-1 text-xs text-rose-100"
          >
            {breadcrumb.map((c, i) => (
              <span key={c.url} className="flex items-center gap-1">
                {i > 0 ? <span>›</span> : null}
                {i < breadcrumb.length - 1 ? (
                  <Link href={c.url} className="hover:text-white">
                    {c.nom}
                  </Link>
                ) : (
                  <span className="font-semibold text-white">{c.nom}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="mt-3 flex items-start gap-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            <HandshakeIcon className="mt-1 h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            {h1}
          </h1>
          <div className="mt-3 max-w-2xl text-sm leading-relaxed text-rose-50">
            {intro}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        {evenements.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            Aucun événement pour l&apos;instant.{" "}
            <Link href="/" className="font-medium text-rose-600 hover:underline">
              Voir tous les événements
            </Link>
            .
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

      <CategorieFAQ contexte={contexteFAQ} evenements={evenements} />

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-gray-400 sm:px-6 space-y-2">
          <p>
            <Link href="/" className="hover:text-gray-600">
              ← Tous les événements
            </Link>
          </p>
          <p>
            <Link href="/mentions-legales" className="hover:text-gray-600">
              Mentions légales
            </Link>
            {" · "}
            <Link
              href="/politique-confidentialite"
              className="hover:text-gray-600"
            >
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
