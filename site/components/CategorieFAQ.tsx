import type { Evenement } from "@/lib/db";

type Contexte =
  | { type: "categorie"; nom: string }
  | { type: "ville"; nom: string }
  | { type: "en-ligne" };

function faqsPourContexte(
  ctx: Contexte,
  evenements: Evenement[]
): { q: string; r: string }[] {
  const n = evenements.length;
  const nEnLigne = evenements.filter((e) => e.en_ligne).length;
  const topOrgs = [
    ...new Map(
      evenements
        .filter((e) => e.organisateur)
        .map((e) => [e.organisateur!, true])
    ).keys(),
  ].slice(0, 5);
  const topVilles = [
    ...new Map(
      evenements
        .filter((e) => e.ville && !e.en_ligne)
        .map((e) => [e.ville!, true])
    ).keys(),
  ].slice(0, 5);

  if (ctx.type === "categorie") {
    return [
      {
        q: `Combien d'événements ${ctx.nom} recensés au Maroc ?`,
        r: `Nous recensons actuellement ${n} événement${n > 1 ? "s" : ""} de type ${ctx.nom} au Maroc, dont ${nEnLigne} accessible${nEnLigne > 1 ? "s" : ""} en ligne. Le catalogue est mis à jour tous les 2 jours à partir de sources ouvertes (Eventbrite, Meetup).`,
      },
      {
        q: `Qui organise ces événements ${ctx.nom} ?`,
        r: topOrgs.length
          ? `Parmi les organisateurs actuels : ${topOrgs.join(", ")}. Chaque fiche renvoie vers la page d'inscription officielle de l'organisateur.`
          : `Les événements sont organisés par des collectifs, entreprises et associations marocaines ou internationales accessibles depuis le Maroc.`,
      },
      {
        q: `Comment m'inscrire à un événement ${ctx.nom} ?`,
        r: `Chaque fiche contient un lien direct vers la page officielle de l'organisateur (Eventbrite, Meetup ou site propre). L'inscription se fait directement là-bas — ce site est un catalogue, pas une billetterie.`,
      },
      {
        q: `Est-ce gratuit ?`,
        r: `Beaucoup d'événements networking et meetups au Maroc sont gratuits, mais ça dépend de l'organisateur. Vérifiez toujours les conditions sur la fiche officielle avant inscription.`,
      },
    ];
  }
  if (ctx.type === "ville") {
    return [
      {
        q: `Combien d'événements networking à ${ctx.nom} ?`,
        r: `${n} événement${n > 1 ? "s" : ""} professionnel${n > 1 ? "s" : ""} actuellement recensé${n > 1 ? "s" : ""} à ${ctx.nom} (meetups, conférences, forums, workshops).`,
      },
      {
        q: `Quels types d'événements à ${ctx.nom} ?`,
        r: `Meetups tech, conférences business, forums professionnels, soirées networking, workshops et ateliers de formation. Chaque fiche précise la catégorie et la date.`,
      },
      {
        q: `Comment trouver du networking tech à ${ctx.nom} ?`,
        r: `Filtrez la liste par catégorie (Networking, Workshop / Formation, Conférence / Summit) ou utilisez la recherche sur la page d'accueil pour cibler un domaine précis.`,
      },
    ];
  }
  return [
    {
      q: `Combien d'événements networking en ligne accessibles au Maroc ?`,
      r: `${n} événement${n > 1 ? "s" : ""} en ligne actuellement, ouverts aux professionnels marocains : webinaires, visio-conférences, meetups virtuels.`,
    },
    {
      q: `Faut-il payer pour participer en ligne ?`,
      r: `La majorité des webinaires et meetups virtuels sont gratuits sur inscription. Vérifiez chaque fiche officielle avant de vous inscrire.`,
    },
    {
      q: `Comment rejoindre un événement en ligne ?`,
      r: `Chaque fiche renvoie vers la page d'inscription de l'organisateur (Eventbrite, Meetup, Zoom, Teams). Le lien de connexion est généralement envoyé par email après inscription.`,
    },
    topVilles.length
      ? {
          q: `Et en présentiel ?`,
          r: `Des événements présentiels sont aussi recensés à ${topVilles.join(", ")}. Filtrez par format "Présentiel" sur la page d'accueil pour les voir.`,
        }
      : {
          q: `Et en présentiel ?`,
          r: `Des événements présentiels sont aussi recensés dans les grandes villes (Casablanca, Rabat, Marrakech...). Filtrez par format "Présentiel" pour les voir.`,
        },
  ];
}

export default function CategorieFAQ({
  contexte,
  evenements,
}: {
  contexte: Contexte;
  evenements: Evenement[];
}) {
  const faqs = faqsPourContexte(contexte, evenements);
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.r },
    })),
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      />
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
        Questions fréquentes
      </h2>
      <dl className="mt-6 space-y-5">
        {faqs.map((f) => (
          <div
            key={f.q}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <dt className="text-sm font-semibold text-gray-900">{f.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-gray-600">
              {f.r}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
