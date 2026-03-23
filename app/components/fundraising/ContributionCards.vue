<script setup lang="ts">
const { t } = useI18n()

const { elementRef: heroRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

const cards = computed(() => [
  {
    number: '01',
    icon: 'fa-solid fa-graduation-cap',
    title: t('leveesDeFonds.contribution.card1Title'),
    desc: t('leveesDeFonds.contribution.card1Desc'),
    color: 'blue' as const,
  },
  {
    number: '02',
    icon: 'fa-solid fa-building-columns',
    title: t('leveesDeFonds.contribution.card2Title'),
    desc: t('leveesDeFonds.contribution.card2Desc'),
    color: 'blue' as const,
  },
  {
    number: '03',
    icon: 'fa-solid fa-globe',
    title: t('leveesDeFonds.contribution.card3Title'),
    desc: t('leveesDeFonds.contribution.card3Desc'),
    color: 'blue' as const,
  },
])
</script>

<template>
  <section class="relative overflow-hidden bg-gray-50 py-16 transition-colors duration-300 dark:bg-gray-900 lg:py-24">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-blue-50/50 via-transparent to-brand-red-50/50 dark:from-brand-blue-900/10 dark:via-transparent dark:to-brand-red-900/10" />
      <div class="absolute -left-40 -top-40 h-80 w-80 animate-blob rounded-full bg-brand-blue-200/30 blur-3xl dark:bg-brand-blue-500/10" />
      <div class="absolute -right-20 top-1/2 h-96 w-96 animate-blob rounded-full bg-brand-red-200/30 blur-3xl animation-delay-2000 dark:bg-brand-red-500/10" />
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Hero Intro -->
      <div ref="heroRef" class="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
        <span class="mb-4 inline-flex items-center rounded-full bg-brand-blue-100 px-4 py-1.5 text-sm font-medium text-brand-blue-700 dark:bg-brand-blue-900/30 dark:text-brand-blue-400">
          <font-awesome-icon icon="fa-solid fa-star" class="mr-2 h-3.5 w-3.5" />
          {{ t('leveesDeFonds.contribution.heroBadge') }}
        </span>
        <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
          <span class="relative inline-block">
            {{ t('leveesDeFonds.contribution.heroTitleStart') }} {{ t('leveesDeFonds.contribution.heroTitleEmphasis') }}<br>{{ t('leveesDeFonds.contribution.heroTitleEnd') }}
            <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" />
          </span>
        </h2>
        <p class="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400" v-html="t('leveesDeFonds.contribution.heroText')" />
      </div>

      <!-- Section Header : Votre contribution sert à -->
      <div ref="headerRef" class="mb-12 text-center lg:mb-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          <span class="relative inline-block">
            {{ t('leveesDeFonds.contribution.titleStart') }} {{ t('leveesDeFonds.contribution.titleEmphasis') }}
            <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" />
          </span>
        </h2>
      </div>

      <!-- Cards Grid -->
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        <div
          v-for="(card, index) in cards"
          :key="card.number"
          class="group perspective-1000"
        >
          <div class="card-3d relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-8 backdrop-blur-xl transition-all duration-500 dark:border-gray-700/50 dark:bg-gray-800/80 lg:p-10">
            <!-- Glow Border -->
            <div
              class="absolute -inset-[2px] -z-10 rounded-3xl opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100"
              :class="card.color === 'blue'
                ? 'bg-gradient-to-r from-brand-blue-400 via-brand-blue-500 to-brand-blue-400'
                : 'bg-gradient-to-r from-brand-red-400 via-brand-red-500 to-brand-red-400'"
            />
            <div class="absolute inset-0 -z-[5] rounded-3xl bg-white dark:bg-gray-800" />

            <!-- Floating Orb -->
            <div
              class="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-80"
              :class="card.color === 'blue'
                ? 'bg-gradient-to-br from-brand-blue-400/40 to-brand-blue-500/40'
                : 'bg-gradient-to-br from-brand-red-400/40 to-brand-red-500/40'"
            />

            <!-- Number -->
            <span class="absolute right-6 top-4 text-6xl font-bold text-gray-100 transition-colors duration-500 group-hover:text-gray-200 dark:text-gray-700/50 dark:group-hover:text-gray-600/50">
              {{ card.number }}
            </span>

            <!-- Icon -->
            <div class="mb-6">
              <font-awesome-icon :icon="card.icon" class="h-7 w-7 text-gray-400 transition-colors duration-300 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
            </div>

            <!-- Content -->
            <div class="relative z-10">
              <h3
                class="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 dark:text-white lg:text-2xl"
                :class="card.color === 'blue'
                  ? 'group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400'
                  : 'group-hover:text-brand-red-600 dark:group-hover:text-brand-red-400'"
              >
                {{ card.title }}
              </h3>
              <p class="text-gray-600 leading-relaxed dark:text-gray-300">
                {{ card.desc }}
              </p>
            </div>

            <!-- Corner Accent -->
            <div class="absolute bottom-0 right-0 h-32 w-32">
              <div
                class="absolute bottom-4 right-4 h-20 w-20 rounded-br-3xl border-b-2 border-r-2 transition-all duration-500 group-hover:scale-110"
                :class="card.color === 'blue'
                  ? 'border-brand-blue-400/30 group-hover:border-brand-blue-400/60'
                  : 'border-brand-red-400/30 group-hover:border-brand-red-400/60'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(30px, 10px) scale(1.05); }
}

.animate-blob {
  animation: blob 12s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.perspective-1000 {
  perspective: 1000px;
}

.card-3d {
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.group:hover .card-3d {
  transform: rotateX(2deg) rotateY(-2deg) translateY(-8px);
}

.-z-\[5\] {
  z-index: -5;
}
</style>
