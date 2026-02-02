<script setup lang="ts">
import type { SectorPublicWithServices, ServicePublic } from '~/composables/usePublicOrganizationApi'
import type { OutputData } from '@editorjs/editorjs'

const { t } = useI18n()
const localePath = useLocalePath()
const { listSectorsWithServices, slugify } = usePublicOrganizationApi()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// State
const sectors = ref<SectorPublicWithServices[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch sectors with services
const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    sectors.value = await listSectorsWithServices()
  }
  catch (err: unknown) {
    const fetchError = err as { message?: string }
    error.value = fetchError.message || 'Erreur lors du chargement'
    console.error('Error fetching sectors:', err)
  }
  finally {
    loading.value = false
  }
}

// Fetch on mount
onMounted(fetchData)

// SSR data
const { data: sectorsData } = await useAsyncData(
  'organization-sectors',
  async () => {
    try {
      return await listSectorsWithServices()
    }
    catch {
      return []
    }
  },
)

// Initialize from SSR
if (sectorsData.value && sectorsData.value.length > 0) {
  sectors.value = sectorsData.value
  loading.value = false
}

// Animations staggerées pour chaque groupe
const groupRefs = ref<HTMLElement[]>([])

onMounted(() => {
  // Wait for sectors to load
  watch(sectors, () => {
    nextTick(() => {
      groupRefs.value.forEach((el) => {
        if (!el) return
        const cards = el.querySelectorAll<HTMLElement>('[data-card]')

        cards.forEach((card) => {
          card.style.opacity = '0'
          card.style.transform = 'translateY(20px)'
        })

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                cards.forEach((card, cardIndex) => {
                  setTimeout(() => {
                    card.classList.add('animate__animated', 'animate__fadeInUp')
                    card.style.opacity = '1'
                    card.style.transform = 'translateY(0)'
                  }, cardIndex * 80)
                })
                observer.disconnect()
              }
            })
          },
          { threshold: 0.1 },
        )
        observer.observe(el)
      })
    })
  }, { immediate: true })
})

// Couleurs alternées pour les secteurs
const sectorColors = [
  {
    bg: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
    text: 'text-brand-blue-600 dark:text-brand-blue-400',
    border: 'border-brand-blue-200 dark:border-brand-blue-800',
    line: 'bg-brand-blue-200 dark:bg-brand-blue-800',
    hover: 'group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400',
  },
  {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    line: 'bg-purple-200 dark:bg-purple-800',
    hover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
  },
  {
    bg: 'bg-brand-red-100 dark:bg-brand-red-900/30',
    text: 'text-brand-red-600 dark:text-brand-red-400',
    border: 'border-brand-red-200 dark:border-brand-red-800',
    line: 'bg-brand-red-200 dark:bg-brand-red-800',
    hover: 'group-hover:text-brand-red-600 dark:group-hover:text-brand-red-400',
  },
  {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    line: 'bg-teal-200 dark:bg-teal-800',
    hover: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
  },
  {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    line: 'bg-amber-200 dark:bg-amber-800',
    hover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
  },
]

const getSectorColors = (index: number) => {
  return sectorColors[index % sectorColors.length]
}

// Convertir une string (potentiellement JSON ou texte brut) en OutputData
const parseEditorContent = (content: string | null | undefined): OutputData | undefined => {
  if (!content) return undefined
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: content } }],
        version: '2.28.0'
      }
    }
  }
  return undefined
}

// Generate service URL
const getServiceUrl = (service: ServicePublic) => {
  return localePath(`/a-propos/organisation/service/${slugify(service.name)}`)
}

// Generate sector URL
const getSectorUrl = (sector: SectorPublicWithServices) => {
  return localePath(`/a-propos/organisation/secteur/${sector.code.toLowerCase()}`)
}
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ t('organization.orgchart.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full" />
          </span>
        </h2>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('organization.intro.text') }}
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue-600 border-t-transparent mx-auto mb-4" />
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('common.loading') }}
          </p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-16">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-500 mb-4" />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('common.error') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ error }}
        </p>
        <button
          class="px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium rounded-lg transition-colors"
          @click="fetchData"
        >
          {{ t('common.retry') || 'Réessayer' }}
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="sectors.length === 0" class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <font-awesome-icon icon="fa-solid fa-building" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('organization.empty.title') || 'Aucun secteur' }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('organization.empty.description') || 'Aucun secteur n\'est disponible pour le moment.' }}
        </p>
      </div>

      <!-- Sectors -->
      <div v-else class="space-y-12">
        <div
          v-for="(sector, sectorIndex) in sectors"
          :key="sector.id"
          :ref="(el) => { if (el) groupRefs[sectorIndex] = el as HTMLElement }"
        >
          <!-- Sector Title -->
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="h-px flex-1" :class="getSectorColors(sectorIndex).line" />
            <NuxtLink
              :to="getSectorUrl(sector)"
              class="text-lg font-semibold uppercase tracking-wider hover:underline"
              :class="getSectorColors(sectorIndex).text"
            >
              {{ sector.name }}
            </NuxtLink>
            <div class="h-px flex-1" :class="getSectorColors(sectorIndex).line" />
          </div>

          <!-- Sector Description -->
          <div
            v-if="sector.description"
            class="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto"
          >
            <EditorJSRenderer :data="parseEditorContent(sector.description)" />
          </div>

          <!-- Services Grid -->
          <div v-if="sector.services.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="service in sector.services"
              :key="service.id"
              :to="getServiceUrl(service)"
              data-card
              class="group bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              :class="getSectorColors(sectorIndex).border"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  :class="getSectorColors(sectorIndex).bg"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-building"
                    class="w-5 h-5"
                    :class="getSectorColors(sectorIndex).text"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {{ service.name }}
                  </h4>
                  <span
                    class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors"
                    :class="getSectorColors(sectorIndex).hover"
                  >
                    <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                    <span>{{ t('organization.departments.view_programs') }}</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Empty services message -->
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            {{ t('organization.services.empty') || 'Aucun service dans ce secteur' }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
