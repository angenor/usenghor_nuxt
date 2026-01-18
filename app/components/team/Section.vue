<script setup lang="ts">
import type { Staff } from '@/composables/useMockData'

const { t, locale } = useI18n()
const { staff, getStaffByType, getDepartmentById, getServiceById } = useMockData()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Filtre actif
type FilterType = 'all' | 'direction' | 'enseignant' | 'administratif'
const activeFilter = ref<FilterType>('all')

// Recherche
const searchQuery = ref('')

// Filtres disponibles
const filters: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'team.filters.all', icon: 'fa-solid fa-users' },
  { key: 'direction', label: 'team.filters.direction', icon: 'fa-solid fa-crown' },
  { key: 'enseignant', label: 'team.filters.enseignant', icon: 'fa-solid fa-chalkboard-user' },
  { key: 'administratif', label: 'team.filters.administratif', icon: 'fa-solid fa-building' }
]

// Membres filtrés
const filteredMembers = computed(() => {
  let members: Staff[] = []

  if (activeFilter.value === 'all') {
    members = staff.value
  } else {
    members = getStaffByType(activeFilter.value)
  }

  // Recherche par nom
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    members = members.filter(m =>
      m.first_name.toLowerCase().includes(query) ||
      m.last_name.toLowerCase().includes(query) ||
      getStaffTitle(m).toLowerCase().includes(query)
    )
  }

  // Tri par ordre
  return members.sort((a, b) => a.sort_order - b.sort_order)
})

// Nombre total
const totalCount = computed(() => staff.value.length)

// Couleurs par type de staff
const typeColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  direction: {
    bg: 'bg-brand-red-100 dark:bg-brand-red-900/30',
    text: 'text-brand-red-600 dark:text-brand-red-400',
    border: 'border-brand-red-200 dark:border-brand-red-800',
    badge: 'bg-brand-red-500'
  },
  enseignant: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-500'
  },
  administratif: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-500'
  },
  technique: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-500'
  }
}

const getTypeColors = (type: string) => typeColors[type] || typeColors.administratif

// Titre localisé
const getStaffTitle = (member: Staff) => {
  if (locale.value === 'ar' && member.title_ar) return member.title_ar
  if (locale.value === 'en' && member.title_en) return member.title_en
  return member.title_fr
}

// Département ou service
const getAffiliation = (member: Staff) => {
  if (member.department_id) {
    const dept = getDepartmentById(member.department_id)
    if (dept) {
      if (locale.value === 'ar') return dept.name_ar
      if (locale.value === 'en') return dept.name_en
      return dept.name_fr
    }
  }
  if (member.service_id) {
    const service = getServiceById(member.service_id)
    if (service) {
      if (locale.value === 'ar') return service.name_ar
      if (locale.value === 'en') return service.name_en
      return service.name_fr
    }
  }
  return null
}

// Réinitialiser les filtres
const clearFilters = () => {
  activeFilter.value = 'all'
  searchQuery.value = ''
}

// Animation staggerée pour les cartes
const cardsRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!cardsRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = cardsRef.value?.querySelectorAll<HTMLElement>('[data-card]') || []
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate__animated', 'animate__fadeInUp')
              card.style.opacity = '1'
            }, index * 50)
          })
          observer.disconnect()
        }
      })
    },
    { threshold: 0.1 }
  )

  observer.observe(cardsRef.value)
})
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ t('team.hero.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
          </span>
        </h2>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('team.hero.subtitle') }}
        </p>
      </div>

      <!-- Filtres et recherche -->
      <div class="mb-10 space-y-6">
        <!-- Tabs de filtre -->
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="filter in filters"
            :key="filter.key"
            type="button"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
            :class="[
              activeFilter === filter.key
                ? 'bg-brand-blue-500 text-white shadow-lg shadow-brand-blue-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
            @click="activeFilter = filter.key"
          >
            <font-awesome-icon :icon="filter.icon" class="w-4 h-4" />
            <span>{{ t(filter.label) }}</span>
          </button>
        </div>

        <!-- Barre de recherche -->
        <div class="max-w-md mx-auto">
          <div class="relative">
            <font-awesome-icon
              icon="fa-solid fa-magnifying-glass"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('team.filters.search')"
              class="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-blue-500 transition-all duration-300"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              @click="searchQuery = ''"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Compteur -->
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          {{ t('team.stats.showing', { count: filteredMembers.length, total: totalCount }) }}
        </p>
      </div>

      <!-- Grille des membres -->
      <div
        v-if="filteredMembers.length > 0"
        ref="cardsRef"
        class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="member in filteredMembers"
          :key="member.id"
          data-card
          class="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 opacity-0"
          :class="getTypeColors(member.staff_type).border"
        >
          <!-- Photo -->
          <div class="relative aspect-[4/3] overflow-hidden">
            <img
              :src="member.photo || `https://i.pravatar.cc/300?u=${member.id}`"
              :alt="`${member.civility} ${member.first_name} ${member.last_name}`"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <!-- Badge type -->
            <div
              class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              :class="getTypeColors(member.staff_type).badge"
            >
              {{ t(`team.filters.${member.staff_type}`) }}
            </div>
            <!-- Nom en overlay -->
            <div class="absolute bottom-3 left-3 right-3">
              <p class="text-white font-bold text-lg leading-tight">
                {{ member.civility }} {{ member.first_name }} {{ member.last_name }}
              </p>
            </div>
          </div>

          <!-- Contenu -->
          <div class="p-5">
            <!-- Titre/fonction -->
            <p class="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
              {{ getStaffTitle(member) }}
            </p>

            <!-- Affiliation (département ou service) -->
            <p
              v-if="getAffiliation(member)"
              class="text-sm mb-4 flex items-center gap-2"
              :class="getTypeColors(member.staff_type).text"
            >
              <font-awesome-icon
                :icon="member.department_id ? 'fa-solid fa-graduation-cap' : 'fa-solid fa-building'"
                class="w-3.5 h-3.5"
              />
              <span class="line-clamp-1">{{ getAffiliation(member) }}</span>
            </p>

            <!-- Actions -->
            <div class="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <a
                v-if="member.email"
                :href="`mailto:${member.email}`"
                :title="t('team.card.email')"
                class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-brand-blue-100 hover:text-brand-blue-600 dark:hover:bg-brand-blue-900/30 dark:hover:text-brand-blue-400 transition-colors duration-300"
              >
                <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4" />
                <span class="text-sm font-medium">{{ t('team.card.email') }}</span>
              </a>
              <a
                v-if="member.linkedin"
                :href="member.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                :title="t('team.card.linkedin')"
                class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors duration-300"
              >
                <font-awesome-icon :icon="['fab', 'linkedin-in']" class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si aucun résultat -->
      <div
        v-else
        class="text-center py-16"
      >
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
          <font-awesome-icon icon="fa-solid fa-user-slash" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">
          {{ t('team.filters.no_results') }}
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-medium rounded-full transition-colors duration-300"
          @click="clearFilters"
        >
          <font-awesome-icon icon="fa-solid fa-rotate-left" class="w-4 h-4" />
          <span>{{ t('team.filters.clear_filters') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
