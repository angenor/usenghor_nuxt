# Structure du Sidebar - Back-Office Université Senghor

Ce document décrit la structure de navigation du back-office basée sur le modèle de données.

## Structure YAML

```yaml
sidebar:
  # ============================================================================
  # TABLEAU DE BORD
  # ============================================================================
  - id: dashboard
    label: "Tableau de bord"
    icon: "home"
    route: "/admin"
    permissions: []  # Accessible à tous les utilisateurs connectés

  # ============================================================================
  # ACADEMIC - Formations
  # ============================================================================
  - id: academic
    label: "Formations"
    icon: "graduation-cap"
    permissions: ["programs.view"]
    children:
      - id: programs
        label: "Programmes"
        route: "/admin/formations/programmes"
        permissions: ["programs.view"]
        description: "Gestion des formations (Master, DU, etc.)"
      - id: program-semesters
        label: "Semestres & Cours"
        route: "/admin/formations/semestres"
        permissions: ["programs.view"]
        description: "Organisation pédagogique des programmes"
      - id: program-skills
        label: "Compétences"
        route: "/admin/formations/competences"
        permissions: ["programs.view"]
        description: "Compétences acquises par formation"
      - id: career-opportunities
        label: "Débouchés"
        route: "/admin/formations/debouches"
        permissions: ["programs.view"]
        description: "Opportunités de carrière par formation"

  # ============================================================================
  # APPLICATION - Candidatures
  # ============================================================================
  - id: applications
    label: "Candidatures"
    icon: "file-text"
    permissions: ["applications.view"]
    children:
      - id: application-calls
        label: "Appels à candidatures"
        route: "/admin/candidatures/appels"
        permissions: ["applications.view"]
        description: "Gestion des sessions de recrutement"
      - id: applications-list
        label: "Dossiers de candidature"
        route: "/admin/candidatures/dossiers"
        permissions: ["applications.view"]
        description: "Liste et évaluation des candidatures"
      - id: applications-statistics
        label: "Statistiques"
        route: "/admin/candidatures/statistiques"
        permissions: ["applications.view"]
        description: "Tableaux de bord et rapports"

  # ============================================================================
  # CONTENT - Actualités & Événements
  # ============================================================================
  - id: content
    label: "Contenus"
    icon: "newspaper"
    permissions: ["news.view", "events.view"]
    children:
      - id: news
        label: "Actualités"
        route: "/admin/contenus/actualites"
        permissions: ["news.view"]
        description: "Articles et communiqués"
      - id: events
        label: "Événements"
        route: "/admin/contenus/evenements"
        permissions: ["events.view"]
        description: "Conférences, séminaires, cérémonies"
      - id: event-registrations
        label: "Inscriptions événements"
        route: "/admin/contenus/inscriptions"
        permissions: ["events.view"]
        description: "Gestion des participants"
      - id: tags
        label: "Étiquettes"
        route: "/admin/contenus/etiquettes"
        permissions: ["news.edit"]
        description: "Catégorisation des contenus"

  # ============================================================================
  # PROJECT - Projets de recherche
  # ============================================================================
  - id: projects
    label: "Projets"
    icon: "briefcase"
    permissions: ["projects.view"]
    children:
      - id: projects-list
        label: "Liste des projets"
        route: "/admin/projets/liste"
        permissions: ["projects.view"]
        description: "Projets de recherche et développement"
      - id: project-categories
        label: "Catégories"
        route: "/admin/projets/categories"
        permissions: ["projects.view"]
        description: "Classification des projets"
      - id: project-calls
        label: "Appels à projets"
        route: "/admin/projets/appels"
        permissions: ["projects.view"]
        description: "Financement et appels d'offres"

  # ============================================================================
  # ORGANIZATION - Structure organisationnelle
  # ============================================================================
  - id: organization
    label: "Organisation"
    icon: "building"
    permissions: ["organization.view"]
    children:
      - id: departments
        label: "Départements"
        route: "/admin/organisation/departements"
        permissions: ["organization.view"]
        description: "Départements académiques"
      - id: services
        label: "Services"
        route: "/admin/organisation/services"
        permissions: ["organization.view"]
        description: "Services administratifs et techniques"
      - id: service-objectives
        label: "Objectifs & Réalisations"
        route: "/admin/organisation/objectifs"
        permissions: ["organization.view"]
        description: "Suivi des objectifs par service"

  # ============================================================================
  # CAMPUS - Campus et implantations
  # ============================================================================
  - id: campus
    label: "Campus"
    icon: "map-pin"
    permissions: ["campuses.view"]
    children:
      - id: campuses-list
        label: "Liste des campus"
        route: "/admin/campus/liste"
        permissions: ["campuses.view"]
        description: "Alexandrie, Dakar, etc."
      - id: campus-team
        label: "Équipes campus"
        route: "/admin/campus/equipes"
        permissions: ["campuses.view"]
        description: "Personnel par campus"

  # ============================================================================
  # PARTNER - Partenaires
  # ============================================================================
  - id: partners
    label: "Partenaires"
    icon: "handshake"
    route: "/admin/partenaires"
    permissions: ["partners.view"]
    description: "Universités, entreprises, organisations partenaires"

  # ============================================================================
  # MEDIA - Médiathèque
  # ============================================================================
  - id: media
    label: "Médiathèque"
    icon: "image"
    permissions: ["media.view"]
    children:
      - id: media-library
        label: "Fichiers médias"
        route: "/admin/mediatheque/fichiers"
        permissions: ["media.view"]
        description: "Images, vidéos, documents"
      - id: albums
        label: "Albums"
        route: "/admin/mediatheque/albums"
        permissions: ["media.view"]
        description: "Galeries photos et vidéos"

  # ============================================================================
  # NEWSLETTER - Communication
  # ============================================================================
  - id: newsletter
    label: "Newsletter"
    icon: "mail"
    permissions: ["newsletter.view"]
    children:
      - id: newsletter-campaigns
        label: "Campagnes"
        route: "/admin/newsletter/campagnes"
        permissions: ["newsletter.view"]
        description: "Création et envoi de newsletters"
      - id: newsletter-subscribers
        label: "Abonnés"
        route: "/admin/newsletter/abonnes"
        permissions: ["newsletter.view"]
        description: "Gestion des abonnements"
      - id: newsletter-statistics
        label: "Statistiques"
        route: "/admin/newsletter/statistiques"
        permissions: ["newsletter.view"]
        description: "Taux d'ouverture, clics, etc."

  # ============================================================================
  # EDITORIAL - Configuration du site
  # ============================================================================
  - id: editorial
    label: "Éditorial"
    icon: "settings-2"
    permissions: ["editorial.view"]
    children:
      - id: editorial-statistics
        label: "Chiffres clés"
        route: "/admin/editorial/chiffres-cles"
        permissions: ["editorial.edit"]
        description: "Statistiques affichées sur le site"
      - id: editorial-values
        label: "Valeurs"
        route: "/admin/editorial/valeurs"
        permissions: ["editorial.edit"]
        description: "Mission, vision, valeurs"
      - id: editorial-contact
        label: "Informations de contact"
        route: "/admin/editorial/contact"
        permissions: ["editorial.edit"]
        description: "Adresses, téléphones, emails"
      - id: editorial-social
        label: "Réseaux sociaux"
        route: "/admin/editorial/reseaux-sociaux"
        permissions: ["editorial.edit"]
        description: "Liens vers les réseaux sociaux"
      - id: editorial-legal
        label: "Mentions légales"
        route: "/admin/editorial/mentions-legales"
        permissions: ["editorial.edit"]
        description: "CGU, politique de confidentialité"

  # ============================================================================
  # CORE - Données de référence
  # ============================================================================
  - id: reference-data
    label: "Données de référence"
    icon: "database"
    permissions: ["admin.settings"]
    children:
      - id: countries
        label: "Pays"
        route: "/admin/references/pays"
        permissions: ["admin.settings"]
        description: "Liste des pays (ISO 3166)"

  # ============================================================================
  # IDENTITY - Administration système
  # ============================================================================
  - id: administration
    label: "Administration"
    icon: "shield"
    permissions: ["users.view"]
    children:
      - id: users
        label: "Utilisateurs"
        route: "/admin/administration/utilisateurs"
        permissions: ["users.view"]
        description: "Comptes utilisateurs"
      - id: roles
        label: "Rôles"
        route: "/admin/administration/roles"
        permissions: ["users.roles"]
        description: "Rôles et niveaux d'accès"
      - id: permissions
        label: "Permissions"
        route: "/admin/administration/permissions"
        permissions: ["users.roles"]
        description: "Droits d'accès par rôle"
      - id: audit-logs
        label: "Journal d'audit"
        route: "/admin/administration/audit"
        permissions: ["admin.audit"]
        description: "Historique des actions"
```

## Correspondance avec les services de la base de données

| Rubrique sidebar | Service(s) SQL | Tables principales |
|------------------|----------------|-------------------|
| Tableau de bord | Tous | Agrégation |
| Formations | `07_academic` | programs, program_semesters, program_courses |
| Candidatures | `08_application` | application_calls, applications |
| Contenus | `09_content` | news, events, tags |
| Projets | `10_project` | projects, project_categories, project_calls |
| Organisation | `04_organization` | departments, services |
| Campus | `05_campus` | campuses, campus_team |
| Partenaires | `06_partner` | partners |
| Médiathèque | `03_media` | media, albums |
| Newsletter | `11_newsletter` | newsletter_campaigns, newsletter_subscribers |
| Éditorial | `12_editorial` | editorial_contents, editorial_categories |
| Données de référence | `01_core` | countries |
| Administration | `02_identity` | users, roles, permissions, audit_logs |

## Notes d'implémentation

1. **Permissions** : Chaque rubrique/sous-rubrique est protégée par des permissions définies dans `02_identity.sql`
2. **Icônes** : Utiliser Lucide Icons (compatible avec le design system Nuxt UI)
3. **Routes** : Préfixe `/admin` pour toutes les routes du back-office
4. **Ordre** : Les rubriques sont ordonnées par fréquence d'utilisation estimée
