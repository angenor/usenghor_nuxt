<script setup lang="ts">
interface Indicator {
  value: string
  suffix?: string
  label: string
}

interface Props {
  title?: string
  subtitle?: string
  indicators: Indicator[]
  backgroundImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  backgroundImage: '/images/bg/bg_stats_section.jpeg'
})

const sectionRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)
const animatedValues = ref<number[]>([])

// Parse numeric values from indicators
const targetValues = computed(() => {
  return props.indicators.map(indicator => {
    const num = parseInt(indicator.value.replace(/[^0-9]/g, ''))
    return isNaN(num) ? 0 : num
  })
})

// Initialize animated values
onMounted(() => {
  animatedValues.value = props.indicators.map(() => 0)
})

const animateValue = (index: number, target: number, duration = 1500) => {
  const startTime = performance.now()
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

  const updateValue = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutQuart(progress)
    animatedValues.value[index] = Math.round(target * easedProgress)
    if (progress < 1) requestAnimationFrame(updateValue)
  }
  requestAnimationFrame(updateValue)
}

const startAnimation = () => {
  if (hasAnimated.value) return
  hasAnimated.value = true
  targetValues.value.forEach((target, index) => {
    setTimeout(() => animateValue(index, target, 1500), index * 150)
  })
}

// Get suffix from original value or use provided suffix
const getSuffix = (indicator: Indicator): string => {
  if (indicator.suffix !== undefined) return indicator.suffix
  const match = indicator.value.match(/[^0-9]+$/)
  return match ? match[0] : ''
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startAnimation()
      })
    },
    { threshold: 0.3 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <section
    ref="sectionRef"
    class="relative py-16 lg:py-24 pb-24 lg:pb-32"
  >
    <!-- Background Image with Fixed Attachment (Parallax) -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-fixed"
      :style="{ backgroundImage: `url(${props.backgroundImage})` }"
    ></div>

    <!-- Dark Overlay with Gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-brand-blue-900/85 via-brand-blue-800/80 to-brand-blue-900/85"></div>

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div v-if="props.title" class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          {{ props.title }}
        </h2>
        <p v-if="props.subtitle" class="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
          {{ props.subtitle }}
        </p>
      </div>

      <!-- Indicators Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <div
          v-for="(indicator, index) in props.indicators"
          :key="index"
          class="text-center transform transition-all duration-500"
          :class="{ 'translate-y-0 opacity-100': hasAnimated, 'translate-y-4 opacity-0': !hasAnimated }"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <div class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 tabular-nums drop-shadow-lg">
            {{ animatedValues[index] || 0 }}{{ getSuffix(indicator) }}
          </div>
          <div class="text-white/90 text-sm sm:text-base font-medium">
            {{ indicator.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Ligne de séparation droite -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      class="absolute -bottom-5 left-0 w-full rotate-180"
      preserveAspectRatio="none"
    >
      <polygon points="0,40 1200,0 1200,120 0,120" class="fill-gray-50 dark:fill-gray-800" />
    </svg>
  </section>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
