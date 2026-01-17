<script setup lang="ts">
const { t, locale } = useI18n()
const { getFeaturedEvents, getFeaturedNews } = useMockData()

// État du panneau
const isOpen = ref(false)
const isMinimized = ref(false)
const activeTab = ref<'events' | 'news'>('events')

// Données à la une
const featuredEvents = computed(() => getFeaturedEvents())
const featuredNews = computed(() => getFeaturedNews())

// Nombre total d'éléments à la une
const totalFeatured = computed(() => featuredEvents.value.length + featuredNews.value.length)

// N'afficher le widget que s'il y a du contenu
const hasContent = computed(() => totalFeatured.value > 0)

// Formater la date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

// Formater la date complète pour les actualités
const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Obtenir le titre localisé
const getLocalizedTitle = (item: any) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

// Obtenir l'extrait localisé
const getLocalizedExcerpt = (item: any) => {
  if (locale.value === 'en' && item.excerpt_en) return item.excerpt_en
  return item.excerpt_fr
}

// Couleurs par type d'événement
const typeColors: Record<string, string> = {
  conference: 'bg-blue-500',
  atelier: 'bg-emerald-500',
  ceremonie: 'bg-purple-500',
  autre: 'bg-gray-500'
}

// Fermer le panneau
const close = () => {
  isOpen.value = false
}

// Minimiser/restaurer
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

// Sélectionner l'onglet avec contenu au démarrage
watch(isOpen, (open) => {
  if (open) {
    if (featuredEvents.value.length > 0) {
      activeTab.value = 'events'
    } else if (featuredNews.value.length > 0) {
      activeTab.value = 'news'
    }
  }
})
</script>

<template>
  <div v-if="hasContent" class="fixed bottom-6 right-6 z-50">
    <!-- Bouton flottant (affiché quand fermé) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="scale-0 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-0 opacity-0"
    >
      <button
        v-if="!isOpen"
        @click="isOpen = true"
        class="group relative flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <!-- Badge avec nombre total -->
        <span class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {{ totalFeatured }}
        </span>

        <font-awesome-icon icon="fa-solid fa-bell" class="w-5 h-5" />
        <span class="font-medium">{{ t('widget.featured.title') }}</span>
      </button>
    </Transition>

    <!-- Panneau -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="isOpen"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        :class="isMinimized ? 'w-72' : 'w-80 sm:w-96'"
      >
        <!-- En-tête -->
        <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2 text-white">
            <font-awesome-icon icon="fa-solid fa-bell" class="w-5 h-5" />
            <h3 class="font-semibold">{{ t('widget.featured.title') }}</h3>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="toggleMinimize"
              class="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
              :title="isMinimized ? t('widget.featured.expand') : t('widget.featured.minimize')"
            >
              <font-awesome-icon :icon="isMinimized ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up'" class="w-4 h-4" />
            </button>
            <button
              @click="close"
              class="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
              :title="t('widget.featured.close')"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Onglets -->
        <div v-if="!isMinimized" class="flex border-b border-gray-100 dark:border-gray-700">
          <button
            v-if="featuredEvents.length > 0"
            @click="activeTab = 'events'"
            class="flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            :class="activeTab === 'events'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-4 h-4" />
            {{ t('widget.featured.events') }}
            <span class="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs px-1.5 py-0.5 rounded-full">
              {{ featuredEvents.length }}
            </span>
          </button>
          <button
            v-if="featuredNews.length > 0"
            @click="activeTab = 'news'"
            class="flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            :class="activeTab === 'news'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            <font-awesome-icon icon="fa-solid fa-newspaper" class="w-4 h-4" />
            {{ t('widget.featured.news') }}
            <span class="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs px-1.5 py-0.5 rounded-full">
              {{ featuredNews.length }}
            </span>
          </button>
        </div>

        <!-- Liste des événements -->
        <div
          v-if="!isMinimized && activeTab === 'events'"
          class="max-h-72 overflow-y-auto"
        >
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <NuxtLink
              v-for="event in featuredEvents"
              :key="event.id"
              :to="`/actualites/evenements/${event.id}`"
              class="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              @click="close"
            >
              <!-- Date -->
              <div class="flex-shrink-0 w-14 text-center">
                <div class="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2">
                  <div class="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">
                    {{ formatDate(event.date).split(' ')[1] }}
                  </div>
                  <div class="text-lg font-bold text-amber-700 dark:text-amber-300">
                    {{ formatDate(event.date).split(' ')[0] }}
                  </div>
                </div>
              </div>

              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    :class="typeColors[event.type]"
                  ></span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {{ t(`partners.campus.events.types.${event.type}`) }}
                  </span>
                </div>
                <h4 class="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {{ getLocalizedTitle(event) }}
                </h4>
                <div class="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3" />
                  <span class="truncate">{{ event.location_fr }}</span>
                </div>
              </div>

              <!-- Flèche -->
              <font-awesome-icon
                icon="fa-solid fa-chevron-right"
                class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-2 rtl:rotate-180"
              />
            </NuxtLink>
          </div>
        </div>

        <!-- Liste des actualités -->
        <div
          v-if="!isMinimized && activeTab === 'news'"
          class="max-h-72 overflow-y-auto"
        >
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <NuxtLink
              v-for="news in featuredNews"
              :key="news.id"
              :to="news.url || `/actualites/${news.id}`"
              class="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              @click="close"
            >
              <!-- Image -->
              <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  v-if="news.image"
                  :src="news.image"
                  :alt="getLocalizedTitle(news)"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-newspaper" class="w-6 h-6 text-gray-400" />
                </div>
              </div>

              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {{ getLocalizedTitle(news) }}
                </h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                  {{ getLocalizedExcerpt(news) }}
                </p>
                <div class="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                  <font-awesome-icon icon="fa-regular fa-clock" class="w-3 h-3" />
                  {{ formatFullDate(news.date) }}
                </div>
              </div>

              <!-- Flèche -->
              <font-awesome-icon
                icon="fa-solid fa-chevron-right"
                class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-2 rtl:rotate-180"
              />
            </NuxtLink>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!isMinimized" class="border-t border-gray-100 dark:border-gray-700 p-3">
          <NuxtLink
            :to="activeTab === 'events' ? '/actualites/evenements' : '/actualites'"
            class="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
            @click="close"
          >
            {{ activeTab === 'events' ? t('widget.featured.viewAllEvents') : t('widget.featured.viewAllNews') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3 rtl:rotate-180" />
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
