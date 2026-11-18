import { cache } from "react";
import { getPool } from "./pg";
import { slugifyLibre } from "./slug";
import type { Evenement } from "./db";

const SELECT = `
  SELECT url, slug, titre, organisateur, ville, description, categorie,
         source, to_char(date_debut, 'YYYY-MM-DD') AS date_debut,
         to_char(date_fin, 'YYYY-MM-DD') AS date_fin,
         en_ligne, fenetre, premiere_detection, derniere_verification
  FROM evenements
  WHERE masque = FALSE
`;

const ORDER = `
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
    premiere_detection DESC
`;

export type Categorie = { categorie: string; slug: string; n: number };
export type Ville = { ville: string; slug: string; n: number };

export const getCategoriesAvecCompte = cache(
  async (): Promise<Categorie[]> => {
    const pool = getPool();
    if (!pool) return [];
    const { rows } = await pool.query<{ categorie: string; n: string }>(
      `SELECT categorie, COUNT(*)::text AS n
       FROM evenements
       WHERE masque = FALSE AND categorie IS NOT NULL AND categorie <> ''
       GROUP BY categorie
       ORDER BY COUNT(*) DESC, categorie ASC`
    );
    return rows.map((r) => ({
      categorie: r.categorie,
      slug: slugifyLibre(r.categorie),
      n: parseInt(r.n, 10),
    }));
  }
);

export const getVillesAvecCompte = cache(async (): Promise<Ville[]> => {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<{ ville: string; n: string }>(
    `SELECT ville, COUNT(*)::text AS n
     FROM evenements
     WHERE masque = FALSE AND ville IS NOT NULL AND ville <> ''
       AND en_ligne = FALSE
     GROUP BY ville
     ORDER BY COUNT(*) DESC, ville ASC`
  );
  return rows.map((r) => ({
    ville: r.ville,
    slug: slugifyLibre(r.ville),
    n: parseInt(r.n, 10),
  }));
});

export async function getEvenementsParCategorie(
  categorie: string
): Promise<Evenement[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<Evenement>(
    `${SELECT} AND categorie = $1 ${ORDER}`,
    [categorie]
  );
  return rows;
}

export async function getEvenementsParVille(
  ville: string
): Promise<Evenement[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<Evenement>(
    `${SELECT} AND ville = $1 ${ORDER}`,
    [ville]
  );
  return rows;
}

export async function getEvenementsEnLigne(): Promise<Evenement[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<Evenement>(
    `${SELECT} AND en_ligne = TRUE ${ORDER}`
  );
  return rows;
}

export async function getEvenementsNouveautes(
  jours = 7
): Promise<Evenement[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<Evenement>(
    `${SELECT} AND premiere_detection >= NOW() - INTERVAL '${jours} days' ${ORDER}`
  );
  return rows;
}
