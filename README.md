# Veille des événements networking — Maroc

Pipeline Python + site Next.js pour lister les **événements professionnels
au Maroc** (meetups, conférences, forums, salons, soirées réseautage,
workshops), afin d'aider à **développer son réseau**. Événements au
Maroc OU en ligne accessibles depuis le Maroc.

**Projet frère de `sourcing-hackathons-maroc`** — même architecture
(collecteurs best-effort + classifieur pur + synchro Postgres/Neon +
site Next.js), scope différent : networking général, pas hackathons
(ceux-ci ont leur propre site).

## Installation

```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
cp .env.example .env         # puis renseigner DATABASE_URL (Neon)
```

## Usage

```bash
python networking_maroc.py            # collecte réseau + upsert Postgres
python networking_maroc.py reclass    # re-classe depuis le cache, hors ligne
```

## Sources (v1)

| Source | Accès | Portée |
|---|---|---|
| **Eventbrite** | HTML `/d/<pays>--<ville>/events/` + `/d/morocco/business-events/` (JSON-LD `Event` embarqué) | événements professionnels publiés sur Eventbrite par Casablanca, Rabat, Marrakech, Tanger + catégories business/tech |
| **Meetup** | HTML `/find/?location=ma--<ville>` (JSON-LD `[Event]` embarqué) | meetups récurrents, 6 villes marocaines |

robots.txt vérifié le 2026-11-15 pour les deux sources. Pour ajouter une
source : écrire une fonction `collect_xxx()` dans `sources.py` qui renvoie
une liste de dicts aux mêmes clés, puis l'ajouter au registre
`COLLECTORS`.

## Comment un événement devient « convenable »

Logique dans `classifier.py` (pur, testé). Un événement est **CONVENABLE**
si les trois conditions sont vraies :

1. **C'est un événement professionnel** — mot-clé networking / conférence /
   forum / meetup / workshop / startup détecté dans le titre ou la
   description. Les événements **source Meetup** sont acceptés par
   défaut (plateforme 100 % orientée networking). **Rejet** : hackathons
   (voir site dédié `veille-hackathon.vercel.app`), concerts, yoga,
   cuisine, événements religieux, fêtes privées.
2. **C'est accessible depuis le Maroc** — au Maroc, OU en ligne.
3. **L'événement n'est pas passé** — fin ≥ aujourd'hui.

### Catégories (tag informatif, jamais excluant)

- Networking
- Conférence / Summit
- Forum / Salon
- Workshop / Formation
- Startup / Pitch
- Autre événement pro

### Fenêtre de fraîcheur

Même logique que le site hackathons :

| Fenêtre | Règle |
|---|---|
| EN COURS | `début ≤ aujourd'hui ≤ fin` |
| IMMINENT | `début ≤ aujourd'hui + 7 j` |
| BIENTÔT | `début ≤ aujourd'hui + 30 j` |
| ANNONCÉ | `début > aujourd'hui + 30 j` |
| INCONNUE | pas de date utilisable |
| PASSÉ | `fin < aujourd'hui` → écarté |

## Sortie — table Postgres `evenements`

Schéma créé automatiquement au premier run (`db_sync.TABLE_SQL`). Colonnes
clés : `url` (PK), `titre`, `organisateur`, `ville`, `categorie`, `source`,
`date_debut`, `date_fin`, `en_ligne`, `fenetre`, `slug`, timestamps,
`masque` / `manuel` (admin-only).

À chaque run, les événements convenables sont upsertés ; ceux qui ne
sont plus convenables sont supprimés, sauf `manuel = TRUE`.

## Automatisation cloud (GitHub Actions)

[`.github/workflows/scrape_networking.yml`](.github/workflows/scrape_networking.yml)
— cron tous les jours à 05:37 UTC + déclenchement manuel. Secret
requis : `DATABASE_URL`.

## Tests

```bash
python -m unittest test_classifier
```

25 tests couvrent détection (hackathons rejetés, catégories, garde-fous
hors scope), géo, fenêtres, verdicts, déduplication, tri.

## Site web (`site/`)

Next.js 16 + Tailwind v4, lit la base Neon en direct. Même pattern que
`sourcing-hackathons-maroc/site/` — hero rose/pink/fuchsia (vs indigo
hackathons), filtres sticky, cartes avec bande accent et ruban "En cours".
