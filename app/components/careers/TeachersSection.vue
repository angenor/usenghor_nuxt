<script setup lang="ts">
const { t, tm } = useI18n()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Get translated arrays
const benefits = computed(() => tm('careers.teachers.benefits.items') as any[])
const positions = computed(() => tm('careers.teachers.positions.items') as any[])
</script>

<template>
  <section
    id="enseignants"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300 scroll-mt-20"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <!-- Image -->
        <div class="relative order-2 lg:order-1">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://picsum.photos/seed/teachers-career/800/600"
              :alt="t('careers.teachers.title')"
              class="w-full h-auto object-cover aspect-[4/3]"
            />
            <div class="absolute inset-0 bg-gradient-to-tr from-lime-500/20 to-transparent"></div>
          </div>
          <div class="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl -z-10 bg-lime-500/10"></div>
          <div class="absolute -top-4 -right-4 w-32 h-32 rounded-full -z-10 bg-lime-500/10"></div>
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-2">
          <!-- Badge -->
          <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400">
            <font-awesome-icon icon="fa-solid fa-chalkboard-user" class="w-3.5 h-3.5 mr-2" />
            {{ t('careers.opportunities.teachers.title') }}
          </span>

          <!-- Title -->
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('careers.teachers.title') }}
          </h2>

          <!-- Subtitle -->
          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            {{ t('careers.teachers.text') }}
          </p>

          <!-- Benefits -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ t('careers.teachers.benefits.title') }}
            </h3>
            <div class="grid sm:grid-cols-2 gap-4">
              <div
                v-for="(benefit, index) in benefits"
                :key="index"
                class="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
              >
                <div class="w-10 h-10 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon
                    :icon="benefit.icon"
                    class="w-4 h-4 text-lime-600 dark:text-lime-400"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white text-sm">
                    {{ benefit.title }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ benefit.text }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Position types -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ t('careers.teachers.positions.title') }}
            </h3>
            <div class="space-y-3">
              <div
                v-for="(position, index) in positions"
                :key="index"
                class="flex items-start gap-3"
              >
                <font-awesome-icon
                  icon="fa-solid fa-check-circle"
                  class="w-5 h-5 text-lime-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ position.title }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ position.text }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="p-6 rounded-xl bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
              {{ t('careers.teachers.cta.title') }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {{ t('careers.teachers.cta.text') }}
            </p>
            <a
              :href="`mailto:${t('careers.teachers.cta.email')}`"
              class="inline-flex items-center gap-2 px-6 py-3 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/30 hover:-translate-y-0.5"
            >
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-4 h-4" />
              {{ t('careers.teachers.cta.button') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
