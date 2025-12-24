# 05 - Page Organisation `/a-propos/organisation`

> Route: `/a-propos/organisation`
> Fichier: `app/pages/a-propos/organisation.vue`
> Statut: **À implémenter**

---

## Objectif

Présenter l'organisation interne de l'Université: organigramme interactif, départements académiques et services.

---

## Sections de la page

1. **Hero** - Titre, sous-titre, breadcrumb
2. **Introduction** - Texte + navigation rapide (ancres vers sections)
3. **Organigramme** `#organigramme` - Diagramme interactif cliquable (Recteur → Direction → Départements)
4. **Départements** `#departements` - Accordéon avec responsable, description, liens formations/équipe
5. **Services** `#services` - Grille par catégorie (académiques, administratifs) avec contacts
6. **CTA** - Lien vers page équipe

---

## Composants à créer

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `OrgChart` | `components/organization/OrgChart.vue` | Organigramme interactif multi-niveaux |
| `OrgChartNode` | `components/organization/OrgChartNode.vue` | Nœud cliquable de l'organigramme |
| `DepartmentAccordion` | `components/organization/DepartmentAccordion.vue` | Accordéon départements avec responsables |
| `ServiceCard` | `components/organization/ServiceCard.vue` | Card service avec contacts |

---

## Tables SQL

- `departments` - Départements avec responsable (head_id → staff)
- `services` - Services groupés par catégorie avec contacts

---

## API endpoints

- `GET /api/departments` (avec responsable)
- `GET /api/services` (groupés par catégorie)

---

## i18n

Créer: `i18n/locales/{fr,en,ar}/organization.json`

Clés principales:
- `organization.hero.title`
- `organization.intro.nav.{orgchart,departments,services}`
- `organization.orgchart.{recteur,cabinet,sg}`
- `organization.departments.{culture,environment,management,health,doctoral}`
- `organization.services.{academic,administrative}`
- `organization.head` / `organization.view_programs` / `organization.view_team`
