<script setup lang="ts">
const props = withDefaults(defineProps<{
  image?: string | null
}>(), {
  image: null,
})

const { t, tm } = useI18n()
const localePath = useLocalePath()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Chiffres clés centralisés (même source que MissionSection)
const keyFiguresStore = useKeyFiguresStore()

onMounted(() => {
  keyFiguresStore.fetchFigures()
})

const stats = computed(() => ({
  graduates: Number(keyFiguresStore.getFigure('stats_graduates')) || 5000,
  countries: Number(keyFiguresStore.getFigure('stats_countries')) || 54,
  years: Number(keyFiguresStore.getFigure('stats_years')) || 30,
}))

// Get translated array
const whyItems = computed(() => tm('careers.students.why.items') as string[])

// Programs with infographic colors
const programs = [
  {
    key: 'masters',
    icon: 'fa-solid fa-graduation-cap',
    link: '/formations/masters',
    colors: ['#2b4bbf', '#8aabff'] // brand-blue
  },
  {
    key: 'doctoral',
    icon: 'fa-solid fa-flask',
    link: '/formations/doctorats',
    colors: ['#8b5cf6', '#c4b5fd'] // purple
  },
  {
    key: 'diplomes',
    icon: 'fa-solid fa-certificate',
    link: '/formations/diplomes-universitaires',
    colors: ['#f32525', '#ffa0a0'] // brand-red
  },
  {
    key: 'certifications',
    icon: 'fa-solid fa-award',
    link: '/formations/certifiantes',
    colors: ['#2b4bbf', '#5478e6'] // brand-blue
  }
]

// Image
const imageUrl = computed(() => props.image || '/images/bg/backgroud_senghor1.jpg')
</script>

<template>
  <section
    id="etudiants"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 scroll-mt-20 overflow-hidden"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
        <!-- Text Content -->
        <div class="order-2 lg:order-1">
          <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5 mr-2" />
            {{ t('careers.opportunities.students.title') }}
          </span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            <span class="relative inline-block">
              {{ t('careers.students.title') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
            </span>
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {{ t('careers.students.text') }}
          </p>

          <!-- Stats Row -->
          <div class="flex flex-wrap gap-6 mb-8">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-brand-blue-500 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-users" class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.graduates.toLocaleString() }}+</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('mission.experience.stats.graduates') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-globe-africa" class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.countries }}+</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('mission.experience.stats.countries') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-brand-red-500 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-award" class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.years }}+</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('mission.experience.stats.years') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Image -->
        <div class="order-1 lg:order-2 relative">
          <div class="relative rounded-2xl overflow-hidden shadow-xl">
            <img
              :src="imageUrl"
              :alt="t('careers.students.title')"
              class="w-full h-72 sm:h-80 lg:h-full lg:min-h-[400px] object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-brand-blue-600/30 to-transparent"></div>
          </div>

          <!-- Decorative elements -->
          <div class="absolute -top-4 -right-4 w-24 h-24 bg-brand-blue-200 dark:bg-brand-blue-800/30 rounded-full blur-2xl opacity-60"></div>
          <div class="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200 dark:bg-purple-800/30 rounded-full blur-2xl opacity-60"></div>
        </div>
      </div>

      <!-- Two column layout: Why + Programs -->
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <!-- Left: Why study with us + CTA -->
        <div>
          <!-- Why study with us -->
          <div class="mb-10">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-star" class="w-4 h-4 text-brand-blue-600 dark:text-brand-blue-400" />
              </span>
              {{ t('careers.students.why.title') }}
            </h3>
            <div class="space-y-3">
              <div
                v-for="(item, index) in whyItems"
                :key="index"
                class="group flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-blue-300 dark:hover:border-brand-blue-700 transition-all duration-300 hover:shadow-md"
              >
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue-500 to-brand-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-4 h-4 text-white" />
                </div>
                <span class="text-gray-700 dark:text-gray-300 pt-0.5">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Programs Infographic -->
        <div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-book-open" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </span>
            {{ t('careers.students.programs.title') }}
          </h3>

          <!-- Infographic -->
          <div class="infographic-container">
            <NuxtLink
              v-for="(program, index) in programs"
              :key="program.key"
              :to="localePath(program.link)"
              class="infographic-item group"
              :class="{ 'infographic-item--even': index % 2 === 1 }"
              :style="{
                '--c0': program.colors[0],
                '--c1': program.colors[1],
                '--idx': index
              }"
            >
              <!-- Number -->
              <span class="infographic-number">
                {{ String(index + 1).padStart(2, '0') }}
              </span>

              <!-- Content -->
              <div class="infographic-content">
                <h4 class="infographic-title">
                  {{ t(`careers.students.programs.${program.key}.title`) }}
                </h4>
                <p class="infographic-text">
                  {{ t(`careers.students.programs.${program.key}.description`) }}
                </p>
              </div>

              <!-- Icon -->
              <div class="infographic-icon">
                <font-awesome-icon :icon="program.icon" />
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Infographic */
.infographic-container {
  display: flex;
  flex-direction: column;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.15));
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.dark .infographic-container {
  filter: drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.4));
}

.infographic-item {
  --arrow-size: 1.5rem;
  --overlap: 0.5rem;

  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  padding-left: 2.5rem;
  margin-bottom: calc(-1 * var(--overlap));
  background: linear-gradient(90deg, var(--c0), var(--c1));
  clip-path: polygon(
    0 50%,
    var(--arrow-size) 0,
    100% var(--overlap),
    100% calc(100% - var(--overlap)),
    var(--arrow-size) 100%
  );
  color: #1a1a1a;
  text-decoration: none;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.infographic-item:hover {
  transform: translateX(4px);
  filter: brightness(1.05);
}

/* Even items - arrow points right */
.infographic-item--even {
  clip-path: polygon(
    0 var(--overlap),
    calc(100% - var(--arrow-size)) 0,
    100% 50%,
    calc(100% - var(--arrow-size)) 100%,
    0 calc(100% - var(--overlap))
  );
  background: linear-gradient(-90deg, var(--c0), var(--c1));
  padding-left: 1.5rem;
  padding-right: 2.5rem;
}

.infographic-item--even:hover {
  transform: translateX(-4px);
}

.infographic-item--even .infographic-number {
  order: 3;
  text-align: left;
  padding-left: 0.5rem;
  padding-right: 0;
}

.infographic-item--even .infographic-icon {
  order: 1;
  padding-left: 0;
  padding-right: 0.5rem;
}

.infographic-item--even .infographic-content {
  text-align: right;
}

/* First item - flat top */
.infographic-item:first-child {
  clip-path: polygon(
    0 50%,
    var(--arrow-size) 0,
    100% 0,
    100% calc(100% - var(--overlap)),
    var(--arrow-size) 100%
  );
}

.infographic-item--even:first-child {
  clip-path: polygon(
    0 0,
    calc(100% - var(--arrow-size)) 0,
    100% 50%,
    calc(100% - var(--arrow-size)) 100%,
    0 calc(100% - var(--overlap))
  );
}

/* Last item - flat bottom */
.infographic-item:last-child {
  margin-bottom: 0;
  clip-path: polygon(
    0 50%,
    var(--arrow-size) 0,
    100% var(--overlap),
    100% 100%,
    var(--arrow-size) 100%
  );
}

.infographic-item--even:last-child {
  clip-path: polygon(
    0 var(--overlap),
    calc(100% - var(--arrow-size)) 0,
    100% 50%,
    calc(100% - var(--arrow-size)) 100%,
    0 100%
  );
}

.infographic-number {
  font-size: 2rem;
  font-weight: 700;
  opacity: 0.4;
  padding-right: 0.5rem;
  font-family: ui-monospace, monospace;
}

.infographic-content {
  flex: 1;
}

.infographic-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  transition: transform 0.3s ease;
}

.infographic-item:hover .infographic-title {
  transform: scale(1.02);
}

.infographic-text {
  font-size: 0.875rem;
  opacity: 0.85;
  line-height: 1.4;
}

.infographic-icon {
  font-size: 1.75rem;
  opacity: 0.3;
  padding-right: 0.5rem;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.infographic-item:hover .infographic-icon {
  opacity: 0.5;
  transform: scale(1.1);
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .infographic-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .infographic-item {
    --arrow-size: 1rem;
    --overlap: 0.4rem;
    grid-template-columns: auto 1fr;
    padding: 1rem 1rem 1rem 2rem;
  }

  .infographic-item--even {
    padding: 1rem 2rem 1rem 1rem;
  }

  .infographic-item--even .infographic-number {
    order: 0;
    text-align: right;
    padding-left: 0;
    padding-right: 0.5rem;
  }

  .infographic-item--even .infographic-content {
    text-align: left;
  }

  .infographic-icon {
    display: none;
  }

  .infographic-item:hover,
  .infographic-item--even:hover {
    transform: translateY(-2px);
  }

  .infographic-number {
    font-size: 1.5rem;
  }

  .infographic-title {
    font-size: 1rem;
  }

  .infographic-text {
    font-size: 0.8rem;
  }
}
</style>
