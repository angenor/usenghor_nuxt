/**
 * Composable de recherche globale pour le front-office
 * Agrège toutes les sources de données (API backend) et fournit une recherche flexible
 */

import type { ProgramPublic } from '~/composables/usePublicProgramsApi'
import type { EventPublic } from '~/composables/usePublicEventsApi'
import type { ApplicationCallPublic } from '~/types/api'
import type { NewsDisplay } from '~/types/news'

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

// Extrait le texte brut d'un contenu EditorJS (JSON)
function extractTextFromEditorJS(content: string | null | undefined): string {
  if (!content) return ''

  // Si c'est déjà du texte simple (pas de JSON)
  if (!content.trim().startsWith('{')) {
    return content
  }

  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: { type: string; data: { text?: string; items?: Array<{ content?: string }> } }) => {
          // Paragraphes et headers
          if (block.data?.text) {
            return block.data.text.replace(/<[^>]*>/g, '') // Supprimer les balises HTML
          }
          // Listes
          if (block.data?.items) {
            return block.data.items
              .map((item: { content?: string }) => item.content || '')
              .join(' ')
          }
          return ''
        })
        .filter(Boolean)
        .join(' ')
        .trim()
    }
  } catch {
    // Si le parsing échoue, retourner tel quel ou vide
    return content.startsWith('{') ? '' : content
  }
  return ''
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

// Icônes par type de formation (correspond aux types backend)
const formationIcons: Record<string, string> = {
  master: 'fa-solid fa-graduation-cap',
  doctorate: 'fa-solid fa-book-open',
  university_diploma: 'fa-solid fa-award',
  certificate: 'fa-solid fa-certificate'
}

// Mapping des types de programme vers les slugs URL
const programTypeToUrlSlug: Record<string, string> = {
  master: 'masters',
  doctorate: 'doctorats',
  university_diploma: 'diplomes-universitaires',
  certificate: 'certifiantes'
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

// Labels de durée par type
const programTypeDurationLabels: Record<string, string> = {
  master: '2 ans',
  doctorate: '3-4 ans',
  university_diploma: '6 mois',
  certificate: '3 mois'
}

export function useGlobalSearch() {
  // State pour stocker les données chargées depuis les APIs
  const programs = ref<ProgramPublic[]>([])
  const events = ref<EventPublic[]>([])
  const calls = ref<ApplicationCallPublic[]>([])
  const news = ref<NewsDisplay[]>([])
  const isLoaded = ref(false)
  const isLoading = ref(false)

  // Charger les données depuis les APIs backend
  async function loadSearchData() {
    if (isLoaded.value || isLoading.value) return

    isLoading.value = true

    try {
      const { listPrograms } = usePublicProgramsApi()
      const { getAllPublishedEvents } = usePublicEventsApi()
      const { listCalls } = usePublicCallsApi()
      const { getAllPublishedNews } = usePublicNewsApi()

      // Charger toutes les données en parallèle
      const [programsData, eventsData, callsData, newsData] = await Promise.all([
        listPrograms({ limit: 100 }).catch(() => ({ items: [] })),
        getAllPublishedEvents(100).catch(() => []),
        listCalls({ limit: 100 }).catch(() => ({ items: [] })),
        getAllPublishedNews({ limit: 100 }).catch(() => [])
      ])

      programs.value = programsData.items || []
      events.value = eventsData || []
      calls.value = callsData.items || []
      news.value = newsData || []
      isLoaded.value = true
    } catch (error) {
      console.error('[GlobalSearch] Erreur lors du chargement des données:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Construit tous les résultats searchables
  const allSearchableItems = computed<SearchResult[]>(() => {
    const items: SearchResult[] = []

    // 1. Formations (programmes) depuis l'API
    for (const program of programs.value) {
      const typeSlug = programTypeToUrlSlug[program.type] || 'masters'
      const duration = program.duration_months
        ? `${Math.floor(program.duration_months / 12)} an${program.duration_months >= 24 ? 's' : ''}`
        : programTypeDurationLabels[program.type] || ''

      items.push({
        id: program.id,
        type: 'formation',
        title: program.title,
        subtitle: `${typeLabels.formation} • ${duration}`,
        description: extractTextFromEditorJS(program.description) || program.subtitle || '',
        icon: formationIcons[program.type] || 'fa-solid fa-graduation-cap',
        route: `/formations/${typeSlug}/${program.slug}`,
        image: program.cover_image_external_id
          ? `https://picsum.photos/seed/${program.cover_image_external_id}/400/300`
          : undefined,
        score: 0
      })
    }

    // 2. Événements depuis l'API
    for (const event of events.value) {
      items.push({
        id: event.id,
        type: 'event',
        title: event.title,
        subtitle: `${typeLabels.event} • ${new Date(event.start_date).toLocaleDateString('fr-FR')}`,
        description: extractTextFromEditorJS(event.description),
        icon: eventIcons[event.type] || 'fa-solid fa-calendar-days',
        route: `/actualites/evenements/${event.slug}`,
        image: event.cover_image || undefined,
        date: event.start_date,
        score: 0
      })
    }

    // 3. Appels à candidatures depuis l'API
    for (const call of calls.value) {
      items.push({
        id: call.id,
        type: 'call',
        title: call.title,
        subtitle: `${typeLabels.call} • ${call.deadline ? `Date limite: ${new Date(call.deadline).toLocaleDateString('fr-FR')}` : 'En cours'}`,
        description: extractTextFromEditorJS(call.description),
        icon: callIcons[call.type] || 'fa-solid fa-bullhorn',
        route: `/actualites/appels/${call.slug}`,
        date: call.deadline || undefined,
        score: 0
      })
    }

    // 4. Actualités depuis l'API
    for (const newsItem of news.value) {
      items.push({
        id: newsItem.id,
        type: 'news',
        title: newsItem.title,
        subtitle: `${typeLabels.news} • ${new Date(newsItem.published_at || newsItem.created_at).toLocaleDateString('fr-FR')}`,
        description: extractTextFromEditorJS(newsItem.summary) || '',
        icon: 'fa-solid fa-newspaper',
        route: `/actualites/${newsItem.slug}`,
        image: newsItem.cover_image || undefined,
        date: newsItem.published_at || newsItem.created_at,
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
    loadSearchData,
    isLoaded,
    isLoading,
    allSearchableItems,
    popularSuggestions
  }
}
