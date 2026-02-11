<script setup lang="ts">
import type { UserPublicProfile } from '~/composables/usePublicUserApi'
import type { OutputData } from '@editorjs/editorjs'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { getUserProfile, getFullName } = usePublicUserApi()

const userId = route.params.id as string

/**
 * Parse un contenu qui peut être du JSON EditorJS ou du texte brut.
 */
function parseEditorContent(content: string | null | undefined): OutputData | null {
  if (!content) return null
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  }
  catch {
    // Texte brut → encapsulé en bloc paragraphe
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ id: '1', type: 'paragraph', data: { text: content } }],
        version: '2.28.0',
      }
    }
  }
  return null
}

// State
const profile = ref<UserPublicProfile | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

// Chargement des données
async function loadProfile() {
  isLoading.value = true
  hasError.value = false
  try {
    profile.value = await getUserProfile(userId)
  }
  catch {
    hasError.value = true
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProfile()
})

// Computed
const fullName = computed(() => profile.value ? getFullName(profile.value) : '')

const photoUrl = computed(() => {
  if (profile.value?.photo_url) return profile.value.photo_url
  return `https://i.pravatar.cc/400?u=${userId}`
})

const primaryPosition = computed(() => {
  if (profile.value?.campus_affiliations?.length) {
    return profile.value.campus_affiliations[0].position
  }
  if (profile.value?.service_affiliations?.length) {
    return profile.value.service_affiliations[0].position
  }
  return ''
})

const parsedBiography = computed(() => parseEditorContent(profile.value?.biography))

const hasContactInfo = computed(() => {
  if (!profile.value) return false
  return profile.value.email || profile.value.phone || profile.value.city
})

const hasSocialLinks = computed(() => {
  if (!profile.value) return false
  return profile.value.linkedin || profile.value.facebook
})

const hasAffiliations = computed(() => {
  if (!profile.value) return false
  return profile.value.campus_affiliations.length > 0 || profile.value.service_affiliations.length > 0
})

// Couleurs par campus
const campusColors: Record<string, string> = {
  ALX: 'bg-brand-red-500',
  ABJ: 'bg-orange-500',
  DKR: 'bg-emerald-500',
  YAO: 'bg-blue-500',
  LBV: 'bg-purple-500',
  TNR: 'bg-pink-500',
  RBA: 'bg-cyan-500',
}

function getCampusBadgeColor(code: string): string {
  return campusColors[code] || 'bg-gray-500'
}

// Emoji drapeau
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// SEO
useSeoMeta({
  title: () => fullName.value
    ? t('team.profile.seo.title', { name: fullName.value })
    : t('team.seo.title'),
  description: () => profile.value?.biography?.substring(0, 160)
    || t('team.profile.seo.description', { name: fullName.value }),
  ogTitle: () => fullName.value
    ? t('team.profile.seo.title', { name: fullName.value })
    : t('team.seo.title'),
  ogDescription: () => profile.value?.biography?.substring(0, 160) || '',
  ogImage: () => photoUrl.value,
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 bg-grid-pattern dark:bg-gray-950 transition-colors duration-300">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[60vh]">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Erreur -->
    <div v-else-if="hasError" class="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <font-awesome-icon icon="fa-solid fa-user-slash" class="w-10 h-10 text-gray-400" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('team.profile.error.notFound') }}
      </h1>
      <NuxtLink
        :to="localePath('/a-propos/equipe')"
        class="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-medium rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
        {{ t('team.profile.error.backToTeam') }}
      </NuxtLink>
    </div>

    <!-- Profil -->
    <template v-else-if="profile">
      <!-- Hero -->
      <section class="relative overflow-hidden bg-gradient-to-br from-brand-blue-600 via-brand-blue-700 to-brand-blue-800 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950">
        <!-- Motif décoratif -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
          <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-red-500/20 blur-3xl"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <!-- Fil d'Ariane -->
          <nav class="mb-8 flex items-center gap-2 text-sm text-white/60">
            <NuxtLink :to="localePath('/')" class="hover:text-white transition-colors">
              {{ t('nav.home') || 'Accueil' }}
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-2.5 h-2.5" />
            <NuxtLink :to="localePath('/a-propos/equipe')" class="hover:text-white transition-colors">
              {{ t('team.hero.title') }}
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-2.5 h-2.5" />
            <span class="text-white/90">{{ fullName }}</span>
          </nav>

          <!-- Contenu hero -->
          <div class="flex flex-col sm:flex-row items-center sm:items-end gap-8">
            <!-- Photo -->
            <div class="relative shrink-0">
              <div class="w-36 h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                <img
                  :src="photoUrl"
                  :alt="fullName"
                  class="w-full h-full object-cover"
                />
              </div>
              <!-- Badge nationalité -->
              <div
                v-if="profile.nationality_country_iso_code"
                class="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-xl"
              >
                {{ getFlagEmoji(profile.nationality_country_iso_code) }}
              </div>
            </div>

            <!-- Infos -->
            <div class="text-center sm:text-left pb-2">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {{ fullName }}
              </h1>
              <p v-if="primaryPosition" class="mt-3 text-lg lg:text-xl text-white/80 font-medium">
                {{ primaryPosition }}
              </p>
              <div class="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-white/60">
                <span v-if="profile.nationality_country_name_fr" class="inline-flex items-center gap-1.5">
                  <font-awesome-icon icon="fa-solid fa-globe" class="w-3.5 h-3.5" />
                  {{ profile.nationality_country_name_fr }}
                </span>
                <span v-if="profile.city" class="inline-flex items-center gap-1.5">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3.5 h-3.5" />
                  {{ profile.city }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contenu principal -->
      <section class="py-12 lg:py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid lg:grid-cols-3 gap-10 lg:gap-12">
            <!-- Colonne principale : Biographie -->
            <div class="lg:col-span-2">
              <div class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-book-open" class="w-5 h-5 text-brand-blue-600 dark:text-brand-blue-400" />
                  </div>
                  {{ t('team.profile.sections.biography') }}
                </h2>

                <div v-if="parsedBiography" class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                  <EditorJSRenderer :data="parsedBiography" />
                </div>
                <p v-else class="text-gray-400 dark:text-gray-500 italic">
                  {{ t('team.profile.empty.biography') }}
                </p>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <!-- Contact -->
              <div v-if="hasContactInfo" class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-address-card" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {{ t('team.profile.sections.contact') }}
                </h3>
                <div class="space-y-4">
                  <!-- Email -->
                  <a
                    v-if="profile.email"
                    :href="`mailto:${profile.email}`"
                    class="flex items-center gap-3 group text-gray-600 dark:text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors"
                  >
                    <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/30 transition-colors">
                      <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs text-gray-400 dark:text-gray-500">{{ t('team.profile.labels.email') }}</p>
                      <p class="text-sm font-medium truncate">{{ profile.email }}</p>
                    </div>
                  </a>

                  <!-- Téléphone -->
                  <a
                    v-if="profile.phone"
                    :href="`tel:${profile.phone}`"
                    class="flex items-center gap-3 group text-gray-600 dark:text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors"
                  >
                    <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/30 transition-colors">
                      <font-awesome-icon icon="fa-solid fa-phone" class="w-4 h-4" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs text-gray-400 dark:text-gray-500">{{ t('team.profile.labels.phone') }}</p>
                      <p class="text-sm font-medium">{{ profile.phone }}</p>
                    </div>
                  </a>

                  <!-- Ville -->
                  <div
                    v-if="profile.city"
                    class="flex items-center gap-3 text-gray-600 dark:text-gray-400"
                  >
                    <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-location-dot" class="w-4 h-4" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs text-gray-400 dark:text-gray-500">{{ t('team.profile.labels.city') }}</p>
                      <p class="text-sm font-medium">{{ profile.city }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Réseaux sociaux -->
              <div v-if="hasSocialLinks" class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-share-nodes" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  {{ t('team.profile.sections.socialLinks') }}
                </h3>
                <div class="space-y-3">
                  <a
                    v-if="profile.linkedin"
                    :href="profile.linkedin"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70B5F9] transition-colors group"
                  >
                    <font-awesome-icon :icon="['fab', 'linkedin']" class="w-5 h-5" />
                    <span class="text-sm font-medium">{{ t('team.profile.labels.linkedin') }}</span>
                    <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a
                    v-if="profile.facebook"
                    :href="profile.facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] dark:text-[#8AB4F8] transition-colors group"
                  >
                    <font-awesome-icon :icon="['fab', 'facebook']" class="w-5 h-5" />
                    <span class="text-sm font-medium">{{ t('team.profile.labels.facebook') }}</span>
                    <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>

              <!-- Affiliations campus -->
              <div v-if="profile.campus_affiliations.length > 0" class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-brand-red-100 dark:bg-brand-red-900/30 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-building-columns" class="w-4 h-4 text-brand-red-600 dark:text-brand-red-400" />
                  </div>
                  {{ t('team.profile.sections.campusAffiliations') }}
                </h3>
                <div class="space-y-3">
                  <div
                    v-for="aff in profile.campus_affiliations"
                    :key="aff.campus_id"
                    class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <span
                      class="shrink-0 mt-0.5 inline-flex items-center justify-center w-10 h-6 rounded-full text-[10px] font-bold text-white"
                      :class="getCampusBadgeColor(aff.campus_code)"
                    >
                      {{ aff.campus_code }}
                    </span>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">
                        {{ aff.campus_name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {{ aff.position }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Affiliations services -->
              <div v-if="profile.service_affiliations.length > 0" class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-sitemap" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  {{ t('team.profile.sections.serviceAffiliations') }}
                </h3>
                <div class="space-y-3">
                  <div
                    v-for="aff in profile.service_affiliations"
                    :key="aff.service_id"
                    class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div class="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-briefcase" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">
                        {{ aff.service_name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {{ aff.position }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Aucune affiliation -->
              <div
                v-if="!hasAffiliations"
                class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm text-center"
              >
                <font-awesome-icon icon="fa-solid fa-building" class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p class="text-sm text-gray-400 dark:text-gray-500 italic">
                  {{ t('team.profile.empty.affiliations') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Bouton retour -->
          <div class="mt-12 text-center">
            <NuxtLink
              :to="localePath('/a-propos/equipe')"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
              {{ t('team.profile.error.backToTeam') }}
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
