import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connection } from "next/server";
import CategorieLanding from "@/components/CategorieLanding";
import {
  getCategoriesAvecCompte,
  getEvenementsParCategorie,
} from "@/lib/categories";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

async function resoudre(slug: string) {
  const toutes = await getCategoriesAvecCompte();
  return toutes.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const trouve = await resoudre(slug);
  if (!trouve) return { title: "Catégorie introuvable" };

  const nom = trouve.categorie;
  const path = `/categorie/${slug}`;
  return {
    title: `${nom} au Maroc — événements à venir`,
    description: `${trouve.n} événement${trouve.n > 1 ? "s" : ""} de type ${nom} au Maroc : dates, organisateurs, inscription. Mis à jour tous les 2 jours.`,
    keywords: [
      `${nom} Maroc`,
      `${nom} Casablanca`,
      `${nom} Rabat`,
      `événement ${nom}`,
      `networking ${nom}`,
    ],
    alternates: { canonical: path },
    openGraph: {
      title: `${nom} au Maroc`,
      description: `Tous les événements ${nom} au Maroc.`,
      url: path,
    },
  };
}

export default async function CategoriePage({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const trouve = await resoudre(slug);
  if (!trouve) notFound();

  const evenements = await getEvenementsParCategorie(trouve.categorie);
  const path = `/categorie/${slug}`;

  return (
    <CategorieLanding
      h1={`${trouve.categorie} au Maroc`}
      titre={trouve.categorie}
      canonicalPath={path}
      breadcrumb={[
        { nom: "Accueil", url: "/" },
        { nom: trouve.categorie, url: path },
      ]}
      intro={
        <p>
          Tous les événements <strong>{trouve.categorie}</strong> au Maroc :
          meetups, conférences, forums professionnels. Nouveaux événements
          détectés automatiquement tous les 2 jours.
        </p>
      }
      evenements={evenements}
      contexteFAQ={{ type: "categorie", nom: trouve.categorie }}
    />
  );
}
