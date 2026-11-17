import type { Metadata } from "next";
import Link from "next/link";
import { HandshakeIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité du site Networking Maroc : données collectées, cookies, analytics, droits GDPR et loi 09-08.",
  alternates: { canonical: "/politique-confidentialite" },
  robots: { index: true, follow: true },
};

export default function PolitiqueConfidentialite() {
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
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-xs text-rose-100">
            Dernière mise à jour : novembre 2026
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <article className="prose prose-sm sm:prose-base max-w-none space-y-6 text-gray-700">
          <Section titre="En bref">
            <p>
              Ce site <strong>ne collecte aucune donnée personnelle</strong>{" "}
              directement : il n&apos;y a ni compte utilisateur, ni formulaire
              d&apos;inscription, ni cookie de tracking marketing.
            </p>
            <p>
              Deux outils tiers mesurent le trafic de manière{" "}
              <strong>anonyme et agrégée</strong> : Vercel Analytics et
              Vercel Speed Insights.
            </p>
          </Section>

          <Section titre="Mesures d'audience (Vercel Analytics)">
            <p>
              Nous utilisons{" "}
              <a
                href="https://vercel.com/docs/analytics"
                className="text-rose-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Vercel Analytics
              </a>{" "}
              pour compter les pages vues et comprendre quelles pages
              intéressent les visiteurs. Vercel Analytics est{" "}
              <strong>sans cookie</strong> et <strong>sans identifiant
              persistant</strong> : chaque visite est anonymisée par un hash
              quotidien généré côté serveur, invariant pendant la journée
              mais impossible à relier à une personne.
            </p>
            <p>
              Données collectées : URL visitée, référent, pays (dérivé de
              l&apos;IP mais l&apos;IP n&apos;est pas stockée), type
              d&apos;appareil, navigateur. <strong>Aucune donnée
              personnelle identifiante</strong> n&apos;est stockée.
            </p>
          </Section>

          <Section titre="Mesures de performance (Vercel Speed Insights)">
            <p>
              Vercel Speed Insights mesure les{" "}
              <a
                href="https://web.dev/vitals/"
                className="text-rose-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Core Web Vitals
              </a>{" "}
              (LCP, INP, CLS) depuis votre navigateur, pour nous aider à
              améliorer la vitesse du site. Même principe : aucune donnée
              identifiante, aucun cookie.
            </p>
          </Section>

          <Section titre="Événements affichés">
            <p>
              Les événements listés sur ce site contiennent parfois le nom
              de l&apos;organisateur (personne ou organisation). Ces
              informations proviennent de pages publiques (Eventbrite,
              Meetup) où leurs auteurs les ont volontairement publiées.
            </p>
            <p>
              Si vous êtes organisateur et souhaitez que votre nom ou votre
              événement soit retiré du site, envoyez un email à{" "}
              <a
                href="mailto:niangmamathyacine@gmail.com?subject=Demande%20de%20retrait"
                className="text-rose-600 font-medium hover:underline"
              >
                niangmamathyacine@gmail.com
              </a>
              . Le retrait est effectué sous 48 h ouvrées.
            </p>
          </Section>

          <Section titre="Cookies">
            <p>
              Aucun cookie n&apos;est déposé par ce site. Le navigateur peut
              utiliser le stockage local (localStorage) pour mémoriser vos
              filtres sélectionnés sur la liste, mais ce stockage reste sur
              votre appareil et n&apos;est jamais transmis.
            </p>
          </Section>

          <Section titre="Vos droits">
            <p>
              Conformément au{" "}
              <strong>Règlement général sur la protection des données
              (RGPD)</strong> et à la{" "}
              <strong>loi marocaine 09-08</strong> relative à la protection
              des personnes physiques à l&apos;égard du traitement des
              données à caractère personnel, vous disposez des droits
              d&apos;accès, de rectification, d&apos;effacement,
              d&apos;opposition et de portabilité.
            </p>
            <p>
              Pour exercer ces droits : envoyez un email à{" "}
              <a
                href="mailto:niangmamathyacine@gmail.com"
                className="text-rose-600 font-medium hover:underline"
              >
                niangmamathyacine@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section titre="Modifications">
            <p>
              Cette politique peut être mise à jour pour refléter des
              changements techniques ou légaux. La date de dernière mise à
              jour est affichée en haut de page.
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
          <Link href="/mentions-legales" className="hover:text-gray-600">
            Mentions légales
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
