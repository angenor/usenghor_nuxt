/**
 * Composable de recherche globale pour le front-office
 * Agrège toutes les sources de données et fournit une recherche flexible
 */

import { mockFormations } from '@bank/mock-data/formations'
import { mockEvents } from '@bank/mock-data/events'
import { mockApplicationCalls } from '@bank/mock-data/application-calls'
import { mockNews } from '@bank/mock-data/news'

export type SearchResultType = 'formation' | 'event' | 'call' | 'news' | 'page'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  description?: string
  icon: string
  route: string
  image?: string
  date?: string
  score: number
}

// Normalise le texte pour la recherche (supprime accents, met en minuscules)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^\w\s]/g, ' ') // Remplace les caractères spéciaux par des espaces
    .replace(/\s+/g, ' ') // Normalise les espaces multiples
    .trim()
}

// Calcule un score de pertinence pour un résultat
function calculateScore(searchTerms: string[], fields: { text: string; weight: number }[]): number {
  let totalScore = 0

  for (const term of searchTerms) {
    const normalizedTerm = normalizeText(term)
    if (!normalizedTerm) continue

    for (const field of fields) {
      const normalizedField = normalizeText(field.text)

      // Match exact au début = score le plus élevé
      if (normalizedField.startsWith(normalizedTerm)) {
        totalScore += 100 * field.weight
      }
      // Match mot complet
      else if (normalizedField.split(' ').some(word => word === normalizedTerm)) {
        totalScore += 80 * field.weight
      }
      // Match début de mot
      else if (normalizedField.split(' ').some(word => word.startsWith(normalizedTerm))) {
        totalScore += 60 * field.weight
      }
      // Match partiel (le terme est contenu quelque part)
      else if (normalizedField.includes(normalizedTerm)) {
        totalScore += 40 * field.weight
      }
    }
  }

  return totalScore
}

// Vérifie si au moins un terme de recherche est trouvé
function matchesSearch(searchTerms: string[], fields: string[]): boolean {
  const normalizedTerms = searchTerms.map(t => normalizeText(t)).filter(t => t.length > 0)
  if (normalizedTerms.length === 0) return false

  // Au moins un terme doit matcher au moins un champ
  return normalizedTerms.some(term =>
    fields.some(field => normalizeText(field).includes(term))
  )
}

// Pages statiques searchables
const staticPages: SearchResult[] = [
  {
    id: 'page-about',
    type: 'page',
    title: 'À propos de l\'Université Senghor',
    subtitle: 'Notre histoire et notre mission',
    description: 'Découvrez l\'histoire, la mission et les valeurs de l\'Université Senghor d\'Alexandrie',
    icon: 'fa-solid fa-info-circle',
    route: '/a-propos',
    score: 0
  },
  {
    id: 'page-site',
    type: 'page',
    title: 'Campus d\'Alexandrie',
    subtitle: 'Nos installations et équipements',
    description: 'Visitez notre campus historique au coeur d\'Alexandrie en Égypte',
    icon: 'fa-solid fa-building-columns',
    route: '/site',
    score: 0
  },
  {
    id: 'page-alumni',
    type: 'page',
    title: 'Réseau Alumni',
    subtitle: 'Plus de 4200 diplômés',
    description: 'Rejoignez le réseau des anciens étudiants de l\'Université Senghor',
    icon: 'fa-solid fa-user-graduate',
    route: '/alumni',
    score: 0
  },
  {
    id: 'page-partners',
    type: 'page',
    title: 'Nos partenaires',
    subtitle: 'Partenariats académiques et institutionnels',
    description: 'Découvrez nos partenaires et collaborations internationales',
    icon: 'fa-solid fa-handshake',
    route: '/a-propos/partenaires',
    score: 0
  },
  {
    id: 'page-contact',
    type: 'page',
    title: 'Contact',
    subtitle: 'Nous contacter',
    description: 'Contactez l\'Université Senghor pour toute demande d\'information',
    icon: 'fa-solid fa-envelope',
    route: '/contact',
    score: 0
  },
  {
    id: 'page-masters',
    type: 'page',
    title: 'Masters',
    subtitle: 'Tous nos programmes de Master',
    description: 'Explorez nos formations de niveau Master dans différents domaines',
    icon: 'fa-solid fa-graduation-cap',
    route: '/formations/masters',
    score: 0
  },
  {
    id: 'page-doctorats',
    type: 'page',
    title: 'Doctorats',
    subtitle: 'Programmes doctoraux',
    description: 'Nos programmes de doctorat en partenariat avec des universités internationales',
    icon: 'fa-solid fa-book-open',
    route: '/formations/doctorats',
    score: 0
  },
  {
    id: 'page-du',
    type: 'page',
    title: 'Diplômes Universitaires',
    subtitle: 'Formations courtes qualifiantes',
    description: 'Nos diplômes universitaires et formations courtes',
    icon: 'fa-solid fa-award',
    route: '/formations/diplomes-universitaires',
    score: 0
  },
  {
    id: 'page-certifiantes',
    type: 'page',
    title: 'Formations certifiantes',
    subtitle: 'Certifications professionnelles',
    description: 'Nos formations certifiantes en ligne et en présentiel',
    icon: 'fa-solid fa-certificate',
    route: '/formations/certifiantes',
    score: 0
  },
  {
    id: 'page-calls',
    type: 'page',
    title: 'Appels à candidatures',
    subtitle: 'Candidatez à nos formations',
    description: 'Consultez nos appels à candidatures et bourses disponibles',
    icon: 'fa-solid fa-bullhorn',
    route: '/actualites/appels',
    score: 0
  },
  {
    id: 'page-events',
    type: 'page',
    title: 'Événements',
    subtitle: 'Conférences, séminaires et ateliers',
    description: 'Découvrez nos événements académiques et culturels',
    icon: 'fa-solid fa-calendar-days',
    route: '/actualites/evenements',
    score: 0
  },
  {
    id: 'page-news',
    type: 'page',
    title: 'Actualités',
    subtitle: 'Toute l\'actualité de l\'université',
    description: 'Les dernières nouvelles et annonces de l\'Université Senghor',
    icon: 'fa-solid fa-newspaper',
    route: '/actualites',
    score: 0
  },
  {
    id: 'page-projects',
    type: 'page',
    title: 'Projets',
    subtitle: 'Nos projets phares',
    description: 'Découvrez nos projets de développement et initiatives',
    icon: 'fa-solid fa-rocket',
    route: '/projets',
    score: 0
  },
  {
    id: 'page-transformaction',
    type: 'page',
    title: 'Transform\'Action Africa',
    subtitle: 'Programme de formation des dirigeants',
    description: 'Programme phare de formation des cadres dirigeants africains',
    icon: 'fa-solid fa-rocket',
    route: '/projets/transformaction',
    score: 0
  },
  {
    id: 'page-kreafrika',
    type: 'page',
    title: 'KreAfrika',
    subtitle: 'Industries culturelles et créatives',
    description: 'Programme dédié aux industries culturelles et créatives africaines',
    icon: 'fa-solid fa-lightbulb',
    route: '/projets/kreafrika',
    score: 0
  },
  {
    id: 'page-library',
    type: 'page',
    title: 'Bibliothèque',
    subtitle: 'Centre de ressources documentaires',
    description: 'Notre bibliothèque universitaire et ses ressources',
    icon: 'fa-solid fa-book',
    route: '/site#bibliotheque',
    score: 0
  },
  {
    id: 'page-housing',
    type: 'page',
    title: 'Hébergement',
    subtitle: 'Logement étudiant',
    description: 'Solutions d\'hébergement pour les étudiants sur le campus',
    icon: 'fa-solid fa-house',
    route: '/site#hebergement',
    score: 0
  }
]

// Icônes par type de formation
const formationIcons: Record<string, string> = {
  master: 'fa-solid fa-graduation-cap',
  doctorat: 'fa-solid fa-book-open',
  du: 'fa-solid fa-award',
  certifiante: 'fa-solid fa-certificate'
}

// Icônes par type d'événement
const eventIcons: Record<string, string> = {
  conference: 'fa-solid fa-microphone',
  workshop: 'fa-solid fa-tools',
  ceremony: 'fa-solid fa-award',
  seminar: 'fa-solid fa-chalkboard-teacher',
  symposium: 'fa-solid fa-users',
  other: 'fa-solid fa-calendar-alt'
}

// Icônes par type d'appel
const callIcons: Record<string, string> = {
  application: 'fa-solid fa-file-alt',
  scholarship: 'fa-solid fa-hand-holding-usd',
  project: 'fa-solid fa-project-diagram',
  recruitment: 'fa-solid fa-briefcase',
  training: 'fa-solid fa-chalkboard'
}

// Labels par type
const typeLabels: Record<SearchResultType, string> = {
  formation: 'Formation',
  event: 'Événement',
  call: 'Appel',
  news: 'Actualité',
  page: 'Page'
}

export function useGlobalSearch() {
  const { locale } = useI18n()

  // Construit tous les résultats searchables
  const allSearchableItems = computed<SearchResult[]>(() => {
    const items: SearchResult[] = []

    // 1. Formations (publiées uniquement)
    for (const formation of mockFormations.filter(f => f.is_published)) {
      const title = locale.value === 'en' && formation.title_en
        ? formation.title_en
        : formation.title_fr
      const description = locale.value === 'en' && formation.short_description_en
        ? formation.short_description_en
        : formation.short_description_fr

      // Construire la route selon le type
      let route = '/formations'
      if (formation.formation_type === 'master') {
        route = `/formations/masters/${formation.slug}`
      } else if (formation.formation_type === 'doctorat') {
        route = `/formations/doctorats/${formation.slug}`
      } else if (formation.formation_type === 'du') {
        route = `/formations/diplomes-universitaires/${formation.slug}`
      } else if (formation.formation_type === 'certifiante') {
        route = `/formations/certifiantes/${formation.slug}`
      }

      items.push({
        id: formation.id,
        type: 'formation',
        title,
        subtitle: `${typeLabels.formation} • ${formation.duration_fr}`,
        description,
        icon: formationIcons[formation.formation_type] || 'fa-solid fa-graduation-cap',
        route,
        image: formation.image,
        score: 0
      })
    }

    // 2. Événements (publiés uniquement)
    for (const event of mockEvents.filter(e => e.status === 'published')) {
      items.push({
        id: event.id,
        type: 'event',
        title: event.title,
        subtitle: `${typeLabels.event} • ${new Date(event.start_date).toLocaleDateString('fr-FR')}`,
        description: event.description,
        icon: eventIcons[event.type] || 'fa-solid fa-calendar-days',
        route: `/actualites/evenements/${event.slug}`,
        image: event.cover_image,
        date: event.start_date,
        score: 0
      })
    }

    // 3. Appels à candidatures (publiés uniquement)
    for (const call of mockApplicationCalls.filter(c => c.publication_status === 'published')) {
      items.push({
        id: call.id,
        type: 'call',
        title: call.title,
        subtitle: `${typeLabels.call} • ${call.deadline ? `Date limite: ${new Date(call.deadline).toLocaleDateString('fr-FR')}` : 'En cours'}`,
        description: call.description,
        icon: callIcons[call.type] || 'fa-solid fa-bullhorn',
        route: `/actualites/appels/${call.slug}`,
        date: call.deadline,
        score: 0
      })
    }

    // 4. Actualités (publiées uniquement)
    for (const news of mockNews.filter(n => n.status === 'published')) {
      items.push({
        id: news.id,
        type: 'news',
        title: news.title,
        subtitle: `${typeLabels.news} • ${new Date(news.published_at || news.created_at).toLocaleDateString('fr-FR')}`,
        description: news.summary,
        icon: 'fa-solid fa-newspaper',
        route: `/actualites/${news.slug}`,
        image: news.cover_image,
        date: news.published_at || news.created_at,
        score: 0
      })
    }

    // 5. Pages statiques
    items.push(...staticPages)

    return items
  })

  // Fonction de recherche principale
  function search(query: string, maxResults: number = 10): SearchResult[] {
    if (!query || query.trim().length < 2) return []

    // Divise la requête en termes de recherche
    const searchTerms = query.trim().split(/\s+/).filter(t => t.length >= 2)
    if (searchTerms.length === 0) return []

    // Filtre et score les résultats
    const results = allSearchableItems.value
      .filter(item => matchesSearch(searchTerms, [
        item.title,
        item.subtitle,
        item.description || ''
      ]))
      .map(item => ({
        ...item,
        score: calculateScore(searchTerms, [
          { text: item.title, weight: 3 },
          { text: item.subtitle, weight: 1 },
          { text: item.description || '', weight: 1 }
        ])
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)

    return results
  }

  // Suggestions populaires
  const popularSuggestions = computed(() => [
    { title: 'Masters', icon: 'fa-solid fa-graduation-cap', route: '/formations/masters' },
    { title: 'Candidatures', icon: 'fa-solid fa-bullhorn', route: '/actualites/appels' },
    { title: 'Événements', icon: 'fa-solid fa-calendar-days', route: '/actualites/evenements' },
    { title: 'Alumni', icon: 'fa-solid fa-user-graduate', route: '/alumni' },
    { title: 'Campus', icon: 'fa-solid fa-building-columns', route: '/site' }
  ])

  return {
    search,
    allSearchableItems,
    popularSuggestions
  }
}
