<script setup lang="ts">
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'

const { t } = useI18n()
const { conseilAdministration, getCAPresident } = useMockData()
const {
  laterMembers,
  paysBailleurs: mockPaysBailleurs,
  egypte: mockEgypte,
  northernFounders: mockNorthernFounders,
  africanFounders: mockAfricanFounders,
} = usePaysBailleursData()
const { selectedPays, openDrawer, closeDrawer } = useCountryDrawer()

// Contenus éditoriaux avec fallback i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('governance')

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-governance', () => loadContent())

// SEO
useSeoMeta({
  title: () => getContent('governance.title'),
  description: () => getContent('governance.subtitle'),
  ogTitle: () => getContent('governance.title'),
  ogDescription: () => getContent('governance.subtitle'),
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: getContent('governance.badge') },
])

// Documents fondateurs : éditorial uniquement, pas de fallback mock
const foundingTexts = computed(() => {
  const rawDocs = getRawContent('governance.foundingTexts.documents')
  if (rawDocs) {
    try {
      const parsed = JSON.parse(rawDocs)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
    catch {
      // JSON invalide
    }
  }
  return []
})

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
      :documents="foundingTexts"
      :title="foundingTextsTitle"
      :description="foundingTextsDescription"
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
