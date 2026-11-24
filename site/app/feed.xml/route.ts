import { getEvenements } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 1800;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const items = (await getEvenements()) ?? [];
  const now = new Date().toUTCString();

  const entries = items
    .slice(0, 50)
    .map((e) => {
      const url = `${siteUrl}/evenement/${e.slug}`;
      const pub = new Date(
        e.premiere_detection || new Date().toISOString()
      ).toUTCString();
      const loc = e.en_ligne ? "En ligne" : e.ville || "Maroc";
      const dates = e.date_debut ? ` (${e.date_debut})` : "";
      const desc =
        (e.description || "").slice(0, 500) ||
        `${e.titre} — ${loc}${dates} — organisé par ${e.organisateur ?? "un collectif"}.`;
      return `
    <item>
      <title>${xmlEscape(e.titre)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <pubDate>${pub}</pubDate>
      <category>${xmlEscape(e.categorie || "Networking")}</category>
      <description>${cdata(desc)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Networking au Maroc — nouveaux événements</title>
    <link>${siteUrl}/</link>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Meetups, conférences, forums professionnels au Maroc. Mis à jour chaque jour.</description>
    <language>fr-MA</language>
    <lastBuildDate>${now}</lastBuildDate>${entries}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
