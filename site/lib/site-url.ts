// Adresse publique du site (sitemap, canonical, OpenGraph). Verrouillée
// sur l'alias custom Vercel via .env.production — cf. incident sur le
// site hackathons où VERCEL_PROJECT_PRODUCTION_URL remontait le nom
// technique du projet (ex. site-alpha-gold), pas l'alias.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
