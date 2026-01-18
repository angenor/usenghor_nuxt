<script setup lang="ts">
const { t } = useI18n()
const { conseilAdministration, getTextesFondateurs, getCAPresident } = useMockData()
const { paysBailleurs, egypte, northernFounders, africanFounders, laterMembers } = usePaysBailleursData()
const { selectedPays, openDrawer, closeDrawer } = useCountryDrawer()

// SEO
useSeoMeta({
  title: () => t('governance.title'),
  description: () => t('governance.subtitle'),
  ogTitle: () => t('governance.title'),
  ogDescription: () => t('governance.subtitle')
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('governance.badge') }
])

// Données
const foundingTexts = computed(() => getTextesFondateurs())
const president = computed(() => getCAPresident())
const members = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'membre')
)
const vicePresidents = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'vice_president')
)
const observers = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'observateur')
)
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero
      :title="t('governance.badge')"
      :subtitle="t('governance.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Section 1: Textes Fondateurs -->
    <GovernanceFoundingTextsSection :documents="foundingTexts" />

    <!-- Section 2: Pays Bailleurs -->
    <GovernanceDonorCountriesSection
      :pays-bailleurs="paysBailleurs"
      :egypte="egypte"
      :northern-founders="northernFounders"
      :african-founders="africanFounders"
      @open-drawer="openDrawer"
    />

    <!-- Section 3: Chronologie des adhésions -->
    <GovernanceChronologyMapSection
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
    />
  </div>
</template>
