<script setup lang="ts">
import { computed } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { t } = useI18n()

// SEO
useSeoMeta({
  title: () => t('history.title'),
  description: () => t('history.subtitle'),
  ogTitle: () => t('history.title'),
  ogDescription: () => t('history.subtitle'),
  ogImage: 'https://picsum.photos/seed/og-history/1200/630'
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('history.title') }
])

// Timeline events data
const timelineEvents = [
  {
    year: '1989',
    title: t('history.genesis.title'),
    description: t('history.genesis.description'),
    bgColor: '#FDF6E3',
    media: [
      { type: 'image', src: 'https://picsum.photos/seed/dakar89/800/600', alt: 'Sommet de Dakar 1989' },
      { type: 'image', src: 'https://picsum.photos/seed/francophonie/800/600', alt: 'Francophonie' },
      { type: 'image', src: 'https://picsum.photos/seed/africa89/800/600', alt: 'Afrique 1989' }
    ]
  },
  {
    year: '1990',
    title: t('history.usenghor.title'),
    description: t('history.usenghor.description'),
    bgColor: '#E0F7FA',
    media: [
      { type: 'image', src: 'https://picsum.photos/seed/alexandria/800/600', alt: 'Alexandrie' },
      { type: 'image', src: 'https://picsum.photos/seed/inauguration/800/600', alt: 'Inauguration' },
      { type: 'image', src: 'https://picsum.photos/seed/campus90/800/600', alt: 'Campus 1990' }
    ]
  },
  {
    year: '2000',
    title: 'Une decennie d\'excellence',
    description: 'Apres 10 ans de formation, l\'Universite Senghor a forme des centaines de cadres africains dans les domaines du developpement durable.',
    bgColor: '#EDE7F6',
    media: [
      { type: 'image', src: 'https://picsum.photos/seed/diploma/800/600', alt: 'Diplomes' },
      { type: 'image', src: 'https://picsum.photos/seed/ceremony/800/600', alt: 'Ceremonie' },
      { type: 'image', src: 'https://picsum.photos/seed/decade/800/600', alt: '10 ans' }
    ]
  },
  {
    year: '2016',
    title: t('history.leadership.rector.name'),
    description: t('history.leadership.rector.since'),
    bgColor: '#E8F5E9',
    media: [
      { type: 'image', src: 'https://picsum.photos/seed/verdel/800/600', alt: 'Pr. Verdel' },
      { type: 'image', src: 'https://picsum.photos/seed/strategy/800/600', alt: 'Strategie' },
      { type: 'image', src: 'https://picsum.photos/seed/new-era/800/600', alt: 'Nouvelle ere' }
    ]
  },
  {
    year: '2020',
    title: t('history.legacy.title'),
    description: t('history.legacy.description'),
    bgColor: '#FCE4EC',
    media: [
      { type: 'image', src: 'https://picsum.photos/seed/30years/800/600', alt: '30 ans' },
      { type: 'image', src: 'https://picsum.photos/seed/alumni/800/600', alt: 'Alumni' },
      { type: 'image', src: 'https://picsum.photos/seed/impact/800/600', alt: 'Impact' }
    ]
  }
]

// Current year for display
let currentYear = '1989'

// Refs
const yearDisplayRef = ref<HTMLElement | null>(null)
const timelineRef = ref<HTMLElement | null>(null)
const sectionRefs = ref<HTMLElement[]>([])

// Year display visibility
const isYearVisible = ref(false)

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

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger)

  // Initially hide year display
  if (yearDisplayRef.value) {
    gsap.set(yearDisplayRef.value, { autoAlpha: 0 })
  }

  // Show/hide year display based on timeline visibility
  if (timelineRef.value) {
    ScrollTrigger.create({
      trigger: timelineRef.value,
      start: 'top 60%',
      end: 'bottom+=500% bottom', // Compte les 5 sections pinnees (chaque +100%)
      onEnter: () => {
        isYearVisible.value = true
        gsap.to(yearDisplayRef.value, { autoAlpha: 1, duration: 0.3 })
      },
      onLeave: () => {
        isYearVisible.value = false
        gsap.to(yearDisplayRef.value, { autoAlpha: 0, duration: 0.3 })
      },
      onEnterBack: () => {
        isYearVisible.value = true
        gsap.to(yearDisplayRef.value, { autoAlpha: 1, duration: 0.3 })
      },
      onLeaveBack: () => {
        isYearVisible.value = false
        gsap.to(yearDisplayRef.value, { autoAlpha: 0, duration: 0.3 })
      }
    })
  }

  // Setup timeline animations for each section
  sectionRefs.value.forEach((section, index) => {
    if (!section) return

    const event = timelineEvents[index]
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
          const prev = timelineEvents[index - 1]
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
  <div class="histoire-page">
    <!-- Hero Section -->
    <PageHero
      :title="t('history.badge')"
      :subtitle="t('history.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Intro Section -->
    <section class="py-16 lg:py-24 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <!-- Text Content -->
          <div class="space-y-6">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              <span class="relative inline-block">
                {{ t('history.title') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
              </span>
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ t('history.subtitle') }}
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ t('history.genesis.point1') }}
            </p>
          </div>
          <!-- SVG Image -->
          <div class="flex items-center justify-center">
            <svg class="w-full max-w-md h-auto" viewBox="0 0 100 100">
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
                href="https://picsum.photos/seed/senghor-portrait/800/800"
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

    <!-- Fixed Year Display (visible only during timeline scroll) -->
    <div
      ref="yearDisplayRef"
      class="year-display-fixed"
    >
      <span class="digit">1</span>
      <span class="digit">9</span>
      <span class="digit">8</span>
      <span class="digit">9</span>
    </div>

    <!-- Timeline Section -->
    <div ref="timelineRef" class="timeline pt-[20vw]">
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
                v-if="media.type === 'image'"
                :src="media.src"
                :alt="media.alt"
                class="media-item"
              />
              <video
                v-else
                :src="media.src"
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

    <!-- Footer Space -->
    <div class="h-[50vh] bg-white dark:bg-gray-900 flex items-center justify-center">
      <p class="text-2xl font-bold text-gray-400">{{ t('history.legacy.badge') }}</p>
    </div>
  </div>
</template>

<style scoped>
.histoire-page {
  overflow-x: hidden;
}

/* Fixed year display - stays at top below navbar */
.year-display-fixed {
  position: fixed;
  top: 5rem; /* Below navbar (~80px) */
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: var(--font-pixel, 'JetBrains Mono', monospace);
  font-size: clamp(4rem, 12vw, 10rem);
  font-weight: 300;
  line-height: 1;
  color: rgba(0, 0, 0, 0.4); /* Beaucoup plus fonce */
  pointer-events: none;
  user-select: none;
  visibility: hidden; /* Initially hidden, controlled by GSAP autoAlpha */
}

.dark .year-display-fixed {
  color: rgba(255, 255, 255, 0.4); /* Beaucoup plus fonce */
}

.year-display-fixed .digit {
  display: inline-block;
  width: 0.7em;
  text-align: center;
  overflow: hidden;
}
</style>
