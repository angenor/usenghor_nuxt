<script setup lang="ts">
const { t } = useI18n()

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: foundingTextsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.15 })
const { elementRef: donorCountriesRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.2 })

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

</script>

<template>
  <section class="relative py-16 lg:py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-blue-50/50 via-transparent to-brand-red-50/50 dark:from-brand-blue-900/10 dark:via-transparent dark:to-brand-red-900/10"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-brand-blue-200/30 dark:bg-brand-blue-500/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute top-1/2 -left-20 w-96 h-96 bg-brand-red-200/30 dark:bg-brand-red-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div ref="headerRef" class="text-center mb-16 lg:mb-20">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 mb-4">
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
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300">
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
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center mt-0.5">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <span class="text-gray-700 dark:text-gray-300">{{ t('governance.foundingTexts.point1') }}</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center mt-0.5">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <span class="text-gray-700 dark:text-gray-300">{{ t('governance.foundingTexts.point2') }}</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center mt-0.5">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <span class="text-gray-700 dark:text-gray-300">{{ t('governance.foundingTexts.point3') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Pays Bailleurs Section -->
      <div ref="donorCountriesRef">
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
                class="flex-shrink-0 group relative bg-white dark:bg-gray-800/50 rounded-xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-brand-blue-500/10"
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
                class="flex-shrink-0 group relative bg-white dark:bg-gray-800/50 rounded-xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-brand-blue-500/10"
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
  background: linear-gradient(19deg, #2b4bbf 0%, #f32525 50%, #8b5cf6 100%);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  box-shadow: 15px 15px 50px rgba(43, 75, 191, 0.3), -15px -15px 50px rgba(243, 37, 37, 0.2);
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
    box-shadow: 15px 15px 50px rgba(43, 75, 191, 0.3), -15px -15px 50px rgba(243, 37, 37, 0.2);
  }
  25% {
    border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
    box-shadow: -10px 15px 50px rgba(139, 92, 246, 0.3), 10px -15px 50px rgba(43, 75, 191, 0.2);
  }
  50% {
    border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
    box-shadow: -15px -10px 50px rgba(43, 75, 191, 0.3), 15px 10px 50px rgba(243, 37, 37, 0.2);
  }
  75% {
    border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
    box-shadow: 10px -15px 50px rgba(139, 92, 246, 0.3), -10px 15px 50px rgba(43, 75, 191, 0.2);
  }
  100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    box-shadow: 15px 15px 50px rgba(43, 75, 191, 0.3), -15px -15px 50px rgba(243, 37, 37, 0.2);
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
</style>
