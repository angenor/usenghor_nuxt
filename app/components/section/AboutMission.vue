<script setup lang="ts">
interface DiscoverItem {
  label: string
}

interface CtaLink {
  label: string
  to: string
  icon?: string
}

interface Props {
  title: string
  content: string
  illustration?: string
  transformText?: string
  discoverItems?: DiscoverItem[]
  ctaLabel?: string
  ctaAnchor?: string
  ctaLinks?: CtaLink[]
}

const props = withDefaults(defineProps<Props>(), {
  illustration: '/images/bg/bg_mission_section.jpeg',
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
            class="illustration-bordered w-full max-w-md lg:max-w-lg h-auto object-contain"
          />
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-2">

          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span class="relative inline-block">
              {{ props.title }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
            </span>
          </h2>

          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            {{ props.content }}
          </p>

          <!-- Accompagner la transformation de l'Afrique -->
          <div v-if="props.transformText" class="mb-8 p-4 bg-brand-blue-50 dark:bg-brand-blue-900/20 rounded-xl border-l-4 border-brand-blue-500">
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
                <span class="w-2 h-2 rounded-full bg-brand-blue-500 flex-shrink-0"></span>
                <span class="font-medium">{{ item.label }}</span>
              </li>
            </ul>

            <!-- CTA Button -->
            <button
              type="button"
              class="group inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-500 text-white font-semibold rounded-full transition-all duration-300 hover:bg-brand-blue-600 hover:shadow-lg hover:shadow-brand-blue-500/30 hover:-translate-y-0.5"
              @click="scrollToSection"
            >
              <span>{{ props.ctaLabel }}</span>
              <font-awesome-icon
                icon="fa-solid fa-arrow-right"
                class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>

          <!-- CTA Links -->
          <div v-if="props.ctaLinks?.length" class="flex flex-wrap gap-4 mt-8">
            <NuxtLink
              v-for="(link, index) in props.ctaLinks"
              :key="index"
              :to="link.to"
              :class="[
                'group inline-flex items-center gap-3 px-6 py-3 font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5',
                index === 0
                  ? 'bg-brand-blue-500 text-white hover:bg-brand-blue-600 hover:shadow-lg hover:shadow-brand-blue-500/30'
                  : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-blue-500 hover:text-brand-blue-600 dark:hover:border-brand-blue-500 dark:hover:text-brand-blue-400'
              ]"
            >
              <font-awesome-icon
                v-if="link.icon"
                :icon="link.icon"
                class="w-5 h-5"
              />
              <span>{{ link.label }}</span>
              <font-awesome-icon
                icon="fa-solid fa-arrow-right"
                class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.illustration-bordered {
  --c: #2b4bbf; /* brand-blue-500 */
  --b: 6px; /* thickness of the border */
  --o: 20px; /* control the offset */

  --_p: calc(2 * var(--o) + var(--b));
  padding: var(--_p) var(--_p) 0 0;
  outline: var(--b) solid var(--c);
  outline-offset: calc(var(--o) - var(--_p));
  transition: 0.4s;
}

.illustration-bordered:hover {
  padding: calc(var(--_p) / 2);
}

:root.dark .illustration-bordered {
  --c: #5478e6; /* brand-blue-400 for dark mode */
}
</style>
