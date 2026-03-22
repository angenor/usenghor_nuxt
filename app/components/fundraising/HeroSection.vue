<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-brand-blue-900 to-brand-blue-800 min-h-[400px] md:min-h-[450px]">
    <!-- Topography pattern overlay -->
    <div
      class="absolute inset-0 opacity-10"
      style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cpath d='M0 300c50-80 150-120 300-100s250 80 300 100' fill='none' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 350c80-60 200-100 300-80s220 60 300 80' fill='none' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 250c60-40 180-80 300-60s240 40 300 60' fill='none' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 200c40-30 160-60 300-40s260 30 300 40' fill='none' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 400c70-50 190-90 300-70s230 50 300 70' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E&quot;); background-size: 600px 600px;"
    ></div>

    <!-- Decorative diese -->
    <UiDecorativeDiese
      :enabled="true"
      position="bottom-right"
      size="2xl"
      :opacity="0.08"
      bg="dark"
    />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div class="max-w-4xl mx-auto">
        <!-- Badge -->
        <span
          class="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide uppercase rounded-full bg-brand-red-500/20 text-brand-red-300 border border-brand-red-400/30"
        >
          {{ t('leveesDeFonds.hero.badge') }}
        </span>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          {{ t('leveesDeFonds.hero.title') }}
        </h1>

        <!-- Subtitle -->
        <p class="text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
          {{ t('leveesDeFonds.hero.subtitle') }}
        </p>
      </div>
    </div>

    <!-- SVG diagonal separator -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg
        class="w-full h-12 md:h-16 text-white dark:text-gray-900"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
      </svg>
    </div>
  </section>
</template>
