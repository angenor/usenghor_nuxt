<script setup lang="ts">
/** Partenaires du pôle regroupés par famille (ordre fixe, familles vides masquées). */
import type { PeiPartnerFamily, PeiPartnerFamilyPublic } from '~/types/api/entrepreneurship'

const props = defineProps<{
  families: PeiPartnerFamilyPublic[]
}>()

const { t } = useI18n()

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
  <div v-if="visible.length" class="grid gap-6 md:grid-cols-3">
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
