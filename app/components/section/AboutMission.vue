<script setup lang="ts">
interface DiscoverItem {
  label: string
}

interface Props {
  title: string
  content: string
  illustration?: string
  transformText?: string
  discoverItems?: DiscoverItem[]
  ctaLabel?: string
  ctaAnchor?: string
}

const props = withDefaults(defineProps<Props>(), {
  illustration: '/images/bg/Asset-1.webp',
  ctaLabel: 'Découvrir',
  ctaAnchor: '#history'
})

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

const scrollToSection = () => {
  const element = document.querySelector(props.ctaAnchor)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <section
    id="mission"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Illustration -->
        <div class="relative order-2 lg:order-1 flex items-center justify-center">
          <img
            :src="props.illustration"
            :alt="props.title"
            class="w-full max-w-md lg:max-w-lg h-auto object-contain drop-shadow-lg"
          />
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-2">

          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span class="relative inline-block">
              {{ props.title }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
            </span>
          </h2>

          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            {{ props.content }}
          </p>

          <!-- Accompagner la transformation de l'Afrique -->
          <div v-if="props.transformText" class="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-l-4 border-amber-500">
            <p class="text-gray-700 dark:text-gray-200 font-medium italic">
              {{ props.transformText }}
            </p>
          </div>

          <!-- Discover Box -->
          <div v-if="props.discoverItems?.length" class="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <ul class="mb-5 flex flex-wrap gap-x-6 gap-y-2">
              <li
                v-for="(item, index) in props.discoverItems"
                :key="index"
                class="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <span class="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span class="font-medium">{{ item.label }}</span>
              </li>
            </ul>

            <!-- CTA Button -->
            <button
              type="button"
              class="group inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-full transition-all duration-300 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
              @click="scrollToSection"
            >
              <span>{{ props.ctaLabel }}</span>
              <font-awesome-icon
                icon="fa-solid fa-arrow-right"
                class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
