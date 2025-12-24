# 07 - Page Partenaires `/a-propos/partenaires`

> Route: `/a-propos/partenaires`
> Fichier: `app/pages/a-propos/partenaires.vue`
> Statut: **À implémenter**

---

## Objectif

Présenter les campus externalisés et les partenaires stratégiques de l'Université.

---

## Sections de la page

1. **Hero** - Titre, sous-titre, breadcrumb
2. **Introduction** - Texte + navigation rapide (ancres)
3. **Campus externalisés** `#campus` - Carte interactive (Leaflet) + grille cards campus
4. **Partenaires stratégiques** `#partenaires` - Filtres par type + grille logos cliquables
5. **Devenir partenaire** - CTA contact

---

## Composants à créer

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `CampusMap` | `components/partners/CampusMap.vue` | Carte Leaflet avec markers campus |
| `CardCampus` | `components/partners/CardCampus.vue` | Card campus avec image, drapeau, actions |
| `CampusModal` | `components/partners/CampusModal.vue` | Modal détails campus (adresse, contact, carte) |
| `PartnersLogos` | `components/partners/PartnersLogos.vue` | Grille logos filtrables avec overlay |

---

## Tables SQL

- `campus_externalises` - Campus avec coordonnées GPS
- `partenaires` - Partenaires par type (academique, institutionnel, entreprise, ong)

---

## API endpoints

- `GET /api/campus-externalises`
- `GET /api/partenaires`

---

## Composables

Créer `composables/usePartners.ts` - Récupération campus et partenaires

Créer `composables/useMap.ts` - Initialisation Leaflet, ajout markers

---

## Dépendances

Installer Leaflet pour la carte interactive:
- `leaflet`
- `@types/leaflet`

---

## i18n

Créer: `i18n/locales/{fr,en,ar}/partners.json`

Clés principales:
- `partners.hero.title` / `partners.hero.subtitle`
- `partners.campus.title` / `partners.campus.programs` / `partners.campus.view_programs`
- `partners.map.main_campus` / `partners.map.external_campus`
- `partners.strategic.title`
- `partners.types.{academic,institutional,business,ngo}`
- `partners.become_partner.title` / `partners.become_partner.cta`
