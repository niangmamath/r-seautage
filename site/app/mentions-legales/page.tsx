import type { Metadata } from "next";
import Link from "next/link";
import { HandshakeIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Networking Maroc : éditeur, hébergeur, finalité, sources, contact.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default function MentionsLegales() {
  return (
    <div className="flex min-h-full flex-col">
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
            ← Retour au site
          </Link>
          <h1 className="mt-3 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            <HandshakeIcon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            Mentions légales
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <article className="prose prose-sm sm:prose-base max-w-none space-y-6 text-gray-700">
          <Section titre="Éditeur du site">
            <p>
              Ce site est un projet personnel de veille automatique édité par
              un particulier à titre non commercial. Les événements listés
              sont collectés automatiquement à partir de sources publiques
              (voir section « Sources »).
            </p>
            <p>
              Pour toute question, réclamation ou demande de retrait :{" "}
              <a
                href="mailto:niangmamathyacine@gmail.com"
                className="text-rose-600 font-medium hover:underline"
              >
                niangmamathyacine@gmail.com
              </a>
            </p>
          </Section>

          <Section titre="Hébergeur">
            <p>
              Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723,
              États-Unis — <a href="https://vercel.com" className="text-rose-600 hover:underline" target="_blank" rel="noreferrer">vercel.com</a>.
            </p>
            <p>
              Base de données hébergée par Neon Inc. (Neon Postgres).
            </p>
          </Section>

          <Section titre="Finalité du service">
            <p>
              Ce site agrège automatiquement des événements networking
              professionnels (meetups, conférences, forums, salons, soirées
              réseautage, workshops) accessibles au Maroc ou en ligne.
              L&apos;objectif est de faciliter la découverte et l&apos;accès
              à ces événements pour les professionnels basés au Maroc.
            </p>
            <p>
              Aucune transaction n&apos;est réalisée sur ce site : chaque
              fiche renvoie vers la page officielle de l&apos;organisateur
              où l&apos;inscription a lieu directement.
            </p>
          </Section>

          <Section titre="Sources des données">
            <p>
              Les événements affichés sont collectés via les pages publiques
              des plateformes suivantes, dans le respect de leurs{" "}
              <code>robots.txt</code> respectifs (vérifié le 2026-11-15) et
              avec un délai raisonnable entre requêtes :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Eventbrite</strong> —{" "}
                <a href="https://www.eventbrite.com" className="text-rose-600 hover:underline" target="_blank" rel="noreferrer">eventbrite.com</a>
              </li>
              <li>
                <strong>Meetup</strong> —{" "}
                <a href="https://www.meetup.com" className="text-rose-600 hover:underline" target="_blank" rel="noreferrer">meetup.com</a>
              </li>
            </ul>
            <p>
              Chaque fiche affichée porte le nom de sa source et un lien
              cliquable vers la page originale. Nous ne revendiquons aucune
              propriété sur ces données.
            </p>
          </Section>

          <Section titre="Droit de retrait">
            <p>
              Si vous êtes organisateur d&apos;un événement listé sur ce
              site et souhaitez qu&apos;il soit retiré, envoyez un email à{" "}
              <a
                href="mailto:niangmamathyacine@gmail.com?subject=Demande%20de%20retrait"
                className="text-rose-600 font-medium hover:underline"
              >
                niangmamathyacine@gmail.com
              </a>{" "}
              en précisant l&apos;URL de la fiche. Le retrait est effectué
              sous 48 h ouvrées.
            </p>
          </Section>

          <Section titre="Responsabilité">
            <p>
              Les informations affichées sont collectées automatiquement et
              peuvent contenir des erreurs ou être obsolètes. Vérifiez
              toujours les conditions d&apos;inscription, les dates et le
              lieu directement auprès de l&apos;organisateur avant de vous
              déplacer.
            </p>
            <p>
              L&apos;éditeur ne peut être tenu responsable d&apos;un
              événement annulé, déplacé, payant par surprise, ou de toute
              information inexacte relayée depuis la source d&apos;origine.
            </p>
          </Section>

          <Section titre="Propriété intellectuelle">
            <p>
              Le design, le code source du site et le code du pipeline de
              collecte sont la propriété de l&apos;éditeur. Le code est
              disponible en open source sur{" "}
              <a
                href="https://github.com/niangmamath/r-seautage"
                className="text-rose-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              .
            </p>
            <p>
              Les titres, descriptions et visuels des événements restent la
              propriété de leurs organisateurs et plateformes respectives.
            </p>
          </Section>
        </article>
      </main>

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-gray-400 sm:px-6">
          <Link href="/" className="hover:text-gray-600">
            Retour à l&apos;accueil
          </Link>
          {" · "}
          <Link href="/politique-confidentialite" className="hover:text-gray-600">
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Section({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{titre}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
