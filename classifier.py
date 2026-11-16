# -*- coding: utf-8 -*-
"""Classification des événements de networking / professionnels au Maroc.

Projet frère de sourcing-hackathons-maroc (même architecture : détecteurs
purs, composés par verdict_of, dédup inter-sources). Différences :

1. On NE veut PAS de hackathons ici (ils ont leur propre site). On les
   détecte et on les rejette comme "hors scope".
2. On accepte une catégorie plus large : meetups tech, conférences,
   forums, salons professionnels, cafés business, soirées réseautage.
3. Mais on exclut tout de même ce qui n'est pas professionnel :
   concerts, soirées privées, événements religieux, sport, culture
   pure, événements payants de formation (bootcamps vendus comme des
   produits), fêtes.

La fraîcheur est calculée sur la date d'événement (début/fin), pas la
date d'annonce — comme pour les hackathons.
"""
import datetime as dt
import re
import unicodedata


# --------------------------------------------------------------- TEXTE UTILS
def strip_accents(s):
    s = unicodedata.normalize("NFKD", s or "")
    return "".join(c for c in s if not unicodedata.combining(c))


def _strip_invisibles(s):
    return "".join(c for c in (s or "")
                   if unicodedata.category(c) not in ("Cf", "Cc") or c in "\n\t")


def _pad(s):
    return " " + (s or "").lower() + " "


def has_any(text, kws):
    t = _pad(text)
    return any(k in t for k in kws)


def normalize_title(title):
    t = strip_accents(title).lower()
    t = re.sub(r"\(.*?\)", " ", t)
    t = re.sub(r"\b(20\d{2}|edition|meetup|event|events|session)\b", " ", t)
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def dedup_annonces(annonces):
    """Dédoublonnage inter-sources par (organisateur normalisé + titre)."""
    seen, out = set(), []
    for a in annonces:
        key = (strip_accents(a.get("entite", "")).lower().strip(),
               normalize_title(a.get("poste", "")))
        if key in seen:
            continue
        seen.add(key)
        out.append(a)
    return out


# ---------------------------------------------------------- DETECTION TYPE
# Mots-clés qui signalent qu'un événement est un hackathon -> rejet (hors
# scope de CE site, cf. sourcing-hackathons-maroc).
HACKATHON_KW = [
    "hackathon", "hack-a-thon", "hack a thon", "datathon", "ideathon",
    "makeathon", "designathon", "gamejam", "game jam", "codejam",
    "code jam", "ctf", "capture the flag",
]

# Mots-clés qui signalent un événement de networking / professionnel
# légitime. Positif, large volontairement.
NETWORKING_KW = [
    "networking", "reseautage", "réseautage", "meetup", "conference",
    "conférence", "summit", "forum", "salon", "cafe business",
    "café business", "cafes business", "cafés business",
    "business event", "startup weekend", "entrepreneurs",
    "entrepreneuriat", "entrepreneurship", "workshop", "masterclass",
    "talk", "panel", "table ronde", "tech talk", "developer meetup",
    "demo day", "pitch", "expo", "exhibition", "trade show",
    "convention", "gathering", "soiree", "soirée", "rencontre",
    "club", "community", "communaute", "communauté", "mentoring",
    "fireside chat", "roundtable",
]

# Garde-fous : événements clairement hors scope professionnel.
HORS_SCOPE_KW = [
    "concert", "festival de musique", "music festival",
    "mariage", "wedding", "anniversaire private",
    "soiree privee", "soirée privée", "prayer", "priere", "prière",
    "yoga", "pilates", "zumba", "fitness",
    "bootcamp certifiant", "certifying bootcamp", "formation payante",
    "paid course", "diplome", "diplôme",
    "concert live", "dj set", "nightclub", "boite de nuit", "boîte de nuit",
    "degustation", "dégustation", "wine tasting", "cuisine class",
    "cours de cuisine", "atelier pate", "pâte", "modelage",
]


def detect_evenement(poste, texte, source=None):
    """(est_evenement: bool, categorie: str, motif: str).

    Categorie parmi :
      - "Networking" (soirée réseau, meetup général, café business)
      - "Conférence / Summit" (grands formats, keynote)
      - "Forum / Salon" (recrutement, carrière, expo métier)
      - "Workshop / Formation" (atelier court, masterclass)
      - "Startup / Pitch" (demo day, pitch competition, startup weekend)
      - "Autre événement pro" (match trop faible mais source fiable)

    Rejet :
      - Hackathon détecté -> hors scope (autre site)
      - Signal hors scope fort (concert, yoga, religieux, cuisine)
    """
    poste_n = _strip_invisibles(poste).lower()
    texte_n = _strip_invisibles(texte or "").lower()
    blob = f" {poste_n} . {texte_n} "

    # 1. Rejet hackathons -> redirection implicite vers l'autre site
    if any(k in blob for k in HACKATHON_KW):
        return False, "", "hackathon - voir site dedie"

    # 2. Rejet hors scope non pro
    if any(k in blob for k in HORS_SCOPE_KW):
        return False, "", "hors scope professionnel"

    # 3. Détection positive par mot-clé
    title_signal = any(k in _pad(poste_n) for k in NETWORKING_KW)
    body_signal = any(k in blob for k in NETWORKING_KW)

    if title_signal or body_signal:
        cat = _categorie(poste_n, texte_n)
        return True, cat, ""

    # 4. Sources fiables pour un événement pro par construction
    # (Meetup est 100 % orienté groupes d'intérêt, souvent networking).
    if source == "Meetup":
        return True, _categorie(poste_n, texte_n) or "Networking", ""

    return False, "", "signal professionnel insuffisant"


def _categorie(poste_n, texte_n):
    blob = f" {poste_n} . {texte_n} "
    if any(k in blob for k in ["summit", "conference", "conférence",
                                "congress", "congres", "congrès"]):
        return "Conférence / Summit"
    if any(k in blob for k in ["forum", "salon", "expo", "exhibition",
                                "trade show", "convention"]):
        return "Forum / Salon"
    if any(k in blob for k in ["startup weekend", "demo day",
                                "pitch competition", "pitch day"]):
        return "Startup / Pitch"
    if any(k in blob for k in ["workshop", "masterclass", "atelier",
                                "training session"]):
        return "Workshop / Formation"
    if any(k in blob for k in ["networking", "reseautage", "réseautage",
                                "meetup", "cafe business", "café business",
                                "soiree", "soirée", "rencontre",
                                "club", "community"]):
        return "Networking"
    return "Autre événement pro"


# ------------------------------------------------------------- GEO + MODE
GEO_HORS_MAROC_KW = [
    "paris", "lyon", "marseille", "toulouse", "bordeaux", "nantes",
    "lille", "strasbourg", "nice", "france",
    "dubai", "abu dhabi", "doha", "riyadh", "riyad",
    "london", "londres", "madrid", "barcelona", "barcelone",
    "berlin", "munich", "amsterdam", "bruxelles", "brussels",
    "new york", "san francisco", "boston", "toronto", "montreal", "montréal",
    "abidjan", "dakar", "tunis", "tunisie", "alger", "algérie", "algerie",
    "sénégal", "senegal", "côte d'ivoire", "cote d'ivoire",
]

ONLINE_KW = [
    "online", "en ligne", "virtual", "virtuel", "remote",
    "à distance", "a distance", "webinar", "webinaire",
    "zoom", "google meet",
]


def is_online(poste, ville, texte=""):
    blob = strip_accents(f"{poste} {ville} {texte}").lower()
    return any(strip_accents(k) in blob for k in ONLINE_KW)


def hors_maroc(poste, ville, texte="", country=None):
    """Vrai si l'événement est présentiel hors Maroc.

    `country` est le code pays officiel extrait du JSON-LD par le
    collecteur (cf. sources._event_to_annonce). Quand il vaut 'MA',
    on fait confiance à la source et on ne cherche plus de signal
    contradictoire ; quand il vaut une autre valeur, l'événement
    aurait déjà été rejeté au collecteur ; quand il est vide, on
    retombe sur la détection par mots-clés dans le texte (moins
    fiable, mais mieux que rien)."""
    if is_online(poste, ville, texte):
        return False
    if country == "MA":
        return False
    blob = strip_accents(f"{poste} {ville}").lower()
    if "maroc" in blob or "morocco" in blob:
        return False
    return any(strip_accents(k) in blob for k in GEO_HORS_MAROC_KW)


VILLES_CONNUES = [
    ("Casablanca", ["casablanca"]),
    ("Rabat", ["rabat"]),
    ("Marrakech", ["marrakech", "marrakesh"]),
    ("Tanger", ["tanger", "tangier"]),
    ("Fès", ["fes", "fès"]),
    ("Agadir", ["agadir"]),
    ("Meknès", ["meknes", "meknès"]),
    ("Oujda", ["oujda"]),
    ("Kénitra", ["kenitra", "kénitra"]),
    ("Tétouan", ["tetouan", "tétouan"]),
    ("Benguerir", ["benguerir", "ben guerir"]),
    ("El Jadida", ["el jadida"]),
    ("Ifrane", ["ifrane"]),
    ("Dakhla", ["dakhla"]),
    ("Laâyoune", ["laayoune", "laâyoune"]),
]


def normalize_ville(ville, poste="", texte="", country=None):
    """Nom de ville canonique. "Maroc (non précisé)" ne s'applique QUE
    quand la source a explicitement confirmé le pays MA ; sans ça, on
    ne peut pas affirmer le pays et on remonte "Lieu non confirmé" pour
    ne pas mentir à l'utilisateur."""
    if is_online(poste, ville, texte):
        return "En ligne"
    if not ville or not ville.strip():
        return "Maroc (non précisé)" if country == "MA" else "Lieu non confirmé"
    v_full = strip_accents(ville).lower()
    premier = ville.split(",")[0].strip()
    premier_l = strip_accents(premier).lower()
    for canon, variantes in VILLES_CONNUES:
        if any(v in premier_l for v in variantes):
            return canon
    for canon, variantes in VILLES_CONNUES:
        if any(v in v_full for v in variantes):
            return canon
    if "maroc" in v_full or "morocco" in v_full:
        return "Maroc (non précisé)"
    return premier or "Maroc (non précisé)"


# -------------------------------------------------------------------- DATES
def _parse_iso(s):
    try:
        return dt.date.fromisoformat((s or "")[:10])
    except (ValueError, TypeError):
        return None


def fenetre_from_event(date_debut_iso, date_fin_iso, today):
    """Fraîcheur sur la date d'événement. Renvoie :
      - PASSÉ : fin révolue -> écarté
      - EN COURS : aujourd'hui dans [début, fin]
      - IMMINENT : début ≤ aujourd'hui + 7 j
      - BIENTÔT : début ≤ aujourd'hui + 30 j
      - ANNONCÉ : début > aujourd'hui + 30 j
      - INCONNUE : pas de date utilisable
    """
    td = dt.date.fromisoformat(today) if isinstance(today, str) else today
    d = _parse_iso(date_debut_iso)
    f = _parse_iso(date_fin_iso) or d
    if d is None and f is None:
        return "INCONNUE"
    debut = d or f
    fin = f or d
    if fin < td:
        return "PASSÉ"
    if debut <= td <= fin:
        return "EN COURS"
    delta = (debut - td).days
    if delta <= 7:
        return "IMMINENT"
    if delta <= 30:
        return "BIENTÔT"
    return "ANNONCÉ"


# ------------------------------------------------------------------ VERDICT
def verdict_of(a):
    if not a.get("est_evenement"):
        return "ÉCARTÉE", a.get("motif_evenement") or "pas un événement pro"
    if a.get("hors_maroc_flag"):
        return "ÉCARTÉE", "hors Maroc et pas en ligne"
    if a.get("fenetre") == "PASSÉ":
        return "ÉCARTÉE", "événement passé"
    # Lieu non confirmé + pas en ligne : on ne peut pas garantir le
    # Maroc -> on écarte plutôt que d'induire l'utilisateur en erreur.
    if a.get("ville") == "Lieu non confirmé" and not a.get("en_ligne"):
        return "ÉCARTÉE", "localisation non confirmée"
    return "CONVENABLE", ""


def classifier(annonce, today=None):
    today = today or dt.date.today().isoformat()
    poste = _strip_invisibles(annonce.get("poste", ""))
    texte = _strip_invisibles(annonce.get("texte", "") or "")
    entite = _strip_invisibles(annonce.get("entite", ""))
    ville = annonce.get("ville", "") or annonce.get("lieu", "")
    source = annonce.get("source")

    est, cat, motif = detect_evenement(poste, texte, source)
    online = is_online(poste, ville, texte)
    country = annonce.get("country")
    hm = hors_maroc(poste, ville, texte, country=country)
    fen = fenetre_from_event(annonce.get("date_debut"),
                              annonce.get("date_fin"), today)

    out = dict(annonce)
    out.update({
        "poste": poste, "texte": texte, "entite": entite,
        "est_evenement": est, "categorie": cat,
        "motif_evenement": motif,
        "en_ligne": online, "hors_maroc_flag": hm,
        "fenetre": fen,
        "ville": normalize_ville(ville, poste, texte, country=country),
    })
    verdict, motif_v = verdict_of(out)
    out["verdict"] = verdict
    out["motif"] = motif_v
    return out


_ORDRE_FENETRE = {
    "EN COURS": 0, "IMMINENT": 1, "BIENTÔT": 2,
    "ANNONCÉ": 3, "INCONNUE": 4, "PASSÉ": 5,
}


def classify_all(annonces, today=None):
    today = today or dt.date.today().isoformat()
    items = [classifier(a, today) for a in dedup_annonces(annonces)]
    items.sort(key=lambda a: (
        0 if a["verdict"] == "CONVENABLE" else 1,
        _ORDRE_FENETRE.get(a.get("fenetre", ""), 9),
        a.get("date_debut") or "9999-99-99",
    ))
    return items
