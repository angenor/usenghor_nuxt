/**
 * Composable pour la navigation du sidebar admin
 * Basé sur: bank/plans/plan-back-office/description-side-bare.md
 */

export interface SidebarItem {
  id: string
  label: string
  icon: string
  route?: string
  permissions: string[]
  description?: string
  children?: SidebarItem[]
}

export interface SidebarSection {
  id: string
  label: string
  icon: string
  route?: string
  permissions: string[]
  description?: string
  children?: SidebarItem[]
}

export function useAdminSidebar() {
  const { t } = useI18n()
  const route = useRoute()

  // Structure complète du sidebar admin
  const sidebarItems: SidebarSection[] = [
    // ========================================================================
    // TABLEAU DE BORD
    // ========================================================================
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'fa-solid fa-house',
      route: '/admin',
      permissions: []
    },

    // ========================================================================
    // ACADEMIC - Formations
    // ========================================================================
    {
      id: 'academic',
      label: 'Formations',
      icon: 'fa-solid fa-graduation-cap',
      permissions: ['programs.view'],
      children: [
        {
          id: 'programs',
          label: 'Programmes',
          icon: 'fa-solid fa-book-open',
          route: '/admin/formations/programmes',
          permissions: ['programs.view'],
          description: 'Gestion des formations (Master, DU, etc.)'
        },
        {
          id: 'program-semesters',
          label: 'Semestres & Cours',
          icon: 'fa-solid fa-calendar-alt',
          route: '/admin/formations/semestres',
          permissions: ['programs.view'],
          description: 'Organisation pédagogique des programmes'
        },
        {
          id: 'program-skills',
          label: 'Compétences',
          icon: 'fa-solid fa-lightbulb',
          route: '/admin/formations/competences',
          permissions: ['programs.view'],
          description: 'Compétences acquises par formation'
        },
        {
          id: 'career-opportunities',
          label: 'Débouchés',
          icon: 'fa-solid fa-briefcase',
          route: '/admin/formations/debouches',
          permissions: ['programs.view'],
          description: 'Opportunités de carrière par formation'
        }
      ]
    },

    // ========================================================================
    // APPLICATION - Candidatures
    // ========================================================================
    {
      id: 'applications',
      label: 'Candidatures',
      icon: 'fa-solid fa-file-alt',
      permissions: ['applications.view'],
      children: [
        {
          id: 'application-calls',
          label: 'Appels à candidatures',
          icon: 'fa-solid fa-bullhorn',
          route: '/admin/candidatures/appels',
          permissions: ['applications.view'],
          description: 'Gestion des sessions de recrutement'
        },
        {
          id: 'applications-list',
          label: 'Dossiers de candidature',
          icon: 'fa-solid fa-folder-open',
          route: '/admin/candidatures/dossiers',
          permissions: ['applications.view'],
          description: 'Liste et évaluation des candidatures'
        },
        {
          id: 'applications-statistics',
          label: 'Statistiques',
          icon: 'fa-solid fa-chart-pie',
          route: '/admin/candidatures/statistiques',
          permissions: ['applications.view'],
          description: 'Tableaux de bord et rapports'
        }
      ]
    },

    // ========================================================================
    // CONTENT - Actualités & Événements
    // ========================================================================
    {
      id: 'content',
      label: 'Contenus',
      icon: 'fa-solid fa-newspaper',
      permissions: ['news.view', 'events.view'],
      children: [
        {
          id: 'news',
          label: 'Actualités',
          icon: 'fa-solid fa-rss',
          route: '/admin/contenus/actualites',
          permissions: ['news.view'],
          description: 'Articles et communiqués'
        },
        {
          id: 'events',
          label: 'Événements',
          icon: 'fa-solid fa-calendar-days',
          route: '/admin/contenus/evenements',
          permissions: ['events.view'],
          description: 'Conférences, séminaires, cérémonies'
        },
        {
          id: 'event-registrations',
          label: 'Inscriptions événements',
          icon: 'fa-solid fa-user-check',
          route: '/admin/contenus/inscriptions',
          permissions: ['events.view'],
          description: 'Gestion des participants'
        },
        {
          id: 'tags',
          label: 'Étiquettes',
          icon: 'fa-solid fa-tags',
          route: '/admin/contenus/etiquettes',
          permissions: ['news.edit'],
          description: 'Catégorisation des contenus'
        }
      ]
    },

    // ========================================================================
    // PROJECT - Projets de recherche
    // ========================================================================
    {
      id: 'projects',
      label: 'Projets',
      icon: 'fa-solid fa-rocket',
      permissions: ['projects.view'],
      children: [
        {
          id: 'projects-list',
          label: 'Liste des projets',
          icon: 'fa-solid fa-list',
          route: '/admin/projets/liste',
          permissions: ['projects.view'],
          description: 'Projets de recherche et développement'
        },
        {
          id: 'project-categories',
          label: 'Catégories',
          icon: 'fa-solid fa-folder-tree',
          route: '/admin/projets/categories',
          permissions: ['projects.view'],
          description: 'Classification des projets'
        },
        {
          id: 'project-calls',
          label: 'Appels à projets',
          icon: 'fa-solid fa-bullhorn',
          route: '/admin/projets/appels',
          permissions: ['projects.view'],
          description: 'Financement et appels d\'offres'
        }
      ]
    },

    // ========================================================================
    // ORGANIZATION - Structure organisationnelle
    // ========================================================================
    {
      id: 'organization',
      label: 'Organisation',
      icon: 'fa-solid fa-building',
      permissions: ['organization.view'],
      children: [
        {
          id: 'sectors',
          label: 'Secteurs',
          icon: 'fa-solid fa-sitemap',
          route: '/admin/organisation/secteurs',
          permissions: ['organization.view'],
          description: 'Secteurs'
        },
        {
          id: 'services',
          label: 'Services',
          icon: 'fa-solid fa-cogs',
          route: '/admin/organisation/services',
          permissions: ['organization.view'],
          description: 'Services administratifs et techniques'
        },
        {
          id: 'service-objectives',
          label: 'Objectifs & Réalisations',
          icon: 'fa-solid fa-bullseye',
          route: '/admin/organisation/objectifs',
          permissions: ['organization.view'],
          description: 'Suivi des objectifs par service'
        }
      ]
    },

    // ========================================================================
    // CAMPUS - Campus et implantations
    // ========================================================================
    {
      id: 'campus',
      label: 'Campus',
      icon: 'fa-solid fa-map-marker-alt',
      permissions: ['campuses.view'],
      children: [
        {
          id: 'campuses-list',
          label: 'Liste des campus',
          icon: 'fa-solid fa-university',
          route: '/admin/campus/liste',
          permissions: ['campuses.view'],
          description: 'Alexandrie, Dakar, etc.'
        },
        {
          id: 'campus-team',
          label: 'Équipes campus',
          icon: 'fa-solid fa-users',
          route: '/admin/campus/equipes',
          permissions: ['campuses.view'],
          description: 'Personnel par campus'
        }
      ]
    },

    // ========================================================================
    // PARTNER - Partenaires
    // ========================================================================
    {
      id: 'partners',
      label: 'Partenaires',
      icon: 'fa-solid fa-handshake',
      route: '/admin/partenaires',
      permissions: ['partners.view'],
      description: 'Universités, entreprises, organisations partenaires'
    },

    // ========================================================================
    // MEDIA - Médiathèque
    // ========================================================================
    {
      id: 'media',
      label: 'Médiathèque',
      icon: 'fa-solid fa-photo-video',
      permissions: ['media.view'],
      children: [
        {
          id: 'media-library',
          label: 'Fichiers médias',
          icon: 'fa-solid fa-images',
          route: '/admin/mediatheque/fichiers',
          permissions: ['media.view'],
          description: 'Images, vidéos, documents'
        },
        {
          id: 'albums',
          label: 'Albums',
          icon: 'fa-solid fa-folder-open',
          route: '/admin/mediatheque/albums',
          permissions: ['media.view'],
          description: 'Galeries photos et vidéos'
        }
      ]
    },

    // ========================================================================
    // NEWSLETTER - Communication
    // ========================================================================
    {
      id: 'newsletter',
      label: 'Newsletter',
      icon: 'fa-solid fa-envelope',
      permissions: ['newsletter.view'],
      children: [
        {
          id: 'newsletter-campaigns',
          label: 'Campagnes',
          icon: 'fa-solid fa-paper-plane',
          route: '/admin/newsletter/campagnes',
          permissions: ['newsletter.view'],
          description: 'Création et envoi de newsletters'
        },
        {
          id: 'newsletter-subscribers',
          label: 'Abonnés',
          icon: 'fa-solid fa-user-plus',
          route: '/admin/newsletter/abonnes',
          permissions: ['newsletter.view'],
          description: 'Gestion des abonnements'
        },
        {
          id: 'newsletter-statistics',
          label: 'Statistiques',
          icon: 'fa-solid fa-chart-line',
          route: '/admin/newsletter/statistiques',
          permissions: ['newsletter.view'],
          description: 'Taux d\'ouverture, clics, etc.'
        }
      ]
    },

    // ========================================================================
    // EDITORIAL - Configuration du site
    // ========================================================================
    {
      id: 'editorial',
      label: 'Éditorial',
      icon: 'fa-solid fa-sliders',
      permissions: ['editorial.view'],
      children: [
        {
          id: 'editorial-statistics',
          label: 'Chiffres clés',
          icon: 'fa-solid fa-chart-bar',
          route: '/admin/editorial/chiffres-cles',
          permissions: ['editorial.edit'],
          description: 'Statistiques affichées sur le site'
        },
        {
          id: 'editorial-values',
          label: 'Valeurs',
          icon: 'fa-solid fa-star',
          route: '/admin/editorial/valeurs',
          permissions: ['editorial.edit'],
          description: 'Mission, vision, valeurs'
        },
        {
          id: 'editorial-contact',
          label: 'Informations de contact',
          icon: 'fa-solid fa-address-book',
          route: '/admin/editorial/contact',
          permissions: ['editorial.edit'],
          description: 'Adresses, téléphones, emails'
        },
        {
          id: 'editorial-social',
          label: 'Réseaux sociaux',
          icon: 'fa-solid fa-share-nodes',
          route: '/admin/editorial/reseaux-sociaux',
          permissions: ['editorial.edit'],
          description: 'Liens vers les réseaux sociaux'
        },
        {
          id: 'editorial-legal',
          label: 'Mentions légales',
          icon: 'fa-solid fa-scale-balanced',
          route: '/admin/editorial/mentions-legales',
          permissions: ['editorial.edit'],
          description: 'CGU, politique de confidentialité'
        }
      ]
    },

    // ========================================================================
    // CORE - Données de référence
    // ========================================================================
    {
      id: 'reference-data',
      label: 'Données de référence',
      icon: 'fa-solid fa-database',
      permissions: ['admin.settings'],
      children: [
        {
          id: 'countries',
          label: 'Pays',
          icon: 'fa-solid fa-globe',
          route: '/admin/references/pays',
          permissions: ['admin.settings'],
          description: 'Liste des pays (ISO 3166)'
        }
      ]
    },

    // ========================================================================
    // IDENTITY - Administration système
    // ========================================================================
    {
      id: 'administration',
      label: 'Administration',
      icon: 'fa-solid fa-shield-halved',
      permissions: ['users.view'],
      children: [
        {
          id: 'users',
          label: 'Utilisateurs',
          icon: 'fa-solid fa-users-cog',
          route: '/admin/administration/utilisateurs',
          permissions: ['users.view'],
          description: 'Comptes utilisateurs'
        },
        {
          id: 'roles',
          label: 'Rôles',
          icon: 'fa-solid fa-user-tag',
          route: '/admin/administration/roles',
          permissions: ['users.roles'],
          description: 'Rôles et niveaux d\'accès'
        },
        {
          id: 'permissions',
          label: 'Permissions',
          icon: 'fa-solid fa-key',
          route: '/admin/administration/permissions',
          permissions: ['users.roles'],
          description: 'Droits d\'accès par rôle'
        },
        {
          id: 'audit-logs',
          label: 'Journal d\'audit',
          icon: 'fa-solid fa-clock-rotate-left',
          route: '/admin/administration/audit',
          permissions: ['admin.audit'],
          description: 'Historique des actions'
        }
      ]
    }
  ]

  // État du sidebar (expanded/collapsed)
  const isCollapsed = ref(false)
  const expandedMenus = ref<string[]>([])

  // Toggle collapse du sidebar
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
  }

  // Toggle d'un menu parent
  const toggleMenu = (menuId: string) => {
    const index = expandedMenus.value.indexOf(menuId)
    if (index === -1) {
      expandedMenus.value.push(menuId)
    } else {
      expandedMenus.value.splice(index, 1)
    }
  }

  // Vérifie si un menu est ouvert
  const isMenuExpanded = (menuId: string) => {
    return expandedMenus.value.includes(menuId)
  }

  // Vérifie si une route est active
  const isRouteActive = (itemRoute?: string) => {
    if (!itemRoute) return false

    // Cas spécial pour le tableau de bord : correspondance exacte uniquement
    if (itemRoute === '/admin') {
      return route.path === '/admin' || route.path === '/admin/'
    }

    // Pour les autres routes : correspondance exacte ou préfixe
    return route.path === itemRoute || route.path.startsWith(itemRoute + '/')
  }

  // Vérifie si un parent a une route enfant active
  const hasActiveChild = (item: SidebarSection) => {
    if (!item.children) return false
    return item.children.some(child => isRouteActive(child.route))
  }

  // Initialise les menus ouverts basé sur la route active
  const initExpandedMenus = () => {
    sidebarItems.forEach(item => {
      if (item.children && hasActiveChild(item)) {
        if (!expandedMenus.value.includes(item.id)) {
          expandedMenus.value.push(item.id)
        }
      }
    })
  }

  // Initialiser au montage
  onMounted(() => {
    initExpandedMenus()
  })

  // Réagir aux changements de route
  watch(() => route.path, () => {
    initExpandedMenus()
  })

  return {
    sidebarItems,
    isCollapsed,
    expandedMenus,
    toggleCollapse,
    toggleMenu,
    isMenuExpanded,
    isRouteActive,
    hasActiveChild
  }
}
