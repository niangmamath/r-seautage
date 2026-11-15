import type { MetadataRoute } from "next";
import { getEvenements } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = (await getEvenements()) ?? [];
  const now = new Date();
  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...items.map((e) => ({
      url: `${siteUrl}/evenement/${e.slug}`,
      lastModified: new Date(e.derniere_verification),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
