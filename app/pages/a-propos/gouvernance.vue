<script setup lang="ts">
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'
import type { MediaRead } from '~/types/api/media'

interface FoundingDocument {
  id: string
  title_fr: string
  description_fr?: string
  file_url: string
  file_size?: number
  year?: number
  cover_image?: string
  document_category?: string
  sort_order?: number
}

const { t, locale } = useI18n()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()
const { conseilAdministration, getCAPresident } = useMockData()
const {
  laterMembers,
  paysBailleurs: mockPaysBailleurs,
  egypte: mockEgypte,
  northernFounders: mockNorthernFounders,
  africanFounders: mockAfricanFounders,
} = usePaysBailleursData()
const { selectedPays, openDrawer, closeDrawer } = useCountryDrawer()
const { getAlbumBySlug } = usePublicAlbumsApi()

// Contenus éditoriaux avec fallback i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('governance')

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-governance', () => loadContent())

// Chargement SSR de l'album « gouvernance » (textes fondateurs)
const { data: foundingAlbum } = await useAsyncData(
  'public-album-gouvernance',
  async () => {
    try {
      return await getAlbumBySlug('gouvernance')
    }
    catch {
      return null
    }
  },
)

// Map id → MediaRead pour retrouver le média complet à l'ouverture du modal
const foundingMediaById = computed(() => {
  const map = new Map<string, MediaRead>()
  for (const m of foundingAlbum.value?.media_items ?? []) {
    map.set(m.id, m)
  }
  return map
})

function mapMediaToFoundingDocument(m: MediaRead, index: number): FoundingDocument {
  const yearRaw = m.credits ? Number.parseInt(m.credits, 10) : NaN
  return {
    id: m.id,
    title_fr: m.name,
    description_fr: m.description ?? undefined,
    file_url: m.url,
    file_size: m.size_bytes ?? undefined,
    year: Number.isFinite(yearRaw) ? yearRaw : undefined,
    cover_image: m.thumbnail_url ?? undefined,
    sort_order: index,
  }
}

const foundingDocuments = computed<FoundingDocument[]>(() =>
  (foundingAlbum.value?.media_items ?? []).map((m, i) => mapMediaToFoundingDocument(m, i)),
)

// Modal de prévisualisation
const selectedMedia = ref<MediaRead | null>(null)

function onPreview(doc: FoundingDocument) {
  selectedMedia.value = foundingMediaById.value.get(doc.id) ?? null
}

function closePreview() {
  selectedMedia.value = null
}

// SEO
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }
useSeoMeta({
  title: () => getContent('governance.title'),
  description: () => getContent('governance.subtitle'),
  ogTitle: () => getContent('governance.title'),
  ogDescription: () => getContent('governance.subtitle'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: getContent('governance.badge') },
])

// Pays fondateurs : éditorial avec fallback sur mock data
const paysBailleurs = computed<PaysBailleur[]>(() => {
  const rawCountries = getRawContent('governance.donorCountries.countries')
  if (rawCountries) {
    try {
      const parsed = JSON.parse(rawCountries)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((p: PaysBailleur) => p.is_active)
      }
    }
    catch {
      // JSON invalide
    }
  }
  return mockPaysBailleurs.value
})

const egypte = computed(() => paysBailleurs.value.find(p => p.code === 'EG') ?? mockEgypte.value)
const northernFounders = computed(() => {
  const filtered = paysBailleurs.value.filter(p => p.code !== 'EG')
  return filtered.length > 0 ? filtered : mockNorthernFounders.value
})
const africanFounders = computed<PaysBailleur[]>(() => mockAfricanFounders.value)

// Titre et description des sections (éditorial avec fallback i18n)
const foundingTextsTitle = computed(() => getContent('governance.foundingTexts.title'))
const foundingTextsDescription = computed(() => getContent('governance.foundingTexts.description'))
const donorCountriesTitle = computed(() => getContent('governance.donorCountries.title'))
const donorCountriesDescription = computed(() => getContent('governance.donorCountries.description'))
const boardTitle = computed(() => getContent('governance.board.title'))
const boardDescription = computed(() => getContent('governance.board.description'))

// Conseil d'Administration
const president = computed(() => getCAPresident())
const members = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'membre'),
)
const vicePresidents = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'vice_president'),
)
const observers = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'observateur'),
)
</script>

<template>
  <div class="bg-grid-pattern">
    <!-- Hero -->
    <PageHero
      :title="getContent('governance.badge')"
      :subtitle="getContent('governance.subtitle')"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Section 1: Textes Fondateurs -->
    <GovernanceFoundingTextsSection
      :documents="foundingDocuments"
      :title="foundingTextsTitle"
      :description="foundingTextsDescription"
      @preview="onPreview"
    />

    <!-- Modal de prévisualisation des documents fondateurs -->
    <MediaFilePreviewModal
      v-if="selectedMedia"
      :media="selectedMedia"
      @close="closePreview"
    />

    <!-- Section 2: Pays Bailleurs -->
    <GovernanceDonorCountriesSection
      :pays-bailleurs="paysBailleurs"
      :egypte="egypte"
      :northern-founders="northernFounders"
      :african-founders="africanFounders"
      :title="donorCountriesTitle"
      :description="donorCountriesDescription"
      @open-drawer="openDrawer"
    />

    <!-- Section 3: Chronologie des adhésions (masquée si aucun pays ultérieur) -->
    <GovernanceChronologyMapSection
      v-if="laterMembers.length > 0"
      :countries="laterMembers"
      @open-drawer="openDrawer"
    />

    <!-- Drawer latéral pour détails pays -->
    <GovernanceCountryDrawer
      :pays="selectedPays"
      @close="closeDrawer"
    />

    <!-- Section 4: Conseil d'Administration -->
    <!-- <GovernanceBoardSection
      :president="president"
      :vice-presidents="vicePresidents"
      :members="members"
      :observers="observers"
      :title="boardTitle"
      :description="boardDescription"
    /> -->
  </div>
</template>
