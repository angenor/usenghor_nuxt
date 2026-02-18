<script setup lang="ts">
const localePath = useLocalePath()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('homepage')

// API Media pour résoudre les URLs des images
const { getMediaUrl } = useMediaApi()

// État de chargement initial (attendre que les contenus soient chargés)
const isContentLoaded = ref(false)

// Configuration des slides avec clés éditoriales (pas d'images par défaut)
const slidesConfig = [
  {
    editorialTitleKey: 'hero.slide1.title',
    editorialSubtitleKey: 'hero.slide1.subtitle',
    editorialImageKey: 'hero.slide1.image',
    editorialCta1TextKey: 'hero.slide1.cta1.text',
    editorialCta1LinkKey: 'hero.slide1.cta1.link',
    editorialCta2TextKey: 'hero.slide1.cta2.text',
    editorialCta2LinkKey: 'hero.slide1.cta2.link',
  },
  {
    editorialTitleKey: 'hero.slide2.title',
    editorialSubtitleKey: 'hero.slide2.subtitle',
    editorialImageKey: 'hero.slide2.image',
    editorialCta1TextKey: 'hero.slide2.cta1.text',
    editorialCta1LinkKey: 'hero.slide2.cta1.link',
    editorialCta2TextKey: 'hero.slide2.cta2.text',
    editorialCta2LinkKey: 'hero.slide2.cta2.link',
  },
  {
    editorialTitleKey: 'hero.slide3.title',
    editorialSubtitleKey: 'hero.slide3.subtitle',
    editorialImageKey: 'hero.slide3.image',
    editorialCta1TextKey: 'hero.slide3.cta1.text',
    editorialCta1LinkKey: 'hero.slide3.cta1.link',
    editorialCta2TextKey: 'hero.slide3.cta2.text',
    editorialCta2LinkKey: 'hero.slide3.cta2.link',
  },
  {
    editorialTitleKey: 'hero.slide4.title',
    editorialSubtitleKey: 'hero.slide4.subtitle',
    editorialImageKey: 'hero.slide4.image',
    editorialCta1TextKey: 'hero.slide4.cta1.text',
    editorialCta1LinkKey: 'hero.slide4.cta1.link',
    editorialCta2TextKey: 'hero.slide4.cta2.text',
    editorialCta2LinkKey: 'hero.slide4.cta2.link',
  },
]

// Computed : ne garder que les slides ayant une image éditoriale définie
const slides = computed(() => {
  return slidesConfig
    .map((config) => {
      const imageMediaId = getRawContent(config.editorialImageKey)
      if (!imageMediaId) return null

      return {
        image: getMediaUrl(imageMediaId, 'medium'),
        editorialTitleKey: config.editorialTitleKey,
        editorialSubtitleKey: config.editorialSubtitleKey,
        editorialCta1TextKey: config.editorialCta1TextKey,
        editorialCta1LinkKey: config.editorialCta1LinkKey,
        editorialCta2TextKey: config.editorialCta2TextKey,
        editorialCta2LinkKey: config.editorialCta2LinkKey,
      }
    })
    .filter(Boolean) as Array<{
    image: string
    editorialTitleKey: string
    editorialSubtitleKey: string
    editorialCta1TextKey: string
    editorialCta1LinkKey: string
    editorialCta2TextKey: string
    editorialCta2LinkKey: string
  }>
})

const currentSlide = ref(0)
const isTransitioning = ref(false)
let slideInterval: ReturnType<typeof setInterval> | null = null

const currentSlideData = computed(() => slides.value[currentSlide.value])

// Titre et sous-titre du slide courant (avec fallback i18n)
const currentTitle = computed(() => {
  const slide = currentSlideData.value
  return slide ? getContent(slide.editorialTitleKey) : ''
})
const currentSubtitle = computed(() => {
  const slide = currentSlideData.value
  return slide ? getContent(slide.editorialSubtitleKey) : ''
})

// Boutons CTA du slide courant (0, 1 ou 2 boutons par slide)
// Utilise getRawContent (sans fallback i18n) - un bouton ne s'affiche que s'il est défini dans l'admin
const currentCta1Text = computed(() => {
  const slide = currentSlideData.value
  return slide ? getRawContent(slide.editorialCta1TextKey) : null
})
const currentCta1Link = computed(() => {
  const slide = currentSlideData.value
  return slide ? getRawContent(slide.editorialCta1LinkKey) : null
})
const currentCta2Text = computed(() => {
  const slide = currentSlideData.value
  return slide ? getRawContent(slide.editorialCta2TextKey) : null
})
const currentCta2Link = computed(() => {
  const slide = currentSlideData.value
  return slide ? getRawContent(slide.editorialCta2LinkKey) : null
})

// Vérifie si au moins un bouton est présent pour ce slide (texte ET lien définis)
const hasButtons = computed(() => {
  const hasCta1 = !!(currentCta1Text.value && currentCta1Link.value)
  const hasCta2 = !!(currentCta2Text.value && currentCta2Link.value)
  return hasCta1 || hasCta2
})

const goToSlide = (index: number, resetTimer = false) => {
  if (isTransitioning.value || index === currentSlide.value) return
  isTransitioning.value = true
  currentSlide.value = index
  if (resetTimer && slideInterval) {
    clearInterval(slideInterval)
    slideInterval = setInterval(() => goToSlide((currentSlide.value + 1) % slides.value.length), 6000)
  }
  setTimeout(() => {
    isTransitioning.value = false
  }, 1000)
}

const nextSlide = () => {
  goToSlide((currentSlide.value + 1) % slides.value.length, true)
}

const prevSlide = () => {
  goToSlide((currentSlide.value - 1 + slides.value.length) % slides.value.length, true)
}

onMounted(async () => {
  // Charger les contenus éditoriaux (bloquant : attendre avant affichage)
  await loadContent()
  isContentLoaded.value = true

  // Démarrer le carrousel seulement s'il y a des slides avec images
  if (slides.value.length > 1) {
    slideInterval = setInterval(() => goToSlide((currentSlide.value + 1) % slides.value.length), 6000)
  }
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
})
</script>

<template>
  <!-- Chargement des contenus éditoriaux -->
  <section v-if="!isContentLoaded" class="relative h-screen min-h-[700px] overflow-hidden bg-gray-900">
    <div class="absolute inset-0 flex items-center justify-center">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-10 w-10 animate-spin text-white/40" />
    </div>
  </section>

  <!-- Hero affiché uniquement quand les contenus sont chargés et qu'il y a des slides -->
  <section v-else-if="slides.length > 0" class="relative h-screen min-h-[700px] overflow-hidden">
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

          <!-- CTA Buttons (0, 1 ou 2 boutons par slide) - affichés uniquement si définis dans l'admin -->
          <div
            v-if="hasButtons"
            :key="currentSlide + '-buttons'"
            class="flex flex-wrap gap-4 animate__animated animate__fadeInUp animate__delay-2s"
          >
            <!-- Bouton primaire (style bleu) - affiché si texte ET lien définis -->
            <NuxtLink
              v-if="currentCta1Text && currentCta1Link"
              :to="localePath(currentCta1Link)"
              class="group relative inline-flex items-center px-8 py-4 bg-brand-blue-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:bg-brand-blue-600 hover:shadow-2xl hover:shadow-brand-blue-500/30 hover:-translate-y-1"
            >
              <span class="relative z-10">{{ currentCta1Text }}</span>
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="relative z-10 w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </NuxtLink>
            <!-- Bouton secondaire (style transparent) - affiché si texte ET lien définis -->
            <NuxtLink
              v-if="currentCta2Text && currentCta2Link"
              :to="localePath(currentCta2Link)"
              class="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
            >
              <span>{{ currentCta2Text }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows (seulement si plus d'un slide) -->
    <template v-if="slides.length > 1">
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
    </template>
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
