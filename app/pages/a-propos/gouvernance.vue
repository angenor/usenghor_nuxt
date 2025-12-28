<script setup lang="ts">
const { t } = useI18n()
const {
  paysBailleurs,
  conseilAdministration,
  getFlagEmoji,
  getTextesFondateurs,
  getCAPresident
} = useMockData()

// SEO
useSeoMeta({
  title: () => t('governance.title'),
  description: () => t('governance.subtitle'),
  ogTitle: () => t('governance.title'),
  ogDescription: () => t('governance.subtitle')
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('governance.badge') }
])

// Données
const foundingTexts = computed(() => getTextesFondateurs())
const president = computed(() => getCAPresident())
const members = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'membre')
)
const vicePresidents = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'vice_president')
)
const observers = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'observateur')
)

// Scroll animations
const { elementRef: textsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
const { elementRef: countriesRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
const { elementRef: boardRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero
      :title="t('governance.badge')"
      :subtitle="t('governance.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Section 1: Textes Fondateurs -->
    <section
      ref="textsRef"
      class="py-16 lg:py-24 bg-white dark:bg-gray-900"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="max-w-3xl mb-12">
          <span class="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-full mb-4">
            {{ t('governance.foundingTexts.badge') }}
          </span>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('governance.foundingTexts.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ t('governance.foundingTexts.description') }}
          </p>
        </div>

        <!-- Points clés -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fa-solid fa-scroll" class="text-white text-sm" />
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              {{ t('governance.foundingTexts.point1') }}
            </p>
          </div>
          <div class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fa-solid fa-building-columns" class="text-white text-sm" />
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              {{ t('governance.foundingTexts.point2') }}
            </p>
          </div>
          <div class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fa-solid fa-handshake" class="text-white text-sm" />
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              {{ t('governance.foundingTexts.point3') }}
            </p>
          </div>
        </div>

        <!-- Grid documents -->
        <div class="grid md:grid-cols-2 gap-6">
          <a
            v-for="(doc, index) in foundingTexts"
            :key="doc.id"
            :href="doc.file_url"
            download
            class="group flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl
                   hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300
                   border-l-4 border-transparent hover:border-amber-500
                   hover:shadow-lg hover:-translate-y-0.5"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <!-- Icon PDF -->
            <div class="w-14 h-14 bg-red-500/10 dark:bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fa-solid fa-file-pdf" class="text-red-500 text-2xl" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {{ doc.title_fr }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {{ doc.description_fr }}
              </p>
              <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span v-if="doc.year" class="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {{ doc.year }}
                </span>
                <span>{{ formatFileSize(doc.file_size) }}</span>
              </div>
            </div>

            <!-- Download icon -->
            <font-awesome-icon
              icon="fa-solid fa-download"
              class="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </a>
        </div>
      </div>
    </section>

    <!-- Section 2: Pays Bailleurs -->
    <section
      ref="countriesRef"
      class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 relative overflow-hidden"
    >
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-5 dark:opacity-[0.02]">
        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <pattern id="africa-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#africa-pattern)" />
        </svg>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <!-- Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('governance.donorCountries.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ t('governance.donorCountries.description') }}
          </p>

          <!-- Stats -->
          <div class="flex justify-center gap-12 mt-8">
            <div class="text-center">
              <span class="text-5xl font-bold text-amber-500">{{ paysBailleurs.length }}</span>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pays membres</p>
            </div>
            <div class="text-center">
              <span class="text-5xl font-bold text-amber-500">1989</span>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Année de création</p>
            </div>
          </div>
        </div>

        <!-- Grille pays -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <div
            v-for="(pays, index) in paysBailleurs"
            :key="pays.id"
            class="group relative bg-white dark:bg-gray-700 rounded-2xl p-6
                   text-center shadow-sm hover:shadow-xl transition-all duration-300
                   hover:-translate-y-2 cursor-default"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <!-- Drapeau -->
            <span class="text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300">
              {{ getFlagEmoji(pays.code) }}
            </span>

            <!-- Nom du pays -->
            <h3 class="font-medium text-sm text-gray-900 dark:text-white">
              {{ pays.name_fr }}
            </h3>

            <!-- Badge fondateur -->
            <span
              v-if="pays.contribution_type_fr"
              class="inline-block mt-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full"
            >
              {{ pays.contribution_type_fr }}
            </span>

            <!-- Tooltip -->
            <div
              class="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none
                     group-hover:opacity-100 transition-opacity duration-300
                     bg-gray-900 dark:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg
                     whitespace-nowrap shadow-lg z-10"
            >
              Membre depuis {{ pays.member_since }}
              <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-600"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Conseil d'Administration -->
    <section
      ref="boardRef"
      class="py-16 lg:py-24 bg-white dark:bg-gray-900"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('governance.board.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ t('governance.board.description') }}
          </p>
        </div>

        <!-- Président (featured) -->
        <div v-if="president" class="max-w-3xl mx-auto mb-16">
          <div
            class="relative bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600
                   rounded-3xl p-8 md:p-10 text-white overflow-hidden shadow-2xl shadow-amber-500/20"
          >
            <!-- Decorative elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <!-- Badge -->
            <div class="absolute top-4 right-4">
              <span class="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium">
                Président du Conseil
              </span>
            </div>

            <!-- Content -->
            <div class="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <img
                :src="president.photo || 'https://i.pravatar.cc/200?u=president'"
                :alt="`${president.first_name} ${president.last_name}`"
                class="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/30 object-cover shadow-xl"
              />
              <div class="text-center md:text-left">
                <h3 class="text-2xl md:text-3xl font-bold">
                  {{ president.civility }} {{ president.first_name }} {{ president.last_name }}
                </h3>
                <p class="text-white/90 text-lg mt-1">{{ president.title_fr }}</p>
                <p class="text-white/75 mt-3 flex items-center justify-center md:justify-start gap-2">
                  <span class="text-3xl">{{ getFlagEmoji(president.country_code) }}</span>
                  <span>{{ president.representing_fr }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Vice-Présidents -->
        <div v-if="vicePresidents.length > 0" class="mb-12">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Vice-Présidents
          </h3>
          <div class="grid sm:grid-cols-2 gap-6">
            <div
              v-for="vp in vicePresidents"
              :key="vp.id"
              class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50
                     rounded-2xl p-6 flex items-center gap-5
                     border border-gray-200 dark:border-gray-700
                     hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <img
                :src="vp.photo || 'https://i.pravatar.cc/150?u=' + vp.id"
                :alt="`${vp.first_name} ${vp.last_name}`"
                class="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-gray-700 shadow"
              />
              <div>
                <span class="text-2xl">{{ getFlagEmoji(vp.country_code) }}</span>
                <h4 class="font-semibold text-gray-900 dark:text-white mt-1">
                  {{ vp.civility }} {{ vp.first_name }} {{ vp.last_name }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ vp.title_fr }}</p>
                <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">{{ vp.representing_fr }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Membres -->
        <div v-if="members.length > 0" class="mb-12">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            Membres
          </h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(member, index) in members"
              :key="member.id"
              class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center
                     hover:shadow-lg transition-all duration-300 hover:-translate-y-1
                     border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
              :style="{ animationDelay: `${index * 75}ms` }"
            >
              <img
                :src="member.photo || 'https://i.pravatar.cc/150?u=' + member.id"
                :alt="`${member.first_name} ${member.last_name}`"
                class="w-20 h-20 rounded-full mx-auto mb-4 object-cover
                       ring-4 ring-white dark:ring-gray-700 shadow"
              />
              <span class="text-3xl">{{ getFlagEmoji(member.country_code) }}</span>
              <h4 class="font-semibold text-gray-900 dark:text-white mt-2">
                {{ member.civility }} {{ member.first_name }} {{ member.last_name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ member.title_fr }}</p>
              <p class="text-xs text-amber-600 dark:text-amber-400 mt-2">{{ member.representing_fr }}</p>
            </div>
          </div>
        </div>

        <!-- Observateurs -->
        <div v-if="observers.length > 0">
          <h3 class="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-gray-400 rounded-full"></span>
            Observateurs
          </h3>
          <div class="grid sm:grid-cols-2 gap-6">
            <div
              v-for="obs in observers"
              :key="obs.id"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600
                     rounded-2xl p-6 flex items-center gap-4
                     hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <img
                :src="obs.photo || 'https://i.pravatar.cc/150?u=' + obs.id"
                :alt="`${obs.first_name} ${obs.last_name}`"
                class="w-16 h-16 rounded-full object-cover opacity-90"
              />
              <div>
                <h4 class="font-semibold text-gray-700 dark:text-gray-300">
                  {{ obs.civility }} {{ obs.first_name }} {{ obs.last_name }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ obs.title_fr }}</p>
                <span
                  class="inline-block mt-2 text-xs bg-gray-200 dark:bg-gray-700
                         text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                >
                  Observateur
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
