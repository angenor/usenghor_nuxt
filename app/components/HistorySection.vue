<script setup lang="ts">
const { t } = useI18n()

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: genesisRef } = useScrollAnimation({ animation: 'fadeInLeft', threshold: 0.15 })
const { elementRef: foundersRef } = useScrollAnimation({ animation: 'fadeInRight', threshold: 0.15 })
const { elementRef: usenghorRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.15 })
const { elementRef: legacyRef } = useScrollAnimation({ animation: 'zoomIn', threshold: 0.2 })

const founders = [
  { name: 'Léopold Sédar Senghor', role: 'history.founders.senghor.role', icon: 'fa-solid fa-feather-pointed' },
  { name: 'Maurice Druon', role: 'history.founders.druon.role', icon: 'fa-solid fa-pen-nib' },
  { name: 'Boutros Boutros-Ghali', role: 'history.founders.boutros.role', icon: 'fa-solid fa-globe' },
  { name: 'René-Jean Dupuy', role: 'history.founders.dupuy.role', icon: 'fa-solid fa-scale-balanced' }
]
</script>

<template>
  <section id="history" class="relative pb-16 pt-10 lg:py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Gradient Mesh -->
      <div class="absolute inset-0 bg-gradient-to-br from-brand-blue-50/30 via-transparent to-brand-red-50/30 dark:from-brand-blue-900/5 dark:via-transparent dark:to-brand-red-900/5"></div>

      <!-- Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <!-- Decorative Elements -->
      <div class="absolute top-20 right-1/4 w-64 h-64 bg-brand-blue-200/20 dark:bg-brand-blue-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-1/4 w-80 h-80 bg-brand-red-200/20 dark:bg-brand-red-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div ref="headerRef" class="text-center mb-16 lg:mb-20">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-landmark" class="w-3.5 h-3.5 mr-2" />
          {{ t('history.badge') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('history.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {{ t('history.subtitle') }}
        </p>
      </div>

      <!-- Timeline -->
      <div class="relative">
        <!-- Timeline Line -->
        <div class="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-blue-400 via-brand-blue-500 to-brand-red-500 transform -translate-x-1/2"></div>

        <!-- Section 1: Genesis -->
        <div class="relative mb-16 lg:mb-24">
          <div class="hidden lg:flex absolute left-1/2 top-8 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue-400 to-brand-blue-600 items-center justify-center shadow-lg shadow-brand-blue-500/30 z-10">
            <font-awesome-icon icon="fa-solid fa-seedling" class="w-5 h-5 text-white" />
          </div>

          <div class="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
            <div ref="genesisRef" class="lg:text-right lg:pr-16">
              <div class="history-box bg-white dark:bg-gray-800 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-gray-900 dark:border-gray-600">
                <div class="lg:hidden flex items-center gap-4 mb-6">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue-400 to-brand-blue-600 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-seedling" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-sm font-semibold text-brand-blue-600 dark:text-brand-blue-400">1989</span>
                </div>

                <div class="hidden lg:block mb-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300">
                    {{ t('history.genesis.date') }}
                  </span>
                </div>

                <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {{ t('history.genesis.title') }}
                </h3>

                <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {{ t('history.genesis.description') }}
                </p>

                <div class="space-y-3">
                  <div class="flex items-start gap-3 lg:flex-row-reverse lg:text-right">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-handshake" class="w-4 h-4 text-brand-blue-600 dark:text-brand-blue-400" />
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('history.genesis.point1') }}</p>
                  </div>
                  <div class="flex items-start gap-3 lg:flex-row-reverse lg:text-right">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-bullseye" class="w-4 h-4 text-brand-blue-600 dark:text-brand-blue-400" />
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('history.genesis.point2') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Founders -->
            <div ref="foundersRef" class="mt-8 lg:mt-0 lg:pl-16">
              <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ t('history.founders.title') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('history.founders.subtitle') }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div
                  v-for="founder in founders"
                  :key="founder.name"
                  class="group bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-all duration-300"
                >
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue-400/20 to-brand-blue-500/20 dark:from-brand-blue-400/10 dark:to-brand-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <font-awesome-icon :icon="founder.icon" class="w-5 h-5 text-brand-blue-600 dark:text-brand-blue-400" />
                  </div>
                  <h5 class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ founder.name }}</h5>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ t(founder.role) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: USenghor -->
        <div class="relative">
          <div class="hidden lg:flex absolute left-1/2 top-8 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-brand-red-400 to-brand-red-600 items-center justify-center shadow-lg shadow-brand-red-500/30 z-10">
            <font-awesome-icon icon="fa-solid fa-university" class="w-5 h-5 text-white" />
          </div>

          <div class="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
            <div class="hidden lg:block lg:pr-16"></div>

            <div ref="usenghorRef" class="lg:pl-16">
              <div class="animated-border-box rounded-3xl p-8 lg:p-10">
                <div class="lg:hidden flex items-center gap-4 mb-6">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-red-400 to-brand-red-600 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-university" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-sm font-semibold text-brand-red-600 dark:text-brand-red-400">{{ t('history.usenghor.since') }}</span>
                </div>

                <div class="hidden lg:block mb-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-red-100 dark:bg-brand-red-900/40 text-brand-red-700 dark:text-brand-red-300">
                    {{ t('history.usenghor.since') }}
                  </span>
                </div>

                <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {{ t('history.usenghor.title') }}
                </h3>

                <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {{ t('history.usenghor.description') }}
                </p>

                <div class="space-y-4">
                  <div class="flex items-center gap-4 p-3 bg-brand-red-50 dark:bg-brand-red-900/20 rounded-xl">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-red-100 dark:bg-brand-red-900/40 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-door-open" class="w-5 h-5 text-brand-red-600 dark:text-brand-red-400" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('history.usenghor.milestone1.title') }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('history.usenghor.milestone1.desc') }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 p-3 bg-brand-red-50 dark:bg-brand-red-900/20 rounded-xl">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-red-100 dark:bg-brand-red-900/40 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-award" class="w-5 h-5 text-brand-red-600 dark:text-brand-red-400" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('history.usenghor.milestone2.title') }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('history.usenghor.milestone2.desc') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Legacy Section -->
        <div ref="legacyRef" class="mt-16 lg:mt-24">
          <div class="relative bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden">
            <div class="absolute inset-0 opacity-10">
              <div class="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]"></div>
            </div>

            <div class="relative px-8 py-12 lg:px-16 lg:py-16">
              <div class="max-w-3xl mx-auto text-center">
                <div class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20 mb-6">
                  <font-awesome-icon icon="fa-solid fa-star" class="w-3.5 h-3.5 mr-2 text-brand-blue-400" />
                  {{ t('history.legacy.badge') }}
                </div>

                <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4">
                  {{ t('history.legacy.title') }}
                </h3>

                <p class="text-white/80 leading-relaxed mb-6">
                  {{ t('history.legacy.description') }}
                </p>

                <div class="flex flex-wrap justify-center gap-4">
                  <div class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                    <font-awesome-icon icon="fa-solid fa-globe-africa" class="w-4 h-4 text-brand-blue-400" />
                    <span class="text-sm text-white">{{ t('history.legacy.tag1') }}</span>
                  </div>
                  <div class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                    <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-4 h-4 text-brand-blue-400" />
                    <span class="text-sm text-white">{{ t('history.legacy.tag2') }}</span>
                  </div>
                  <div class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                    <font-awesome-icon icon="fa-solid fa-handshake-angle" class="w-4 h-4 text-brand-blue-400" />
                    <span class="text-sm text-white">{{ t('history.legacy.tag3') }}</span>
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
.history-box {
  --borderradius: 1.5rem;
  --bgsize: 0.38rem;
  position: relative;
  transform: translateY(-2px);
  z-index: 2;
  transition: transform 0.3s ease;
}

.history-box:hover {
  transform: translateY(-4px);
}

.history-box::before,
.history-box::after {
  border-radius: var(--borderradius);
  background-image: linear-gradient(
    45deg,
    #fff 33.33%,
    rgba(0, 0, 0, 0.95) 33.33%,
    rgba(0, 0, 0, 0.95) 50%,
    #fff 50%,
    #fff 83.33%,
    rgba(0, 0, 0, 0.95) 83.33%,
    rgba(0, 0, 0, 0.95) 100%
  );
  content: "";
  display: block;
  position: absolute;
  z-index: -2;
  top: 0.75rem;
  left: 0.75rem;
  width: 100%;
  height: 100%;
  background-size: var(--bgsize) var(--bgsize);
}

.history-box::before {
  top: 0;
  left: 0;
  background: white;
  z-index: -1;
}

/* Animated Border Box */
@property --border-angle {
  syntax: "<angle>";
  inherits: true;
  initial-value: 0turn;
}

.animated-border-box {
  --border-angle: 0turn;
  --main-bg: conic-gradient(
    from var(--border-angle),
    #f8fafc,
    #f1f5f9 5%,
    #f1f5f9 60%,
    #f8fafc 95%
  );
  --gradient-border: conic-gradient(
    from var(--border-angle),
    transparent 25%,
    #2b4bbf,
    #f32525 99%,
    transparent
  );

  border: solid 4px transparent;
  border-radius: 1.5rem;
  background:
    var(--main-bg) padding-box,
    var(--gradient-border) border-box,
    var(--main-bg) border-box;
  background-position: center center;
  animation: bg-spin 3s linear infinite;
}

.animated-border-box:hover {
  animation-play-state: paused;
}

@keyframes bg-spin {
  to {
    --border-angle: 1turn;
  }
}
</style>

<!-- Dark mode styles (non-scoped to access .dark on html) -->
<style>
.dark .history-box::before {
  background: rgb(31 41 55) !important;
}

.dark .history-box::after {
  background-image: linear-gradient(
    45deg,
    rgb(31 41 55) 33.33%,
    rgba(255, 255, 255, 0.7) 33.33%,
    rgba(255, 255, 255, 0.7) 50%,
    rgb(31 41 55) 50%,
    rgb(31 41 55) 83.33%,
    rgba(255, 255, 255, 0.7) 83.33%,
    rgba(255, 255, 255, 0.7) 100%
  ) !important;
}

.dark .animated-border-box {
  --main-bg: conic-gradient(
    from var(--border-angle),
    rgb(31 41 55),
    rgb(17 24 39) 5%,
    rgb(17 24 39) 60%,
    rgb(31 41 55) 95%
  );
}
</style>
