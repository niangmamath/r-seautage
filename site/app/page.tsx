import { getEvenements, getDerniereMaj, type Evenement } from "@/lib/db";
import EvenementsExplorer from "@/components/EvenementsExplorer";
import { HandshakeIcon } from "@/components/icons";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

function ItemListJsonLd({ items }: { items: Evenement[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.slice(0, 50).map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/evenement/${e.slug}`,
      name: e.titre,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default async function HomePage() {
  const [items, maj] = await Promise.all([getEvenements(), getDerniereMaj()]);

  if (items === null) {
    return (
      <div className="flex min-h-full flex-col">
        <header className="bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 px-4 py-8 sm:px-6">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white sm:text-3xl">
            <HandshakeIcon className="h-6 w-6 shrink-0" />
            Networking au Maroc
          </h1>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Base de données non configurée (variable{" "}
            <code>DATABASE_URL</code> absente). Renseignez-la dans les
            variables d&apos;environnement Vercel puis redéployez.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {items.length > 0 ? <ItemListJsonLd items={items} /> : null}
      <EvenementsExplorer items={items} derniereMaj={maj} />
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-gray-400 sm:px-6 space-y-2">
          <p>
            Événements collectés automatiquement (Eventbrite, Meetup) —
            vérifiez toujours les conditions d&apos;inscription auprès de
            l&apos;organisateur.
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
