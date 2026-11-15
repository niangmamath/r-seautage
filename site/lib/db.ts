import { getPool } from "./pg";

export type Evenement = {
  url: string;
  slug: string;
  titre: string;
  organisateur: string | null;
  ville: string | null;
  description: string | null;
  categorie: string | null;
  source: string | null;
  date_debut: string | null;
  date_fin: string | null;
  en_ligne: boolean;
  fenetre: string;
  premiere_detection: string;
  derniere_verification: string;
};

const SELECT = `
  SELECT url, slug, titre, organisateur, ville, description, categorie,
         source, to_char(date_debut, 'YYYY-MM-DD') AS date_debut,
         to_char(date_fin, 'YYYY-MM-DD') AS date_fin,
         en_ligne, fenetre, premiere_detection, derniere_verification
  FROM evenements
  WHERE masque = FALSE
`;

/** null = DATABASE_URL absente ; distinct d'une liste vide. */
export async function getEvenements(): Promise<Evenement[] | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Evenement>(
    `${SELECT}
     ORDER BY
       CASE fenetre
         WHEN 'EN COURS' THEN 0
         WHEN 'IMMINENT' THEN 1
         WHEN 'BIENTÔT' THEN 2
         WHEN 'ANNONCÉ' THEN 3
         WHEN 'INCONNUE' THEN 4
         ELSE 9
       END,
       date_debut ASC NULLS LAST,
       premiere_detection DESC`
  );
  return rows;
}

export async function getEvenementBySlug(
  slug: string
): Promise<Evenement | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Evenement>(
    `${SELECT} AND slug = $1 LIMIT 1`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function getDerniereMaj(): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<{ max: string | null }>(
    "SELECT MAX(derniere_verification) AS max FROM evenements"
  );
  return rows[0]?.max ?? null;
}
