<script setup lang="ts">
import type { CampusFormationRealisee } from '~/composables/useMockData'

interface Props {
  formation: CampusFormationRealisee
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

// Get localized title
const getLocalizedTitle = computed(() => {
  if (locale.value === 'en' && props.formation.title_en) {
    return props.formation.title_en
  }
  if (locale.value === 'ar' && props.formation.title_ar) {
    return props.formation.title_ar
  }
  return props.formation.title_fr
})

// Get localized description
const getLocalizedDescription = computed(() => {
  if (locale.value === 'en' && props.formation.description_en) {
    return props.formation.description_en
  }
  return props.formation.description_fr
})

// Type badge colors
const typeBgColors: Record<string, string> = {
  master: 'bg-indigo-500',
  du: 'bg-teal-500',
  certifiante: 'bg-rose-500'
}

// Type labels
const typeLabels: Record<string, string> = {
  master: 'Master',
  du: 'DU',
  certifiante: 'Certificat'
}
</script>

<template>
  <div
    class="blog-card group relative block w-full h-[380px] bg-cover bg-center bg-no-repeat overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    :style="{ backgroundImage: `url(${formation.image})` }"
  >
    <!-- Content mask (white area on left) - inline-block -->
    <div class="content-mask">
      <!-- Type badge -->
      <span
        class="inline-block px-3 py-1.5 text-xs font-semibold text-white rounded shadow-md tracking-wide my-4"
        :class="typeBgColors[formation.formation_type]"
      >
        {{ typeLabels[formation.formation_type] }}
      </span>

      <!-- Title -->
      <h3 class="text-xl lg:text-2xl font-extrabold text-gray-900 dark:text-gray-900 leading-tight mb-2 pb-1 border-b-2 border-gray-300">
        {{ getLocalizedTitle }}
      </h3>

      <!-- Description -->
      <p v-if="getLocalizedDescription" class="text-gray-700 text-sm lg:text-base leading-relaxed line-clamp-3 mt-2">
        {{ getLocalizedDescription }}
      </p>

      <!-- Promotion & Graduates info -->
      <div class="post-detail">
        <font-awesome-icon icon="fa-solid fa-calendar-check" class="inline-block w-4 h-4 mr-2 align-middle" />
        <span class="text-sm text-gray-600">{{ formation.promotion }}</span>
        <span class="mx-2 text-gray-400">•</span>
        <font-awesome-icon icon="fa-solid fa-user-graduate" class="inline-block w-4 h-4 mr-1 align-middle text-amber-500" />
        <span class="text-sm font-semibold text-gray-700">{{ formation.graduates_count }}</span>
        <span class="text-sm text-gray-600 ml-1">{{ t('partners.campus.formations.graduates') }}</span>
      </div>

      <!-- Partner logos -->
      <div v-if="formation.partner_logos && formation.partner_logos.length > 0" class="absolute bottom-4 left-8 flex items-center gap-2">
        <div
          v-for="(logo, index) in formation.partner_logos.slice(0, 4)"
          :key="index"
          class="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden shadow-md -ml-1 first:ml-0"
        >
          <img :src="logo" alt="Partenaire" class="w-full h-full object-contain p-1.5" loading="lazy">
        </div>
        <span v-if="formation.partner_logos.length > 4" class="text-xs text-gray-500 ml-1 font-medium">+{{ formation.partner_logos.length - 4 }}</span>
      </div>
    </div>

    <!-- Diagonal transition - inline-block next to content-mask -->
    <div class="horizontal" />
  </div>
</template>

<style scoped>
.blog-card {
  background-color: #444;
}

.content-mask {
  display: inline-block;
  background: rgba(255, 255, 255, 0.92);
  width: 61%;
  height: 100%;
  padding: 0.75em 0 0.75em 2em;
  overflow: hidden;
  vertical-align: top;
  position: relative;
}

.horizontal {
  display: inline-block;
  position: relative;
  background: linear-gradient(to top right, rgba(255, 255, 255, 0.92) 50%, transparent 50%);
  height: 101%;
  width: 20%;
  top: -0.5%;
  vertical-align: top;
}

.post-detail {
  color: rgba(0, 0, 0, 0.55);
  margin-top: 1.5rem;
  padding-left: 2px;
}

/* Dark mode */
.dark .content-mask {
  background: rgba(17, 24, 39, 0.92);
}

.dark .horizontal {
  background: linear-gradient(to top right, rgba(17, 24, 39, 0.92) 50%, transparent 50%);
}

.dark h3 {
  color: white;
}

.dark p {
  color: #d1d5db;
}

.dark .post-detail {
  color: rgba(255, 255, 255, 0.55);
}

.dark .post-detail span {
  color: #9ca3af;
}

/* Mobile: full width content, no diagonal */
@media (max-width: 640px) {
  .content-mask {
    width: 100%;
    padding: 1rem;
  }
  .horizontal {
    display: none;
  }
  .blog-card {
    height: auto;
    min-height: 300px;
  }
}
</style>
