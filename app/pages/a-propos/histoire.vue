<script setup lang="ts">
import { computed } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { t } = useI18n()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('history')
const { getMediaUrl } = useMediaApi()

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-history', () => loadContent())

// Résoudre une image éditoriale avec fallback null
function resolveImage(editorialKey: string, fallbackSrc: string | null, fallbackAlt: string) {
  const mediaId = getRawContent(editorialKey)
  return {
    type: 'image' as const,
    src: mediaId ? (getMediaUrl(mediaId, 'medium') || null) : null,
    alt: fallbackAlt,
  }
}

// SEO
useSeoMeta({
  title: () => t('history.title'),
  description: () => t('history.subtitle'),
  ogTitle: () => t('history.title'),
  ogDescription: () => t('history.subtitle'),
  ogImage: undefined
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: getContent('history.title') }
])

// Phase colors mapping
const phaseColors: Record<string, string> = {
  'Fondation': '#FDF6E3',     // Jaune/crème - Phase 1
  'Foundation': '#FDF6E3',
  'التأسيس': '#FDF6E3',
  'Développement': '#E8F5E9', // Vert clair - Phase 2
  'Development': '#E8F5E9',
  'التطوير': '#E8F5E9',
  'Rayonnement': '#E3F2FD',   // Bleu clair - Phase 3
  'Outreach': '#E3F2FD',
  'الإشعاع': '#E3F2FD',
  'Actuel': '#FCE4EC',        // Rose - Phase actuelle
  'Current': '#FCE4EC',
  'الحالي': '#FCE4EC'
}

// Timeline events data from editorial content (4 étapes clés)
const timelineEvents = computed(() => [
  {
    year: '1989',
    title: getContent('history.timeline.1989.title'),
    description: getContent('history.timeline.1989.description'),
    bgColor: phaseColors[getContent('history.timeline.1989.phase')] || '#FDF6E3',
    media: [
      resolveImage('history.timeline.1989.image1', null, 'Sommet de Dakar 1989'),
      resolveImage('history.timeline.1989.image2', null, 'Francophonie'),
      resolveImage('history.timeline.1989.image3', null, 'Pierre Tabatoni'),
    ]
  },
  {
    year: '2002',
    title: getContent('history.timeline.2002.title'),
    description: getContent('history.timeline.2002.description'),
    bgColor: phaseColors[getContent('history.timeline.2002.phase')] || '#E8F5E9',
    media: [
      resolveImage('history.timeline.2002.image1', null, 'Fred Constant'),
      resolveImage('history.timeline.2002.image2', null, 'Ahmed El Kosheri'),
      resolveImage('history.timeline.2002.image3', null, 'Décennie 2000'),
    ]
  },
  {
    year: '2016',
    title: getContent('history.timeline.2016.title'),
    description: getContent('history.timeline.2016.description'),
    bgColor: phaseColors[getContent('history.timeline.2016.phase')] || '#FCE4EC',
    media: [
      resolveImage('history.timeline.2016.image1', null, 'Pr. Thierry Verdel'),
      resolveImage('history.timeline.2016.image2', null, 'Stratégie'),
      resolveImage('history.timeline.2016.image3', null, 'Nouvelle ère'),
    ]
  },
  {
    year: '2020',
    title: getContent('history.timeline.2020.title'),
    description: getContent('history.timeline.2020.description'),
    bgColor: phaseColors[getContent('history.timeline.2020.phase')] || '#FCE4EC',
    media: [
      resolveImage('history.timeline.2020.image1', null, '30 ans'),
      resolveImage('history.timeline.2020.image2', null, 'Alumni'),
      resolveImage('history.timeline.2020.image3', null, 'Impact'),
    ]
  }
])

// Current year for display
let currentYear = '1989'

// Refs
const yearDisplayRef = ref<HTMLElement | null>(null)
const timelineRef = ref<HTMLElement | null>(null)
const sectionRefs = ref<HTMLElement[]>([])

// Set section ref
const setSectionRef = (el: any, index: number) => {
  if (el) sectionRefs.value[index] = el
}

// Animate year roll
const animateYearRoll = (from: string, to: string, direction: 'up' | 'down' = 'up') => {
  const fromStr = from.padStart(4, '0')
  const toStr = to.padStart(4, '0')
  const digits = yearDisplayRef.value?.querySelectorAll('.digit')

  if (!digits) return

  digits.forEach((el, i) => {
    const oldDigit = fromStr[i]
    const newDigit = toStr[i]

    if (oldDigit !== newDigit) {
      const delay = (3 - i) * 0.1

      gsap.to(el, {
        yPercent: -100,
        opacity: 0,
        duration: 0.2,
        delay,
        ease: 'power2.in',
        onComplete: () => {
          el.textContent = newDigit
          gsap.set(el, { yPercent: 100, opacity: 0 })

          gsap.to(el, {
            yPercent: 0,
            opacity: 1,
            duration: 0.3,
            delay: 0.05,
            ease: 'power2.out'
          })
        }
      })
    }
  })
}

// Split text into words for animation
const splitIntoWords = (text: string): string[] => {
  return text.split(' ')
}

onMounted(() => {
  if (import.meta.server) return

  // Scroll to top on page load with smooth animation
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger)

  // Reset body background color on page entry
  gsap.set('body', { backgroundColor: '#FDF6E3' })

  // L'année est visible dès le départ grâce à position: sticky
  // Pas besoin de toggle autoAlpha !

  // ScrollTrigger pour gérer la fin de timeline (scroll avec footer)
  // On utilise la dernière section comme trigger, avec un offset pour les sections pinnées
  if (timelineRef.value) {
    ScrollTrigger.create({
      trigger: timelineRef.value,
      // Start après toutes les sections pinnées (4 sections x 100% = 400%)
      start: 'bottom+=400% bottom',
      end: 'bottom+=400% top',
      onEnter: () => {
        // Quand on quitte la timeline, transformer sticky en relative pour scroller avec footer
        if (yearDisplayRef.value) {
          gsap.set(yearDisplayRef.value, { position: 'relative' })
        }
      },
      onLeaveBack: () => {
        // Retour au sticky quand on revient
        if (yearDisplayRef.value) {
          gsap.set(yearDisplayRef.value, { position: 'sticky' })
        }
      }
    })
  }

  // Setup timeline animations for each section
  sectionRefs.value.forEach((section, index) => {
    if (!section) return

    const event = timelineEvents.value[index]
    const newYear = event.year
    const bgColor = event.bgColor

    // Get elements
    const intro = section.querySelector('.intro')
    const stack = section.querySelector('.media-stack')
    const items = stack?.querySelectorAll('.media-item') || []

    // Split text into words and wrap them
    if (intro) {
      const text = intro.textContent || ''
      const words = text.split(' ').filter(w => w.trim())
      intro.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ')
      const wordEls = intro.querySelectorAll('.word')
      gsap.set(wordEls, { opacity: 0.1 })
    }

    // Setup media items initial state
    items.forEach((item, i) => {
      gsap.set(item, {
        opacity: 0,
        zIndex: i,
        rotate: gsap.utils.random(-4, 4),
        scale: 0.95
      })
    })

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: true,
        onEnter: () => {
          animateYearRoll(currentYear, newYear, 'up')
          currentYear = newYear

          gsap.to('body', {
            backgroundColor: bgColor,
            duration: 0.6,
            ease: 'power2.out'
          })
        },
        onLeaveBack: () => {
          const prev = timelineEvents.value[index - 1]
          const prevYear = prev?.year || '1989'
          const prevColor = prev?.bgColor || '#ffffff'

          animateYearRoll(currentYear, prevYear, 'down')
          currentYear = prevYear

          gsap.to('body', {
            backgroundColor: prevColor,
            duration: 0.6,
            ease: 'power2.out'
          })
        }
      }
    })

    // Animate text words
    if (intro) {
      const wordEls = intro.querySelectorAll('.word')
      tl.to(wordEls, {
        opacity: 1,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out'
      })
    }

    // Animate media items
    items.forEach((item, i) => {
      tl.to(item, {
        opacity: 1,
        scale: 1,
        zIndex: items.length + i,
        duration: 0.1,
        ease: 'power2.out'
      }, i * 0.6)
    })
  })
})

onUnmounted(() => {
  // Clean up ScrollTriggers
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  // Reset background color
  gsap.set('body', { backgroundColor: '' })
})
</script>

<template>
  <div class="histoire-page bg-grid-pattern">
    <!-- Hero Section -->
    <PageHero
      :title="getContent('history.badge')"
      :subtitle="getContent('history.subtitle')"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Histoire Content Wrapper (pour le sticky behavior) -->
    <div class="histoire-content">
      <!-- Intro Section -->
      <section class="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <!-- Text Content -->
            <div class="space-y-6 flex flex-col justify-center">
              <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                <span class="relative inline-block">
                  {{ getContent('history.title') }}
                  <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
                </span>
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ getContent('history.subtitle') }}
              </p>
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ getContent('history.genesis.point1') }}
              </p>
            </div>
            <!-- SVG Image -->
            <div class="flex items-center justify-center">
              <svg class="w-full max-w-md lg:max-w-4xl h-auto" viewBox="0 0 100 100">
                <defs>
                  <mask id="hashMask">
                    <rect width="100" height="100" fill="black"/>
                    <rect x="20" y="30" width="60" height="12" rx="2" fill="white"/>
                    <rect x="20" y="58" width="60" height="12" rx="2" fill="white"/>
                    <rect x="30" y="20" width="12" height="60" rx="2" fill="white"/>
                    <rect x="58" y="20" width="12" height="60" rx="2" fill="white"/>
                    <rect x="42" y="42" width="16" height="16" fill="white"/>
                  </mask>
                </defs>
                <image
                  href="/images/logos/Conours-20e-promotion-usenghor.jpg"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid slice"
                  mask="url(#hashMask)"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Year Display - APRÈS l'intro, devient sticky en haut -->
      <div
        ref="yearDisplayRef"
        class="year-display"
      >
        <span class="year-bg">
          <span class="digit">1</span>
          <span class="digit">9</span>
          <span class="digit">8</span>
          <span class="digit">9</span>
        </span>
      </div>

      <!-- Timeline Section -->
      <div ref="timelineRef" class="timeline pt-[10vw]">
      <!-- Year Sections -->
      <section
        v-for="(event, index) in timelineEvents"
        :key="index"
        :ref="(el) => setSectionRef(el, index)"
        class="year-section h-screen flex px-8 py-12 md:py-4"
        :data-year="event.year"
        :data-color="event.bgColor"
      >
        <div class="grid grid-rows-[1fr_auto] md:grid-rows-1 md:grid-cols-2 gap-8 w-full h-full">
          <!-- Media Stack -->
          <div class="media-stack relative w-full h-full flex items-center justify-center p-4 md:p-12 order-1 md:order-2">
            <template v-for="(media, mediaIndex) in event.media" :key="mediaIndex">
              <img
                v-if="media.type === 'image' && media.src"
                :src="media.src"
                :alt="media.alt"
                class="media-item"
              />
              <div
                v-else-if="media.type === 'image' && !media.src"
                class="media-item w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
              >
                <font-awesome-icon icon="fa-solid fa-image" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <video
                v-else
                :src="media.src ?? undefined"
                class="media-item"
                autoplay
                muted
                loop
                playsinline
              />
            </template>
          </div>

          <!-- Text Content -->
          <div class="order-2 md:order-1 flex flex-col justify-end md:justify-end md:items-start md:self-center">
            <div class="text-left">
              <h2 class="text-[length:var(--fs-5)] font-bold mb-2 leading-[100%] text-gray-900 dark:text-white">
                {{ event.title }}
              </h2>
              <p class="intro text-lg text-[length:var(--fs-0)] md:text-[length:var(--fs-1)] max-w-[40ch] leading-[112.5%] text-gray-600 dark:text-gray-300">
                {{ event.description }}
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Wrapper for sticky behavior - doit contenir tout le contenu scrollable */
.histoire-content {
  position: relative;
}

/* Sticky year display - visible from start, becomes sticky below navbar */
.year-display {
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 80px; /* Hauteur exacte du navbar */
  z-index: 40;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0 4rem; /* Plus d'espace en bas sur mobile */
  font-family: var(--font-pixel, 'JetBrains Mono', monospace);
  font-size: clamp(2rem, 6vw, 5rem);
  font-weight: 300;
  line-height: 1;
  color: rgba(0, 0, 0, 0.7);
  pointer-events: none;
  user-select: none;
}

@media (min-width: 768px) {
  .year-display {
    padding: 2rem 0; /* Padding normal sur desktop */
  }
}

.dark .year-display {
  color: rgba(255, 255, 255, 0.7);
}

/* Background uniquement autour des chiffres */
.year-bg {
  display: inline-flex;
  padding: 0.1em 0.1em;
  border-radius: 0.25em;
  background: rgba(253, 246, 227, 0.9);
}

.dark .year-bg {
  background: rgba(17, 24, 39, 0.9);
}

.year-display .digit {
  display: inline-block;
  width: 0.7em;
  text-align: center;
  overflow: hidden;
}
</style>
