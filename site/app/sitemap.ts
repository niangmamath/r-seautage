import type { MetadataRoute } from "next";
import { getEvenements } from "@/lib/db";
import {
  getCategoriesAvecCompte,
  getVillesAvecCompte,
} from "@/lib/categories";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [items, categories, villes] = await Promise.all([
    getEvenements().then((r) => r ?? []),
    getCategoriesAvecCompte(),
    getVillesAvecCompte(),
  ]);
  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/en-ligne`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/nouveautes`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/feed.xml`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/mentions-legales`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/politique-confidentialite`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...categories.map((c) => ({
      url: `${siteUrl}/categorie/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...villes.map((v) => ({
      url: `${siteUrl}/ville/${v.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...items.map((e) => ({
      url: `${siteUrl}/evenement/${e.slug}`,
      lastModified: new Date(e.derniere_verification),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
