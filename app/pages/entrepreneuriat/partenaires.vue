<script setup lang="ts">
/**
 * « Nos partenaires » du mini-site PEI : partenaires filtrables par famille (style de /a-propos/partenaires).
 * Spec : specs/024-pei-public-alumni-resources-news (US2).
 */
const { t } = useI18n()
const { listPartners } = usePublicEntrepreneurshipApi()

const page = await usePeiPage({ heroPrefix: 'partners', navKey: 'partners' })

const { data: familiesData } = await useAsyncData('pei-partners-page', () => listPartners().catch(() => []))

const families = computed(() => familiesData.value ?? [])
const hasPartners = computed(() => families.value.some(f => f.partners.length > 0))
// Description éditoriale de chaque famille (clés `entrepreneurship.partners.family.*.description`)
const familyDescriptions = computed(() => peiFamilyDescriptions(page.text))

page.applySeo()
</script>

<template>
  <div>
    <PageHero v-bind="page.hero.value" :breadcrumb="page.breadcrumb.value" />

    <EntrepreneurshipSubNav />

    <section class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-950 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EntrepreneurshipPartnerFamilies v-if="hasPartners" variant="detailed" :families="families" :descriptions="familyDescriptions" />

        <EntrepreneurshipEmptyState
          v-else
          icon="fa-solid fa-handshake"
          :title="t('pei.partners.empty.title')"
          :description="t('pei.partners.empty.description')"
          to="/entrepreneuriat"
          :link-label="t('pei.common.backHome')"
        />
      </div>
    </section>
  </div>
</template>
