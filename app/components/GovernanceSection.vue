<script setup lang="ts">
const { t } = useI18n()

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: foundingTextsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.15 })
const { elementRef: donorCountriesRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.2 })
const { elementRef: boardRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

const donorCountries = [
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'EG', name: 'Égypte' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'MA', name: 'Maroc' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'GA', name: 'Gabon' },
  { code: 'BF', name: 'Burkina Faso' }
]

const orgChart = {
  president: { initials: 'HH', nameKey: 'governance.board.president.name', roleKey: 'governance.board.president.role', color: 'emerald' },
  directors: [
    { id: 'secretary', initials: 'MK', nameKey: 'governance.board.secretary.name', roleKey: 'governance.board.secretary.role', color: 'cyan' },
    { id: 'treasurer', initials: 'AB', nameKey: 'governance.board.treasurer.name', roleKey: 'governance.board.treasurer.role', color: 'amber' },
    { id: 'programs', initials: 'FN', nameKey: 'governance.board.programs.name', roleKey: 'governance.board.programs.role', color: 'purple' }
  ]
}

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; badge: string }> = {
    emerald: { bg: 'bg-gradient-to-br from-emerald-500 to-teal-600', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
    cyan: { bg: 'bg-gradient-to-br from-cyan-500 to-blue-600', badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300' },
    amber: { bg: 'bg-gradient-to-br from-amber-500 to-orange-600', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
    purple: { bg: 'bg-gradient-to-br from-purple-500 to-indigo-600', badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' }
  }
  return colors[color] || colors.emerald
}
</script>

<template>
  <section class="relative py-16 lg:py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/50 dark:from-emerald-900/10 dark:via-transparent dark:to-blue-900/10"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute top-1/2 -left-20 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div ref="headerRef" class="text-center mb-16 lg:mb-20">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-landmark" class="w-3.5 h-3.5 mr-2" />
          {{ t('governance.badge') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('governance.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('governance.subtitle') }}
        </p>
      </div>

      <!-- Textes Fondateurs Section -->
      <div ref="foundingTextsRef" class="mb-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Animated Border Image -->
          <div class="relative flex justify-center">
            <div class="morphing-border-container">
              <div class="morphing-border">
                <img
                  src="/images/gallery/gallery4.jpg"
                  :alt="t('governance.foundingTexts.title')"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              <font-awesome-icon icon="fa-solid fa-scroll" class="w-3 h-3 mr-2" />
              {{ t('governance.foundingTexts.badge') }}
            </div>
            <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {{ t('governance.foundingTexts.title') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ t('governance.foundingTexts.description') }}
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mt-0.5">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="text-gray-700 dark:text-gray-300">{{ t('governance.foundingTexts.point1') }}</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mt-0.5">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="text-gray-700 dark:text-gray-300">{{ t('governance.foundingTexts.point2') }}</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mt-0.5">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="text-gray-700 dark:text-gray-300">{{ t('governance.foundingTexts.point3') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Pays Bailleurs Section -->
      <div ref="donorCountriesRef" class="mb-20">
        <div class="text-center mb-12">
          <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('governance.donorCountries.title') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {{ t('governance.donorCountries.description') }}
          </p>
        </div>

        <!-- Marquee Container -->
        <div class="marquee-container overflow-hidden relative">
          <!-- Gradient overlays for fade effect -->
          <div class="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none"></div>
          <div class="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none"></div>

          <!-- Scrolling track -->
          <div class="marquee-track flex">
            <!-- First set of items -->
            <div class="marquee-content flex gap-6 animate-marquee">
              <div
                v-for="country in donorCountries"
                :key="'first-' + country.code"
                class="flex-shrink-0 group relative bg-white dark:bg-gray-800/50 rounded-xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`"
                    :alt="country.name"
                    class="w-10 h-7 object-cover rounded shadow-sm group-hover:scale-110 transition-transform duration-300"
                  />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {{ country.name }}
                  </span>
                </div>
              </div>
            </div>
            <!-- Duplicate set for seamless loop -->
            <div class="marquee-content flex gap-6 animate-marquee" aria-hidden="true">
              <div
                v-for="country in donorCountries"
                :key="'second-' + country.code"
                class="flex-shrink-0 group relative bg-white dark:bg-gray-800/50 rounded-xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`"
                    :alt="country.name"
                    class="w-10 h-7 object-cover rounded shadow-sm group-hover:scale-110 transition-transform duration-300"
                  />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {{ country.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Conseil d'Administration - Organigramme -->
      <div ref="boardRef" class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 lg:p-12 overflow-x-auto">
        <div class="text-center mb-12">
          <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('governance.board.title') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {{ t('governance.board.description') }}
          </p>
        </div>

        <!-- Hierarchical Org Chart -->
        <div class="org-chart min-w-[800px]">
          <!-- Niveau 1 : Président -->
          <div class="flex justify-center mb-8">
            <div class="org-node connector-down">
              <div class="org-card bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-72">
                <div class="flex flex-col items-center">
                  <div class="president-avatar-ring p-1 rounded-full mb-4">
                    <div :class="[getColorClasses(orgChart.president.color).bg, 'w-20 h-20 rounded-full flex items-center justify-center']">
                      <span class="text-2xl font-bold text-white">{{ orgChart.president.initials }}</span>
                    </div>
                  </div>
                  <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {{ t(orgChart.president.nameKey) }}
                  </h4>
                  <span :class="[getColorClasses(orgChart.president.color).badge, 'px-4 py-1.5 rounded-full text-sm font-medium border']">
                    {{ t(orgChart.president.roleKey) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Niveau 2 : Directeurs -->
          <div class="horizontal-line pt-8">
            <div class="flex justify-center gap-6 flex-wrap">
              <div
                v-for="director in orgChart.directors"
                :key="director.id"
                class="org-node connector-up"
              >
                <div class="org-card bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-56">
                  <div class="flex flex-col items-center">
                    <div :class="[getColorClasses(director.color).bg, 'w-16 h-16 rounded-full flex items-center justify-center mb-3 ring-4 ring-opacity-30', getColorClasses(director.color).bg.includes('emerald') ? 'ring-emerald-500/30' : getColorClasses(director.color).bg.includes('cyan') ? 'ring-cyan-500/30' : getColorClasses(director.color).bg.includes('amber') ? 'ring-amber-500/30' : 'ring-purple-500/30']">
                      <span class="text-lg font-bold text-white">{{ director.initials }}</span>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
                      {{ t(director.nameKey) }}
                    </h4>
                    <span :class="[getColorClasses(director.color).badge, 'px-3 py-1 rounded-full text-xs font-medium border text-center']">
                      {{ t(director.roleKey) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Blob Animation */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 12s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Morphing Border Animation */
.morphing-border-container {
  position: relative;
  width: 320px;
  height: 320px;
}

@media (min-width: 640px) {
  .morphing-border-container {
    width: 380px;
    height: 380px;
  }
}

.morphing-border {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(19deg, #10b981 0%, #6366f1 50%, #8b5cf6 100%);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  box-shadow: 15px 15px 50px rgba(16, 185, 129, 0.3), -15px -15px 50px rgba(99, 102, 241, 0.2);
  animation: morphing 10s ease-in-out infinite;
  overflow: hidden;
  padding: 8px;
  transition: animation-play-state 0.3s;
}

.morphing-border:hover {
  animation-play-state: paused;
}

.morphing-border img {
  border-radius: 25% 65% 65% 25% / 25% 25% 65% 65%;
  animation: morphing-inner 10s ease-in-out infinite;
}

@keyframes morphing {
  0% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    box-shadow: 15px 15px 50px rgba(16, 185, 129, 0.3), -15px -15px 50px rgba(99, 102, 241, 0.2);
  }
  25% {
    border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
    box-shadow: -10px 15px 50px rgba(139, 92, 246, 0.3), 10px -15px 50px rgba(16, 185, 129, 0.2);
  }
  50% {
    border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
    box-shadow: -15px -10px 50px rgba(16, 185, 129, 0.3), 15px 10px 50px rgba(99, 102, 241, 0.2);
  }
  75% {
    border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
    box-shadow: 10px -15px 50px rgba(139, 92, 246, 0.3), -10px 15px 50px rgba(16, 185, 129, 0.2);
  }
  100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    box-shadow: 15px 15px 50px rgba(16, 185, 129, 0.3), -15px -15px 50px rgba(99, 102, 241, 0.2);
  }
}

@keyframes morphing-inner {
  0% {
    border-radius: 25% 65% 65% 25% / 25% 25% 65% 65%;
  }
  25% {
    border-radius: 53% 37% 70% 20% / 71% 41% 49% 19%;
  }
  50% {
    border-radius: 45% 45% 28% 62% / 50% 22% 68% 40%;
  }
  75% {
    border-radius: 28% 62% 53% 37% / 58% 63% 27% 32%;
  }
  100% {
    border-radius: 25% 65% 65% 25% / 25% 25% 65% 65%;
  }
}

/* Org Chart Layout */
.org-chart {
  padding: 1rem 0;
}

.org-node {
  position: relative;
}

.org-card {
  position: relative;
}

/* Connector down - vertical line going down from element */
.connector-down::after {
  content: '';
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 32px;
  background: linear-gradient(to bottom, #10b981, #6366f1);
}

/* Connector up - vertical line going up to element */
.connector-up::before {
  content: '';
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 32px;
  background: linear-gradient(to bottom, #6366f1, #10b981);
}

/* Horizontal line for grouping children */
.horizontal-line {
  position: relative;
}

.horizontal-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 2px;
  background: linear-gradient(to right, transparent, #10b981, #6366f1, #10b981, transparent);
}

/* President avatar ring - static gradient border */
.president-avatar-ring {
  background: linear-gradient(135deg, #10b981, #6366f1, #8b5cf6);
  padding: 3px;
}

/* Marquee Animation for Donor Countries */
.marquee-container {
  padding: 1rem 0;
}

.marquee-track {
  display: flex;
  width: max-content;
}

.marquee-content {
  padding-right: 1.5rem;
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* Pause animation on hover */
.marquee-track:hover .animate-marquee {
  animation-play-state: paused;
}

/* Card entrance animation */
.org-card {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
