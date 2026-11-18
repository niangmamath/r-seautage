import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connection } from "next/server";
import CategorieLanding from "@/components/CategorieLanding";
import {
  getVillesAvecCompte,
  getEvenementsParVille,
} from "@/lib/categories";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

async function resoudre(slug: string) {
  const toutes = await getVillesAvecCompte();
  return toutes.find((v) => v.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const trouve = await resoudre(slug);
  if (!trouve) return { title: "Ville introuvable" };

  const nom = trouve.ville;
  const path = `/ville/${slug}`;
  return {
    title: `Networking à ${nom} — meetups, conférences, forums`,
    description: `${trouve.n} événement${trouve.n > 1 ? "s" : ""} professionnel${trouve.n > 1 ? "s" : ""} à ${nom} : meetups tech, conférences business, forums. Collecté automatiquement.`,
    keywords: [
      `networking ${nom}`,
      `meetup ${nom}`,
      `événement professionnel ${nom}`,
      `conférence ${nom}`,
      `forum ${nom}`,
    ],
    alternates: { canonical: path },
    openGraph: {
      title: `Networking à ${nom}`,
      description: `Tous les événements networking et professionnels à ${nom}.`,
      url: path,
    },
  };
}

export default async function VillePage({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const trouve = await resoudre(slug);
  if (!trouve) notFound();

  const evenements = await getEvenementsParVille(trouve.ville);
  const path = `/ville/${slug}`;

  return (
    <CategorieLanding
      h1={`Networking à ${trouve.ville}`}
      titre={trouve.ville}
      canonicalPath={path}
      breadcrumb={[
        { nom: "Accueil", url: "/" },
        { nom: trouve.ville, url: path },
      ]}
      intro={
        <p>
          Tous les événements networking et professionnels à{" "}
          <strong>{trouve.ville}</strong> : meetups tech, conférences, forums,
          soirées réseautage, workshops.
        </p>
      }
      evenements={evenements}
      contexteFAQ={{ type: "ville", nom: trouve.ville }}
    />
  );
}
