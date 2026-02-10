<script setup lang="ts">
const { t } = useI18n()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('homepage')

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: missionCardRef } = useScrollAnimation({ animation: 'fadeInLeft', threshold: 0.2 })
const { elementRef: visionCardRef } = useScrollAnimation({ animation: 'fadeInRight', threshold: 0.2 })
const { elementRef: experienceRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.15 })

const statsRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)
const animatedStats = ref({
  countries: 0,
  graduates: 0,
  years: 0,
})

const targetStats = {
  countries: 54,
  graduates: 5000,
  years: 30,
}

const animateValue = (key: keyof typeof animatedStats.value, target: number, duration = 2000) => {
  const startTime = performance.now()
  const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4)

  const updateValue = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutQuart(progress)
    animatedStats.value[key] = Math.round(target * easedProgress)
    if (progress < 1) requestAnimationFrame(updateValue)
  }
  requestAnimationFrame(updateValue)
}

const startAnimation = () => {
  if (hasAnimated.value) return
  hasAnimated.value = true
  animateValue('countries', targetStats.countries, 1500)
  setTimeout(() => animateValue('graduates', targetStats.graduates, 2000), 200)
  setTimeout(() => animateValue('years', targetStats.years, 1500), 400)
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startAnimation()
      })
    },
    { threshold: 0.3 },
  )
  if (statsRef.value) observer.observe(statsRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <section class="relative py-16 lg:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Gradient Mesh -->
      <div class="absolute inset-0 bg-gradient-to-br from-brand-blue-50/50 via-transparent to-brand-red-50/50 dark:from-brand-blue-900/10 dark:via-transparent dark:to-brand-red-900/10"></div>

      <!-- Animated Blobs -->
      <div class="absolute -top-40 -left-40 w-80 h-80 bg-brand-blue-200/30 dark:bg-brand-blue-500/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute top-1/2 -right-20 w-96 h-96 bg-brand-red-200/30 dark:bg-brand-red-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-40 left-1/3 w-72 h-72 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      <!-- Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <!-- Floating Particles -->
      <div class="absolute top-20 left-1/4 w-2 h-2 bg-brand-blue-400/40 rounded-full animate-float"></div>
      <div class="absolute top-40 right-1/4 w-3 h-3 bg-brand-red-400/40 rounded-full animate-float animation-delay-1000"></div>
      <div class="absolute bottom-40 left-1/3 w-2 h-2 bg-purple-400/40 rounded-full animate-float animation-delay-3000"></div>
      <div class="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-brand-blue-400/50 rounded-full animate-float animation-delay-2000"></div>
      <div class="absolute bottom-1/4 right-1/4 w-2.5 h-2.5 bg-brand-red-400/30 rounded-full animate-float animation-delay-4000"></div>

      <!-- Subtle Radial Gradient -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient opacity-30 dark:opacity-20"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div ref="headerRef" class="text-center mb-16 lg:mb-20">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-compass" class="w-3.5 h-3.5 mr-2" />
          {{ getContent('mission.badge') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {{ getContent('mission.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ getContent('mission.subtitle') }}
        </p>
      </div>

      <!-- Mission & Vision Cards - Glowing 3D Cards -->
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-10 mb-16 lg:mb-20">
        <!-- Mission Card -->
        <div ref="missionCardRef" class="card-wrapper group perspective-1000">
          <div class="card-3d relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/50 dark:border-gray-700/50 overflow-hidden transition-all duration-500">
            <!-- Animated Glow Border -->
            <div class="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-brand-blue-400 via-brand-blue-500 to-brand-blue-400 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10 animate-gradient-x"></div>
            <div class="absolute inset-0 rounded-3xl bg-white dark:bg-gray-800 -z-5"></div>

            <!-- Floating Orb -->
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-brand-blue-400/40 to-brand-blue-500/40 rounded-full blur-2xl group-hover:scale-150 group-hover:opacity-80 transition-all duration-700"></div>

            <!-- Animated Lines -->
            <div class="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div class="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-blue-400/50 to-transparent animate-line-down"></div>
              <div class="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-blue-400/50 to-transparent animate-line-right"></div>
            </div>

            <!-- Icon with Pulse Effect -->
            <div class="relative mb-8 inline-block">
              <div class="absolute inset-0 w-16 h-16 rounded-2xl bg-brand-blue-500 blur-xl opacity-50 group-hover:opacity-80 group-hover:scale-125 transition-all duration-500"></div>
              <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue-400 via-brand-blue-500 to-brand-blue-600 flex items-center justify-center shadow-2xl shadow-brand-blue-500/50 group-hover:shadow-brand-blue-500/70 transition-shadow duration-500 group-hover:scale-110 transform">
                <font-awesome-icon icon="fa-solid fa-bullseye" class="w-7 h-7 text-white" />
              </div>
              <!-- Orbiting Dot -->
              <div class="absolute w-2 h-2 bg-brand-blue-300 rounded-full orbit-animation"></div>
            </div>

            <!-- Content -->
            <div class="relative z-10">
              <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors duration-300">
                {{ getContent('mission.mission.title') }}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {{ getContent('mission.mission.description') }}
              </p>
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-blue-100 to-brand-blue-200 dark:from-brand-blue-900/40 dark:to-brand-blue-800/40 text-brand-blue-700 dark:text-brand-blue-300 border border-brand-blue-200/50 dark:border-brand-blue-700/50 group-hover:scale-105 transition-transform duration-300">
                  <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" class="w-4 h-4 mr-2 animate-pulse" />
                  {{ getContent('mission.mission.tagline') }}
                </span>
              </div>
            </div>

            <!-- Corner Accent -->
            <div class="absolute bottom-0 right-0 w-32 h-32">
              <div class="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-brand-blue-400/30 rounded-br-3xl group-hover:border-brand-blue-400/60 group-hover:scale-110 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        <!-- Vision Card -->
        <div ref="visionCardRef" class="card-wrapper group perspective-1000">
          <div class="card-3d relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/50 dark:border-gray-700/50 overflow-hidden transition-all duration-500">
            <!-- Animated Glow Border -->
            <div class="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-brand-red-400 via-brand-red-500 to-brand-red-400 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10 animate-gradient-x"></div>
            <div class="absolute inset-0 rounded-3xl bg-white dark:bg-gray-800 -z-5"></div>

            <!-- Floating Orb -->
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-brand-red-400/40 to-brand-red-500/40 rounded-full blur-2xl group-hover:scale-150 group-hover:opacity-80 transition-all duration-700"></div>

            <!-- Animated Lines -->
            <div class="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div class="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-red-400/50 to-transparent animate-line-down animation-delay-500"></div>
              <div class="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-red-400/50 to-transparent animate-line-right animation-delay-500"></div>
            </div>

            <!-- Icon with Pulse Effect -->
            <div class="relative mb-8 inline-block">
              <div class="absolute inset-0 w-16 h-16 rounded-2xl bg-brand-red-500 blur-xl opacity-50 group-hover:opacity-80 group-hover:scale-125 transition-all duration-500"></div>
              <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-red-400 via-brand-red-500 to-brand-red-600 flex items-center justify-center shadow-2xl shadow-brand-red-500/50 group-hover:shadow-brand-red-500/70 transition-shadow duration-500 group-hover:scale-110 transform">
                <font-awesome-icon icon="fa-solid fa-eye" class="w-7 h-7 text-white" />
              </div>
              <!-- Orbiting Dot -->
              <div class="absolute w-2 h-2 bg-brand-red-300 rounded-full orbit-animation animation-delay-1000"></div>
            </div>

            <!-- Content -->
            <div class="relative z-10">
              <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-brand-red-600 dark:group-hover:text-brand-red-400 transition-colors duration-300">
                {{ getContent('mission.vision.title') }}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {{ getContent('mission.vision.description') }}
              </p>
              <!-- Vision Values -->
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1.5 text-xs font-medium bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300 rounded-full border border-brand-blue-200/50 dark:border-brand-blue-700/50">{{ t('mission.vision.values.excellence') }}</span>
                <span class="px-3 py-1.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200/50 dark:border-purple-700/50">{{ t('mission.vision.values.ethics') }}</span>
                <span class="px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full border border-green-200/50 dark:border-green-700/50">{{ t('mission.vision.values.inclusion') }}</span>
                <span class="px-3 py-1.5 text-xs font-medium bg-brand-red-100 dark:bg-brand-red-900/40 text-brand-red-700 dark:text-brand-red-300 rounded-full border border-brand-red-200/50 dark:border-brand-red-700/50">{{ t('mission.vision.values.innovation') }}</span>
                <span class="px-3 py-1.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full border border-yellow-200/50 dark:border-yellow-700/50">{{ t('mission.vision.values.solidarity') }}</span>
              </div>
            </div>

            <!-- Corner Accent -->
            <div class="absolute bottom-0 right-0 w-32 h-32">
              <div class="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-brand-red-400/30 rounded-br-3xl group-hover:border-brand-red-400/60 group-hover:scale-110 transition-all duration-500"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Experience Section -->
      <div ref="experienceRef" class="relative rounded-3xl overflow-hidden">
        <div class="absolute inset-0">
          <img
            src="/images/bg/covers_image.jpg"
            alt="L'expérience Senghor"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/40"></div>
        </div>

        <div class="relative px-8 py-16 lg:px-16 lg:py-20">
          <div class="max-w-2xl">
            <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20 mb-6">
              <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5 mr-2 text-brand-blue-400" />
              {{ getContent('experience.badge', 'mission.experience.badge') }}
            </span>

            <h3 class="text-3xl lg:text-4xl font-bold text-white mb-4">
              {{ getContent('experience.title', 'mission.experience.title') }}
            </h3>

            <p class="text-lg text-white/80 leading-relaxed mb-8">
              {{ getContent('experience.description', 'mission.experience.description') }}
            </p>

            <div class="flex flex-wrap gap-4 mb-8">
              <div class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <font-awesome-icon icon="fa-solid fa-briefcase" class="w-4 h-4 text-brand-blue-400" />
                <span class="text-sm text-white">{{ getContent('experience.features.immersion', 'mission.experience.features.immersion') }}</span>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <font-awesome-icon icon="fa-solid fa-lightbulb" class="w-4 h-4 text-brand-blue-400" />
                <span class="text-sm text-white">{{ getContent('experience.features.creativity', 'mission.experience.features.creativity') }}</span>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <font-awesome-icon icon="fa-solid fa-users" class="w-4 h-4 text-brand-blue-400" />
                <span class="text-sm text-white">{{ getContent('experience.features.network', 'mission.experience.features.network') }}</span>
              </div>
            </div>

            <NuxtLink
              to="/site"
              class="group inline-flex items-center gap-2 px-8 py-4 bg-brand-blue-500 text-white font-semibold rounded-full transition-all duration-300 hover:bg-brand-blue-600 hover:shadow-xl hover:shadow-brand-blue-500/30 hover:-translate-y-1"
            >
              <span>{{ getContent('experience.cta', 'mission.experience.cta') }}</span>
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </NuxtLink>
          </div>

          <!-- Decorative Stats -->
          <div ref="statsRef" class="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 flex-col gap-6">
            <div class="stat-card text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-500" :class="{ 'stat-visible': hasAnimated }">
              <div class="text-4xl font-bold text-white mb-1 tabular-nums">{{ animatedStats.countries }}+</div>
              <div class="text-sm text-white/70">{{ getContent('experience.stats.countries', 'mission.experience.stats.countries') }}</div>
            </div>
            <div class="stat-card text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-500 delay-100" :class="{ 'stat-visible': hasAnimated }">
              <div class="text-4xl font-bold text-white mb-1 tabular-nums">{{ animatedStats.graduates.toLocaleString() }}+</div>
              <div class="text-sm text-white/70">{{ getContent('experience.stats.graduates', 'mission.experience.stats.graduates') }}</div>
            </div>
            <div class="stat-card text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-500 delay-200" :class="{ 'stat-visible': hasAnimated }">
              <div class="text-4xl font-bold text-white mb-1 tabular-nums">{{ animatedStats.years }}+</div>
              <div class="text-sm text-white/70">{{ getContent('experience.stats.years', 'mission.experience.stats.years') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Blob Animation */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 12s ease-in-out infinite;
}

/* Float Animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.4;
  }
  25% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) translateX(-10px);
    opacity: 0.3;
  }
  75% {
    transform: translateY(-30px) translateX(5px);
    opacity: 0.5;
  }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

/* Animation Delays */
.animation-delay-500 {
  animation-delay: 0.5s;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-3000 {
  animation-delay: 3s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Radial Gradient Background */
.bg-radial-gradient {
  background: radial-gradient(ellipse at center, rgba(43, 75, 191, 0.1) 0%, transparent 70%);
}

:root.dark .bg-radial-gradient {
  background: radial-gradient(ellipse at center, rgba(43, 75, 191, 0.05) 0%, transparent 70%);
}

/* 3D Card Effects */
.perspective-1000 {
  perspective: 1000px;
}

.card-3d {
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.card-wrapper:hover .card-3d {
  transform: rotateX(2deg) rotateY(-2deg) translateY(-8px);
}

/* Animated Gradient Border */
@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}

/* Line Animations */
@keyframes line-down {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

@keyframes line-right {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-line-down {
  animation: line-down 2s ease-in-out infinite;
}

.animate-line-right {
  animation: line-right 2s ease-in-out infinite;
}

/* Orbiting Animation */
@keyframes orbit {
  0% {
    transform: rotate(0deg) translateX(30px) rotate(0deg);
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(360deg) translateX(30px) rotate(-360deg);
    opacity: 0.8;
  }
}

.orbit-animation {
  top: 50%;
  left: 50%;
  animation: orbit 4s linear infinite;
}

/* Z-index fix for background layers */
.-z-5 {
  z-index: -5;
}

/* Stats Card Animation */
.stat-card {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.stat-card.stat-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.stat-card:nth-child(1) {
  transition-delay: 0ms;
}

.stat-card:nth-child(2) {
  transition-delay: 150ms;
}

.stat-card:nth-child(3) {
  transition-delay: 300ms;
}

/* Tabular numbers for consistent width during animation */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
