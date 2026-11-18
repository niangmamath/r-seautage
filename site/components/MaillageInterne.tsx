import Link from "next/link";
import {
  getCategoriesAvecCompte,
  getVillesAvecCompte,
} from "@/lib/categories";

export default async function MaillageInterne() {
  const [categories, villes] = await Promise.all([
    getCategoriesAvecCompte(),
    getVillesAvecCompte(),
  ]);
  if (categories.length === 0 && villes.length === 0) return null;

  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-lg font-bold text-gray-900">
          Explorer par thème ou ville
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/en-ligne"
            className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
          >
            En ligne
          </Link>
          <Link
            href="/nouveautes"
            className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
          >
            Nouveautés 7j
          </Link>
          <Link
            href="/feed.xml"
            className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
          >
            RSS
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Par catégorie
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categorie/${c.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100"
                  >
                    {c.categorie}
                    <span className="text-[10px] font-semibold text-indigo-500">
                      {c.n}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {villes.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Par ville
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {villes.map((v) => (
                <li key={v.slug}>
                  <Link
                    href={`/ville/${v.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100"
                  >
                    {v.ville}
                    <span className="text-[10px] font-semibold text-sky-500">
                      {v.n}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
