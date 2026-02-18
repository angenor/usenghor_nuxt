<script setup lang="ts">
import type { PublicCampusTeamMember, PublicCampusForSelect } from '~/composables/usePublicCampusTeamApi'

const { t } = useI18n()
const localePath = useLocalePath()

const {
  fetchAllTeamData,
  getFullName,
  getFlagEmoji,
} = usePublicCampusTeamApi()

// === STATE ===
const isLoading = ref(true)
const selectedCampusId = ref<string>('')
const searchQuery = ref('')

// Données
const allMembers = ref<PublicCampusTeamMember[]>([])
const campuses = ref<PublicCampusForSelect[]>([])

// Map pour compter les membres par campus
const memberCountByCampus = ref<Map<string, number>>(new Map())

// === CHARGEMENT DES DONNÉES ===
async function loadData() {
  isLoading.value = true
  try {
    const { members, campuses: campusesData } = await fetchAllTeamData()

    allMembers.value = members
    campuses.value = campusesData

    // Pré-calculer les compteurs par campus
    memberCountByCampus.value.clear()
    for (const campus of campusesData) {
      const count = allMembers.value.filter(m => m.campus_id === campus.id).length
      memberCountByCampus.value.set(campus.id, count)
    }
  }
  catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
  finally {
    isLoading.value = false
  }
}

// Initialisation
onMounted(async () => {
  await loadData()
})

// === COMPUTED ===

// Membres filtrés et triés
const filteredMembers = computed(() => {
  let result = [...allMembers.value]

  // Filtre par campus
  if (selectedCampusId.value) {
    result = result.filter(m => m.campus_id === selectedCampusId.value)
  }

  // Filtre par recherche
  if (searchQuery.value.trim()) {
    const search = searchQuery.value.toLowerCase().trim()
    result = result.filter((m) => {
      const fullName = `${m.user.first_name} ${m.user.last_name}`.toLowerCase()
      return (
        fullName.includes(search)
        || m.position.toLowerCase().includes(search)
      )
    })
  }

  // Tri par ordre d'affichage
  return result.sort((a, b) => a.display_order - b.display_order)
})

// Nombre total
const totalCount = computed(() => allMembers.value.length)

// Campus avec des membres (pour n'afficher que les campus ayant du personnel)
const campusesWithMembers = computed(() => {
  return campuses.value.filter(c => (memberCountByCampus.value.get(c.id) || 0) > 0)
})

// === METHODS ===

// Sélectionner un campus
function selectCampus(campusId: string) {
  selectedCampusId.value = campusId
}

// Réinitialiser les filtres
const clearFilters = () => {
  selectedCampusId.value = ''
  searchQuery.value = ''
}

// Couleur par campus (basée sur le code)
const campusColors: Record<string, { border: string; badge: string }> = {
  ALX: { border: 'border-brand-red-200 dark:border-brand-red-800', badge: 'bg-brand-red-500' },
  ABJ: { border: 'border-orange-200 dark:border-orange-800', badge: 'bg-orange-500' },
  DKR: { border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-500' },
  YAO: { border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-500' },
  LBV: { border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-500' },
  TNR: { border: 'border-pink-200 dark:border-pink-800', badge: 'bg-pink-500' },
  RBA: { border: 'border-cyan-200 dark:border-cyan-800', badge: 'bg-cyan-500' },
}

function getCampusColors(member: PublicCampusTeamMember) {
  const code = member.campus_code || ''
  return campusColors[code] || { border: 'border-gray-200 dark:border-gray-700', badge: 'bg-gray-500' }
}

function getCampusMemberCount(campusId: string): number {
  return memberCountByCampus.value.get(campusId) || 0
}

function getCampusCountryCode(campus: PublicCampusForSelect): string {
  const codeToCountry: Record<string, string> = {
    ALX: 'EG',
    ABJ: 'CI',
    DKR: 'SN',
    YAO: 'CM',
    LBV: 'GA',
    TNR: 'MG',
    RBA: 'MA',
  }
  return codeToCountry[campus.code] || ''
}

// Animation staggerée des cartes
const cardsRef = ref<HTMLElement | null>(null)
watch(filteredMembers, () => {
  nextTick(() => {
    if (!cardsRef.value) return
    const cards = cardsRef.value.querySelectorAll<HTMLElement>('[data-card]')
    cards.forEach((card, index) => {
      card.style.opacity = '0'
      setTimeout(() => {
        card.classList.add('animate__animated', 'animate__fadeInUp')
        card.style.opacity = '1'
      }, index * 50)
    })
  })
})
</script>

<template>
  <section
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 bg-grid-pattern transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
      </div>

      <template v-else>
        <!-- Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            <span class="relative inline-block">
              {{ t('team.hero.title') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
            </span>
          </h2>
          <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ t('team.hero.subtitle') }}
          </p>
        </div>

        <!-- Filtres et recherche -->
        <div class="mb-10 space-y-6">
          <!-- Tabs de filtre par campus -->
          <div class="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              :class="[
                !selectedCampusId
                  ? 'bg-brand-blue-500 text-white shadow-lg shadow-brand-blue-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
              @click="selectCampus('')"
            >
              <font-awesome-icon :icon="['fas', 'globe']" class="w-4 h-4" />
              <span>{{ t('team.filters.all') }}</span>
              <span class="rounded-full px-2 py-0.5 text-xs" :class="!selectedCampusId ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'">
                {{ totalCount }}
              </span>
            </button>
            <button
              v-for="campus in campusesWithMembers"
              :key="campus.id"
              type="button"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              :class="[
                selectedCampusId === campus.id
                  ? 'bg-brand-blue-500 text-white shadow-lg shadow-brand-blue-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
              @click="selectCampus(campus.id)"
            >
              <span>{{ getFlagEmoji(getCampusCountryCode(campus)) }}</span>
              <span>{{ campus.name }}</span>
              <span class="rounded-full px-2 py-0.5 text-xs" :class="selectedCampusId === campus.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'">
                {{ getCampusMemberCount(campus.id) }}
              </span>
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
          <NuxtLink
            v-for="member in filteredMembers"
            :key="member.id"
            :to="localePath(`/a-propos/equipe/${member.user.id}`)"
            data-card
            class="group block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 opacity-0 cursor-pointer"
            :class="getCampusColors(member).border"
          >
            <!-- Photo -->
            <div class="relative aspect-square overflow-hidden">
              <img
                v-if="member.user.photo_url"
                :src="member.user.photo_url"
                :alt="getFullName(member.user)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div
                v-else
                class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
              >
                <font-awesome-icon icon="fa-solid fa-user" class="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <!-- Overlay gradient -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <!-- Badge campus -->
              <div
                class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                :class="getCampusColors(member).badge"
              >
                {{ member.campus_name || member.campus_code }}
              </div>
              <!-- Nom en overlay -->
              <div class="absolute bottom-3 left-3 right-3">
                <p class="text-white font-bold text-lg leading-tight">
                  {{ getFullName(member.user) }}
                </p>
              </div>
            </div>

            <!-- Contenu -->
            <div class="p-5">
              <!-- Poste/fonction -->
              <p class="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                {{ member.position }}
              </p>

              <!-- Campus -->
              <p
                v-if="member.campus_name && !selectedCampusId"
                class="text-sm mb-4 flex items-center gap-2 text-gray-500 dark:text-gray-400"
              >
                <font-awesome-icon
                  icon="fa-solid fa-building"
                  class="w-3.5 h-3.5"
                />
                <span class="line-clamp-1">{{ member.campus_name }}</span>
              </p>

              <!-- Actions -->
              <div class="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <a
                  v-if="member.user.email"
                  :href="`mailto:${member.user.email}`"
                  :title="t('team.card.email')"
                  class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-brand-blue-100 hover:text-brand-blue-600 dark:hover:bg-brand-blue-900/30 dark:hover:text-brand-blue-400 transition-colors duration-300"
                  @click.stop
                >
                  <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4" />
                  <span class="text-sm font-medium">{{ t('team.card.email') }}</span>
                </a>
                <span
                  class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-blue-50 dark:bg-brand-blue-900/20 text-brand-blue-600 dark:text-brand-blue-400 transition-colors duration-300"
                >
                  <font-awesome-icon icon="fa-solid fa-user" class="w-4 h-4" />
                  <span class="text-sm font-medium">{{ t('team.card.profile') }}</span>
                </span>
              </div>
            </div>
          </NuxtLink>
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
      </template>
    </div>
  </section>
</template>
