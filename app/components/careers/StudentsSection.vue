<script setup lang="ts">
const { t, tm } = useI18n()
const localePath = useLocalePath()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Get translated array
const whyItems = computed(() => tm('careers.students.why.items') as string[])

// Programs with infographic colors
const programs = [
  {
    key: 'masters',
    icon: 'fa-solid fa-graduation-cap',
    link: '/formations/masters',
    colors: ['#3b82f6', '#93c5fd'] // blue
  },
  {
    key: 'doctoral',
    icon: 'fa-solid fa-flask',
    link: '/formations/doctorat',
    colors: ['#8b5cf6', '#c4b5fd'] // purple
  },
  {
    key: 'diplomes',
    icon: 'fa-solid fa-certificate',
    link: '/formations/diplomes',
    colors: ['#f59e0b', '#fcd34d'] // amber
  },
  {
    key: 'certifications',
    icon: 'fa-solid fa-award',
    link: '/formations/certifications',
    colors: ['#10b981', '#6ee7b7'] // emerald
  }
]
</script>

<template>
  <section
    id="etudiants"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 scroll-mt-20"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="max-w-3xl mx-auto text-center mb-12">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5 mr-2" />
          {{ t('careers.opportunities.students.title') }}
        </span>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('careers.students.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          {{ t('careers.students.text') }}
        </p>
      </div>

      <!-- Two column layout -->
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <!-- Left: Content -->
        <div class="order-2 lg:order-1">
          <!-- Why study with us -->
          <div class="mb-10">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {{ t('careers.students.why.title') }}
            </h3>
            <div class="space-y-3">
              <div
                v-for="(item, index) in whyItems"
                :key="index"
                class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span class="text-gray-700 dark:text-gray-300 pt-1">{{ item }}</span>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('careers.students.cta.title') }}
            </h4>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              {{ t('careers.students.cta.text') }}
            </p>
            <NuxtLink
              :to="localePath('/inscription')"
              class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              <font-awesome-icon icon="fa-solid fa-file-pen" class="w-4 h-4" />
              {{ t('careers.students.cta.button') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Right: Programs Infographic -->
        <div class="order-1 lg:order-2">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center lg:text-left">
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
.infographic-container {
  display: flex;
  flex-direction: column;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.15));
  padding-left: 1.5rem; /* Space for left arrow */
  padding-right: 1.5rem; /* Space for right arrow */
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
