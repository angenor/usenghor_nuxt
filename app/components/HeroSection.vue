<script setup lang="ts">
const localePath = useLocalePath()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('homepage')

// Configuration des slides avec clés éditoriales
const slides = [
  {
    image: '/images/bg/backgroud_senghor1.jpg',
    editorialTitleKey: 'hero.slide1.title',
    editorialSubtitleKey: 'hero.slide1.subtitle',
  },
  {
    image: '/images/bg/backgroud_senghor2.jpg',
    editorialTitleKey: 'hero.slide2.title',
    editorialSubtitleKey: 'hero.slide2.subtitle',
  },
  {
    image: '/images/bg/backgroud_senghor3.jpg',
    editorialTitleKey: 'hero.slide3.title',
    editorialSubtitleKey: 'hero.slide3.subtitle',
  },
  {
    image: '/images/bg/backgroud_senghor4.jpg',
    editorialTitleKey: 'hero.slide4.title',
    editorialSubtitleKey: 'hero.slide4.subtitle',
  },
]

const currentSlide = ref(0)
const isTransitioning = ref(false)
let slideInterval: ReturnType<typeof setInterval> | null = null

const currentSlideData = computed(() => slides[currentSlide.value])

// Titre et sous-titre du slide courant (avec fallback i18n)
const currentTitle = computed(() => {
  const slide = currentSlideData.value
  return slide ? getContent(slide.editorialTitleKey) : ''
})
const currentSubtitle = computed(() => {
  const slide = currentSlideData.value
  return slide ? getContent(slide.editorialSubtitleKey) : ''
})

// Textes des boutons CTA
const ctaDiscover = computed(() => getContent('hero.cta.discover'))
const ctaContact = computed(() => getContent('hero.cta.contact'))

const goToSlide = (index: number, resetTimer = false) => {
  if (isTransitioning.value || index === currentSlide.value) return
  isTransitioning.value = true
  currentSlide.value = index
  if (resetTimer && slideInterval) {
    clearInterval(slideInterval)
    slideInterval = setInterval(() => goToSlide((currentSlide.value + 1) % slides.length), 6000)
  }
  setTimeout(() => {
    isTransitioning.value = false
  }, 1000)
}

const nextSlide = () => {
  goToSlide((currentSlide.value + 1) % slides.length, true)
}

const prevSlide = () => {
  goToSlide((currentSlide.value - 1 + slides.length) % slides.length, true)
}

onMounted(() => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()

  // Démarrer le carrousel
  slideInterval = setInterval(() => goToSlide((currentSlide.value + 1) % slides.length), 6000)
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
})
</script>

<template>
  <section class="relative h-screen min-h-[700px] overflow-hidden">
    <!-- Background Slides -->
    <div class="absolute inset-0">
      <TransitionGroup name="slide">
        <div
          v-for="(item, index) in slides"
          :key="index"
          v-show="currentSlide === index"
          class="absolute inset-0"
        >
          <img
            :src="item.image"
            :alt="`Slide ${index + 1}`"
            class="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
        </div>
      </TransitionGroup>

      <!-- Gradient Overlays -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 h-full flex items-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="max-w-3xl">
          <!-- Title -->
          <h1
            :key="currentSlide + '-title'"
            class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 animate__animated animate__fadeInUp"
          >
            {{ currentTitle }}
          </h1>

          <!-- Subtitle -->
          <p
            :key="currentSlide + '-subtitle'"
            class="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl animate__animated animate__fadeInUp animate__delay-1s"
          >
            {{ currentSubtitle }}
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap gap-4 animate__animated animate__fadeInUp animate__delay-2s">
            <NuxtLink
              :to="localePath('/formations')"
              class="group relative inline-flex items-center px-8 py-4 bg-brand-blue-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:bg-brand-blue-600 hover:shadow-2xl hover:shadow-brand-blue-500/30 hover:-translate-y-1"
            >
              <span class="relative z-10">{{ ctaDiscover }}</span>
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="relative z-10 w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </NuxtLink>
            <NuxtLink
              :to="localePath('/contact')"
              class="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
            >
              <span>{{ ctaContact }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <div class="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20">
      <button
        @click="prevSlide"
        class="group p-3 lg:p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
        :disabled="isTransitioning"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:-translate-x-1" />
      </button>
    </div>
    <div class="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20">
      <button
        @click="nextSlide"
        class="group p-3 lg:p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
        :disabled="isTransitioning"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>

    <!-- Slide Indicators -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3">
      <button
        v-for="(item, index) in slides"
        :key="index"
        @click="goToSlide(index, true)"
        class="group relative h-3 transition-all duration-500 rounded-full overflow-hidden"
        :class="[
          currentSlide === index ? 'w-12 bg-brand-blue-500' : 'w-3 bg-white/40 hover:bg-white/60'
        ]"
      >
        <span
          v-if="currentSlide === index"
          class="absolute inset-0 bg-brand-blue-300 animate-progress"
        ></span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 1s ease-out;
}

.slide-enter-from {
  opacity: 0;
  transform: scale(1.1);
}

.slide-leave-to {
  opacity: 0;
}

@keyframes slow-zoom {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.animate-slow-zoom {
  animation: slow-zoom 10s ease-out forwards;
}

@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}

.animate-progress {
  animation: progress 6s linear;
}
</style>
