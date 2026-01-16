<script setup lang="ts">
import type { Project } from '~/composables/useMockData'
import { getFlagEmoji } from '@bank/mock-data/projets'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (locale.value === 'en') return props.project.title_en
  if (locale.value === 'ar') return props.project.title_ar
  return props.project.title_fr
})

const getLocalizedDescription = computed(() => {
  if (locale.value === 'en') return props.project.description_en
  if (locale.value === 'ar') return props.project.description_ar
  return props.project.description_fr
})

const getLocalizedContent = computed(() => {
  if (locale.value === 'en') return props.project.content_en
  if (locale.value === 'ar') return props.project.content_ar
  return props.project.content_fr
})

// Format dates
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { month: 'long', year: 'numeric' }
  )
}

// Period string
const periodString = computed(() => {
  const start = formatDate(props.project.start_date)
  if (props.project.end_date) {
    return `${start} - ${formatDate(props.project.end_date)}`
  }
  return `${start} - ${t('projets.detail.ongoing')}`
})

// Status badge classes
const statusClasses = computed(() => {
  switch (props.project.status) {
    case 'active':
      return 'bg-green-600 text-white'
    case 'completed':
      return 'bg-gray-600 text-white'
    case 'upcoming':
      return 'bg-blue-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
})

// Render markdown content
const renderedContent = computed(() => {
  let content = getLocalizedContent.value

  // Process markdown in correct order
  content = content
    // Headers (order matters: h3 before h2)
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">$1</h2>')
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
    // List items
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 dark:text-gray-300 mb-1">$1</li>')
    // Wrap consecutive list items in ul
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside mb-4 space-y-1">$&</ul>')
    // Paragraphs (double newlines)
    .replace(/\n\n(?!<)/g, '</p><p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">')
    // Single newlines within paragraphs
    .replace(/\n(?!<)/g, '<br>')

  // Wrap in paragraph if doesn't start with a tag
  if (!content.startsWith('<')) {
    content = '<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">' + content + '</p>'
  }

  return content
})
</script>

<template>
  <div class="py-8">
    <!-- Cover Image with badges -->
    <div class="mb-8">
      <div class="relative h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-lg">
        <img
          :src="project.image"
          :alt="getLocalizedTitle"
          class="w-full h-full object-cover"
        />
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <!-- Badges on image -->
        <div class="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
          <!-- Category badge -->
          <span class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full shadow-lg backdrop-blur-sm">
            {{ t(`projets.categories.${project.category}`) }}
          </span>

          <!-- Status badge -->
          <span
            class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full shadow-lg backdrop-blur-sm"
            :class="statusClasses"
          >
            {{ t(`projets.status.${project.status}`) }}
          </span>

          <!-- Featured badge -->
          <span
            v-if="project.featured"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-brand-red-500 to-brand-red-600 text-white rounded-full shadow-lg"
          >
            <font-awesome-icon icon="fa-solid fa-star" class="w-4 h-4" />
            {{ t('projets.featured.badge') }}
          </span>
        </div>
      </div>

      <!-- Description -->
      <p class="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {{ getLocalizedDescription }}
      </p>
    </div>

    <!-- Info cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <!-- Period -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
          <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
          {{ t('projets.detail.period') }}
        </div>
        <div class="font-bold text-gray-900 dark:text-white text-sm">
          {{ periodString }}
        </div>
      </div>

      <!-- Countries -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
          <font-awesome-icon icon="fa-solid fa-globe" class="w-4 h-4" />
          {{ t('projets.detail.countries') }}
        </div>
        <div class="font-bold text-gray-900 dark:text-white text-sm">
          <template v-if="project.countries.length > 3">
            {{ project.countries.length }} pays
          </template>
          <template v-else>
            <span v-for="(country, idx) in project.countries" :key="country.code">
              <span v-if="country.code !== 'UN'">{{ getFlagEmoji(country.code) }}</span> {{ country.name }}<span v-if="idx < project.countries.length - 1">, </span>
            </span>
          </template>
        </div>
      </div>

      <!-- Budget -->
      <div v-if="project.budget" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
          <font-awesome-icon icon="fa-solid fa-euro-sign" class="w-4 h-4" />
          {{ t('projets.detail.budget') }}
        </div>
        <div class="font-bold text-gray-900 dark:text-white text-sm">
          {{ project.budget }}
        </div>
      </div>

      <!-- Beneficiaries -->
      <div v-if="project.beneficiaries" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
          <font-awesome-icon icon="fa-solid fa-users" class="w-4 h-4" />
          {{ t('projets.detail.beneficiaries') }}
        </div>
        <div class="font-bold text-gray-900 dark:text-white text-sm">
          {{ project.beneficiaries }}
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="prose prose-lg dark:prose-invert max-w-none mb-8">
      <div v-html="renderedContent"></div>
    </div>

    <!-- Gallery -->
    <div v-if="project.gallery && project.gallery.length > 0" class="mb-8">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-images" class="text-brand-blue-500" />
        {{ t('projets.detail.gallery') }}
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <img
          v-for="(img, index) in project.gallery"
          :key="index"
          :src="img"
          :alt="`${getLocalizedTitle} - ${index + 1}`"
          class="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          loading="lazy"
        >
      </div>
    </div>

    <!-- Countries list -->
    <div v-if="project.countries.length > 0" class="mb-8">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-globe-africa" class="text-brand-blue-500" />
        {{ t('projets.detail.countries') }}
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="country in project.countries"
          :key="country.code"
          class="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue-50 dark:bg-brand-blue-900/20 text-brand-blue-700 dark:text-brand-blue-400 rounded-full text-sm"
        >
          <span v-if="country.code !== 'UN'" class="text-lg">{{ getFlagEmoji(country.code) }}</span>
          <font-awesome-icon v-else icon="fa-solid fa-globe" class="w-4 h-4" />
          {{ country.name }}
        </span>
      </div>
    </div>

    <!-- Partners list -->
    <div v-if="project.partners && project.partners.length > 0" class="mb-8">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-handshake" class="text-brand-blue-500" />
        {{ t('projets.detail.partners') }}
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="partner in project.partners"
          :key="partner.name"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow"
        >
          <div class="w-16 h-16 mb-3 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              v-if="partner.logo"
              :src="partner.logo"
              :alt="partner.name"
              class="max-w-full max-h-full object-contain"
            />
            <font-awesome-icon
              v-else
              icon="fa-solid fa-building"
              class="w-8 h-8 text-gray-400"
            />
          </div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {{ partner.name }}
          </h4>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ partner.type === 'funding' ? t('projets.partenaires.funding') : partner.type === 'technical' ? t('projets.partenaires.technical') : t('projets.partenaires.institutional') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
