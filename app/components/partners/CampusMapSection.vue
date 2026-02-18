<script setup lang="ts">
import World from '@svg-maps/world'
import type { CampusPublic } from '~/composables/usePublicCampusApi'
import type { OutputData } from '@editorjs/editorjs'
import type { MapViewBox } from '~/composables/useMapSettings'
import { DEFAULT_VIEWBOX, DEFAULT_EXCLUDED_COUNTRIES } from '~/composables/useMapSettings'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  getAllCampuses,
  getCoverImageUrl,
  getCampusFlagEmoji,
  getFlagEmoji,
  getCampusLocation,
} = usePublicCampusApi()
const { loadMapSettings, viewBoxToString } = useMapSettings()

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: mapRef } = useScrollAnimation({ animation: 'fadeInLeft', threshold: 0.1 })
const { elementRef: campusButtonsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

// === ÉTAT DE CHARGEMENT ===
const loading = ref(true)
const error = ref<string | null>(null)
const campusesData = ref<CampusPublic[]>([])

// Ref for the campus card to scroll to
const campusCardRef = ref<HTMLElement | null>(null)

// World map data
const map = World

// Configuration dynamique de la carte (chargée depuis l'API)
const mapViewBox = ref<MapViewBox>({ ...DEFAULT_VIEWBOX })
const excludedCountriesSet = ref<Set<string>>(new Set(DEFAULT_EXCLUDED_COUNTRIES))

// ViewBox string pour le SVG
const viewBoxString = computed(() => viewBoxToString(mapViewBox.value))

// Filtered map locations (sans les pays exclus)
const filteredLocations = computed(() => {
  return map.locations.filter(location => !excludedCountriesSet.value.has(location.id.toLowerCase()))
})

// === CHARGEMENT DES DONNÉES ===
onMounted(async () => {
  try {
    const [campusResult, settingsResult] = await Promise.all([
      getAllCampuses(),
      loadMapSettings(),
    ])
    campusesData.value = campusResult
    mapViewBox.value = settingsResult.viewBox
    excludedCountriesSet.value = new Set(settingsResult.excludedCountries)
  }
  catch (e) {
    console.error('Erreur chargement campus:', e)
    error.value = 'Erreur lors du chargement des campus'
  }
  finally {
    loading.value = false
  }
})

// Country names in French (ISO code -> French name)
const countryNamesFr: Record<string, string> = {
  af: 'Afghanistan', al: 'Albanie', dz: 'Algérie', ad: 'Andorre', ao: 'Angola',
  ag: 'Antigua-et-Barbuda', ar: 'Argentine', am: 'Arménie', au: 'Australie', at: 'Autriche',
  az: 'Azerbaïdjan', bs: 'Bahamas', bh: 'Bahreïn', bd: 'Bangladesh', bb: 'Barbade',
  by: 'Biélorussie', be: 'Belgique', bz: 'Belize', bj: 'Bénin', bt: 'Bhoutan',
  bo: 'Bolivie', ba: 'Bosnie-Herzégovine', bw: 'Botswana', br: 'Brésil', bn: 'Brunei',
  bg: 'Bulgarie', bf: 'Burkina Faso', bi: 'Burundi', kh: 'Cambodge', cm: 'Cameroun',
  ca: 'Canada', cv: 'Cap-Vert', cf: 'République centrafricaine', td: 'Tchad', cl: 'Chili',
  cn: 'Chine', co: 'Colombie', km: 'Comores', cg: 'Congo', cd: 'République Démocratique du Congo',
  cr: 'Costa Rica', ci: 'Côte d\'Ivoire', hr: 'Croatie', cu: 'Cuba', cy: 'Chypre',
  cz: 'Tchéquie', dk: 'Danemark', dj: 'Djibouti', dm: 'Dominique', 'do': 'République dominicaine',
  ec: 'Équateur', eg: 'Égypte', sv: 'Salvador', gq: 'Guinée équatoriale', er: 'Érythrée',
  ee: 'Estonie', sz: 'Eswatini', et: 'Éthiopie', fj: 'Fidji', fi: 'Finlande',
  fr: 'France', ga: 'Gabon', gm: 'Gambie', ge: 'Géorgie', de: 'Allemagne',
  gh: 'Ghana', gr: 'Grèce', gd: 'Grenade', gt: 'Guatemala', gn: 'Guinée',
  gw: 'Guinée-Bissau', gy: 'Guyana', ht: 'Haïti', hn: 'Honduras', hu: 'Hongrie',
  is: 'Islande', 'in': 'Inde', id: 'Indonésie', ir: 'Iran', iq: 'Irak',
  ie: 'Irlande', il: 'Israël', it: 'Italie', jm: 'Jamaïque', jp: 'Japon',
  jo: 'Jordanie', kz: 'Kazakhstan', ke: 'Kenya', ki: 'Kiribati', kp: 'Corée du Nord',
  kr: 'Corée du Sud', kw: 'Koweït', kg: 'Kirghizistan', la: 'Laos', lv: 'Lettonie',
  lb: 'Liban', ls: 'Lesotho', lr: 'Liberia', ly: 'Libye', li: 'Liechtenstein',
  lt: 'Lituanie', lu: 'Luxembourg', mg: 'Madagascar', mw: 'Malawi', my: 'Malaisie',
  mv: 'Maldives', ml: 'Mali', mt: 'Malte', mh: 'Îles Marshall', mr: 'Mauritanie',
  mu: 'Maurice', mx: 'Mexique', fm: 'Micronésie', md: 'Moldavie', mc: 'Monaco',
  mn: 'Mongolie', me: 'Monténégro', ma: 'Maroc', mz: 'Mozambique', mm: 'Myanmar',
  na: 'Namibie', nr: 'Nauru', np: 'Népal', nl: 'Pays-Bas', nz: 'Nouvelle-Zélande',
  ni: 'Nicaragua', ne: 'Niger', ng: 'Nigeria', mk: 'Macédoine du Nord', no: 'Norvège',
  om: 'Oman', pk: 'Pakistan', pw: 'Palaos', ps: 'Palestine', pa: 'Panama',
  pg: 'Papouasie-Nouvelle-Guinée', py: 'Paraguay', pe: 'Pérou', ph: 'Philippines', pl: 'Pologne',
  pt: 'Portugal', qa: 'Qatar', ro: 'Roumanie', ru: 'Russie', rw: 'Rwanda',
  kn: 'Saint-Kitts-et-Nevis', lc: 'Sainte-Lucie', vc: 'Saint-Vincent-et-les-Grenadines',
  ws: 'Samoa', sm: 'Saint-Marin', st: 'Sao Tomé-et-Príncipe', sa: 'Arabie saoudite',
  sn: 'Sénégal', rs: 'Serbie', sc: 'Seychelles', sl: 'Sierra Leone', sg: 'Singapour',
  sk: 'Slovaquie', si: 'Slovénie', sb: 'Îles Salomon', so: 'Somalie', za: 'Afrique du Sud',
  ss: 'Soudan du Sud', es: 'Espagne', lk: 'Sri Lanka', sd: 'Soudan', sr: 'Suriname',
  se: 'Suède', ch: 'Suisse', sy: 'Syrie', tw: 'Taïwan', tj: 'Tadjikistan',
  tz: 'Tanzanie', th: 'Thaïlande', tl: 'Timor oriental', tg: 'Togo', to: 'Tonga',
  tt: 'Trinité-et-Tobago', tn: 'Tunisie', tr: 'Turquie', tm: 'Turkménistan', tv: 'Tuvalu',
  ug: 'Ouganda', ua: 'Ukraine', ae: 'Émirats arabes unis', gb: 'Royaume-Uni', us: 'États-Unis',
  uy: 'Uruguay', uz: 'Ouzbékistan', vu: 'Vanuatu', va: 'Vatican', ve: 'Venezuela',
  vn: 'Vietnam', ye: 'Yémen', zm: 'Zambie', zw: 'Zimbabwe',
  xk: 'Kosovo', eh: 'Sahara occidental', nc: 'Nouvelle-Calédonie', gf: 'Guyane française',
  pf: 'Polynésie française', re: 'La Réunion', gp: 'Guadeloupe', mq: 'Martinique'
}

// Get country name based on locale
const getCountryName = (id: string, englishName: string): string => {
  if (locale.value === 'fr') {
    return countryNamesFr[id.toLowerCase()] || englishName
  }
  return englishName
}

// Hovered country state
const hovered = ref<{ id: string; name: string } | null>(null)

// Mouse position for tooltip
const mousePosition = ref({ x: 0, y: 0 })

// Handle mouse move on map
const handleMouseMove = (event: MouseEvent) => {
  const container = event.currentTarget as HTMLElement
  const rect = container.getBoundingClientRect()
  mousePosition.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

// Interface unifiée pour l'affichage des campus (API + siège)
interface CampusItem {
  id: string
  code: string
  name: string
  city: string | null
  country_iso_code: string | null
  country_name: string | null
  description: string | null
  image: string | null
  is_headquarters: boolean
}

// Transformer CampusPublic en CampusItem
const transformCampus = (campus: CampusPublic): CampusItem => ({
  id: campus.id,
  code: campus.code,
  name: campus.name,
  city: campus.city,
  country_iso_code: campus.country_iso_code,
  country_name: campus.country_name_fr,
  description: campus.description,
  image: getCoverImageUrl(campus),
  is_headquarters: campus.is_headquarters,
})

// Tous les campus (siège + externalisés)
const allCampuses = computed<CampusItem[]>(() => {
  return campusesData.value.map(transformCampus)
})

// Campus externalisés uniquement (pour les boutons - exclut le siège)
const externalCampusesOnly = computed(() => {
  return allCampuses.value.filter(c => !c.is_headquarters)
})

// Campus siège
const headquartersCampus = computed(() => {
  return allCampuses.value.find(c => c.is_headquarters) || null
})

// Campus sélectionné - Premier campus externalisé par défaut
const selectedCampus = ref<CampusItem | null>(null)

// Initialiser le campus sélectionné une fois les données chargées
watch(externalCampusesOnly, (campuses) => {
  if (campuses.length > 0 && !selectedCampus.value) {
    selectedCampus.value = campuses[0]
  }
}, { immediate: true })

// Construire les pays colorés depuis les données des campus
const coloredCountries = computed(() => {
  const countries: Record<string, { color: string; type: string; code?: string }> = {}

  campusesData.value.forEach((campus) => {
    if (campus.country_iso_code) {
      const isoLower = campus.country_iso_code.toLowerCase()
      countries[isoLower] = {
        color: campus.is_headquarters ? '#2b4bbf' : '#f32525',
        type: campus.is_headquarters ? 'headquarters' : 'campus',
        code: campus.code,
      }
    }
  })

  return countries
})

// Default color for non-highlighted countries
const defaultColor = '#e5e7eb'

// Selected color (green)
const selectedColor = '#22c55e'

// Adjust brightness for hover effect
const adjustBrightness = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`
}

// Get color for a country
const getColor = (id: string): string => {
  const isHovered = hovered.value?.id === id
  const isSelected = selectedCampus.value?.country_iso_code?.toLowerCase() === id
  const countryData = coloredCountries.value[id]

  if (countryData) {
    if (isSelected) {
      return isHovered ? adjustBrightness(selectedColor, -15) : selectedColor
    }
    if (isHovered) {
      return adjustBrightness(countryData.color, -15)
    }
    return countryData.color
  }

  if (isHovered) {
    return '#bdbdbd'
  }

  return defaultColor
}

// Get campus for a country
const getCampusForCountry = (countryId: string) => {
  return allCampuses.value.find(c => c.country_iso_code?.toLowerCase() === countryId)
}

// Computed property for hovered campus
const hoveredCampus = computed(() => {
  if (!hovered.value) return null
  return getCampusForCountry(hovered.value.id)
})

// Scroll to campus card
const scrollToCampusCard = () => {
  nextTick(() => {
    if (campusCardRef.value) {
      campusCardRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })
}

// Handle country click
const handleCountryClick = (location: { id: string }) => {
  const campus = getCampusForCountry(location.id)
  if (campus) {
    selectedCampus.value = campus
    scrollToCampusCard()
  }
}

// Handle tooltip click
const handleTooltipClick = () => {
  if (hovered.value) {
    const campus = getCampusForCountry(hovered.value.id)
    if (campus) {
      selectedCampus.value = campus
      scrollToCampusCard()
    }
  }
}

// Helper pour obtenir le nom du campus
const getCampusName = (campus: CampusItem): string => {
  return campus.name || ''
}

// Helper pour obtenir la localisation du campus
const getCampusLocationText = (campus: CampusItem): string => {
  const parts: string[] = []
  if (campus.city) parts.push(campus.city)
  if (campus.country_name) parts.push(campus.country_name)
  return parts.join(', ')
}

// Convertir une string (potentiellement JSON ou texte brut) en OutputData
const parseEditorContent = (content: string | null | undefined): OutputData | undefined => {
  if (!content) return undefined
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: content } }],
        version: '2.28.0'
      }
    }
  }
  return undefined
}

// Helper pour obtenir la description du campus parsée
const getCampusDescriptionData = (campus: CampusItem): OutputData | undefined => {
  return parseEditorContent(campus.description)
}

// Fallback image handler
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop'
}
</script>

<template>
  <section id="campus-externalises" class="relative py-16 lg:py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-visible">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-blue-50/50 via-transparent to-brand-red-50/30 dark:from-brand-blue-900/10 dark:via-transparent dark:to-brand-red-900/10"></div>
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue-200/20 dark:bg-brand-blue-500/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute bottom-0 -left-40 w-80 h-80 bg-brand-red-200/20 dark:bg-brand-red-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div ref="headerRef" class="text-center mb-12 lg:mb-16">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-globe-africa" class="w-3.5 h-3.5 mr-2" />
          {{ t('partners.campus.badge') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="relative inline-block">
            {{ t('partners.campus.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('partners.campus.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Content (when loaded) -->
      <template v-else>
        <!-- Legend -->
        <div class="flex flex-wrap justify-center gap-4 lg:gap-6 mb-8">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-brand-blue-500"></span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('partners.campus.headquarters') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-brand-red-500"></span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('partners.campus.externalCampus') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-green-500"></span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('partners.campus.selected') }}</span>
          </div>
        </div>

        <!-- Campus Name Cards -->
        <div ref="campusButtonsRef" class="mb-12">
          <div class="flex flex-wrap justify-center gap-3">
            <button
              v-for="campus in externalCampusesOnly"
              :key="campus.id"
              class="group relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border"
              :class="selectedCampus?.id === campus.id
                ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-lg shadow-brand-blue-500/25'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:shadow-md'"
              @click="selectedCampus = campus; scrollToCampusCard()"
            >
              <span class="ltr:mr-1.5 rtl:ml-1.5">{{ getFlagEmoji(campus.country_iso_code) }}</span>
              {{ campus.country_name || campus.city }}
            </button>
          </div>
        </div>

        <!-- Map and Card Container -->
        <div ref="mapRef" class="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-0">
          <!-- Map Container -->
          <div class="relative flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl ltr:lg:mr-[-80px] rtl:lg:ml-[-80px] z-10 overflow-hidden">
            <!-- Map -->
            <div class="map-container relative" @mousemove="handleMouseMove">
              <!-- ViewBox ajusté pour afficher Europe, Afrique, Asie, Océanie (sans Amériques) -->
              <svg
                :viewBox="viewBoxString"
                class="world-map w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  v-for="location in filteredLocations"
                  :key="location.id"
                  :d="location.path"
                  :fill="getColor(location.id)"
                  stroke="#fff"
                  stroke-width="0.5"
                  class="map-path"
                  :class="{ 'cursor-pointer': coloredCountries[location.id] }"
                  @mouseenter="hovered = location"
                  @mouseleave="hovered = null"
                  @click="handleCountryClick(location)"
                />
              </svg>

              <!-- Tooltip -->
              <Transition name="fade">
                <div
                  v-if="hovered"
                  class="tooltip"
                  :class="{ 'tooltip-clickable': hoveredCampus }"
                  :style="{
                    left: mousePosition.x + 15 + 'px',
                    top: mousePosition.y - 10 + 'px'
                  }"
                  @click.stop="handleTooltipClick"
                >
                  <template v-if="hoveredCampus">
                    <span class="tooltip-campus-name">{{ getCampusName(hoveredCampus) }}</span>
                    <span class="tooltip-hint">{{ locale === 'ar' ? 'انقر للعرض' : locale === 'en' ? 'Click to view' : 'Cliquer pour voir' }}</span>
                  </template>
                  <template v-else>
                    {{ getCountryName(hovered.id, hovered.name) }}
                  </template>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Campus Card -->
          <div v-if="selectedCampus" ref="campusCardRef" class="lg:w-[400px] lg:flex-shrink-0 z-20">
            <Transition
              mode="out-in"
              enter-active-class="animate__animated animate__fadeInRight animate__faster"
              leave-active-class="animate__animated animate__fadeOutRight animate__faster"
            >
              <div :key="selectedCampus.id" class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <!-- Image -->
                <div class="relative h-52 overflow-hidden">
                  <img
                    :src="selectedCampus.image || `https://picsum.photos/seed/${selectedCampus.id}/600/400`"
                    :alt="getCampusName(selectedCampus)"
                    class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    @error="handleImageError"
                  />
                  <!-- Gradient Overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <!-- Badge -->
                  <div
                    class="absolute top-4 ltr:left-4 rtl:right-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                    :class="selectedCampus.is_headquarters ? 'bg-brand-blue-500/90' : 'bg-brand-red-500/90'"
                  >
                    {{ selectedCampus.is_headquarters ? t('partners.campus.headquarters') : t('partners.campus.externalCampus') }}
                  </div>
                  <!-- Location on image -->
                  <div class="absolute bottom-4 ltr:left-4 rtl:right-4 flex items-center text-white text-sm">
                    <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />
                    {{ getCampusLocationText(selectedCampus) }}
                  </div>
                </div>

                <!-- Content -->
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {{ getCampusName(selectedCampus) }}
                  </h3>
                  <div v-if="getCampusDescriptionData(selectedCampus)" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                    <EditorJSRenderer :data="getCampusDescriptionData(selectedCampus)" />
                  </div>

                  <!-- CTA -->
                  <NuxtLink
                    v-if="selectedCampus.is_headquarters"
                    :to="localePath('/site')"
                    class="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:from-brand-blue-600 hover:to-brand-blue-700 hover:shadow-lg hover:shadow-brand-blue-500/25"
                  >
                    {{ t('partners.campus.viewDetails') }}
                    <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180 transition-transform group-hover:translate-x-1" />
                  </NuxtLink>
                  <NuxtLink
                    v-else
                    :to="localePath(`/a-propos/partenaires/campus/${selectedCampus.code.toLowerCase()}`) + '#calls'"
                    class="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:from-brand-blue-600 hover:to-brand-blue-700 hover:shadow-lg hover:shadow-brand-blue-500/25"
                  >
                    {{ t('partners.campus.viewDetails') }}
                    <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180 transition-transform group-hover:translate-x-1" />
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
/* Map Container */
.map-container {
  position: relative;
  width: 100%;
}

.world-map {
  width: 100%;
  height: auto;
}

/* Map Path Styles */
.map-path {
  transition: fill 0.2s ease, opacity 0.2s ease;
}

.map-path:hover {
  opacity: 0.85;
}

/* Tooltip */
.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  pointer-events: none;
  z-index: 50;
  white-space: nowrap;
  transform: translateY(-50%);
}

.tooltip-clickable {
  pointer-events: auto;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  transition: all 0.2s ease;
}

.tooltip-clickable:hover {
  background: rgba(43, 75, 191, 0.95);
  transform: translateY(-50%) scale(1.05);
}

.tooltip-campus-name {
  font-weight: 600;
  font-size: 14px;
}

.tooltip-hint {
  font-size: 11px;
  opacity: 0.7;
  font-weight: 400;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Blob Animation */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 12s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

</style>
