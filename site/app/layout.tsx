import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { siteUrl } from "@/lib/site-url";

const title = "Networking au Maroc — meetups, conférences, forums";
const description =
  "Catalogue à jour des événements networking au Maroc : meetups tech, conférences, forums professionnels, salons, soirées réseautage. Collecte automatique sur Eventbrite et Meetup, mise à jour tous les 2 jours.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s · Networking Maroc" },
  description,
  applicationName: "Networking Maroc",
  keywords: [
    "networking Maroc",
    "meetup Casablanca",
    "meetup Rabat",
    "forum professionnel Maroc",
    "conférence Maroc",
    "salon professionnel Casablanca",
    "soirée réseautage Maroc",
    "entrepreneurs Maroc",
    "événement tech Maroc",
    "startup Maroc",
    "business event Morocco",
  ],
  authors: [{ name: "Networking Maroc" }],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Networking Maroc",
    locale: "fr_MA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "/" },
  formatDetection: { email: false, address: false, telephone: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
