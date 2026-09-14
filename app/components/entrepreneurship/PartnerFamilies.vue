<script setup lang="ts">
/**
 * Partenaires du pôle regroupés par famille (ordre fixe, familles vides masquées).
 * Variante `logos` (accueil, par défaut) ou `detailed` (page « Nos partenaires » : logo, nom, description, site web).
 */
import type { PeiPartnerFamily, PeiPartnerFamilyPublic } from '~/types/api/entrepreneurship'

const props = withDefaults(defineProps<{
  families: PeiPartnerFamilyPublic[]
  variant?: 'logos' | 'detailed'
}>(), {
  variant: 'logos',
})

const { t } = useI18n()
const { localized } = useLocalizedField()

const badgeClasses: Record<PeiPartnerFamily, string> = {
  academic: 'bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900/40 dark:text-brand-blue-300',
  support: 'bg-brand-red-100 text-brand-red-700 dark:bg-brand-red-900/40 dark:text-brand-red-300',
  international: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
}

const visible = computed(() =>
  PEI_FAMILY_ORDER
    .map(family => props.families.find(f => f.family === family))
    .filter((f): f is PeiPartnerFamilyPublic => !!f && f.partners.length > 0),
)
</script>

<template>
  <div v-if="variant === 'detailed' && visible.length" class="space-y-16">
    <section
      v-for="family in visible"
      :key="family.family"
      :aria-labelledby="`pei-family-${family.family}`"
    >
      <span class="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" :class="badgeClasses[family.family]">
        {{ t('pei.partners.count', family.partners.length) }}
      </span>
      <h2 :id="`pei-family-${family.family}`" class="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {{ t(`pei.families.${family.family}`) }}
      </h2>
      <div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="partner in family.partners"
          :key="partner.id"
          class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col gap-4"
        >
          <div class="h-20 rounded-xl bg-white border border-gray-100 dark:border-gray-600 flex items-center justify-center p-3">
            <img
              v-if="partner.logo_url"
              :src="partner.logo_url"
              :alt="partner.name"
              class="max-h-16 max-w-full object-contain"
              loading="lazy"
            >
            <span v-else class="font-bold text-gray-700 text-center line-clamp-2 break-words" aria-hidden="true">{{ partner.name }}</span>
          </div>
          <h3 class="font-bold text-gray-900 dark:text-white break-words">
            {{ partner.name }}
          </h3>
          <p v-if="localized(partner, 'description')" class="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
            {{ localized(partner, 'description') }}
          </p>
          <a
            v-if="partner.website"
            :href="partner.website"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-auto inline-flex items-center gap-2 text-sm font-medium text-brand-blue-700 dark:text-brand-blue-300 hover:underline"
          >
            {{ t('pei.partners.visit') }}
            <span class="sr-only">{{ partner.name }} {{ t('pei.common.openInNewTab') }}</span>
            <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true" />
          </a>
        </article>
      </div>
    </section>
  </div>
  <div v-else-if="visible.length" class="grid gap-6 md:grid-cols-3">
    <div
      v-for="family in visible"
      :key="family.family"
      class="flex flex-col gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
    >
      <h3 class="self-start rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" :class="badgeClasses[family.family]">
        {{ t(`pei.families.${family.family}`) }}
      </h3>
      <ul class="grid grid-cols-2 gap-3">
        <li v-for="partner in family.partners" :key="partner.id">
          <component
            :is="partner.website ? 'a' : 'div'"
            :href="partner.website || undefined"
            :target="partner.website ? '_blank' : undefined"
            :rel="partner.website ? 'noopener noreferrer' : undefined"
            :title="partner.name"
            class="h-[72px] rounded-xl border border-gray-200 dark:border-gray-600 bg-white flex items-center justify-center p-3"
            :class="partner.website ? 'transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500' : ''"
          >
            <img
              v-if="partner.logo_url"
              :src="partner.logo_url"
              :alt="partner.name"
              class="max-h-12 max-w-full object-contain"
              loading="lazy"
            >
            <span v-else class="text-sm font-bold text-gray-700 text-center line-clamp-2 break-words">{{ partner.name }}</span>
          </component>
        </li>
      </ul>
    </div>
  </div>
</template>
