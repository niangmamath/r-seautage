import { getEvenementBySlug } from "@/lib/db";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "Événement networking au Maroc";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OgImage({ params }: { params: { slug: string } }) {
  const e = await getEvenementBySlug(params.slug);
  const titre = e?.titre?.slice(0, 120) ?? "Événement networking au Maroc";
  const surtitre = e?.categorie ?? "Networking Maroc";
  const pied = e?.en_ligne
    ? "En ligne — accessible au Maroc"
    : e?.ville
    ? `${e.ville}${e.date_debut ? ` — ${e.date_debut}` : ""}`
    : e?.date_debut || "Maroc";
  return renderOg({ surtitre, titre, pied });
}
