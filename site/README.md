# Site Networking Maroc

Next.js 16 (App Router) + Tailwind v4 + `pg` pour lire la base Neon
peuplée par le pipeline Python du dépôt parent.

## Dev local

```bash
npm install
cp .env.local.example .env.local   # renseigner DATABASE_URL (pooled Neon)
npm run dev                         # http://localhost:3000
```

## Déploiement Vercel

1. Importer le dépôt sur Vercel.
2. **Root Directory → `site`** (sinon Vercel tombe sur le script Python
   à la racine et retourne `PYTHON_ENTRYPOINT_NOT_FOUND`).
3. Variable **`DATABASE_URL`** — chaîne **pooled** Neon (contient
   `-pooler.`, port 6543, `?sslmode=require`).
4. Après le premier déploiement, poser aussi **`NEXT_PUBLIC_SITE_URL`**
   = ton alias Vercel final (`https://xxx.vercel.app`) pour verrouiller
   le canonical/sitemap sur la bonne URL. Ou créer `site/.env.production`
   et commiter la valeur.

## Architecture

- `lib/pg.ts` — pool pg partagé via globalThis
- `lib/db.ts` — requêtes SELECT (`getEvenements`, `getEvenementBySlug`,
  `getDerniereMaj`)
- `app/page.tsx` — liste serveur (revalidate 1h)
- `app/evenement/[slug]/page.tsx` — détail avec JSON-LD `schema.org/Event`
  + Breadcrumb
- `components/EvenementsExplorer.tsx` — filtres (fenêtre, catégorie,
  ville, format) + recherche + pagination "Voir plus"
- `app/sitemap.ts` + `app/robots.ts` + `app/opengraph-image.tsx` + icon.svg

Thème visuel : hero gradient **rose-600 → pink-600 → fuchsia-700** (vs
indigo pour hackathons, pour distinguer visuellement les deux sites).
