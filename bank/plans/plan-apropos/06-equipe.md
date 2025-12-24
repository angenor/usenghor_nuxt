# 06 - Page Équipe `/a-propos/equipe`

> Route: `/a-propos/equipe`
> Fichier: `app/pages/a-propos/equipe.vue`
> Statut: **À implémenter**

---

## Objectif

Trombinoscope du personnel de l'Université avec filtres par type/service/département, recherche et pagination.

---

## Sections de la page

1. **Hero** - Titre, sous-titre, breadcrumb
2. **Filtres & Recherche** - Barre de recherche + selects (Type, Service, Département) + compteur résultats
3. **Grille équipe** - Cards membres responsive (2-4 colonnes) avec photo, nom, fonction, contacts
4. **Pagination** - Navigation pages ou infinite scroll

---

## Composants à créer

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `StaffFilters` | `components/staff/StaffFilters.vue` | Recherche + filtres dropdowns |
| `StaffGrid` | `components/staff/StaffGrid.vue` | Grille responsive avec animations |
| `CardStaff` | `components/staff/CardStaff.vue` | Card membre avec photo et actions |
| `StaffModal` | `components/staff/StaffModal.vue` | Modal détails profil (bio, publications, contact) |

---

## Table SQL

`staff` avec jointures:
- `departments` (department_id)
- `services` (service_id)

Filtres: `staff_type`, `department_id`, `service_id`, recherche nom/titre

---

## API endpoint

`GET /api/staff`

Query params: `type`, `serviceId`, `departmentId`, `search`, `page`, `limit`

Retourne: `{ items: Staff[], total: number, page: number, limit: number }`

---

## Composable

Créer `composables/useStaff.ts` avec:
- Gestion filtres réactifs
- Pagination (page, limit, totalPages)
- Fonctions setFilters, nextPage, prevPage

---

## i18n

Créer: `i18n/locales/{fr,en,ar}/team.json`

Clés principales:
- `team.hero.title` / `team.hero.subtitle`
- `team.search_placeholder`
- `team.filters.{type,service,department}`
- `team.types.{direction,teacher,admin,technical}`
- `team.results_count` (avec interpolation {count})
- `team.no_results`
- `team.biography` / `team.contact` / `team.publications`
