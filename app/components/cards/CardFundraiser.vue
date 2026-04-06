<script setup lang="ts">
import type { FundraiserDisplay } from '~/types/fundraising'
import { fundraiserStatusColors } from '~/types/fundraising'

const props = defineProps<{
  fundraiser: FundraiserDisplay
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { formatCurrency } = usePublicFundraisingApi()

// Images mock de couverture
const mockCoverImages = [
  '/images/bg/bg_stats_section.jpeg',
  '/images/bg/covers_image.jpg',
  '/images/bg/bg_mission_section.jpeg',
  '/images/bg/backgroud_senghor1.jpg',
  '/images/bg/backgroud_senghor3.jpg',
  '/images/bg/backgroud_senghor2.jpg',
  '/images/bg/people-bg-1.jpg',
  '/images/bg/backgroud_senghor4.jpg',
]

// Image de couverture : réelle ou mock basée sur l'id
const coverImage = computed(() => {
  if (props.fundraiser.coverImageUrl) return props.fundraiser.coverImageUrl
  const index = props.fundraiser.id.charCodeAt(0) % mockCoverImages.length
  return mockCoverImages[index]
})

// Descriptions mock pour les campagnes sans description
const mockDescriptions = [
  'Cette campagne vise à soutenir le développement des infrastructures universitaires et à offrir de meilleures conditions d\'apprentissage aux étudiants de l\'Université Senghor, contribuant ainsi à l\'excellence académique en Afrique francophone.',
  'Un projet ambitieux pour renforcer les capacités de recherche et d\'innovation au sein de notre université, en dotant nos laboratoires d\'équipements modernes et en favorisant les partenariats scientifiques internationaux.',
  'Participez au financement de bourses d\'études pour les étudiants méritants issus de milieux défavorisés. Chaque contribution permet d\'ouvrir les portes du savoir et de former les leaders de demain sur le continent africain.',
  'Soutenez la modernisation de notre bibliothèque universitaire et la création d\'espaces numériques dédiés à l\'apprentissage collaboratif, essentiels pour accompagner la transformation digitale de l\'enseignement supérieur.',
  'Cette levée de fonds accompagne le programme de coopération Sud-Sud, permettant des échanges académiques entre universités africaines et le partage de bonnes pratiques en matière de gouvernance et de développement durable.',
]

// Extrait texte de la description HTML ou mock
const descriptionExcerpt = computed(() => {
  const html = props.fundraiser.descriptionHtml
  if (html) {
    const text = html.replace(/<[^>]*>/g, '').trim()
    if (text) return text
  }
  // Fallback mock basé sur l'id
  const index = props.fundraiser.id.charCodeAt(0) % mockDescriptions.length
  return mockDescriptions[index]
})

// Cap visual bar at 100%
const visualPercentage = computed(() => Math.min(props.fundraiser.progressPercentage, 100))

// Currency locale
const currencyLocale = computed(() => {
  if (locale.value === 'ar') return 'ar-EG'
  if (locale.value === 'en') return 'en-US'
  return 'fr-FR'
})

// Status badge
const statusLabel = computed(() => t(`leveesDeFonds.status.${props.fundraiser.status}`))
const statusClasses = computed(() => fundraiserStatusColors[props.fundraiser.status])

// Campaign link
const campaignLink = computed(() =>
  localePath(`/levees-de-fonds/${props.fundraiser.slug}`),
)
</script>

<template>
  <NuxtLink
    :to="campaignLink"
    class="group flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
  >
    <!-- Cover image avec fort dégradé -->
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        :src="coverImage"
        :alt="fundraiser.title"
        class="h-full w-full object-cover brightness-75 saturate-[0.7] transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      >

      <!-- Fort dégradé du bas vers le haut -->
      <div class="absolute inset-0 bg-gradient-to-t from-white via-white/80 via-40% to-transparent dark:from-gray-800 dark:via-gray-800/80" />

      <!-- Status badge -->
      <span
        class="absolute top-3 rounded-full px-3 py-1 text-xs font-medium ltr:right-3 rtl:left-3"
        :class="statusClasses"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-5">
      <!-- Title -->
      <h3 class="mb-2 line-clamp-2 font-bold text-gray-900 transition-colors duration-200 group-hover:text-brand-blue-600 rtl:text-right dark:text-white dark:group-hover:text-brand-blue-400">
        {{ fundraiser.title }}
      </h3>

      <!-- Description excerpt -->
      <p
        v-if="descriptionExcerpt"
        class="mb-3 line-clamp-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400"
      >
        {{ descriptionExcerpt }}
      </p>

      <!-- Mini progress bar -->
      <div class="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 rtl:bg-gradient-to-l"
          :style="{ width: `${visualPercentage}%` }"
        />
      </div>

      <!-- Amounts -->
      <div class="mb-3 flex items-center justify-between text-sm rtl:flex-row-reverse">
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ formatCurrency(fundraiser.totalRaised, currencyLocale) }}
        </span>
        <span class="text-gray-500 dark:text-gray-400">
          / {{ formatCurrency(fundraiser.goalAmount, currencyLocale) }}
        </span>
      </div>

      <!-- Footer: contributors count + percentage -->
      <div class="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 rtl:flex-row-reverse dark:border-gray-700 dark:text-gray-400">
        <span class="flex items-center gap-1.5">
          <font-awesome-icon icon="fa-solid fa-users" class="h-3.5 w-3.5" />
          {{ fundraiser.contributorCount }}
          {{ t('leveesDeFonds.list.contributors', fundraiser.contributorCount) }}
        </span>
        <span class="font-semibold text-emerald-600 dark:text-emerald-400">
          {{ fundraiser.progressPercentage.toFixed(0) }}%
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
