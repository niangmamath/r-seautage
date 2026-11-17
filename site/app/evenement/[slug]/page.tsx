import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getEvenementBySlug } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";
import {
  ArrowRightIcon,
  CalendarIcon,
  GlobeIcon,
  HandshakeIcon,
  PinIcon,
  UsersIcon,
} from "@/components/icons";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

const FENETRE_STYLE: Record<string, string> = {
  "EN COURS": "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  IMMINENT: "bg-amber-100 text-amber-800 ring-amber-600/20",
  "BIENTÔT": "bg-sky-100 text-sky-800 ring-sky-600/20",
  "ANNONCÉ": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  INCONNUE: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvenementBySlug(slug);
  if (!e) return { title: "Événement introuvable" };

  const path = `/evenement/${slug}`;
  const desc =
    e.description?.slice(0, 160) ||
    `${e.titre} — événement organisé par ${e.organisateur ?? "un collectif"}, ${
      e.en_ligne ? "en ligne" : e.ville || "au Maroc"
    }${e.date_debut ? `, le ${e.date_debut}` : ""}.`;

  return {
    title: e.titre,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: e.titre,
      description: desc,
      url: path,
      siteName: "Networking Maroc",
      locale: "fr_MA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: e.titre,
      description: desc,
    },
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "date non précisée";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default async function EvenementPage({ params }: { params: Params }) {
  const { slug } = await params;
  const e = await getEvenementBySlug(slug);
  if (!e) notFound();

  const pageUrl = `${siteUrl}/evenement/${slug}`;

  const eventLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.titre,
    description: e.description || undefined,
    url: pageUrl,
    startDate: e.date_debut || undefined,
    endDate: e.date_fin || undefined,
    eventAttendanceMode: e.en_ligne
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: e.organisateur
      ? { "@type": "Organization", name: e.organisateur }
      : undefined,
    location: e.en_ligne
      ? { "@type": "VirtualLocation", url: e.url || pageUrl }
      : {
          "@type": "Place",
          name: e.ville || "Maroc",
          address: { "@type": "PostalAddress", addressCountry: "MA" },
        },
    inLanguage: "fr",
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `${siteUrl}/`,
      },
      { "@type": "ListItem", position: 2, name: e.titre, item: pageUrl },
    ],
  };

  const fenStyle = FENETRE_STYLE[e.fenetre] ?? FENETRE_STYLE.INCONNUE;
  const dates =
    e.date_debut && e.date_fin && e.date_debut !== e.date_fin
      ? `${formatDate(e.date_debut)} → ${formatDate(e.date_fin)}`
      : formatDate(e.date_debut || e.date_fin);

  return (
    <div className="flex min-h-full flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_10%,white,transparent_30%),radial-gradient(circle_at_85%_0%,white,transparent_25%)]"
        />
        <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-100 transition hover:text-white"
          >
            ← Tous les événements
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${fenStyle}`}
            >
              {e.fenetre}
            </span>
            {e.en_ligne ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/30">
                <GlobeIcon className="h-3.5 w-3.5" />
                En ligne
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/30">
                <PinIcon className="h-3.5 w-3.5" />
                {e.ville || "Maroc"}
              </span>
            )}
          </div>
          <h1 className="mt-3 flex items-start gap-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            <HandshakeIcon className="mt-1 h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            {e.titre}
          </h1>
          {e.organisateur ? (
            <p className="mt-1 text-sm text-rose-100">
              par <span className="font-semibold">{e.organisateur}</span>
            </p>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard icon={<CalendarIcon className="h-4 w-4" />} label="Dates">
            {dates}
          </InfoCard>
          <InfoCard
            icon={
              e.en_ligne ? (
                <GlobeIcon className="h-4 w-4" />
              ) : (
                <PinIcon className="h-4 w-4" />
              )
            }
            label="Lieu"
          >
            {e.en_ligne ? "En ligne — ouvert au Maroc" : e.ville || "Maroc"}
          </InfoCard>
          {e.categorie ? (
            <InfoCard
              icon={<UsersIcon className="h-4 w-4" />}
              label="Catégorie"
            >
              {e.categorie}
            </InfoCard>
          ) : null}
          {e.source ? (
            <InfoCard
              icon={<ArrowRightIcon className="h-4 w-4" />}
              label="Source"
            >
              {e.source}
            </InfoCard>
          ) : null}
        </div>

        {e.description ? (
          <div className="mt-6 whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700 shadow-sm">
            {e.description}
          </div>
        ) : null}

        {e.url ? (
          <div className="mt-8 flex justify-center">
            <a
              href={e.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-500"
            >
              Voir / s&apos;inscrire
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        ) : null}
      </main>

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-gray-400 sm:px-6 space-y-2">
          <p>
            Événement collecté automatiquement — vérifiez toujours les
            conditions auprès de l&apos;organisateur.
          </p>
          <p>
            <a href="/mentions-legales" className="hover:text-gray-600">
              Mentions légales
            </a>
            {" · "}
            <a
              href="/politique-confidentialite"
              className="hover:text-gray-600"
            >
              Politique de confidentialité
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
        <span className="text-rose-500">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{children}</div>
    </div>
  );
}
