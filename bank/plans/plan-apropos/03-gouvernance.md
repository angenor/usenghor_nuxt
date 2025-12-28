# 03 - Page Gouvernance `/a-propos/gouvernance`

> Route: `/a-propos/gouvernance`
> Fichier: `app/pages/a-propos/gouvernance.vue`
> Statut: **À implémenter**

---

## Objectif

Présenter la gouvernance institutionnelle: textes fondateurs, pays bailleurs et membres du Conseil d'Administration.

---

## Sections de la page

1. **Hero** - Titre, sous-titre, breadcrumb
2. **Textes fondateurs** - Liste de documents PDF téléchargeables (Convention, Statuts, Règlement, Charte)
3. **Pays bailleurs** - Grille de cards avec drapeaux (15 pays)
4. **Conseil d'Administration** - Président en vedette + grille des membres)

---

## Composants à créer

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `DocumentsList` | `components/documents/DocumentsList.vue` | Liste documents PDF avec téléchargement |
| `CardCountry` | `components/cards/CardCountry.vue` | Card pays avec drapeau (code ISO → emoji) |
| `CardCAMember` | `components/cards/CardCAMember.vue` | Card membre CA avec photo et rôle |

---

## Tables SQL

- `documents` - Textes fondateurs (category = 'texte_fondateur')
- `pays_bailleurs` - Pays membres avec code ISO
- `conseil_administration` - Membres du CA avec rôles

---

## API endpoints

- `GET /api/documents?category=texte_fondateur`
- `GET /api/pays-bailleurs`
- `GET /api/conseil-administration`

---

## i18n

Fichier existant à compléter: `i18n/locales/{fr,en,ar}/governance.json`

Clés principales:
- `governance.hero.title` / `governance.hero.subtitle`
- `governance.founding_texts.title` / `governance.founding_texts.intro`
- `governance.donor_countries.title` / `governance.donor_countries.member_since`
- `governance.ca.title` / `governance.ca.roles.{president,vice_president,membre,observateur}`

---

## Utilitaires

Créer `utils/flags.ts` avec fonction `getFlagEmoji(code: string)` pour convertir code ISO en emoji drapeau.
