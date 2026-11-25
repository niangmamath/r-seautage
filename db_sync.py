# -*- coding: utf-8 -*-
"""Synchronisation des événements CONVENABLES vers Postgres/Neon.

Même pattern que sourcing-hackathons-maroc/db_sync.py :
- Upsert par URL
- Suppression des événements qui ne sont plus convenables (passés,
  retirés par l'organisateur) sauf `manuel = TRUE`
- Colonnes `masque` / `manuel` réservées à l'admin, jamais écrasées
"""
import datetime as dt
import hashlib
import os
import re
import unicodedata


TABLE_SQL = """
CREATE TABLE IF NOT EXISTS evenements (
    url TEXT PRIMARY KEY,
    titre TEXT NOT NULL,
    organisateur TEXT,
    ville TEXT,
    description TEXT,
    categorie TEXT,
    source TEXT,
    date_debut DATE,
    date_fin DATE,
    en_ligne BOOLEAN NOT NULL DEFAULT FALSE,
    fenetre TEXT,
    slug TEXT,
    premiere_detection TIMESTAMPTZ NOT NULL DEFAULT now(),
    derniere_verification TIMESTAMPTZ NOT NULL DEFAULT now()
)
"""

MIGRATIONS_SQL = [
    "CREATE UNIQUE INDEX IF NOT EXISTS evenements_slug_idx ON evenements (slug)",
    "ALTER TABLE evenements ADD COLUMN IF NOT EXISTS masque BOOLEAN NOT NULL DEFAULT FALSE",
    "ALTER TABLE evenements ADD COLUMN IF NOT EXISTS manuel BOOLEAN NOT NULL DEFAULT FALSE",
]

UPSERT_SQL = """
INSERT INTO evenements (
    url, titre, organisateur, ville, description, categorie, source,
    date_debut, date_fin, en_ligne, fenetre, slug,
    premiere_detection, derniere_verification
) VALUES (
    %(url)s, %(titre)s, %(organisateur)s, %(ville)s, %(description)s,
    %(categorie)s, %(source)s, %(date_debut)s, %(date_fin)s, %(en_ligne)s,
    %(fenetre)s, %(slug)s,
    %(premiere_detection)s, %(derniere_verification)s
)
ON CONFLICT (url) DO UPDATE SET
    titre = EXCLUDED.titre, organisateur = EXCLUDED.organisateur,
    ville = EXCLUDED.ville, description = EXCLUDED.description,
    categorie = EXCLUDED.categorie, source = EXCLUDED.source,
    date_debut = EXCLUDED.date_debut, date_fin = EXCLUDED.date_fin,
    en_ligne = EXCLUDED.en_ligne, fenetre = EXCLUDED.fenetre,
    derniere_verification = EXCLUDED.derniere_verification
    -- premiere_detection et slug volontairement absents du UPDATE :
    -- stables une fois posés.
"""


def _slug(url, titre):
    base = unicodedata.normalize("NFKD", titre or "")
    base = "".join(c for c in base if not unicodedata.combining(c))
    base = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()[:60]
    suffixe = hashlib.sha1((url or "").encode("utf-8")).hexdigest()[:8]
    return f"{base}-{suffixe}" if base else suffixe


def _iso_or_none(s):
    if not s:
        return None
    s = str(s).strip()[:10]
    try:
        dt.date.fromisoformat(s)
        return s
    except ValueError:
        return None


def _ts_or_now(s):
    if not s:
        return dt.datetime.now()
    try:
        return dt.datetime.fromisoformat(str(s))
    except ValueError:
        try:
            return dt.datetime.strptime(str(s)[:10], "%Y-%m-%d")
        except ValueError:
            return dt.datetime.now()


def _row(a):
    url = a.get("url") or ""
    titre = a.get("poste", "")
    return {
        "url": url,
        "titre": titre,
        "organisateur": a.get("entite", ""),
        "ville": a.get("ville", ""),
        "description": (a.get("texte") or "")[:2000],
        "categorie": a.get("categorie", "Autre événement pro"),
        "source": a.get("source", ""),
        "date_debut": _iso_or_none(a.get("date_debut")),
        "date_fin": _iso_or_none(a.get("date_fin")),
        "en_ligne": bool(a.get("en_ligne")),
        "fenetre": a.get("fenetre", "INCONNUE"),
        "slug": _slug(url, titre),
        "premiere_detection": _ts_or_now(a.get("premiere_detection")),
        "derniere_verification": _ts_or_now(a.get("derniere_verif")),
    }


def sync(items, database_url=None):
    database_url = database_url or os.environ.get("DATABASE_URL")
    if not database_url:
        print("  [db] DATABASE_URL non définie — synchro ignorée.")
        return

    try:
        import psycopg2
    except ImportError:
        print("  [db] psycopg2 non installé (pip install psycopg2-binary).")
        return

    convenables = [a for a in items
                   if a.get("verdict") == "CONVENABLE" and a.get("url")]
    urls_gardees = {a["url"] for a in convenables}

    try:
        conn = psycopg2.connect(database_url)
        try:
            with conn.cursor() as cur:
                cur.execute(TABLE_SQL)
                for migration in MIGRATIONS_SQL:
                    cur.execute(migration)
                for a in convenables:
                    cur.execute(UPSERT_SQL, _row(a))
                if urls_gardees:
                    cur.execute(
                        "DELETE FROM evenements "
                        "WHERE url != ALL(%s) AND manuel = FALSE",
                        (list(urls_gardees),))
                else:
                    cur.execute(
                        "DELETE FROM evenements WHERE manuel = FALSE")
                supprimes = cur.rowcount
            conn.commit()
        finally:
            conn.close()
    except Exception as e:
        print(f"  [db] ERREUR synchro : {e}")
        # Code de sortie non nul : le workflow passe en échec (et GitHub
        # envoie une alerte) au lieu d'afficher un succès trompeur.
        raise SystemExit(1) from e

    print(f"  [db] {len(convenables)} événement(s) synchronisé(s) "
          f"({supprimes} retiré(s)).")
