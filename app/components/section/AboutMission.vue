<script setup lang="ts">
interface Cta {
  label: string
  to: string
}

interface Props {
  title: string
  content: string
  image?: string
  transformText?: string
  cta?: Cta
  ctaSecondary?: Cta
}

const props = withDefaults(defineProps<Props>(), {
  image: 'https://picsum.photos/seed/about-mission/800/600'
})

const localePath = useLocalePath()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
</script>

<template>
  <section
    id="mission"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Image -->
        <div class="relative order-2 lg:order-1">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              :src="props.image"
              :alt="props.title"
              class="w-full h-auto object-cover aspect-[4/3]"
            />
            <!-- Decorative overlay -->
            <div class="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent"></div>
          </div>
          <!-- Decorative element -->
          <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-amber-500/10 rounded-2xl -z-10"></div>
          <div class="absolute -top-4 -right-4 w-32 h-32 bg-amber-500/10 rounded-full -z-10"></div>
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-2">
          <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-6">
            <font-awesome-icon icon="fa-solid fa-bullseye" class="w-3.5 h-3.5 mr-2" />
            Mission
          </span>

          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {{ props.title }}
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

          <!-- CTAs -->
          <div class="flex flex-wrap gap-4">
            <NuxtLink
              v-if="props.cta"
              :to="localePath(props.cta.to)"
              class="group inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-full transition-all duration-300 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
            >
              <span>{{ props.cta.label }}</span>
              <font-awesome-icon
                icon="fa-solid fa-arrow-right"
                class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </NuxtLink>

            <NuxtLink
              v-if="props.ctaSecondary"
              :to="localePath(props.ctaSecondary.to)"
              class="group inline-flex items-center gap-2 px-6 py-3 border-2 border-amber-500 text-amber-600 dark:text-amber-400 font-semibold rounded-full transition-all duration-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <span>{{ props.ctaSecondary.label }}</span>
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
