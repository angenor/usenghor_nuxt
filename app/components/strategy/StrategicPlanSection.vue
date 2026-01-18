<script setup lang="ts">
interface Props {
  title: string
  summary: string
  coverImage?: string
  pdfUrl?: string
  pdfLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  coverImage: 'https://picsum.photos/seed/strategic-plan/800/600',
  pdfUrl: '/documents/plan-strategique-2024-2030.pdf',
  pdfLabel: 'Telecharger le plan strategique (PDF)'
})

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Image -->
        <div class="relative">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              :src="props.coverImage"
              :alt="props.title"
              class="w-full h-auto object-cover aspect-[4/3]"
            />
            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-brand-blue-900/30 to-transparent"></div>
          </div>
          <!-- Decorative element -->
          <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-red-400 rounded-xl -z-10"></div>
        </div>

        <!-- Content -->
        <div class="space-y-6">
          <!-- Title -->
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            <span class="relative inline-block">
              {{ props.title }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
            </span>
          </h2>

          <!-- Summary -->
          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ props.summary }}
          </p>

          <!-- PDF Download Button -->
          <div v-if="props.pdfUrl" class="pt-4">
            <a
              :href="props.pdfUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-gray-200 dark:border-gray-700"
            >
              <font-awesome-icon
                icon="fa-solid fa-file-pdf"
                class="w-5 h-5 text-red-500"
              />
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ props.pdfLabel }}
              </span>
              <font-awesome-icon
                icon="fa-solid fa-download"
                class="w-4 h-4 text-gray-400 group-hover:text-brand-blue-500 transition-colors duration-300"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
