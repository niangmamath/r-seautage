# -*- coding: utf-8 -*-
"""Tests unitaires du classifier networking — pur, hors réseau.

    python -m unittest test_classifier
"""
import unittest

from classifier import (
    detect_evenement, is_online, hors_maroc, normalize_ville,
    fenetre_from_event, classifier, classify_all, dedup_annonces,
)


TODAY = "2026-11-15"


def _ev(**kw):
    d = {"poste": "", "entite": "", "ville": "", "texte": "", "url": "",
         "date_debut": "", "date_fin": "", "source": "Test"}
    d.update(kw)
    return d


class TestDetection(unittest.TestCase):
    def test_networking_soiree(self):
        ok, cat, _ = detect_evenement(
            "Soirée networking entrepreneurs Casa", "")
        self.assertTrue(ok)
        self.assertEqual(cat, "Networking")

    def test_conference_summit(self):
        ok, cat, _ = detect_evenement(
            "Leadership Summit Morocco 2027", "")
        self.assertTrue(ok)
        self.assertEqual(cat, "Conférence / Summit")

    def test_forum_salon(self):
        ok, cat, _ = detect_evenement(
            "Salon de l'emploi Casablanca", "")
        self.assertTrue(ok)
        self.assertEqual(cat, "Forum / Salon")

    def test_startup_pitch(self):
        ok, cat, _ = detect_evenement(
            "Demo Day startups Marrakech", "")
        self.assertTrue(ok)
        self.assertEqual(cat, "Startup / Pitch")

    def test_workshop(self):
        ok, cat, _ = detect_evenement(
            "Workshop produit UX", "")
        self.assertTrue(ok)
        self.assertEqual(cat, "Workshop / Formation")

    def test_rejet_hackathon(self):
        ok, _, motif = detect_evenement(
            "Hackathon fintech Rabat", "")
        self.assertFalse(ok)
        self.assertIn("hackathon", motif.lower())

    def test_rejet_ctf(self):
        ok, _, _ = detect_evenement(
            "CTF Capture the Flag", "")
        self.assertFalse(ok)

    def test_rejet_concert(self):
        ok, _, motif = detect_evenement(
            "Concert live Casablanca", "")
        self.assertFalse(ok)
        self.assertIn("hors scope", motif)

    def test_rejet_yoga(self):
        ok, _, _ = detect_evenement(
            "Session yoga matinale Rabat", "")
        self.assertFalse(ok)

    def test_meetup_fallback_source(self):
        # Sans mot-clé ciblé, un événement source=Meetup est accepté
        # comme Networking par construction.
        ok, cat, _ = detect_evenement(
            "Mardi bavard", "Rencontre autour de la musique",
            source="Meetup")
        self.assertTrue(ok)
        self.assertEqual(cat, "Networking")

    def test_titre_quelconque_sans_source(self):
        # Pas de mot-clé, pas de source fiable -> rejeté.
        ok, _, motif = detect_evenement("Rendez-vous automnal", "")
        self.assertFalse(ok)
        self.assertIn("insuffisant", motif)


class TestGeo(unittest.TestCase):
    def test_en_ligne_pas_hors_maroc(self):
        self.assertFalse(hors_maroc("Webinar startup", "Paris", "100% online"))
        self.assertTrue(is_online("Webinar", "Paris", "100% online"))

    def test_physique_hors_maroc(self):
        self.assertTrue(hors_maroc("Startup Summit", "Paris", ""))

    def test_maroc_dans_ville(self):
        self.assertFalse(hors_maroc("Networking", "Casablanca, Maroc", ""))

    def test_normalisation_ville(self):
        self.assertEqual(normalize_ville("Casablanca, Casablanca-Settat"),
                          "Casablanca")
        self.assertEqual(normalize_ville("", poste="Webinar", texte="online"),
                          "En ligne")


class TestFenetre(unittest.TestCase):
    def test_en_cours(self):
        self.assertEqual(fenetre_from_event("2026-11-14", "2026-11-16", TODAY),
                          "EN COURS")

    def test_imminent(self):
        self.assertEqual(fenetre_from_event("2026-11-18", "2026-11-18", TODAY),
                          "IMMINENT")

    def test_passe(self):
        self.assertEqual(fenetre_from_event("2026-10-01", "2026-10-02", TODAY),
                          "PASSÉ")

    def test_inconnue(self):
        self.assertEqual(fenetre_from_event("", "", TODAY), "INCONNUE")


class TestVerdict(unittest.TestCase):
    def test_convenable(self):
        a = classifier(_ev(poste="Forum emploi tech", ville="Casablanca, Maroc",
                            date_debut="2026-12-10", date_fin="2026-12-11"),
                       TODAY)
        self.assertEqual(a["verdict"], "CONVENABLE")
        self.assertEqual(a["categorie"], "Forum / Salon")

    def test_ecartee_hackathon(self):
        a = classifier(_ev(poste="Hackathon IA", ville="Rabat, Maroc",
                            date_debut="2026-12-10"), TODAY)
        self.assertEqual(a["verdict"], "ÉCARTÉE")
        self.assertIn("hackathon", a["motif"])

    def test_ecartee_hors_maroc(self):
        a = classifier(_ev(poste="Business summit", ville="Paris",
                            date_debut="2026-12-10", date_fin="2026-12-10"),
                       TODAY)
        self.assertEqual(a["verdict"], "ÉCARTÉE")
        self.assertIn("hors Maroc", a["motif"])

    def test_ecartee_passee(self):
        a = classifier(_ev(poste="Meetup data", ville="Casablanca, Maroc",
                            date_debut="2026-10-01", date_fin="2026-10-01"),
                       TODAY)
        self.assertEqual(a["verdict"], "ÉCARTÉE")
        self.assertEqual(a["motif"], "événement passé")


class TestDedup(unittest.TestCase):
    def test_doublon_inter_sources(self):
        items = [
            _ev(poste="Chess & Connect Casa", entite="Chess Club", source="A"),
            _ev(poste="Chess & Connect Casa", entite="Chess Club", source="B"),
        ]
        self.assertEqual(len(dedup_annonces(items)), 1)


class TestClassifyAll(unittest.TestCase):
    def test_tri(self):
        items = [
            _ev(poste="Summit futur", ville="Rabat, Maroc",
                date_debut="2027-05-01", date_fin="2027-05-02"),
            _ev(poste="Networking imminent", ville="Casa, Maroc",
                date_debut="2026-11-18"),
            _ev(poste="Hackathon rejet", ville="Rabat, Maroc"),
        ]
        out = classify_all(items, TODAY)
        self.assertEqual(out[0]["poste"], "Networking imminent")
        self.assertEqual(out[1]["poste"], "Summit futur")
        self.assertEqual(out[-1]["verdict"], "ÉCARTÉE")


if __name__ == "__main__":
    unittest.main()
