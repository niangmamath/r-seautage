# -*- coding: utf-8 -*-
"""Collecteurs d'événements networking / professionnels au Maroc.

Chaque collecteur renvoie des dicts avec les mêmes clés :
    poste, entite, ville, url, date_debut, date_fin, texte, source

robots.txt vérifié le 2026-11-15 :
- Eventbrite : User-agent: * avec exclusions ciblées (/api/v3/destination/
  events/, /checkout-external*...), mais /d/<pays>/events/ libre.
- Meetup : User-agent: * avec exclusions sur /join, /chapter, /unsubscribe,
  mais /find/ libre.

Best-effort : échec silencieux (liste vide), jamais d'exception propagée.
"""
import datetime as dt
import json
import random
import re
import time
import traceback

import requests
from bs4 import BeautifulSoup


USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.4 Safari/605.1.15",
]
REQUEST_DELAY_SECONDS = 2.0
TIMEOUT = 25


def _get(url):
    headers = {"User-Agent": random.choice(USER_AGENTS),
               "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"}
    try:
        r = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        print(f"    ! réseau {url}: {e}")
        return None
    if r.status_code != 200:
        print(f"    ! HTTP {r.status_code} sur {url}")
        return None
    return r


def _extract_jsonld(html):
    out = []
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all("script", {"type": "application/ld+json"}):
        raw = tag.string or tag.get_text() or ""
        if not raw.strip():
            continue
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if isinstance(data, list):
            out.extend(data)
        else:
            out.append(data)
    return out


def _flatten_events(objs):
    """Transforme la soupe de JSON-LD (ItemList, Event, [Event, ...]) en
    une liste plate d'Event objects."""
    out = []
    for obj in objs:
        if isinstance(obj, list):
            for x in obj:
                if isinstance(x, dict) and x.get("@type") == "Event":
                    out.append(x)
        elif isinstance(obj, dict):
            if obj.get("@type") == "Event":
                out.append(obj)
            elif obj.get("@type") in ("ItemList", "ItemListElement"):
                for it in obj.get("itemListElement") or []:
                    ev = it.get("item") if isinstance(it, dict) and "item" in it else it
                    if isinstance(ev, dict) and ev.get("@type") == "Event":
                        out.append(ev)
    return out


def _event_to_annonce(ev, source):
    """Convertit un Event schema.org en annonce interne. Renvoie None
    si l'événement est manifestement hors Maroc (addressCountry != MA
    pour TOUS ses lieux, et pas d'indicateur "en ligne").

    Incident constaté 2026-11-16 : Meetup `/find/?location=ma--<ville>`
    élargit silencieusement aux pays voisins / internationaux quand il
    manque d'événements marocains locaux (groupes Madrid/Lisbonne/
    Krakow remontaient comme "Maroc" par défaut parce que notre code
    forçait ville='Maroc' quand `addressLocality` était vide). Il faut
    donc TOUJOURS vérifier `addressCountry`."""
    poste = ev.get("name") or ""
    if not poste:
        return None
    org = ev.get("organizer") or {}
    if isinstance(org, list):
        org = org[0] if org else {}
    entite = org.get("name", "") if isinstance(org, dict) else ""

    # Un événement peut avoir plusieurs `location` (liste) — on parcourt
    # toutes pour détecter l'un d'eux au Maroc AVANT de rejeter.
    locs_raw = ev.get("location") or {}
    locs = locs_raw if isinstance(locs_raw, list) else [locs_raw]

    ville = ""
    countries_seen = set()
    for loc in locs:
        if not isinstance(loc, dict):
            continue
        addr = loc.get("address") or {}
        if isinstance(addr, dict):
            c = (addr.get("addressCountry") or "").strip().upper()
            if c:
                countries_seen.add(c)
            if not ville:
                ville = (addr.get("addressLocality")
                         or addr.get("addressRegion") or "")
        if not ville:
            ville = loc.get("name", "")

    # Signal "en ligne" côté description, pour ne pas rejeter un event
    # mondial accessible depuis le Maroc.
    desc = (ev.get("description") or "").lower()
    name_low = poste.lower()
    en_ligne = any(k in desc or k in name_low for k in [
        "online", "en ligne", "virtual", "webinar", "webinaire", "zoom"
    ])

    # Rejet au collecteur : country déterminé et différent de MA, et
    # pas en ligne. Si country vide (aucun lieu structuré), on laisse
    # le classifieur en aval décider — pas d'hypothèse "Maroc" ici.
    if countries_seen and "MA" not in countries_seen and not en_ligne:
        return None

    return {
        "poste": poste,
        "entite": entite or source,
        # Pas de fallback "Maroc" aveugle : si addressLocality manque,
        # on laisse vide. normalize_ville() posera "Maroc (non précisé)"
        # SEULEMENT quand on a au moins confirmé MA.
        "ville": ville,
        "url": ev.get("url", ""),
        "date_debut": (ev.get("startDate") or "")[:10],
        "date_fin": (ev.get("endDate") or "")[:10],
        "texte": (ev.get("description") or "")[:1000],
        "source": source,
        # On transmet le country reconnu au classifieur, pour qu'il
        # tranche sans deviner.
        "country": "MA" if "MA" in countries_seen else "",
    }


# ============================================================ EVENTBRITE
# robots.txt vérifié 2026-11-15 : /d/<pays>/events/ libre, pas dans le
# Disallow (contrairement à /api/v3/destination/events/ qu'on évite).
EVENTBRITE_PATHS = [
    "/d/morocco--casablanca/events/",
    "/d/morocco--rabat/events/",
    "/d/morocco--marrakech/events/",
    "/d/morocco--tangier/events/",
    "/d/morocco/business-events/",
    "/d/morocco/science-and-tech-events/",
]


def collect_eventbrite():
    print("  → Eventbrite")
    seen_urls = set()
    out = []
    for path in EVENTBRITE_PATHS:
        r = _get(f"https://www.eventbrite.com{path}")
        if not r:
            continue
        events = _flatten_events(_extract_jsonld(r.text))
        for ev in events:
            ann = _event_to_annonce(ev, "Eventbrite")
            if not ann:
                continue
            url = ann.get("url")
            if url and url in seen_urls:
                continue
            seen_urls.add(url)
            out.append(ann)
        time.sleep(REQUEST_DELAY_SECONDS)
    print(f"    {len(out)} événements Eventbrite")
    return out


# ================================================================ MEETUP
# robots.txt vérifié 2026-11-15 : /find/ libre (quelques exclusions sur
# /join, /chapter, /unsubscribe, /auth qui ne nous concernent pas).
MEETUP_CITIES = [
    ("ma--Casablanca", "Casablanca"),
    ("ma--Rabat", "Rabat"),
    ("ma--Marrakech", "Marrakech"),
    ("ma--Tangier", "Tanger"),
    ("ma--Agadir", "Agadir"),
    ("ma--Fes", "Fès"),
]


def collect_meetup():
    print("  → Meetup")
    seen_urls = set()
    out = []
    for code, _label in MEETUP_CITIES:
        url = (f"https://www.meetup.com/find/"
               f"?keywords=&location={code}&source=EVENTS")
        r = _get(url)
        if not r:
            continue
        events = _flatten_events(_extract_jsonld(r.text))
        for ev in events:
            ann = _event_to_annonce(ev, "Meetup")
            if not ann:
                continue
            u = ann.get("url")
            if u and u in seen_urls:
                continue
            seen_urls.add(u)
            out.append(ann)
        time.sleep(REQUEST_DELAY_SECONDS)
    print(f"    {len(out)} événements Meetup")
    return out


# ================================================================ REGISTRE
COLLECTORS = [
    ("Eventbrite", collect_eventbrite),
    ("Meetup", collect_meetup),
]


def collect_all():
    out = []
    for name, fn in COLLECTORS:
        try:
            out.extend(fn())
        except Exception as e:
            print(f"    ! {name} a planté : {e}")
            traceback.print_exc()
        time.sleep(REQUEST_DELAY_SECONDS)
    return out
