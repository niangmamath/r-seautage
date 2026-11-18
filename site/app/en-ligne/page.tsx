import type { Metadata } from "next";
import { connection } from "next/server";
import CategorieLanding from "@/components/CategorieLanding";
import { getEvenementsEnLigne } from "@/lib/categories";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Networking en ligne — événements accessibles au Maroc",
  description:
    "Webinaires, meetups virtuels et conférences en ligne accessibles depuis le Maroc : business, tech, startup. Inscription gratuite pour la plupart.",
  keywords: [
    "webinaire Maroc",
    "meetup en ligne Maroc",
    "conférence en ligne Maroc",
    "networking virtuel Maroc",
    "événement virtuel Maroc",
  ],
  alternates: { canonical: "/en-ligne" },
  openGraph: {
    title: "Networking en ligne — depuis le Maroc",
    description: "Événements professionnels en ligne accessibles au Maroc.",
    url: "/en-ligne",
  },
};

export default async function EnLignePage() {
  await connection();
  const evenements = await getEvenementsEnLigne();

  return (
    <CategorieLanding
      h1="Networking en ligne accessible au Maroc"
      titre="En ligne"
      canonicalPath="/en-ligne"
      breadcrumb={[
        { nom: "Accueil", url: "/" },
        { nom: "En ligne", url: "/en-ligne" },
      ]}
      intro={
        <p>
          Webinaires, meetups virtuels et conférences en ligne accessibles
          depuis le Maroc. Inscription directe sur la page de l&apos;organisateur
          — la plupart sont gratuits.
        </p>
      }
      evenements={evenements}
      contexteFAQ={{ type: "en-ligne" }}
    />
  );
}
