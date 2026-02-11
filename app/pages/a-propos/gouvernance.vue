<script setup lang="ts">
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'

const { t } = useI18n()
const { conseilAdministration, getCAPresident } = useMockData()
const { laterMembers } = usePaysBailleursData()
const { selectedPays, openDrawer, closeDrawer } = useCountryDrawer()

// Contenus éditoriaux avec fallback i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('governance')

onMounted(() => {
  loadContent()
})

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

// Pays fondateurs : éditorial uniquement, pas de fallback mock
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
  return []
})

const egypte = computed(() => paysBailleurs.value.find(p => p.code === 'EG'))
const northernFounders = computed(() => paysBailleurs.value.filter(p => p.code !== 'EG'))
const africanFounders = computed<PaysBailleur[]>(() => [])

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
  <div>
    <!-- Hero -->
    <PageHero
      :title="getContent('governance.badge')"
      :subtitle="getContent('governance.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
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
    <GovernanceBoardSection
      :president="president"
      :vice-presidents="vicePresidents"
      :members="members"
      :observers="observers"
      :title="boardTitle"
      :description="boardDescription"
    />
  </div>
</template>
